# Wave-handoff — wave 1 — Fausto

**Person:** Fausto (AI/Backend) · **Wave:** 1 · **Datum:** 2026-09-03

> Täcker även wave 0, vars handoff hoppades över när waven stängdes tidigt.

## Klart

### Wave 0

| Issue | PR | Bevis (hur testat) |
|---|---|---|
| #7 API-kontrakt för `/api/chat` | #16 (mergad) | `docs/api-contract.md`. Request- och streamformatet lästes ur typerna i `ai@7.0.88` och verifierades genom att köra den specificerade händelsesekvensen genom SDK:ns egen `readUIMessageStream`: texten sattes ihop korrekt och båda källorna kom ut som `source-url`-parts |
| #8 Mock-route | — | **Byggd av main orchestratorn**, inte av mig, enligt wave-open-grinden (se "Inte klart") |
| #9 OpenRouter chat-spike | #25 (mergad) | 271 chunks, 1 724 ms till första token, 5 355 ms totalt, `finishReason: stop`. "Förklara, lös inte" verifierad: modellen vägrade skriva färdig kod och förklarade begreppen i stället |

### Wave 1

| Issue | PR | Bevis (hur testat) |
|---|---|---|
| #19 Riktig RAG-route | #34 (mergad) | curl mot `/api/chat` gav streamat svar + `source-url` för `Functions` och `Closures` ur riktig MDN-data. Alla fyra felvägar i kontraktets §6 verifierade: tom `messages` → 400 `invalid_body`, `level: "nybörjare"` → 400 `invalid_level`, trasig JSON → 400, retrieval nere → 500 `internal_error` |
| #20 System-prompts per nivå | #35 (öppen) | Samma fråga × 3 nivåer med tydligt olika svar (158 / 225 / 143 ord). Lösnings-vägran demonstrerad. Tre iterationer dokumenterade i `docs/prompt-design.md` |

## Inte klart + varför

- **#8 mock-routen byggdes inte av mig.** Main orchestratorn byggde och mergade
  den på morgonen 2/9 med motiveringen att mocken måste ligga på `main` när
  wave 1 öppnar, så frontend-spåret inte blockeras. Ernest hade då väntat ett
  dygn, så beslutet var rimligt — men det innebär att jag inte kan redovisa
  den som eget arbete. Jag granskade den i efterhand: den följer kontraktet
  troget, och jag byggde om den till riktig RAG i #19.
- **#7 fick aldrig Ernests formella godkännande.** Issuens tredje checkbox var
  "Få OK från Ernest". Main orchestratorn godkände i hans ställe enligt
  sveprincipen och stängde issuen. Kontraktet visade sig konsistent med hans
  skiss, så inget gick fel — men kravet uppfylldes inte som det var skrivet.

## Beslut jag tagit

- **AI SDK v7, inte v5.** `ai@7.0.88`, `@ai-sdk/react@4.0.91`,
  `@openrouter/ai-sdk-provider@3.0.0` — versionerna hänger ihop via peer deps.
  Meddelanden har `parts[]`, inte `content`. Nästan all dokumentation och alla
  AI-genererade exempel på nätet beskriver v4/v5 och har fel format.
  **[ADR?]** — värt en rad i PLAN.md §3, för det är den enklaste felkällan att
  gå på för vem som helst som rör frontend eller route.
- **`level` är engelskt i API:t, svenskt i UI:t.** `beginner` / `student` /
  `developer` med mappningstabell i kontraktets §3. Ernests skiss hade
  `nybörjare` som default — krocken fångades innan någon kodade fel.
- **`SIMILARITY_THRESHOLD = 0.2`.** Satt utifrån Yasmins baseline i
  `docs/retrieval-sanity.md`: similarity låg mellan 0,22 och 0,58 över tio
  frågor, och de svagaste korrekta träffarna på 0,22–0,29. En tröskel på 0,5
  hade gett noll källor på de flesta frågor. Tuning är wave 2.
- **Inget `@supabase/supabase-js`.** REST + `fetch`, samma mönster som Yasmins
  ingestion. Håller `package.json` orörd och gör AI-spåret oberoende av
  repo-roten.
- **Streamen skrivs för hand, inte via `toUIMessageStreamResponse()`.**
  Kontraktets §5 kräver att källorna skickas efter `text-end` men före
  `finish`, så att de inte finns i `message.parts` medan texten strömmar.
  Handskriven stream ger exakt kontroll över den ordningen.

## Blockerar / blockeras av

- **Andra väntar på:** inget. #19 är mergad, så Ernests #21 kan verifiera
  noll-kodändring mot den riktiga routen.
- **Jag väntade på:** Supabase-uppgifterna (`SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`) fanns inte i min `.env.local` när #19
  påbörjades. Jag byggde och verifierade felvägarna under tiden och kopplade
  in databasen när nycklarna kom — ingen förlorad tid, men det var wavens enda
  riktiga grind för mig.
- **Kvar att merga:** #35 (#20). Den är stackad på #19, som nu är mergad.

## AI-reflektion

Jag bytte verktyg från Codex till Claude Code mellan wave 0 och 1, och den
tydligaste lärdomen över båda waves är var AI:n är stark respektive svag.
Svag: när den svarar ur minnet. Den ville skriva API-kontraktet mot AI SDK v5,
som var aktuell i dess träningsdata — hade vi gjort det hade Ernests
`useChat` byggts mot fel meddelandeformat och spruckit vid första
hopkopplingen. Stark: när den kan läsa det faktiska artefakten. Genom att
installera SDK:n och läsa typerna, och sedan köra det tänkta streamformatet
genom bibliotekets egen parser, blev kontraktet verifierat i stället för
gissat. Samma mönster upprepades i #19: min instinkt sa att
similarity-tröskeln borde ligga runt 0,5, men Yasmins mätdata visade
0,22–0,58 — hade jag följt instinkten hade appen visat noll källor på de
flesta frågor. Slutsatsen jag tar med mig: låt aldrig modellen gissa på något
som går att slå upp, och be den alltid visa var siffran eller formatet kommer
ifrån.

## Main orchestrator bör först

Merga #35 så nivåprompterna kommer ut på live-URL:en före smoke-testet — och
rätta veckodagarna i PLAN.md och STATE.md, som ligger en dag fel (1/9 är en
tisdag, inte måndag; redovisningen 11/9 är en fredag, inte torsdag).
