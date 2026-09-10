/**
 * Retrieval för RAG-routen: fråga in, relevanta MDN-chunks ut.
 *
 * ENDAST server-side. Service role-nyckeln kringgår RLS (`docs/db-schema.md`
 * §2 — tabellen har RLS på utan policies, så anon-nyckeln kan varken läsa
 * eller skriva) och får därför aldrig nå klienten. Importera inte den här
 * filen från en komponent.
 *
 * Talar med Supabase över REST + `fetch` i stället för `@supabase/supabase-js`.
 * Det var ursprungligen ett ägarskapsbeslut — SDK:t hade krävt en ändring i
 * `package.json`, som ägs av repo-roten — men har fått stå kvar eftersom det
 * håller AI-spåret utan egna körtidsberoenden och använder exakt samma
 * anropsmönster som Yasmins `scripts/ingest.ts`. Ändras schemat där ska det
 * ändras likadant här.
 */

/**
 * Hur många chunks som hämtas och hur svag en träff får vara.
 *
 * SIMILARITY_THRESHOLD = 0.2 är mätt, inte gissat. Yasmins baseline i
 * `docs/retrieval-sanity.md` visade similarity mellan 0.22 och 0.58 över tio
 * testfrågor, med de svagaste KORREKTA träffarna på 0.22–0.29. En tröskel på
 * 0.5 — vilket intuitivt låter rimligt för "hög likhet" — hade alltså gett
 * noll källor på de flesta frågor. Avvägningen är medveten: hellre en svag
 * källa än ingen alls, eftersom UI:t visar källorna och användaren själv kan
 * bedöma dem.
 *
 * Siffrorna ovan är från korpuset FÖRE Yasmins omchunkning (#37). Efter den
 * ligger similarity högre (0.29–0.62), så 0.2 är i dag en bred marginal
 * snarare än en knapp. Den är ändå oförändrad — höjs den måste hela sviten i
 * `docs/retrieval-sanity.md` köras om, för det är en tröskel som avgör om en
 * fråga får källor alls.
 *
 * MATCH_COUNT = 5 är taket för hur många chunks som går in i prompten. Det
 * hänger ihop med två saker: `retrieve()` nedan delar upp det per delfråga
 * vid jämförelser, och `toSources()` visar högst 4 källor i UI:t. Höjer man
 * MATCH_COUNT växer prompten (ingen teckenbudget finns) utan att fler källor
 * syns.
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

/**
 * Embeddar text med EMBEDDING_MODEL.
 *
 * Modellen MÅSTE vara densamma som ingestion använde, annars jämförs vektorer
 * från olika rum och similarity blir meningslös. Den är låst till
 * `text-embedding-3-small` (1536 dim) i PLAN.md §3 beslut 3 — byte kräver
 * omindexering av alla 1738 rader.
 *
 * Felmeddelandet nedan börjar med ordet "Embedding". Det är inte kosmetiskt:
 * `app/api/chat/route.ts` skiljer embedding-fel (502 model_error) från
 * databasfel (500 internal_error) genom att matcha på just det ordet. Byter
 * du formulering, byt på båda ställena.
 */
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

/**
 * Semantisk sökning via Postgres-funktionen `match_documents()`
 * (`docs/db-schema.md` §4). Sorteringen och tröskelfiltreringen sker i
 * databasen, inte här — pgvector kan använda hnsw-indexet, vilket en
 * filtrering i JavaScript inte skulle kunna.
 *
 * `matchCount` går att skicka in därför att `retrieve()` nedan gör flera
 * mindre sökningar för jämförelsefrågor; övriga anrop använder MATCH_COUNT.
 */
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
 * Omvandlar träffar till källchips för UI:t, enligt kontraktets §5: högst 4,
 * deduplicerade på URL.
 *
 * Dedupliceringen är inte kosmetisk. Chunks från samma MDN-sida hamnar ofta
 * på flera platser i topp-5 — Yasmins baseline gav
 * `Array.prototype.reduce()` tre gånger på samma fråga. Utan dedup visar UI:t
 * "reduce · reduce · reduce", vilket ser ut som ett fel och döljer att bara
 * en enda sida faktiskt låg bakom svaret.
 *
 * Taket 4 kommer från kontraktet, inte från koden här. Att det är lägre än
 * MATCH_COUNT (5) är avsiktligt: den femte träffen bidrar fortfarande till
 * kontexten som modellen läser, men får inte plats som chip.
 *
 * `sourceId` är radens id i `documents`, vilket ger en stabil React-nyckel
 * som inte kolliderar när två chunks från olika sidor har samma titel.
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

