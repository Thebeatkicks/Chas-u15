# API-kontrakt — `POST /api/chat`

**Version:** v0.1 · **Ägare:** Fausto (AI/backend) · **Godkänns av:** Ernest (frontend)
**Status:** förslag, väntar på review i PR för issue #7

Kontraktet gäller både mock-routen (#8, wave 0) och den riktiga RAG-routen (wave 1).
Det är hela poängen: **frontenden ska inte behöva ändras när mocken byts mot riktig RAG.**
Bygger Ernest mot det här dokumentet, och jag mot samma dokument, passar delarna ihop
utan att vi behöver stämma av.

---

## 0. Beroenden som måste installeras (Henrik)

Paketen finns **inte** i repot ännu. `package.json` ägs av repo-roten (Henrik) — varken
Ernest eller jag installerar dem. Detta blockerar #8 och #11.

```bash
pnpm add ai@7.0.88 @ai-sdk/react@4.0.91 @openrouter/ai-sdk-provider@3.0.0 zod@^4.1.8
```

| Paket | Version | Används av |
|---|---|---|
| `ai` | 7.0.88 | serverrouten (`streamText`, `createUIMessageStream`) |
| `@ai-sdk/react` | 4.0.91 | klienten (`useChat`) |
| `@openrouter/ai-sdk-provider` | 3.0.0 | modellanrop mot OpenRouter (wave 0 #9, wave 1) |
| `zod` | ^4.1.8 | peer-dependency till `ai`, validering av request-body |

**Varning — versionerna är låsta av en anledning.** AI SDK är på **v7**. Nästan all
dokumentation, alla blogginlägg och alla AI-genererade exempel man hittar beskriver v4
eller v5, där formatet är ett annat (`message.content` i stället för `message.parts`,
annat streamformat). Följ det här dokumentet, inte exempel du googlar fram.
`@openrouter/ai-sdk-provider@3.0.0` kräver `ai: ^7.0.0` — versionerna hänger ihop.

Repots React 19.2.8 uppfyller `@ai-sdk/react`:s peer-krav (`^19.2.1`). ✔

---

## 1. Endpoint

| | |
|---|---|
| Metod | `POST` |
| Path | `/api/chat` |
| Request `Content-Type` | `application/json` |
| Autentisering | ingen (wave 0–2, appen har ingen inloggning) |
| Runtime | Node (inte edge) |

---

## 2. Request

`useChat` skickar via `DefaultChatTransport`. Bodyn ser alltid ut så här:

```ts
type Level = 'beginner' | 'student' | 'developer';

type ChatRequestBody = {
  // --- skickas automatiskt av AI SDK:s transport ---
  id: string;                                        // chattens id, inte meddelandets
  messages: UIMessage[];                             // hela historiken, inte bara sista
  trigger: 'submit-message' | 'regenerate-message';
  messageId?: string;                                // satt endast vid regenerate

  // --- vårt eget fält ---
  level: Level;
};

// Förenklad UIMessage — så ser den ut för vår app (v7):
type UIMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<{ type: 'text'; text: string }>;      // OBS: parts[], INTE content
};
```

**Att hålla reda på:**

- Meddelandetexten ligger i `parts`, inte i `content`. Det ändrades i AI SDK v5 och gäller
  fortfarande i v7. Servern hämtar senaste användarfrågan så här:
  `messages.at(-1)?.parts.find(p => p.type === 'text')?.text`
- `id`, `trigger` och `messageId` skickas alltid av transporten. Servern använder dem inte
  i wave 0, men **valideringen får inte krascha på dem** — okända/extra fält ignoreras.
- Hela historiken skickas varje gång. Wave 0-mocken bryr sig bara om det sista meddelandet.

### Exempel på request-body

```json
{
  "id": "chat-8f2c",
  "messages": [
    { "id": "m1", "role": "user", "parts": [{ "type": "text", "text": "Vad är en closure?" }] }
  ],
  "trigger": "submit-message",
  "level": "beginner"
}
```

---

## 3. `level` — svensk etikett i UI, engelskt värde i API

UI:t är på svenska, API:t är på engelska. **De svenska orden får aldrig skickas över nätet.**

| Etikett i UI (Ernests skiss) | Värde i request-body |
|---|---|
| Nybörjare | `"beginner"` |
| Student | `"student"` |
| Utvecklare | `"developer"` |

- **Default:** `"beginner"` (första segmentet i nivåväljaren).
- **`level` saknas** → servern kör vidare med `"beginner"`. Detta är medvetet: det låter
  Ernest bygga chatkomponenten (#11) innan nivåväljaren (#12) finns, utan att routen svarar 400.
- **`level` finns men har ogiltigt värde** (t.ex. `"nybörjare"`, `"Nybörjare"`, `"dev"`)
  → **400 `invalid_level`**. Ett felstavat värde är en bugg och ska synas direkt,
  inte tyst bli nybörjarsvar.

---

## 4. Response — streamat svar

Svaret är AI SDK:s **UI Message Stream (v1)** över Server-Sent Events. Det är formatet
`useChat` förstår utan konfiguration.

**Status:** `200` så snart streamen börjar.

**Headers (alla obligatoriska):**

| Header | Värde |
|---|---|
| `content-type` | `text/event-stream` |
| `cache-control` | `no-cache` |
| `connection` | `keep-alive` |
| `x-vercel-ai-ui-message-stream` | `v1` |
| `x-accel-buffering` | `no` |

Använder man `createUIMessageStreamResponse()` från `ai` sätts alla fem automatiskt.

**Wire-format:** varje händelse är en rad `data: <json>` följd av en tom rad. Streamen
avslutas alltid med `data: [DONE]`.

### Kanonisk sekvens

```
data: {"type":"start"}

data: {"type":"start-step"}

data: {"type":"text-start","id":"0"}

data: {"type":"text-delta","id":"0","delta":"En closure "}

data: {"type":"text-delta","id":"0","delta":"är en funktion "}

data: {"type":"text-delta","id":"0","delta":"som minns sin omgivning."}

data: {"type":"text-end","id":"0"}

data: {"type":"source-url","sourceId":"mdn-closures","url":"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures","title":"Closures — MDN"}

data: {"type":"source-url","sourceId":"mdn-scope","url":"https://developer.mozilla.org/en-US/docs/Glossary/Scope","title":"Scope — MDN"}

data: {"type":"finish-step"}

data: {"type":"finish"}

data: [DONE]
```

| Händelse | Betydelse |
|---|---|
| `start` | nytt assistentmeddelande börjar |
| `text-start` / `text-delta` / `text-end` | textblocket. `id` knyter deltas till rätt block |
| `source-url` | en källa (se §5) |
| `finish` | meddelandet är klart |
| `error` | något gick fel mitt i streamen (se §6) |

---

## 5. Källor

Källor skickas som **`source-url`-händelser**, en per källa, **efter `text-end` och före
`finish`**.

```json
{ "type": "source-url", "sourceId": "mdn-closures", "url": "https://...", "title": "Closures — MDN" }
```

| Fält | Krav | Innehåll |
|---|---|---|
| `sourceId` | ja | stabil sträng, unik i meddelandet — används som React-key |
| `url` | ja | absolut https-URL till MDN-sidan |
| `title` | ja i praktiken | visas i källchipet. Fältet är valfritt i SDK:n, men vi skickar det alltid |

**Regler:** max 4 källor per svar, deduplicerade på `url`.

**Varför den här lösningen:** `source-url` är en inbyggd del-typ i AI SDK, så vi slipper
komma överens om ett eget dataformat, och klienten får dem automatiskt som
`part.type === 'source-url'` i `message.parts`. I wave 1 kan den riktiga routen skicka
samma händelser från RAG-träffarna — frontenden märker ingen skillnad.

**Det här uppfyller Ernests designbeslut #5 automatiskt** ("källor visas under ett färdigt
svar, inte medan det streamar"): eftersom källorna skickas efter `text-end` *existerar* de
inte i `message.parts` medan texten strömmar. Klienten behöver alltså ingen extra
if-sats — den kan rendera källchipsen så fort de dyker upp.

---

## 6. Fel

### Fel innan streamen börjat

Vanligt JSON-svar, ingen SSE:

```json
{ "error": { "code": "invalid_level", "message": "level must be beginner, student or developer" } }
```

| Status | `code` | När |
|---|---|---|
| 400 | `invalid_body` | bodyn är inte giltig JSON, eller `messages` saknas/är tom |
| 400 | `invalid_level` | `level` finns men är inte ett av de tre värdena |
| 405 | `method_not_allowed` | annan metod än POST |
| 502 | `model_error` | OpenRouter svarar med fel eller timeout (wave 1+) |
| 500 | `internal_error` | allt annat |

### Fel **mitt i** en pågående stream

Statuskoden är redan skickad (200) och går inte att ändra. Servern ska då skicka:

```
data: {"type":"error","errorText":"Kunde inte slutföra svaret."}

data: {"type":"finish"}

data: [DONE]
```

`useChat` exponerar det via `error`. **Streamen får aldrig lämnas hängande** — alltid
`finish` + `[DONE]`, även när det gått fel, annars fastnar UI:t i `status === 'streaming'`.
`errorText` går till slutanvändaren: skriv aldrig ut stacktraces, nyckelnamn eller
råa API-svar där.

---

## 7. Självtest med curl

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"id":"c1","trigger":"submit-message","level":"beginner","messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":"Vad är en closure?"}]}]}'
```

`-N` stänger av buffringen — utan den ser man inte att svaret strömmar. Förväntad utdata
är raderna i §4, som droppar in efter hand.

---

## 8. Klientsidan (Ernest, #11 + #12)

```tsx
'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

