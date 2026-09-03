// Issue #17 — Ingestion v1. Hämtar hela MDN-urvalet (528 sidor, se
// docs/mdn-selection.md), chunkar fast storlek + overlap, embeddar via
// OpenRouter och skriver till Supabase `documents`. Bygger på samma
// REST+fetch-mönster som #6:s spike (scripts/embed-spike.ts) — inget nytt
// SDK-beroende.
//
// Krav:
// - En lokal sparse checkout av mdn/content (se docs/mdn-selection.md
//   §Källträd som klonas för klon-kommandot). Sätt MDN_CONTENT_DIR till den
//   klonens rot. Klonen committas ALDRIG i repot.
// - Kör med .env.local inläst, t.ex.:
//     MDN_CONTENT_DIR=/path/to/content node --env-file=.env.local scripts/ingest.ts
//
// Idempotens: rensa+fyll. Scriptet gör `delete from documents` (alla rader)
// innan det fyller på med hela urvalet igen. Valt istf upsert eftersom hela
// korpuset regenereras varje körning ändå (inget delta-flöde finns ännu) —
// enklare att inte behöva en stabil chunk-nyckel (url+chunk-index) och
// undviker dubbletter om chunkningen ändras mellan körningar. Detta tar
// automatiskt bort #4/#6:s 6 självtest-rader (id 1–6, testdata) — de var
// bara till för att bevisa kedjan, inte riktig MDN-data.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const MDN_CONTENT_DIR = process.env.MDN_CONTENT_DIR;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

for (const [name, val] of Object.entries({
  MDN_CONTENT_DIR,
  OPENROUTER_API_KEY,
  EMBEDDING_MODEL,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
})) {
  if (!val) {
    throw new Error(
      `Saknar ${name}. Sätt MDN_CONTENT_DIR till din mdn/content sparse checkout ` +
        `och kör scriptet med --env-file=.env.local för resten.`,
    );
  }
}

const SELECTION_LIST_PATH = join(import.meta.dirname, "mdn-selection-list.txt");

// Fast storlek + overlap (docs/mdn-selection.md §Chunkningsstrategi — enklaste
// alternativet, vald för att få en fungerande pipeline i wave 1). Tecken,
// inte tokens — ingen tokenizer-dependency för ett engångsscript.
// ~2800 tecken ≈ 700 tokens (grov 4-tecken/token-tumregel), inom
// rekommendationens 500–800 tokens/chunk. Overlap 350 tecken ≈ 12,5%,
// inom rekommenderade 10–15%. Wave 2 tunar dessa siffror mot faktisk
// retrieval-kvalitet (se STATE.md-tröskelvarningen till #19).
const CHUNK_SIZE = 2800;
const CHUNK_OVERLAP = 350;

type Chunk = {
  content: string;
  metadata: { source: string; url: string; title: string };
};

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

function loadChunks(relPath: string): Chunk[] {
  const raw = readFileSync(join(MDN_CONTENT_DIR!, relPath), "utf-8");
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error(`Ingen YAML-frontmatter hittad i ${relPath}`);
  }
  const [, frontmatter, body] = frontmatterMatch;
  const title = frontmatter.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? relPath;
  const slug = frontmatter.match(/^slug:\s*(.+)$/m)?.[1]?.trim();
  const url = `https://developer.mozilla.org/en-US/docs/${slug}`;

  const content = body.replace(/\n{3,}/g, "\n\n").trim();

  return splitIntoChunks(content).map((chunkText) => ({
    content: chunkText,
    metadata: { source: "mdn", url, title },
  }));
}

async function embed(text: string): Promise<number[]> {
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) {
    throw new Error(`Embedding-anrop misslyckades (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  const embedding = json.data?.[0]?.embedding;
  if (!Array.isArray(embedding)) {
    throw new Error(`Oväntat embedding-svar: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return embedding;
}

async function deleteAllDocuments() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/documents?id=gt.0`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Delete misslyckades (${res.status}): ${await res.text()}`);
  }
}

async function insertDocuments(rows: { content: string; metadata: Chunk["metadata"]; embedding: number[] }[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    throw new Error(`Insert misslyckades (${res.status}): ${await res.text()}`);
  }
}

async function countDocuments(): Promise<number> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/documents?select=id`, {
    method: "HEAD",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "count=exact",
    },
  });
  if (!res.ok) {
    throw new Error(`Count misslyckades (${res.status}): ${await res.text()}`);
  }
  const range = res.headers.get("content-range"); // "0-N/total"
  return Number(range?.split("/")[1] ?? -1);
}

// Batchar inserts (annars 528 sidor * flera chunks = tusentals enskilda
// POST:ar). Embedding sker fortfarande en text i taget (OpenRouter-anropet
// tar en input), men insert till Supabase samlas i batchar.
const INSERT_BATCH_SIZE = 50;

async function main() {
  const relPaths = readFileSync(SELECTION_LIST_PATH, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  console.log(`Läser ${relPaths.length} sidor från urvalslistan (${SELECTION_LIST_PATH})...`);

  console.log(`Rensar documents-tabellen (rensa+fyll, se filhuvud för motivering)...`);
  await deleteAllDocuments();

  let totalChunks = 0;
  let batch: { content: string; metadata: Chunk["metadata"]; embedding: number[] }[] = [];
  let pagesDone = 0;
  const failures: string[] = [];

  for (const relPath of relPaths) {
    pagesDone++;
    try {
      const chunks = loadChunks(relPath);
      for (const chunk of chunks) {
        const embedding = await embed(chunk.content);
        batch.push({ content: chunk.content, metadata: chunk.metadata, embedding });
        totalChunks++;
        if (batch.length >= INSERT_BATCH_SIZE) {
          await insertDocuments(batch);
          batch = [];
        }
      }
      if (pagesDone % 25 === 0 || pagesDone === relPaths.length) {
        console.log(`  [${pagesDone}/${relPaths.length}] "${chunks[0]?.metadata.title}" — ${totalChunks} chunks hittills`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  MISSLYCKADES: ${relPath} — ${msg}`);
      failures.push(relPath);
    }
  }
  if (batch.length > 0) {
    await insertDocuments(batch);
  }

  console.log(`\nKlart. ${pagesDone - failures.length}/${relPaths.length} sidor -> ${totalChunks} chunks inskrivna.`);
  if (failures.length > 0) {
    console.log(`Misslyckade sidor (${failures.length}):`);
    for (const f of failures) console.log(`  - ${f}`);
  }

  const finalCount = await countDocuments();
  console.log(`\nRadantal i documents efter körning: ${finalCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
