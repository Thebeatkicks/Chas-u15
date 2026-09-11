# Wave-handoff — wave 2 — Fausto

**Person:** Fausto (AI/Backend) · **Wave:** 2 · **Datum:** 2026-09-05

## Klart

| Issue | PR | Bevis (hur testat) |
|---|---|---|
| #39 Prompt-svagheterna ur `prompt-design.md` | #49 | Regressionsharness (`lib/ai/prompt-regression.mjs`), tio varv per nivå. v3-baseline reproducerade varians-fyndet (1/10 definitionsinledningar, 8/10 ordnade recept). v5 över två oberoende omgångar: **0/20 definitionsinledningar, 0/20 över ordtaket, vägran 8/10 → 7/20** |
| #40 Modell-A/B | #50 | Tre modeller, identiska prompts och retrieval, `docs/model-ab.md`. gpt-4o-mini bäst på instruktionsföljning (0/5, 0/15) och latens (1,9 s median till första token). gpt-5-mini diskvalificerad: 17 s median |
| #52 Query-normalisering | #54 | Yasmins sanity-svit med hennes kriterium (topp-3, tröskel 0.0): **6/10 → 10/10**. Live-bekräftat genom routen: "skillnaden mellan let och const" ger källorna `const · let` |

## Inte klart + varför

- **Vägran är förbättrad men inte löst** — 7 av 20 körningar räknar fortfarande upp
  metoderna i användningsordning, mot 8 av 10 i v3. Ingen version i någon körning har
  gett färdig kod, så det hårda kravet håller. Ligger som rest i `prompt-design.md`.
- **`docs/retrieval-sanity.md` har inte uppdaterats med efter-siffrorna** från #52.
  Filen är Yasmins ägo och jag rörde den inte — bör bli en egen liten issue för henne,
  annars står 6/10 kvar i dokumentationen medan verkligheten är 10/10.

## Beslut jag tagit

- **`openai/gpt-4o-mini` behålls till redovisningen.** Haiku 4.5 är pedagogiskt
  trevligare men bröt två av de regler #39 just byggde bort (2/5 över ordtaket, 1/5
  definitionsinledning). Byte kräver ingen kod, bara `CHAT_MODEL` i Vercel.
- **Prompt-ändringar mäts över upprepade körningar, inte en.** `prompt-regression.mjs`
  är metoden. **[ADR?]** — den regeln är värd att gälla alla som rör prompterna.
- **Query-normalisering: expandera alltid, varva vid jämförelser.** Sortering på
  similarity låter det starkare begreppet ta alla platser — det var precis felet som
  gjorde att `let` aldrig syntes bredvid `const`. Sönderdelning sker bara när båda
  sidor innehåller bokstäver, annars går `==` vs `===` sönder.

## Blockerar / blockeras av

- **Jag blockerade #61** (README v3) tills den här handoffen fanns. Nu löst.
- **#64** (React-krasch vid streaming) är delad med Ernest. Underlaget i #60 pekar på
  klientsidan: servern svarade 200 på samtliga anrop, och bara de kraschade avslutades
  med `net::ERR_ABORTED`. Routen skickar `finish` + `[DONE]` även på fel (kontraktets
  §6), så backend-sidan gör vad den ska.

## AI-reflektion (obligatorisk, 2–3 meningar)

Den mest användbara lärdomen kom ur en misslyckad iteration: v4 försökte styra
modellen med listor över förbjudna formuleringar och gjorde felen **tre gånger
vanligare** — att räkna upp det man vill undvika verkar göra det mer närvarande, inte
mindre, och v5 löste samma problem genom att i stället ge positiva mönster att följa.
Den andra lärdomen är metodologisk: v1–v3 utvärderades med en körning per ändring,
vilket räckte för att v3 skulle *se* löst ut medan Henriks live-regression visade att
den föll tillbaka ibland — först vid tjugo körningar gick det att säga något sant om
en promptregel. Tredje: i modell-A/B-testet flaggade min egen regex "färdig lösning"
för gpt-5-mini, och tre manuella kontrollprov visade att det var falsklarm — en
AI-skriven mätheuristik behöver granskas lika hårt som AI-skriven kod, annars hamnar
felet i rapporten i stället för i koden.

## Main orchestrator bör först

Merga #61 med reflektionen ovan — den var det enda som saknades. Lägg sedan upp
efter-siffrorna i `docs/retrieval-sanity.md` som en liten issue på Yasmin, så
dokumentationen inte säger 6/10 när sviten är 10/10.
