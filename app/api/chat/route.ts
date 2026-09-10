/**
 * POST /api/chat — appens enda backend-endpoint.
 *
 * Kedjan: fråga → normalisering + embedding → `match_documents` (pgvector) →
 * MDN-kontext → `streamText` mot OpenRouter → `source-url`-händelser ur
 * träffarnas metadata.
 *
 * `docs/api-contract.md` ÄR specifikationen för den här filen, inte en
 * beskrivning av den. Den skrevs innan någon kod fanns, så att frontend och
 * backend kunde byggas parallellt, och den har överlevt två omskrivningar av
 * den här routen: först en hårdkodad mock, sedan riktig RAG. Frontenden
 * behövde noll kodändringar vid bytet. Ändrar du något som syns utåt —
 * fältnamn, händelsetyper, statuskoder — ändra kontraktet först och få det
 * godkänt (§9), annars går löftet förlorat.
 *
 * Varför streamen skrivs för hand i stället för med
 * `toUIMessageStreamResponse()`: ordningen. Kontraktets §5 kräver att
 * källorna skickas EFTER `text-end` men FÖRE `finish`, så att de inte finns i
 * `message.parts` medan texten strömmar. Det gör att UI:t kan rendera
 * källchips så fort de dyker upp, utan egen logik för att dölja dem under
 * streamningen. SDK:ns hjälpfunktion ger inte den kontrollen över var i
 * strömmen egna händelser hamnar.
 */
import { streamText } from 'ai';
import { getChatModel } from '@/lib/ai/openrouter';
import { retrieve, toSources, type Match } from '@/lib/ai/retrieval';
import { buildSystemPrompt, LEVELS, type Level } from '@/lib/ai/system-prompts';

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

  // Bodyn innehåller mer än detta — AI SDK:s transport skickar även `id`,
  // `trigger` och ibland `messageId` (kontraktets §2). De ignoreras här, men
  // valideringen får inte avvisa dem: gör den det slutar klienten fungera vid
  // nästa SDK-uppgradering som lägger till ett fält.
  const { messages, level } = (body ?? {}) as { messages?: unknown; level?: unknown };

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError(400, 'invalid_body', 'messages is required and must be non-empty');
  }

  // Saknad `level` ger `beginner` i stället för 400. Det var ett medvetet val
  // när kontraktet skrevs: Ernest byggde chattkomponenten före nivåväljaren,
  // och en route som kräver `level` hade blockerat honom i mellanläget. Ett
  // FELSTAVAT värde ger däremot 400 — tyst fallback där hade dolt buggen att
  // UI:t skickar "nybörjare" i stället för "beginner", vilket är precis den
  // krock kontraktets §3 finns för att förhindra.
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
    matches = await retrieve(question);
  } catch (error) {
    console.error('[chat] retrieval misslyckades:', error);
    // Klassificeringen matchar på felmeddelandets text, vilket är skört men
    // medvetet: alternativet — egna feltyper genom hela kedjan — är mer kod än
    // en skoluppgift bär för att skilja två statuskoder åt. Känd lucka: en
    // SAKNAD miljövariabel ger meddelanden som "OPENROUTER_API_KEY saknas",
    // vilket inte matchar och därför blir 500 i stället för 502. Det syns bara
    // vid felkonfigurerad server, aldrig i drift.
    const isEmbedding = error instanceof Error && error.message.includes('Embedding');
    return isEmbedding
      ? jsonError(502, 'model_error', 'Kunde inte nå embedding-modellen.')
      : jsonError(500, 'internal_error', 'Kunde inte söka i dokumentationen.');
  }

  // Rubrik + URL per chunk, inte bara texten. Modellen behöver se vilken sida
  // ett utdrag kommer från för att kunna följa regel 3 i system-prompten
  // ("använd bara utdrag som handlar om frågan") — utan titeln är fem chunks
  // en enda odifferentierad textmassa.
  //
  // Ingen teckenbudget tillämpas. Fem chunks à ~6000 tecken är taket i
  // praktiken, vilket ryms väl i gpt-4o-minis 128k-kontext. Höjs MATCH_COUNT
  // väsentligt behöver detta ses över.
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
          system: buildSystemPrompt(lvl, context),
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
        // Fel MITT I streamen. Statuskoden 200 är redan skickad och går inte
        // att ta tillbaka, så felet måste ut som en händelse i strömmen.
        //
        // Det viktiga är att `finish` + `[DONE]` skickas ändå, nedanför:
        // utan dem lämnas klientens `useChat` i status 'streaming' för alltid,
        // och användaren ser en skrivindikator som aldrig tar slut.
        //
        // `errorText` går rakt ut till slutanvändaren — därför en neutral
        // svensk mening, aldrig `error.message`, som kan innehålla URL:er,
        // nyckelnamn eller råa API-svar.
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

  // Alla fem headers står i kontraktets §4. De är inte dekoration:
  // `text/event-stream` får klienten att läsa svaret som en ström,
  // `x-vercel-ai-ui-message-stream: v1` är vad AI SDK:s klient letar efter för
  // att välja rätt parser, och `x-accel-buffering: no` stänger av buffring i
  // proxyn framför Vercel — utan den kommer svaret i ett enda block och
  // streamningen blir osynlig trots att servern gör allt rätt.
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
