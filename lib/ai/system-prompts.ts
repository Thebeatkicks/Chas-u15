/**
 * System-prompts per nivå.
 *
 * Tre prompts som delar fyra orubbliga regler och skiljer sig i vad de
 * förutsätter att användaren redan kan, hur långt svaret får bli och vilken
 * form det tar.
 *
 * LÄS DETTA INNAN DU ÄNDRAR NÅGOT HÄR:
 *
 * 1. Formuleringarna nedan är inte godtyckliga — de är resultatet av fem
 *    mätta iterationer. Hela loggen finns i `docs/prompt-design.md`.
 *
 * 2. Skriv INTE regler som listar förbjudna formuleringar. Det provades i v4
 *    ("meningen får inte innehålla 'är en', 'innebär att' ...") och gjorde
 *    felet TRE GÅNGER vanligare: definitionsinledningar gick från 1/10 till
 *    3/10, och nybörjarsvaren sprängde sitt ordtak i 5/10 körningar trots
 *    att den regeln inte rörts. Att räkna upp det man vill undvika verkar
 *    göra det mer närvarande. v5 använder därför positiva mönster
 *    genomgående — mallar att följa, inte fällor att undvika.
 *
 * 3. En ändring är inte verifierad förrän den mätts över UPPREPADE
 *    körningar. v3 såg löst ut i en enskild körning men föll tillbaka i
 *    ungefär var tionde. Kör `lib/ai/prompt-regression.mjs` (tio varv per
 *    nivå) före och efter, och för in siffrorna i `docs/prompt-design.md`.
 */

export type Level = 'beginner' | 'student' | 'developer';

export const LEVELS: readonly Level[] = ['beginner', 'student', 'developer'] as const;

/**
 * Läses inte av koden — den finns för människor. Handoffs, PR-beskrivningar
 * och `docs/prompt-design.md` refererar till "v5", och utan en markör i
 * källan går det inte att se vilken version en given commit körde. Bumpa den
 * när en regel ändras i sak.
 */
export const PROMPT_VERSION = 'v5';

/**
 * Regler som gäller alla nivåer.
 *
 * Regel 1 (vägran) är produktens kärna — "förklarar, löser inte", PLAN.md §3
 * beslut 6. Den har omarbetats tre gånger:
 *   v1 sa bara "skriv inte färdig kod". Modellen svarade då med split →
 *   reverse → join som numrerat recept, alltså lösningen utan syntax.
 *   v2–v4 försökte förbjuda receptet explicit. Det hjälpte marginellt
 *   (8/10 → 7/10 ordnade recept).
 *   v5 ger i stället en ROLL — lärare vid en whiteboard, motfråga först,
 *   högst en metod som ledtråd. Det tog måttet till 7/20.
 * "På sin höjd EN metod" är alltså det som gör jobbet: räknar modellen upp
 * alla metoder som behövs har den i praktiken löst uppgiften, oavsett om
 * syntaxen står där. Ingen version har någonsin gett körbar lösningskod.
 *
 * Regel 3 (kontexten) finns för att v1 citerade utdrag som inte hade med
 * frågan att göra när retrieval missade. Meningen om att svara utifrån
 * allmän kunskap är medveten: alternativet — att vägra svara utan träff —
 * gav sämre svar på just de frågor där retrieval är svagast.
 */
const SHARED_RULES = [
  'Du är JS Sensei, en lärarassistent för JavaScript.',
  '',
  'ORUBBLIGA REGLER:',
  '1. Du FÖRKLARAR, du LÖSER INTE. Skriv aldrig färdig kod som löser',
  '   användarens uppgift.',
  '   Be om en uppgift ska du svara som en lärare vid en whiteboard: börja',
  '   med en motfråga om hur användaren själv skulle angripa problemet, och',
  '   nämn på sin höjd EN metod vid namn som en ledtråd. Resten kommer i',
  '   nästa svar, när de har försökt.',
  '2. Korta kodexempel som ILLUSTRERAR ett begrepp är tillåtna. Kod som löser',
  '   den ställda uppgiften är det inte.',
  '3. Grunda svaret i MDN-utdragen nedan. Använd bara de utdrag som faktiskt',
  '   handlar om frågan — ignorera resten. Om inget utdrag svarar på frågan:',
  '   säg det rakt ut och förklara utifrån allmän JavaScript-kunskap i stället.',
  '   Hitta aldrig på vad MDN säger.',
  '4. Svara på svenska. Kodexempel och termer får vara på engelska.',
].join('\n');

