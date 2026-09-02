/**
 * POST /api/chat — MOCK-implementation (wave 0/1, issue #8).
 *
 * Följer docs/api-contract.md till punkt och pricka: samma request-validering,
 * samma streamformat (AI SDK UI Message Stream v1 över SSE) och samma
 * felkoder som den riktiga RAG-routen kommer ha. Frontenden (#11/#12) byggs
 * mot den här routen och ska inte behöva ändras när riktig RAG (wave 1)
 * byts in — det är kontraktets hela poäng.
 *
 * Streamen är handskriven (inte via `streamText`) med flit: mocken har ingen
 * modell att streama ifrån, och genom att skriva händelserna själva vet vi
 * att wire-formatet i kontraktets §4 faktiskt är det vi levererar.
 */

type Level = 'beginner' | 'student' | 'developer';

const LEVELS: readonly Level[] = ['beginner', 'student', 'developer'] as const;

/**
 * Mocksvaret varierar med nivån så att nivåväljaren (#12) går att verifiera
 * i UI:t utan riktig LLM: byt nivå → skicka samma fråga → få annan ton.
 */
const MOCK_ANSWERS: Record<Level, string> = {
  beginner:
    '(mock · nybörjare) Tänk dig en ryggsäck: när en funktion skapas packar den ner ' +
    'variablerna som fanns runt omkring den. En closure är funktionen plus den ryggsäcken — ' +
    'den kan öppna ryggsäcken och använda variablerna långt senare, även när stället den ' +
    'skapades på inte längre körs. Vill du att jag förklarar något steg långsammare?',
  student:
    '(mock · student) En closure är en funktion tillsammans med sitt lexikala scope: ' +
    'funktionen behåller referenser till variabler från det yttre scope där den definierades, ' +
    'även efter att den yttre funktionen har returnerat. Det är därför en callback kan läsa ' +
    'variabler från sin omgivning. Fundera på: vad händer med en let-variabel i en loop?',
  developer:
    '(mock · utvecklare) Closures = funktionsvärde + captured environment record. Varje anrop ' +
    'av den yttre funktionen skapar en ny environment record, så två closures från samma ' +
    'fabrik delar ingenting. Vanliga fallgropar: loop-variabler med var (delad record) och ' +
    'oavsiktlig retention av stora objekt via fångade referenser.',
};

/** Fejkkällor enligt kontraktets §5 — riktiga MDN-URL:er men statiskt valda. */
const MOCK_SOURCES = [
  {
    sourceId: 'mdn-closures',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures',
    title: 'Closures — MDN',
  },
  {
    sourceId: 'mdn-scope',
    url: 'https://developer.mozilla.org/en-US/docs/Glossary/Scope',
    title: 'Scope — MDN',
  },
] as const;

/** Felsvar innan streamen börjat — vanlig JSON, kontraktets §6. */
function jsonError(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(req: Request): Promise<Response> {
  // --- Validering enligt kontraktets §2–§3 ---
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_body', 'Request body must be valid JSON');
  }

  const { messages, level } = (body ?? {}) as { messages?: unknown; level?: unknown };

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError(400, 'invalid_body', 'messages is required and must be non-empty');
  }

  // level saknas → beginner (medvetet, se §3: låter #11 byggas före #12).
  // level med ogiltigt värde → 400, felstavningar ska synas direkt.
  let lvl: Level = 'beginner';
  if (level !== undefined && level !== null) {
    if (typeof level !== 'string' || !LEVELS.includes(level as Level)) {
      return jsonError(400, 'invalid_level', 'level must be beginner, student or developer');
    }
    lvl = level as Level;
  }

  // --- Streamat svar enligt kontraktets §4 (UI Message Stream v1 / SSE) ---
  const encoder = new TextEncoder();
  // Splitta på ordgräns med behållna mellanslag → deltas som känns som streaming.
  const deltas = MOCK_ANSWERS[lvl].match(/\S+\s*/g) ?? [MOCK_ANSWERS[lvl]];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      send({ type: 'start' });
      send({ type: 'start-step' });
      send({ type: 'text-start', id: '0' });
      for (const delta of deltas) {
        send({ type: 'text-delta', id: '0', delta });
        // Liten paus per ord så streamingen är synlig i UI:t (mock-lyx,
        // riktiga routen får sin naturliga takt från modellen).
        await new Promise((r) => setTimeout(r, 30));
      }
      send({ type: 'text-end', id: '0' });

      // Källor efter text-end, före finish (§5) — då finns de inte i
      // message.parts förrän svaret är färdigstreamat, vilket uppfyller
      // designbeslut 5 i docs/ui-sketch.md utan klientlogik.
      for (const source of MOCK_SOURCES) {
        send({ type: 'source-url', ...source });
      }

      send({ type: 'finish-step' });
      send({ type: 'finish' });
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  // Alla fem headers är obligatoriska enligt §4.
  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'x-vercel-ai-ui-message-stream': 'v1',
      'x-accel-buffering': 'no',
    },
  });
}
