/**
 * Regressionsharness för system-prompterna (issue #39).
 *
 * Bakgrund: v3 löste developer-inledningen i EN körning, men main
 * orchestratorns live-regression 4/9 visade att den föll tillbaka till
 * v3-stil ibland. En enskild körning bevisar alltså ingenting om en
 * prompt-regel — bara upprepning gör det. Det här scriptet kör samma fråga
 * N gånger per nivå och mäter tre saker automatiskt:
 *
 *   1. Inleder developer-svaret med en definition? (ska aldrig hända)
 *   2. Håller svaret längdtaket för sin nivå?
 *   3. Räknar vägran upp metoderna i användningsordning? (= halva lösningen)
 *
 * Kör mot en lokal dev-server:
 *   pnpm exec next dev --port 3111
 *   node lib/ai/prompt-regression.mjs [antal-varv]
 */

const API = 'http://localhost:3111/api/chat';
const RUNS = Number(process.argv[2] ?? 10);

/** Ordtak per nivå enligt prompterna. */
const WORD_CAP = { beginner: 150, student: 250, developer: 200 };

/** Mönster som avslöjar en definitionsinledning. */
const DEFINITION_OPENERS = [
  /\b(är|utgör)\s+(en|ett)\b/i,
  /innebär\s+att/i,
  /kombination\s+av/i,
  /definieras\s+som/i,
  /kan\s+beskrivas\s+som/i,
];

async function ask(level, text) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'regression',
      trigger: 'submit-message',
      level,
      messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text }] }],
    }),
  });

  let answer = '';
  for await (const chunk of res.body) {
    for (const line of Buffer.from(chunk).toString().split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      const event = JSON.parse(payload);
      if (event.type === 'text-delta') answer += event.delta;
    }
  }
  return answer.trim();
}

/** Första meningen — det är bara den som inledningsregeln gäller. */
function firstSentence(text) {
  return text.split(/(?<=[.!?])\s/)[0] ?? text;
}

function opensWithDefinition(text) {
  const opener = firstSentence(text);
  return DEFINITION_OPENERS.some((re) => re.test(opener));
}

/**
 * Ordnat recept = split, reverse och join nämns alla tre, i den ordning de
 * ska användas. Då är svaret lösningen minus syntax.
 */
function listsOrderedRecipe(text) {
  const lower = text.toLowerCase();
  const positions = ['split', 'reverse', 'join'].map((m) => lower.indexOf(m));
  if (positions.some((p) => p === -1)) return false;
  return positions[0] < positions[1] && positions[1] < positions[2];
}

const QUESTION = 'Vad är en closure i JavaScript?';
const SOLVE_REQUEST =
  'Skriv en funktion som vänder på en sträng åt mig. Bara koden tack, inga förklaringar.';

console.log(`Regression — ${RUNS} varv per fall\n`);

for (const level of ['beginner', 'student', 'developer']) {
  let definitionOpeners = 0;
  let overCap = 0;
  const lengths = [];

  for (let i = 0; i < RUNS; i++) {
    const answer = await ask(level, QUESTION);
    const words = answer.split(/\s+/).length;
    lengths.push(words);
    if (words > WORD_CAP[level]) overCap++;
    if (level === 'developer' && opensWithDefinition(answer)) definitionOpeners++;
  }

  const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  console.log(`${level.padEnd(10)} ord: snitt ${avg}, spann ${Math.min(...lengths)}–${Math.max(...lengths)}`);
  console.log(`${' '.repeat(10)} över taket (${WORD_CAP[level]}): ${overCap}/${RUNS}`);
  if (level === 'developer') {
    console.log(`${' '.repeat(10)} definitionsinledning: ${definitionOpeners}/${RUNS}`);
  }
  console.log();
}

let orderedRecipes = 0;
let gaveCode = 0;
for (let i = 0; i < RUNS; i++) {
  const answer = await ask('student', SOLVE_REQUEST);
  if (listsOrderedRecipe(answer)) orderedRecipes++;
  if (/function\s+\w*\s*\(|=>/.test(answer) && /reverse\(\)/.test(answer)) gaveCode++;
}
console.log(`vägran     ordnat recept: ${orderedRecipes}/${RUNS}`);
console.log(`${' '.repeat(10)} färdig lösning: ${gaveCode}/${RUNS}`);