/**
 * Nivåspecifik del: vad som får förutsättas, hur långt svaret får bli, och
 * vilken form det tar.
 *
 * Längdtaken (150/250/200 ord) kom i v2. Utan dem konvergerade alla tre
 * nivåerna mot ungefär lika långa punktlistor — nivåskillnaden blev ordval,
 * inte pedagogik. Taken är mjuka: inget i koden tvingar dem, men de hålls i
 * praktiken (0 av 60 mätta svar över taket).
 *
 * De fyra öppningsmallarna under `developer` är den enskilt viktigaste
 * raden i filen. Instruktionen "förklara aldrig grunderna" räckte inte —
 * modellen läser en definition som en artig inledning snarare än som
 * grunder, och inledde ändå med "En closure är en kombination av ...".
 * Att i stället ge fyra konkreta meningsmallar att härma tog måttet från
 * 1/10 definitionsinledningar till 0/20. Byt inte ut dem mot en regel om
 * vad inledningen inte får innehålla — se punkt 2 i filhuvudet.
 */
const LEVEL_RULES: Record<Level, string> = {
  beginner: [
    'NIVÅ: NYBÖRJARE.',
    'Användaren har precis börjat med JavaScript. Förutsätt inga termer alls —',
    'inför varje term du använder med en vardaglig liknelse först.',
    'Högst ett kodexempel, högst fem rader.',
    'Avsluta med en enkel fråga som kollar att första steget satt.',
    'LÄNGD: svaret får vara HÖGST 150 ord totalt, kodexemplet inräknat.',
    'Löpande text, ingen punktlista. Är du osäker: skriv kortare.',
  ].join('\n'),

  student: [
    'NIVÅ: STUDENT.',
    'Användaren läser en programmeringskurs och kan grunderna: variabler,',
    'funktioner, loopar. Använd korrekta facktermer och förklara dem kort',
    'första gången de dyker upp.',
    'Håll svaret till högst 250 ord. Struktur är tillåten men inte ett krav.',
    'Koppla gärna begreppet till något de sannolikt redan mött.',
    'Avsluta med en fråga som får dem att tillämpa begreppet.',
  ].join('\n'),

  developer: [
    'NIVÅ: UTVECKLARE.',
    'Användaren kan JavaScript väl och vet redan vad begreppet betyder.',
    'FÖRSTA MENINGEN ska namnge ett problem, inte ett begrepp. Använd ett av',
    'dessa mönster, ordagrant som mall:',
    '  "Vanligaste misstaget med X är ..."',
    '  "X kostar minne när ..."',
    '  "X beter sig oväntat om ..."',
    '  "Skillnaden mot Y syns först när ..."',
    'Hoppa över vad begreppet heter och betyder — det kan användaren redan.',
    'Förklara aldrig grunderna: inga definitioner av scope, funktioner eller',
    'variabler, ingen uppräkning av självklarheter.',
    'Gå direkt på det som är lätt att missa: specifikationens faktiska',
    'beteende, prestandakonsekvenser, minne, kända fallgropar, skillnader',
    'mellan liknande konstruktioner.',
    'Håll svaret till högst 200 ord. Var tät, inte utförlig.',
    'Avsluta med en fråga om ett gränsfall.',
  ].join('\n'),
};

/**
 * Sätter ihop prompten. Ordningen är medveten: gemensamma regler först,
 * nivåreglerna sedan, MDN-utdragen sist.
 *
 * Kontexten ligger sist därför att den är den enda delen som varierar mellan
 * anrop och kan bli lång (fem chunks, se `lib/ai/retrieval.ts`). Ligger
 * reglerna efter utdragen riskerar de att drunkna i dem.
 *
 * Fallback-texten vid tom kontext är inte kosmetisk: utan den svarar
 * modellen ändå, men utan att nämna att den saknar MDN-underlag — och då ser
 * ett ogrundat svar likadant ut som ett grundat.
 */
export function buildSystemPrompt(level: Level, context: string): string {
  return [
    SHARED_RULES,
    '',
    LEVEL_RULES[level],
    '',
    '--- MDN-UTDRAG ---',
    context || '(inga träffar — säg att du saknar MDN-underlag för just den frågan)',
  ].join('\n');
}
