# JS Sensei

En lärarassistent för JavaScript som **förklarar, inte löser**. Välj nivå
(nybörjare / student / utvecklare), ställ en fråga och få ett streamat svar
grundat i MDN:s dokumentation — med källhänvisningar.

> Chas u15 — Gruppuppgift: AI-baserad webbapplikation.
> Team: Henrik (orchestrator/infra) · Yasmin (data/RAG) · Fastuo (AI/backend) · Ernest (frontend/UX)

## Teknik

- **Next.js (App Router)** + TypeScript + Tailwind, deploy på Vercel
- **Vercel AI SDK** — chat, streaming
- **OpenRouter** — `openai/gpt-4o-mini` (chat) + `openai/text-embedding-3-small` (embeddings)
- **Supabase + pgvector** — vektorlagring och semantisk sökning (RAG)
- **Data:** [MDN Web Docs](https://github.com/mdn/content) (CC-BY-SA 2.5) — kurerat urval av JavaScript-dokumentationen

## Deploy

Live på Vercel: https://chas-u15.vercel.app — auto-deploy från `main`.

## Kom igång

```bash
pnpm install
cp .env.example .env.local   # fyll i nycklar (delas i gruppens privata kanal)
pnpm dev
```

## Projektstruktur och arbetssätt

Planen, arkitekturen och alla beslut finns i [docs/PLAN.md](docs/PLAN.md).
Läget just nu indexeras i [STATE.md](STATE.md). Arbetet sker i 2-dagars *waves*
med issues per person och handoffs i [docs/handoffs/](docs/handoffs/).

## Reflektion (uppgiftens frågor)

> **Version 1** (wave 1). Skriven ur det som redan är beslutat och byggt:
> besluten i [docs/PLAN.md §3](docs/PLAN.md), lärdomarna i
> [docs/state-archive/wave-0.md](docs/state-archive/wave-0.md) och
> API-kontraktet i [docs/api-contract.md](docs/api-contract.md).
> Personliga AI-reflektioner (4 personer × 4 waves) vävs in efterhand som
> wave-handoffs kommer in; texten färdigställs i wave 3.

### Vilken ny AI-teknik/bibliotek identifierade vi och hur tillämpade vi det?

**RAG (retrieval-augmented generation)** är kärntekniken. Kedjan ser ut så här:

1. Ett kurerat urval av MDN:s dokumentation — **528 sidor** JavaScript-guide,
   referens och utvalda `web/api`-sidor ([docs/mdn-selection.md](docs/mdn-selection.md))
   — chunkas och embeddas med `openai/text-embedding-3-small` (1536 dimensioner).
2. Vektorerna lagras i **Supabase med pgvector**, tabellen `documents` plus
   SQL-funktionen `match_documents` för cosine-likhet
   ([docs/db-schema.md](docs/db-schema.md)).
3. När en fråga kommer in embeddas den med *samma* modell, de närmaste
   chunkarna hämtas och skickas som kontext till `openai/gpt-4o-mini`.
4. Svaret streamas tillbaka tillsammans med de MDN-sidor kontexten kom ifrån,
   som klickbara källchips.

**Vercel AI SDK (v7)** är limmet: `streamText` på servern, `useChat` på
klienten, och SDK:ns *UI Message Stream v1* över Server-Sent Events som
wire-format. Källorna skickas som SDK:ns inbyggda `source-url`-händelser i
stället för ett eget dataformat — då dyker de upp som `source-url`-parts i
klienten utan att vi behöver komma överens om något extra, och de existerar
inte förrän texten är färdigstreamad, vilket är precis vad UI-skissen ville ha
(källor under ett färdigt svar, inte medan det skrivs).

**Nivåanpassningen** görs med en egen system-prompt per nivå (nybörjare /
student / utvecklare). `level` följer med varje anrop i request-bodyn och
valideras hårt — svenskt ord i UI:t, engelskt värde över nätet.

Hela kontraktet mellan frontend och backend skrevs som ett dokument *innan*
någon av delarna byggdes ([docs/api-contract.md](docs/api-contract.md)), och en
mock-route implementerade kontraktet i wave 0 så att UI:t kunde byggas mot ett
riktigt streamande API innan RAG-routen fanns. Poängen: frontenden ska inte
behöva ändras när mocken byts mot riktig RAG.

Vi använde också **AI som utvecklingsverktyg** genom hela projektet — fyra
verktyg parallellt (Claude Code ×2, Codex, Cursor) i en orchestrator/session-
modell där varje avslutad session lämnar en skriftlig handoff med konkret bevis
([docs/handoffs/](docs/handoffs/)).

*(Konkreta erfarenheter av den skarpa ingestion-körningen och RAG-routen
kompletteras efter wave 1-handoffs.)*

### Varför valde vi den AI-tekniken/det biblioteket?

Besluten är dokumenterade som mini-ADR i [docs/PLAN.md §3](docs/PLAN.md) och
ändras bara med gruppbeslut:

| # | Beslut | Varför |
|---|---|---|
| 1 | MDN i stället för att skrapa W3Schools | Öppen licens (CC-BY-SA), ren Markdown i ett publikt repo, bättre innehåll. Skrapning hade varit både juridiskt tveksamt och tekniskt sämre. |
| 2 | OpenRouter för både chat **och** embeddings | En nyckel, en klient, en spending-limit att bevaka i ett publikt repo. |
| 3 | `text-embedding-3-small`, 1536 dim | Billig och standard. **Låst beslut:** byter vi modell måste allt indexeras om, eftersom vektorerna inte är jämförbara mellan modeller. |
| 4 | `gpt-4o-mini` som default-chatmodell | Billig, stabil, bra på svenska. Ligger som env-variabel `CHAT_MODEL` så vi kan A/B-testa modeller utan kodändring. |
| 5 | Supabase + pgvector | Gratis nivå som räcker, ger riktig SQL-erfarenhet, och likhetssökningen blir en vanlig SQL-funktion i stället för ännu en tjänst. |
| 6 | Assistenten **förklarar, löser inte** | Det är produktidén. En modell som skriver färdig kod finns redan överallt; en som vägrar och i stället lär ut är både mer användbar för en kursdeltagare och mer intressant att redovisa. |
| 7 | Text-chat är MVP, röst är stretch | 8 dagars tidslinje. Röst planeras tidigast wave 3, och bara om kärnresan är klar. |

Vercel AI SDK valdes för att streaming, källor och klientstate annars blir tre
egna problem: SDK:n har ett färdigt wire-format som `useChat` förstår utan
konfiguration, och `source-url` är en inbyggd del-typ. Next.js API-routes är
backenden — ingen separat server att drifta för en app som ska leva i åtta dagar.

### Varför behövdes AI-komponenten? Kunde vi löst det på annat sätt?

**Alternativet utan AI** vore en söksida: nyckelordssökning mot MDN plus en
FAQ. Det hade fungerat för "vad heter metoden som…", men inte för det appen
faktiskt gör:

- **Nivåanpassning.** Samma fråga ska ge tre olika svar. En sökmotor har bara
  ett dokument att visa; MDN är dessutom skrivet på en enda nivå, ungefär vår
  "utvecklare"-nivå. Att skriva om innehållet för en nybörjare är en
  språkuppgift, och det är där en LLM faktiskt tillför något.
- **Syntes över flera sidor.** "Skillnaden mellan let och const" bor i två
  referenssidor plus ett guideavsnitt. Ett svar kräver att de vägs samman.
- **Naturligt språk, och svenska.** Frågan ställs som en fråga, inte som
  nyckelord, och besvaras på svenska trots att källorna är engelska.
- **Semantisk träff i stället för ordträff.** Embeddings hittar rätt sida även
  när användaren inte kan ordet — "funktion som minns variabler" leder till
  closures. Nyckelordssökning kräver att man redan kan svaret.

**Var AI inte var rätt verktyg** — lika viktigt för bedömningen:

- **Urvalet av de 528 MDN-sidorna** görs av ett regelbaserat skript, inte av en
  modell. Det ska vara reproducerbart och granskningsbart: ändras kriterierna
  kör man om skriptet, i stället för att lita på ett val ingen kan upprepa.
- **Källvisningen** är ren datavisning. Länkarna kommer från de chunkar
  retrievalen faktiskt hämtade, inte från modellens text — annars kan modellen
  hitta på en URL som ser rimlig ut.
- **Retrievalen** är vektormatematik i SQL, inte ett modellanrop.
- **Validering, felkoder och streamformat** är vanlig kod, hårt specificerad i
  kontraktet.

Just hallucinationsrisken är hela motivet till RAG: en naken LLM svarar
självsäkert fel om JavaScript-detaljer, och en kursdeltagare kan inte se
skillnaden. Med MDN-kontext plus synliga källor kan användaren kontrollera
svaret på en klickning. Att modellen *ändå* kan ha fel är anledningen till att
källorna aldrig är valfria.

### Vad var svårt? (till redovisningen)

**AI-verktygens kunskap om AI-biblioteket var det största problemet.** Vercel
AI SDK är på v7, men i stort sett all dokumentation, alla blogginlägg och alla
AI-genererade exempel man hittar beskriver v4 eller v5 — där meddelandetexten
ligger i `message.content` och streamformatet är ett annat. I v7 heter det
`message.parts`. Varje AI-verktyg vi använde föreslog v4/v5-kod med full
självsäkerhet. Motmedlet blev att skriva API-kontraktet ur *avlästa typer* i
`ai@7.0.88` och verifiera stream-sekvensen genom SDK:ns egen
`readUIMessageStream` innan någon kod byggdes på den, samt att låsa exakta
versioner i [STATE.md](STATE.md) med en varning i kontraktets §0. Samma mönster
dök upp i Next.js 16, som numera själv skriver en `AGENTS.md` som pekar
AI-verktyg mot `node_modules/next/dist/docs/` i stället för mot deras minne.
Lärdomen: när ramverket är nyare än modellens träningsdata är AI-verktyget
snabbast på fel svar, och tiden ska läggas på att göra rätt källa läsbar för
verktyget.

**Att arbeta parallellt var svårare än att koda.** Wave 0 gav tre konkreta
lärdomar ([docs/state-archive/wave-0.md](docs/state-archive/wave-0.md)):
beroendekedjor *mellan* personer inuti en wave serialiserade arbetet
(kontrakt → mock → UI), en Supabase-nyckel som inte delades vid wave-öppning
stoppade en issue i två dagar, och reviews blev en flaskhals — noll reviews på
ett dygn. Fixen blev "sveprincipen" i [docs/PLAN.md §4](docs/PLAN.md): allt som
behövs ska finnas *innan* waven öppnas, beroenden mellan personer läggs på
wave-gränsen i stället för inuti waven, och en öppnad PR blockerar aldrig —
man pingar en namngiven reviewer och fortsätter direkt.

**Plattformsdetaljer kostade också tid:** ett fullständigt klon av
`mdn/content` föll på `Filename too long` på Windows och fick göras om med
sparse checkout, och `main` är skyddad med PR-krav som bara syns som en varning
för den som har admin-bypass.

*(2–3 meningar per person och wave om vad som var svårt eller förvånande med
AI-verktyget samlas i wave-handoffs — 16 stycken totalt. De vävs in här
efterhand; nästa påfyllning sker efter wave 1-handoffs.)*

## Licens och attribution

Kunskapsinnehållet kommer från [MDN Web Docs](https://developer.mozilla.org/)
av Mozilla Contributors, licensierat under
[CC-BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/).