type Level = 'beginner' | 'student' | 'developer';

export function Chat() {
  const [level, setLevel] = useState<Level>('beginner');
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  // level skickas per anrop — då följer alltid den nivå som är vald just nu med
  const submit = () => {
    sendMessage({ text: input }, { body: { level } });
    setInput('');
  };

  return (
    <>
      {messages.map((m) => (
        <div key={m.id}>
          {m.parts.map((p, i) =>
            p.type === 'text' ? <p key={i}>{p.text}</p> : null,
          )}

          {/* Källchips. Finns inte förrän svaret är färdigstreamat — se §5. */}
          <ul>
            {m.parts.map((p) =>
              p.type === 'source-url' ? (
                <li key={p.sourceId}>
                  <a href={p.url} target="_blank" rel="noreferrer">{p.title ?? p.url}</a>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      ))}
    </>
  );
}
```

`status` är `'ready' | 'submitted' | 'streaming' | 'error'` — använd `'streaming'` för
skrivindikatorn och för att låsa skicka-knappen.

---

## 9. Ändringar av kontraktet

Ändringar kräver PR med godkännande från både Fausto och Ernest — mock-routen och
chatkomponenten byggs mot det här dokumentet samtidigt.

| Version | Datum | Ändring |
|---|---|---|
| v0.1 | 2026-09-01 | Första versionen (issue #7) |

---

<sub>Stream- och request-formatet i §2, §4 och §5 är inte skrivet ur minnet: det är
avläst ur typerna i `ai@7.0.88` och verifierat genom att köra sekvensen i §4 genom
SDK:ns egen `readUIMessageStream` — texten sattes ihop korrekt och båda källorna kom
ut som `source-url`-parts.</sub>
