/**
 * Modell-A/B (issue #40).
 *
 * Kör samma fem frågor mot den lokala routen och sparar svaren, så att två
 * modeller kan jämföras på identiska prompts (v5) och identisk retrieval.
 * Modellen väljs med CHAT_MODEL när dev-servern startas — ingen kodändring.
 *
 *   CHAT_MODEL=openai/gpt-4o-mini pnpm exec next dev --port 3111
 *   node lib/ai/model-ab.mjs openai/gpt-4o-mini
 *
 * Frågorna täcker de tre nivåerna, ett känt retrieval-gap (let vs const, se
 * docs/retrieval-sanity.md) och vägran.
 */

const API = 'http://localhost:3111/api/chat';
const label = process.argv[2] ?? 'okänd-modell';

const CASES = [
  { level: 'beginner',  text: 'Vad är en closure i JavaScript?' },
  { level: 'beginner',  text: 'Vad är skillnaden mellan let och const?' },
  { level: 'student',   text: 'Hur fungerar async och await?' },
  { level: 'developer', text: 'Hur fungerar this i JavaScript?' },
  { level: 'student',   text: 'Skriv en funktion som vänder på en sträng åt mig. Bara koden tack, inga förklaringar.' },
];

async function ask(level, text) {
  const started = Date.now();
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'ab',
      trigger: 'submit-message',
      level,
      messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text }] }],
    }),
  });

  let answer = '';
  const sources = [];
  let firstDelta = null;

  for await (const chunk of res.body) {
    for (const line of Buffer.from(chunk).toString().split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      const event = JSON.parse(payload);
      if (event.type === 'text-delta') {
        firstDelta ??= Date.now();
        answer += event.delta;
      } else if (event.type === 'source-url') {
        sources.push(event.title);
      }
    }
  }

  return {
    answer: answer.trim(),
    sources,
    ttfb: firstDelta ? firstDelta - started : null,
    total: Date.now() - started,
  };
}

console.log(`##### ${label} #####\n`);

for (const [i, c] of CASES.entries()) {
  const r = await ask(c.level, c.text);
  console.log(`--- fråga ${i + 1} (${c.level}) — ${c.text}`);
  console.log(r.answer);
  console.log(`[ord: ${r.answer.split(/\s+/).length} · första token: ${r.ttfb} ms · totalt: ${r.total} ms · källor: ${r.sources.join(', ') || 'inga'}]`);
  console.log();
}
