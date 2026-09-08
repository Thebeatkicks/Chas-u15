/**
 * Spike från wave 0 (#9) — bevisade att AI SDK + OpenRouter + gpt-4o-mini
 * streamar, innan någon route fanns.
 *
 * Sparad för att den fortfarande är det snabbaste sättet att svara på frågan
 * "är det modellen eller vår kod som är trasig?". Den går förbi routen,
 * retrieval och Supabase och pratar direkt med modellen, så ett fungerande
 * svar här isolerar felet till vår egen kod. Den är också enda stället där
 * man ser råa deltas tickas in i terminalen.
 *
 * Filen är .mjs och inte .ts med flit — Node kräver .ts-ändelsen i importen
 * för att kunna köra TypeScript direkt, men repots tsconfig tillåter inte
 * sådana importer och tsconfig.json ägs av repo-roten. Som .mjs ligger den
 * utanför typkontrollen och kan inte bryta Vercel-bygget, medan
 * lib/ai/openrouter.ts som den importerar förblir typad TypeScript.
 *
 * Kör:
 *   node --env-file=.env.local --experimental-strip-types lib/ai/spike-chat.mjs
 *   node --env-file=.env.local --experimental-strip-types lib/ai/spike-chat.mjs "din fråga"
 */
import { streamText } from 'ai';
import { getChatModel } from './openrouter.ts';

/**
 * Minimal version av "förklara, lös inte" (PLAN.md §3 beslut 6), som den såg
 * ut innan prompterna itererades.
 *
 * Den lever kvar med flit och ska INTE synkas med `lib/ai/system-prompts.ts`:
 * poängen med spiken är att testa modellen med minsta möjliga instruktion. Vill
 * du testa de riktiga prompterna, kör `lib/ai/prompt-regression.mjs` i stället.
 */
const SYSTEM_PROMPT = [
  'Du är JS Sensei, en lärarassistent för JavaScript.',
  'Du FÖRKLARAR — du löser inte uppgifter åt användaren.',
  'Om någon ber dig skriva färdig kod som löser deras uppgift: skriv den inte.',
  'Förklara i stället begreppen som behövs, och ställ en fråga som leder dem vidare.',
  'Korta kodexempel som illustrerar ett begrepp är tillåtna — färdiga lösningar är det inte.',
  'Svara på svenska.',
].join(' ');

const question = process.argv[2] ?? 'Vad är en closure i JavaScript?';

const { model, modelId } = getChatModel();

console.log(`modell:  ${modelId}`);
console.log(`fråga:   ${question}`);
console.log('---');

const startedAt = Date.now();
let firstChunkAt = null;
let chunks = 0;

const result = streamText({
  model,
  system: SYSTEM_PROMPT,
  prompt: question,
});

// Skriver varje delta direkt till stdout — ser man texten växa fram i
// terminalen så streamar det på riktigt, vilket är hela poängen med spiken.
for await (const delta of result.textStream) {
  firstChunkAt ??= Date.now();
  chunks++;
  process.stdout.write(delta);
}

const usage = await result.totalUsage;
const finishReason = await result.finishReason;

console.log('\n---');
console.log(`chunks:            ${chunks}`);
console.log(`tid till första:   ${firstChunkAt - startedAt} ms`);
console.log(`total tid:         ${Date.now() - startedAt} ms`);
console.log(`finishReason:      ${finishReason}`);
console.log(`tokens:            in ${usage.inputTokens} / ut ${usage.outputTokens}`);
