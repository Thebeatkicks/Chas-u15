/**
 * POST /api/chat — riktig RAG-implementation (wave 1, issue #19).
 *
 * Ersätter mock-routen från #8. Kontraktet i `docs/api-contract.md` är
 * OFÖRÄNDRAT (§9): samma request-validering, samma streamformat, samma
 * felkoder, samma källformat. Frontenden (#21) ska inte behöva en enda
 * kodändring — det är hela poängen med kontraktet.
 *
 * Kedjan: fråga → embedding → match_documents (pgvector) → kontext →
 * streamText mot OpenRouter → source-url-händelser ur träffarnas metadata.
 *
 * Streamen skrivs för hand i stället för via `toUIMessageStreamResponse()`.
 * Skälet är ordningen: kontraktets §5 kräver att källorna skickas EFTER
 * `text-end` men FÖRE `finish`, så att de inte finns i `message.parts` medan
 * texten strömmar (Ernests designbeslut 5). Med handskriven stream har vi
 * exakt kontroll över den ordningen, och wire-formatet är detsamma som
 * mocken levererade och som §4 specificerar.
 */
import { streamText } from 'ai';
import { getChatModel } from '@/lib/ai/openrouter';
import { embedQuery, matchDocuments, toSources, type Match } from '@/lib/ai/retrieval';

type Level = 'beginner' | 'student' | 'developer';

const LEVELS: readonly Level[] = ['beginner', 'student', 'developer'] as const;

/**
 * Minimal nivåstyrning. De genomarbetade, versionerade prompterna per nivå
 * byggs i #20 tillsammans med `docs/prompt-design.md` — den här raden finns
 * bara för att inte tappa nivåbeteendet som mocken hade.
 */
const LEVEL_HINT: Record<Level, string> = {
  beginner: 'Användaren är nybörjare: undvik jargong, använd vardagliga liknelser.',
  student: 'Användaren är student: använd korrekta termer och förklara dem.',
  developer: 'Användaren är erfaren utvecklare: var precis och teknisk, hoppa över grunderna.',
};

function systemPrompt(level: Level, context: string): string {
  return [
    'Du är JS Sensei, en lärarassistent för JavaScript.',
    'Du FÖRKLARAR — du löser inte uppgifter åt användaren.',
    'Om någon ber dig skriva färdig kod som löser deras uppgift: skriv den inte.',
    'Förklara i stället begreppen som behövs och ställ en fråga som leder dem vidare.',
    'Korta kodexempel som illustrerar ett begrepp är tillåtna — färdiga lösningar är det inte.',
    LEVEL_HINT[level],
    'Grunda svaret i utdragen från MDN nedan. Står svaret inte där: säg det',
    'hellre än att gissa.',
    'Svara på svenska.',
    '',
    '--- MDN-utdrag ---',
    context || '(inga träffar — säg att du saknar underlag för just den frågan)',
  ].join(' ');
}

/** Felsvar innan streamen börjat — vanlig JSON, kontraktets §6. */
function jsonError(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(req: Request): Promise<Response> {
  // --- Validering enligt kontraktets §2–§3 (oförändrad från mocken) ---
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

  let lvl: Level = 'beginner';
  if (level !== undefined && level !== null) {
    if (typeof level !== 'string' || !LEVELS.includes(level as Level)) {
      return jsonError(400, 'invalid_level', 'level must be beginner, student or developer');
    }
    lvl = level as Level;
  }

  // Frågan ligger i parts[], inte i content — se kontraktets §2.
  const last = messages.at(-1) as { parts?: Array<{ type: string; text?: string }> } | undefined;
  const question = last?.parts?.find((p) => p.type === 'text')?.text?.trim();

  if (!question) {
    return jsonError(400, 'invalid_body', 'last message must contain a text part');
  }

  // --- Retrieval. Sker före streamen, så fel här kan fortfarande bli
  //     riktiga statuskoder (§6) i stället för ett fel mitt i strömmen. ---
  let matches: Match[];
  try {
    matches = await matchDocuments(await embedQuery(question));
  } catch (error) {
    console.error('[chat] retrieval misslyckades:', error);
    const isEmbedding = error instanceof Error && error.message.includes('Embedding');
    return isEmbedding
      ? jsonError(502, 'model_error', 'Kunde inte nå embedding-modellen.')
      : jsonError(500, 'internal_error', 'Kunde inte söka i dokumentationen.');
  }

  const context = matches
    .map((m) => `## ${m.metadata.title} (${m.metadata.url})\n${m.content}`)
    .join('\n\n');

  const sources = toSources(matches);

  // --- Streamat svar enligt kontraktets §4 ---
  const encoder = new TextEncoder();
  const { model } = getChatModel();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      send({ type: 'start' });
      send({ type: 'start-step' });
      send({ type: 'text-start', id: '0' });

      try {
        const result = streamText({
          model,
          system: systemPrompt(lvl, context),
          prompt: question,
        });

        for await (const delta of result.textStream) {
          send({ type: 'text-delta', id: '0', delta });
        }

        send({ type: 'text-end', id: '0' });

        // Källor efter text-end, före finish (§5).
        for (const source of sources) {
          send({ type: 'source-url', ...source });
        }
      } catch (error) {
        // Fel MITT I streamen: statuskoden är redan skickad, så felet måste
        // ut som en error-händelse. Streamen avslutas ändå med finish +
        // [DONE], annars fastnar UI:t i status 'streaming' för alltid (§6).
        console.error('[chat] fel under streaming:', error);
        send({ type: 'text-end', id: '0' });
        send({ type: 'error', errorText: 'Kunde inte slutföra svaret.' });
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
