/**
 * Experiment för issue #52 — query-time-normalisering.
 *
 * Mäter Yasmins sanity-svit (docs/retrieval-sanity.md) med hennes kriterium:
 * topp-3, similarity_threshold 0.0, "syns den förväntade MDN-sidan?".
 * Kör flera normaliseringsstrategier mot samma korpus så att de kan jämföras
 * rakt av mot hennes före-siffror.
 *
 *   node --env-file=.env.local lib/ai/query-experiment.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;

/** Yasmins tio frågor + vilken MDN-sida som räknas som rätt svar. */
const SUITE = [
  { q: 'vad är en closure',                    expect: '/Guide/Closures' },
  { q: 'skillnaden mellan let och const',      expect: '/Statements/let' },
  { q: 'hur fungerar map()',                   expect: '/Array/map' },
  { q: 'vad är async/await',                   expect: '/async_function' },
  { q: 'hur använder man fetch för att hämta data', expect: '/Using_Fetch' },
  { q: 'vad är en prototyp i JavaScript',      expect: '/Inheritance_and_the_prototype_chain' },
  { q: 'vad är hoisting',                      expect: '/Grammar_and_types' },
  { q: 'skillnad på == och ===',               expect: '/Strict_equality' },
  { q: 'hur fungerar this',                    expect: '/Operators/this' },
  { q: 'vad gör reduce()',                     expect: '/Array/reduce' },
];

async function embed(text) {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`embedding ${res.status}`);
  return (await res.json()).data[0].embedding;
}

async function search(text, count = 3) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_documents`, {
    method: 'POST',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query_embedding: await embed(text), match_count: count, similarity_threshold: 0.0 }),
  });
  if (!res.ok) throw new Error(`match_documents ${res.status}`);
  return res.json();
}

// ---------- strategier ----------

/** Som Yasmin mätte: frågan rakt in. */
const raw = async (q) => search(q, 3);

/** Issuens förslag: expandera till hel mening. */
const sentence = async (q) =>
  search(`Förklara följande om JavaScript: ${q}. Vad innebär det och hur fungerar det?`, 3);

/**
 * Svensk fråga → engelska nyckelord. Korpuset är engelsk MDN; frågorna är
 * svenska. Strippar svenska frågeord och lägger till domänordet.
 */
const SV_STOPWORDS = /\b(vad|är|en|ett|hur|fungerar|gör|skillnaden?|mellan|och|på|man|använder|för|att|hämta|data|i)\b/gi;
const english = async (q) => {
  const terms = q.replace(SV_STOPWORDS, ' ').replace(/\s+/g, ' ').trim();
  return search(`JavaScript ${terms}`, 3);
};

/**
 * Yasmins rekommendation: sönderdela jämförelsefrågor till en sökning per
 * begrepp och unionera. Icke-jämförande frågor går orörda igenom.
 */
const COMPARISON = /skillnade?n?\s+(?:mellan|på)\s+(.+?)\s+(?:och|vs\.?|mot)\s+(.+)$/i;
const decompose = async (q) => {
  const m = q.match(COMPARISON);
  if (!m) return search(q, 3);
  const [a, b] = [m[1].trim(), m[2].trim()];
  const [ra, rb] = await Promise.all([search(`JavaScript ${a}`, 2), search(`JavaScript ${b}`, 2)]);
  return [...ra, ...rb].sort((x, y) => y.similarity - x.similarity).slice(0, 3);
};

/** Kombination: sönderdela jämförelser, annars engelska nyckelord. */
const combined = async (q) => (COMPARISON.test(q) ? decompose(q) : english(q));

/**
 * Kandidat: meningsexpansion alltid, plus VARVADE träffar för
 * jämförelsefrågor så att båda begreppen garanterat får plats. Att sortera
 * unionen på similarity räcker inte — då tar det starkare begreppet alla
 * platserna, vilket är exakt felet som gör att `let` aldrig syns.
 */
const EXPAND = (q) => `Förklara följande om JavaScript: ${q}. Vad innebär det och hur fungerar det?`;

const isWordLike = (s) => /[a-zA-ZåäöÅÄÖ]/.test(s) && s.length <= 30;

const balanced = async (q, count = 3) => {
  const m = q.match(COMPARISON);
  // Sönderdela bara när båda sidor är begrepp med bokstäver. "skillnad på ==
  // och ===" ser ut som en jämförelse men går sönder av sönderdelning: en
  // expanderad mening runt bara "==" ger en meningslös embedding, och
  // Strict-equality-sidan hittas bara på den hela frasen.
  if (!m || !isWordLike(m[1].trim()) || !isWordLike(m[2].trim())) {
    return search(EXPAND(q), count);
  }

  // Tre sökningar: hela frågan plus ett per begrepp. Hela frasen behövs —
  // "const" ensamt hittar inte const-sidan, den hittas bara via jämförelsen.
  // Delfrågorna behövs — "let" syns bara via sin egen sökning.
  const per = Math.max(2, Math.ceil(count / 2));
  const [whole, a, b] = await Promise.all([
    search(EXPAND(q), per),
    search(EXPAND(m[1].trim()), per),
    search(EXPAND(m[2].trim()), per),
  ]);

  const merged = [];
  for (let i = 0; i < per; i++) {
    for (const list of [whole, a, b]) if (list[i]) merged.push(list[i]);
  }
  return merged.slice(0, count);
};

const STRATEGIES = { raw, sentence, balanced };

// ---------- körning ----------

const results = {};

for (const [name, fn] of Object.entries(STRATEGIES)) {
  let hits = 0;
  const rows = [];
  for (const { q, expect } of SUITE) {
    const matches = await fn(q);
    const hit = matches.some((m) => m.metadata.url.includes(expect));
    if (hit) hits++;
    rows.push({ q, hit, top: matches.map((m) => `${m.metadata.title} ${m.similarity.toFixed(3)}`) });
  }
  results[name] = { hits, rows };
  console.log(`${name.padEnd(10)} ${hits}/10`);
}

console.log('\n--- per fråga ---');
console.log('fråga'.padEnd(46) + Object.keys(STRATEGIES).map((s) => s.slice(0, 4).padEnd(6)).join(''));
for (let i = 0; i < SUITE.length; i++) {
  const line = SUITE[i].q.slice(0, 44).padEnd(46) +
    Object.keys(STRATEGIES).map((s) => (results[s].rows[i].hit ? '✅' : '❌').padEnd(5)).join('');
  console.log(line);
}
