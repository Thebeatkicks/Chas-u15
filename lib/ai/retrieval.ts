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
export async function matchDocuments(
  queryEmbedding: number[],
  matchCount: number = MATCH_COUNT,
): Promise<Match[]> {
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
      match_count: matchCount,
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

/**
 * Query-time-normalisering (issue #52).
 *
 * Bakgrund: Yasmins rotorsaksanalys i `docs/retrieval-sanity.md` visade tre
 * gap som låg 0,0006–0,0098 similarity bakom rank 3 efter hennes
 * chunkningsfix — marginaler som ingen chunkningsstrategi kan garantera att
 * vinna, men som frågans egen formulering kan.
 *
 * Två steg, båda mätta (se `lib/ai/query-experiment.mjs`):
 *
 * 1. Korta nyckelordsfrågor expanderas till en hel mening före embedding.
 *    Det ensamt tog sviten från 6/10 till 9/10 — en kort fråga som "hur
 *    fungerar map()" ligger nära `Map`-objektet i embeddingrymden, medan en
 *    hel förklarande mening drar mot guide- och referenstexter som är
 *    skrivna som hela meningar.
 *
 * 2. Jämförelsefrågor ("skillnaden mellan X och Y") söks en gång per begrepp,
 *    och träffarna VARVAS i stället för att sorteras på similarity. Det är
 *    avgörande: sorterar man unionen tar det starkare begreppet alla
 *    platserna, vilket är precis felet som gjorde att `let` aldrig syntes
 *    bredvid `const`. Varvning tar sviten från 9/10 till 10/10.
 */

/** "skillnaden mellan X och Y", "skillnad på X vs Y". */
const COMPARISON = /skillnade?n?\s+(?:mellan|på)\s+(.+?)\s+(?:och|vs\.?|mot)\s+(.+)$/i;

/**
 * Sönderdelning kräver att båda sidor är begrepp med bokstäver. "skillnad på
 * == och ===" ser ut som en jämförelse men går sönder av sönderdelning: en
 * expanderad mening runt bara "==" ger en meningslös embedding, och
 * Strict-equality-sidan hittas bara på hela frasen. Mätt: utan det här
 * villkoret faller den frågan från träff till miss.
 */
function isWordLike(text: string): boolean {
  return /[a-zA-ZåäöÅÄÖ]/.test(text) && text.length <= 30;
}

function expand(query: string): string {
  return `Förklara följande om JavaScript: ${query}. Vad innebär det och hur fungerar det?`;
}

/**
 * Hämtar kontext för en fråga: normaliserar, söker och returnerar träffarna.
 * Ersätter direktanropen till embedQuery + matchDocuments i routen.
 */
export async function retrieve(question: string): Promise<Match[]> {
  const comparison = question.match(COMPARISON);

  if (!comparison || !isWordLike(comparison[1].trim()) || !isWordLike(comparison[2].trim())) {
    return matchDocuments(await embedQuery(expand(question)), MATCH_COUNT);
  }

  // Tre sökningar: hela frågan plus en per begrepp. Båda behövs, och det är
  // mätt: en expanderad mening runt bara "const" hittar inte const-sidan alls
  // (den hittas bara via hela jämförelsefrasen), medan `let` bara syns via
  // sin egen delfråga. Utan hela frasen tappar svaret const, utan
  // delfrågorna tappar det let.
  const per = Math.max(2, Math.ceil(MATCH_COUNT / 2));
  const [whole, first, second] = await Promise.all([
    embedQuery(expand(question)).then((e) => matchDocuments(e, per)),
    embedQuery(expand(comparison[1].trim())).then((e) => matchDocuments(e, per)),
    embedQuery(expand(comparison[2].trim())).then((e) => matchDocuments(e, per)),
  ]);

  // Varva, inte sortera — se doc-kommentaren ovan.
  const merged: Match[] = [];
  for (let i = 0; i < per; i++) {
    for (const list of [whole, first, second]) if (list[i]) merged.push(list[i]);
  }

  return merged.slice(0, MATCH_COUNT);
}
