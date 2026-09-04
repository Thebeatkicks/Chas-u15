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
Läget just nu indexeras i [STATE.md](STATE.md).

Vi jobbade i en **orchestrator/session-modell** med fyra AI-verktyg parallellt
— ett per person (Claude Code ×2, Codex, Cursor). Henrik som main
orchestrator skickade **startprompts** i början av varje wave; var och en
startade en **personlig orchestrator** i sitt eget verktyg, som i sin tur gav
prompts för en session per issue. En avslutad session lämnade en
session-handoff till den personliga orchestratorn, och en avslutad wave en
wave-handoff till Henrik ([docs/handoffs/](docs/handoffs/)) — Henrik
reconcilade, mergade och öppnade nästa wave.

Arbetet gick i **2-dagars waves** med issues per person, styrda av
**sveprincipen** ([docs/PLAN.md §4](docs/PLAN.md)): allt en person behöver
för sina issues — delade nycklar, mergade kontrakt/stubbar, installerade
paket — ska finnas *innan* waven öppnas, beroenden mellan personer läggs
alltid på wave-gränsen (aldrig inuti en wave), och en öppnad PR blockerar
aldrig arbetet — man pingar en namngiven reviewer och fortsätter direkt på
nästa issue. Regeln kom av en lärdom från wave 0, där beroendekedjor mitt i
waven serialiserade arbetet
([docs/state-archive/wave-0.md](docs/state-archive/wave-0.md)).

## Reflektion (uppgiftens frågor)

> **Version 2** (wave 2). Besluten i [docs/PLAN.md §3](docs/PLAN.md),
> lärdomarna i [docs/state-archive/wave-0.md](docs/state-archive/wave-0.md)
> och API-kontraktet i [docs/api-contract.md](docs/api-contract.md). Alla
> fyra personliga AI-reflektionerna från wave 0–1
> ([docs/handoffs/](docs/handoffs/)) är nu invävda i "Vad var svårt?" nedan,
> tillsammans med miljöbuggen och prompt-designens tre iterationer.
> Modell-A/B-resultatet (#40) läggs till här när det landar. Text
> färdigställs i wave 3.

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

Den skarpa ingestion-körningen skrev **1 738 chunks** ur alla 528 sidor till
`documents` (radantalet verifierat oberoende via en egen REST-`HEAD`-fråga,
inte bara scriptets egen logg). Retrieval-baseline låg på **6/10** rätt sida
i topp-3 över tio testfrågor ([docs/retrieval-sanity.md](docs/retrieval-sanity.md))
— de fyra missarna är namngivna och verifierat att vara renodlade
retrieval-gap, inte täckningsluckor, och är wave 2:s startlista (#37).

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

### Personliga AI-reflektioner (wave 0–1)

Fyra reflektioner ur [docs/handoffs/](docs/handoffs/), en per wave-handoff:

**Yasmin** (wave 0 + wave 1): Det mest lärorika mönstret var att sessionerna
byggde en vana av att verifiera *faktiskt tillstånd* i stället för att lita
på ett kommandos egen "success"-rapport — i wave 0 upptäcktes en
`CREATE TABLE` som Supabase SQL Editor tyst blockerat bakom en modal bara för
att sessionen körde `select count(*)` efteråt, och samma mönster upprepades
i wave 1 när #17:s radantal verifierades med en oberoende REST-`HEAD`-fråga i
stället för att lita på scriptets egen logg. Störst friktion gav
miljöbegränsningar utanför själva kodningen: `gh` CLI saknades i varje
session, så PR:er fick öppnas manuellt via länk i wave 0 — tills en wave
1-session löste det själv genom att återanvända git-autentiseringen
(`git credential fill`) mot GitHub:s REST API för att öppna PR:er, sätta
reviewers och posta ping-kommentarer, helt utan att exponera token i
loggar. Windows-specifika problem (path-längd vid full klon av
`mdn/content`) hittades och löstes av AI:n på egen hand.

**Ernest**: Cursor ritade snygga PNG-skisser i wave 0 men förstörde svensk
text, så SVG + kanonisk copy blev den riktiga sanningen i stället — en
påminnelse om att inte lita på genererad UI-copy. I wave 1 var
API-kontraktets §8 (`useChat` + `DefaultChatTransport` + `parts`) mer värt
än googlad AI SDK-dokumentation, som fortfarande beskriver v4/v5; när UI:t
byggdes strikt mot kontraktet passade mocken direkt, och den enda fällan var
att råka skicka `"nybörjare"` i stället för `"beginner"`.

**Fastuo**: Bytte verktyg från Codex till Claude Code mellan wave 0 och 1,
och lärdomen höll över båda: AI:n är svag när den svarar ur minnet — den
ville skriva API-kontraktet mot AI SDK v5, som var aktuell i dess
träningsdata, vilket hade spräckt Ernests `useChat` vid första
hopkopplingen — och stark när den läser det faktiska artefakten, som när
kontraktet i stället verifierades genom att installera SDK:n, läsa typerna
och köra streamformatet genom bibliotekets egen `readUIMessageStream`-parser.
Samma mönster upprepades i wave 1: instinkten sa att similarity-tröskeln
borde ligga runt 0,5, men Yasmins uppmätta data visade 0,22–0,58 — hade
instinkten fått styra hade appen visat noll källor på de flesta frågor.

### Miljöbuggen — "namn ≠ värde"

Wave 1:s enda produktionsbugg fångades av smoke-testets pre-flight, inte av
koden: alla sex env-variabler fanns till namnet i Vercels dashboard men hade
tomma värden, vilket aldrig upptäcktes tidigare eftersom RAG-routen (#19)
var den första deployade koden som faktiskt läste dem. Dokumenterat i
[docs/smoke-runs/wave-1.md](docs/smoke-runs/wave-1.md): att en variabel
*finns* i Production säger inget om att den har ett *värde* — checklistan
kollar nu båda.

### Prompt-designens tre iterationer

Nivåprompterna gick genom tre versioner innan de höll
([docs/prompt-design.md](docs/prompt-design.md)). **v1** — sex rader inbakade
i routen — gav fyra synliga problem: nivåskillnaden var bara ordval,
`developer` förklarade grunderna ändå, vägran läckte lösningen som ett
numrerat recept, och irrelevant MDN-kontext citerades ändå. **v2** — egen
modul, längdtak per nivå, hårdare vägransregel — fixade tre av fyra, men
`developer` öppnade fortfarande med en definition; en negativ regel om
*innehåll* ("förklara inte grunderna") räckte inte. **v3**:s enda ändring
var att i stället styra **formen** på första meningen: förbjudna
inledningsfraser som "X är en kombination av", och första meningen ska
handla om beteende eller fallgrop i stället för definition. Lärdomen: när
modellen har en stark stilmässig vana slår en regel om form en regel om
innehåll.

### Modell-A/B

Läggs till här när Fastuos jämförelse mellan `gpt-4o-mini` och en
utmanarmodell (#40, wave 2) landar i `docs/model-ab.md`.

## Licens och attribution

Kunskapsinnehållet kommer från [MDN Web Docs](https://developer.mozilla.org/)
av Mozilla Contributors, licensierat under
[CC-BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/).
