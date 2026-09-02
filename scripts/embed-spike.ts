// Issue #6 — embedding-spike. Bevisar kedjan Markdown → embedding → Supabase →
// similarity search end-to-end. Ingen produktionskod: chunkning = en chunk per
// sida (se docs/mdn-selection.md §Chunkningsstrategi, inget beslut taget ännu).
//
// Krav:
// - En lokal sparse checkout av mdn/content (se docs/mdn-selection.md
//   §Källträd som klonas för klon-kommandot). Sätt MDN_CONTENT_DIR till den
//   klonens rot.
// - Kör med .env.local inläst, t.ex.:
//     node --env-file=.env.local scripts/embed-spike.ts
//
// REST mot Supabase (inte @supabase/supabase-js) — service role-nyckeln i
// headers räcker för ett engångsscript och undviker ett SDK-beroende bara
// för fyra REST-anrop.

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

// Handplockade ur scripts/mdn-selection-list.txt — ämnesmässigt utspridda,
// och closures måste vara med för self-testet nedan.
const SELECTED_PAGES = [
  "files/en-us/web/javascript/guide/closures/index.md",
  "files/en-us/web/javascript/guide/functions/index.md",
  "files/en-us/web/javascript/reference/global_objects/array/map/index.md",
  "files/en-us/web/javascript/reference/global_objects/promise/index.md",
  "files/en-us/web/javascript/reference/statements/for/index.md",
] as const;

const MAX_CHUNK_CHARS = 6000; // grov gräns mot embedding-modellens 8191-token-tak

type Chunk = { content: string; metadata: { source: string; url: string; title: string } };

function loadChunk(relPath: string): Chunk {
  const raw = readFileSync(join(MDN_CONTENT_DIR!, relPath), "utf-8");
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error(`Ingen YAML-frontmatter hittad i ${relPath}`);
  }
  const [, frontmatter, body] = frontmatterMatch;
  const title = frontmatter.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? relPath;
  const slug = frontmatter.match(/^slug:\s*(.+)$/m)?.[1]?.trim();
  const url = `https://developer.mozilla.org/en-US/docs/${slug}`;

  const content = body.replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_CHUNK_CHARS);

  return { content, metadata: { source: "mdn", url, title } };
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

async function insertDocument(chunk: Chunk, embedding: number[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      content: chunk.content,
      metadata: chunk.metadata,
      embedding,
    }),
  });
  if (!res.ok) {
    throw new Error(`Insert misslyckades (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

async function matchDocuments(queryEmbedding: number[], matchCount = 5, similarityThreshold = 0.0) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_documents`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_count: matchCount,
      similarity_threshold: similarityThreshold,
    }),
  });
  if (!res.ok) {
    throw new Error(`match_documents misslyckades (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  console.log(`Läser ${SELECTED_PAGES.length} sidor från ${MDN_CONTENT_DIR}...`);
  const chunks = SELECTED_PAGES.map(loadChunk);
  for (const c of chunks) {
    console.log(`  - "${c.metadata.title}" (${c.content.length} tecken) — ${c.metadata.url}`);
  }

  console.log(`\nEmbeddar ${chunks.length} chunks via OpenRouter (${EMBEDDING_MODEL})...`);
  for (const chunk of chunks) {
    const embedding = await embed(chunk.content);
    console.log(`  embedded "${chunk.metadata.title}" -> dim=${embedding.length}`);
    const inserted = await insertDocument(chunk, embedding);
    const row = Array.isArray(inserted) ? inserted[0] : inserted;
    console.log(`  inserted id=${row?.id} into documents`);
  }

  console.log(`\nSjälvtest: "vad är en closure"`);
  const queryEmbedding = await embed("vad är en closure");
  const matches = await matchDocuments(queryEmbedding, 5, 0.0);
  console.log("match_documents-resultat:");
  for (const m of matches) {
    console.log(`  similarity=${m.similarity.toFixed(4)}  "${m.metadata?.title}"  id=${m.id}`);
  }

  const top = matches[0];
  const topIsClosure = top?.metadata?.title?.toLowerCase() === "closures";
  console.log(
    topIsClosure
      ? `\nOK: closure-sidan rankas högst (similarity=${top.similarity.toFixed(4)}).`
      : `\nFEL: closure-sidan rankas INTE högst. Toppträff var "${top?.metadata?.title}".`,
  );
  if (!topIsClosure) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
