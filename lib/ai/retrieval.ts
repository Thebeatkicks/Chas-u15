/**
 * Retrieval för RAG-routen (issue #19).
 *
 * Talar med Supabase över REST + fetch — samma mönster som Yasmins
 * `scripts/embed-spike.ts` och `scripts/ingest.ts`. Medvetet inget
 * `@supabase/supabase-js`: det hade krävt en ändring i `package.json`, som
 * ägs av repo-roten, och REST-vägen är redan bevisad av hennes ingestion.
 *
 * ENDAST server-side. Service role-nyckeln kringgår RLS (se docs/db-schema.md
 * §2) och får aldrig nå klienten.
 */

/**
 * Hur många chunks som hämtas och hur svag en träff får vara.
 *
 * Tröskeln är satt utifrån Yasmins baseline i `docs/retrieval-sanity.md`:
 * över tio testfrågor låg similarity mellan 0.22 och 0.58, och de svagaste
 * korrekta träffarna ("vad är hoisting", "hur fungerar this") låg på
 * 0.22–0.29. En tröskel på 0.5 hade gett noll källor på de flesta frågor.
 * 0.2 släpper igenom nästan allt som `match_documents` rankar högst, vilket
 * är rätt avvägning i wave 1 — hellre en svag källa än ingen alls.
 *
 * Retrieval-tuning (chunkstorlek, overlap, tröskel) är wave 2:s jobb.
 */
export const MATCH_COUNT = 5;
export const SIMILARITY_THRESHOLD = 0.2;

export type Match = {
  id: number;
  content: string;
  metadata: { source: string; url: string; title: string };
  similarity: number;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} saknas. Lägg den i .env.local (gitignorad) — se .env.example.`,
    );
  }
  return value;
}

/** Embeddar frågan med samma modell som ingestion använde. */
export async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireEnv('OPENROUTER_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: requireEnv('EMBEDDING_MODEL'), input: text }),
  });

  if (!res.ok) {
    throw new Error(`Embedding-anrop misslyckades (${res.status})`);
  }

  const json = await res.json();
  const embedding = json.data?.[0]?.embedding;

  if (!Array.isArray(embedding)) {
    throw new Error('Oväntat svar från embedding-endpointen');
  }

  return embedding;
}

/** Semantisk sökning via `match_documents()` (docs/db-schema.md §4). */
export async function matchDocuments(queryEmbedding: number[]): Promise<Match[]> {
  const url = requireEnv('SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  const res = await fetch(`${url}/rest/v1/rpc/match_documents`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_count: MATCH_COUNT,
      similarity_threshold: SIMILARITY_THRESHOLD,
    }),
  });

  if (!res.ok) {
    throw new Error(`match_documents misslyckades (${res.status})`);
  }

  return res.json();
}

/**
 * Källor till klienten, enligt kontraktets §5: max 4, deduplicerade på URL.
 *
 * Dedupliceringen är inte kosmetisk. Yasmins baseline visar att samma sida
 * ofta upptar flera platser i topp-5 (fråga 10 gav Array.prototype.reduce()
 * tre gånger) — utan dedup skulle UI:t visa "reduce · reduce · reduce".
 */
export function toSources(matches: Match[]) {
  const seen = new Set<string>();
  const sources = [];

  for (const match of matches) {
    const { url, title } = match.metadata;
    if (seen.has(url)) continue;
    seen.add(url);
    sources.push({ sourceId: `doc-${match.id}`, url, title });
    if (sources.length === 4) break;
  }

  return sources;
}