/**
 * Fångar "skillnaden mellan X och Y", "skillnad på X vs Y".
 *
 * Medvetet bara svenska: UI:t och system-prompten är svenska, så en engelsk
 * jämförelsefråga är ett gränsfall vi valt att inte hantera. Missar regexen
 * en jämförelse blir konsekvensen inte ett fel, bara den vanliga sökvägen —
 * alltså samma kvalitet som före #52, inte sämre.
 */
const COMPARISON = /skillnade?n?\s+(?:mellan|på)\s+(.+?)\s+(?:och|vs\.?|mot)\s+(.+)$/i;

/**
 * Grindar sönderdelningen: båda sidor måste vara begrepp med bokstäver.
 *
 * Kravet finns på grund av ett konkret regressionsfall. "skillnad på == och
 * ===" matchar COMPARISON, men sönderdelas den blir delfrågan en expanderad
 * mening runt bara "==", vilket ger en meningslös embedding —
 * Strict-equality-sidan hittas bara på hela frasen. Mätt: utan det här
 * villkoret faller just den frågan från träff till miss, alltså 10/10 → 9/10.
 *
 * Längdgränsen 30 tecken fångar det andra felfallet: en lång bisats efter
 * "och" är inte ett begrepp utan resten av meningen, och att söka på den för
 * sig ger brus. Siffran är en avvägning, inte mätt — inget MDN-begrepp i
 * korpuset är i närheten så långt.
 */
function isWordLike(text: string): boolean {
  return /[a-zA-ZåäöÅÄÖ]/.test(text) && text.length <= 30;
}

/**
 * Formuleringen är mätt mot alternativen, inte vald på känsla. Två
 * strategier som lät mer sofistikerade förlorade i `query-experiment.mjs`:
 * att översätta frågan till engelska nyckelord gav 6/10 (ingen förbättring
 * alls, trots att korpuset är engelsk MDN), och sönderdelning utan hela
 * frasen gav 5/10. Den här enkla meningen ensam gav 9/10.
 *
 * Varför den fungerar: MDN:s guide- och referenstexter ÄR hela meningar. En
 * kort nyckelordsfråga som "hur fungerar map()" ligger nära rubriker och
 * API-namn — därav träffen på `Map`-objektet i stället för
 * `Array.prototype.map()`. En hel förklarande mening ligger närmare
 * brödtexten som faktiskt svarar på frågan.
 */
function expand(query: string): string {
  return `Förklara följande om JavaScript: ${query}. Vad innebär det och hur fungerar det?`;
}

/**
 * Enda ingången routen behöver: fråga in, träffar ut.
 *
 * Två vägar. Vanliga frågor får en sökning på den expanderade frågan.
 * Jämförelsefrågor får tre — hela frasen plus en per begrepp — som varvas.
 *
 * Kostnaden för en jämförelsefråga är alltså tre embeddings i stället för en.
 * De körs parallellt, så latensen är i praktiken oförändrad; det är
 * kronor-per-anrop som tredubblas, vilket är försumbart vid vår volym.
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
  // Hur många träffar som hämtas per delsökning. Golvet 2 är inte kosmetiskt:
  // med bara en träff per lista blir varvningen meningslös, eftersom en enda
  // svag träff från ena begreppet då kan vara allt som representerar det.
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
