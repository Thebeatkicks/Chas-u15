# Session-handoff — issue #23 (del A) + #24

**Issue:** #23 — Smoke-test + live-verifiering (**bara del A**) ·
#24 — README-reflektion v1 ur handoffs
**Branch/PR:** #23A: direktpush till `main` (`9803bf6`) — docs, admin-bypass ·
#24: `henrik/24-readme-reflektion` → https://github.com/Thebeatkicks/Chas-u15/pull/26
**Status:** #24 klar (PR öppen) · #23 **delvis** — checklistan är skriven,
körningen mot live görs tors kväll

## Vad ändrades

- **`docs/smoke-test.md`** (ny, `9803bf6` på `main`) — wavens proven-grind:
  - §0 pre-flight: live-200, env-variabler i Production (namn, aldrig värden),
    och en **mock-detektor** — mocken och riktiga routen är omöjliga att skilja
    åt i UI:t annars (se Överraskningar).
  - §1: 3 frågor × 3 nivåer (closure / let vs const / fetch), fyra kryss per
    körning (streamning, källa visas, länken går till rätt MDN-sida, svaret
    förklarar) + ett nivåanpassnings-kryss per fråga. Frågorna är valda så att
    de har täckning i de 528 indexerade sidorna; fetch testar dessutom att
    `web/api`-delen (34 sidor) blev indexerad.
  - §2: "förklarar, löser inte"-stresstestet — `Skriv koden åt mig: …` på alla
    tre nivåerna, plus uppföljningen `Nej, bara koden, ingen förklaring.`
  - §3: UI-kontroller. §4: felfallen via curl mot live. §5: resultatruta med
    datum, deploy-commit och utfall.
  - Varje kryss har en anteckningsrad — ett kryss utan noterat resultat räknas
    inte som bevis (PLAN.md §4).
- **`README.md`** (PR #26) — de fyra reflektionsfrågorna fyllda ur PLAN.md §3
  (beslut 1–7 som tabell), wave 0-arkivets lärdomar, api-contract §0:s
  v7-varning och mdn-selection/db-schema-detaljerna. Luckor där personliga
  AI-reflektioner saknas är uttryckligen markerade.
- Ingen app-kod rörd. Inga andra filer.

## Så testade jag

**Hela §4 är körd mot live** (`https://chas-u15.vercel.app`, mock-routen
`fc490e5`) — kommandona i checklistan är alltså verifierade, inte påhittade:

```
$ curl -sI https://chas-u15.vercel.app | head -1
HTTP/1.1 200 OK

$ curl -s -w '\nHTTP %{http_code}\n' -X POST .../api/chat -d '{... "level":"nybörjare" ...}'
{"error":{"code":"invalid_level","message":"level must be beginner, student or developer"}}
HTTP 400

$ curl ... -d '{"...","level":"beginner","messages":[]}'
{"error":{"code":"invalid_body","message":"messages is required and must be non-empty"}}
HTTP 400

$ curl -s -o /dev/null -w 'HTTP %{http_code}\n' https://chas-u15.vercel.app/api/chat
HTTP 405

$ curl -s -o /dev/null -D - -X POST .../api/chat -d '<giltig body>'
HTTP/1.1 200 OK
Cache-Control: no-cache
Content-Type: text/event-stream
X-Accel-Buffering: no
X-Vercel-Ai-Ui-Message-Stream: v1
```

Streamsekvensen (§4.5), deltas bortfiltrerade:

```
data: {"type":"start"} → start-step → text-start(id 0) → 54 × text-delta →
text-end → source-url ×2 → finish-step → finish → data: [DONE]
```

**README (#24):** varje faktapåstående kontrollerat mot källan i repot i
stället för skrivet ur minnet — `wc -l scripts/mdn-selection-list.txt` → `528`;
cosine/1536/`match_documents` ur `docs/db-schema.md` §3–§4; `parts` vs
`content` och versionslåsningen ur `docs/api-contract.md` §0 och §2;
lärdomarna ur `docs/state-archive/wave-0.md`.

## Inte klart / avvikelser

- **#23 del B (körningen) är inte gjord** och kan inte göras än: RAG-routen
  (#19) och UI:t (#21) är inte live. Issuen ska stå kvar öppen till tors kväll.
  Checklistan kopieras då till `docs/smoke-runs/wave-1.md` och fylls i där.
- **Del av §0 kan inte kryssas förrän del B körs:** raden om
  `SUPABASE_SERVICE_ROLE_KEY` i Production är skriven som en kontroll att göra,
  inte som något denna session verifierat (`vercel env ls` kördes inte här —
  senaste kontrollen är session-2:s, där fem variabler fanns men service
  role-nyckeln lades till senare, ons fm).
- README:ns reflektion är **v1**, inte färdig: inga personliga
  AI-reflektioner finns än (wave 0:s formella wave-handoffs hoppades över och
  reflektionerna lämnas i wave 1-handoffen i stället).
- Issue #23 och #24 är inte bockade/stängda i GitHub — orchestratorns beslut.

## Överraskningar

- **Mocken och den riktiga routen går inte att skilja åt i UI:t** — samma
  streamformat, samma källchips, samma nivåskillnad i tonen (mocken har tre
  handskrivna svar). Utan detektor kan hela smoke-testen bli grön mot mocken.
  Tre tecken finns nu i §0: prefixet `(mock · …)`, att mockens källpar är
  identiskt för varje fråga, och — starkast — att mockens andra källa pekar på
  `/docs/Glossary/Scope`, som **inte** ligger i de 528 indexerade sidorna
  (`grep -ic glossary scripts/mdn-selection-list.txt` → `0`). En Glossary-länk
  i ett svar betyder alltså mock, inte RAG. Bekräftat live: frågan "Hur
  fungerar fetch?" gav closure-källor.
- **405 för fel metod kommer från Next**, inte från vår kod — routen
  exporterar bara `POST`, så kontraktets JSON-kropp `method_not_allowed`
  levereras inte. Checklistan kräver därför statuskoden och behandlar
  felkroppen som önskvärd, inte som krav. Värt ett kontraktsförtydligande i
  wave 2 om vi bryr oss.
- **`main`-skyddet varnar men släpper igenom** för admin (`remote: Changes must
  be made through a pull request` + lyckad push) — samma beteende som #1 och #2
  noterade. Övriga i gruppen får det som ett hårt stopp.

## Nästa session bör börja med

Tors kväll, när #19 + #21 är mergade och deployade: kopiera
`docs/smoke-test.md` till `docs/smoke-runs/wave-1.md`, kör hela checklistan mot
live och fyll i resultatrutan — det är #23:s bevis och grinden för wave
1-handoffen.
