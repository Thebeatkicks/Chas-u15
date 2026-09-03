# Wave 2 — utkast (bekräftas på mötet fre 4/9, publiceras direkt efter)

> Wave 2 = fre 5/9 + mån 8/9 (helg = frivillig bonus). Mål: **högre
> svarskvalitet + demoredo app.** Vertikala spår enligt sveprincipen.
> Max 2 nya idéer från mötet får in — resten är backlogg.

## Yasmin (data/RAG) — retrieval-kvalitet

**W2-Y1: Åtgärda baselinens fyra retrieval-gap** (`docs/retrieval-sanity.md`):
let/const (#2), map() → fel Map (#3), prototyp (#6), hoisting (#7).
Verktygslåda: chunkning per rubrik/hybrid (omindexering OK — ingestion är
idempotent), berika chunkar med sidtitel i texten, eller query-normalisering.
Notering från live: helmeningsfrågor träffar bättre än nyckelord — utnyttja.
Bevis: sanity-körningen igen, före/efter-tabell. Mål ≥8/10.

**W2-Y2: Regressionskörning + uppdaterad sanity-rapport** efter tuning +
efter Fastuos #20 (svaren ändras). Dokumentera i samma fil, daterat.

## Fastuo (AI/backend) — svarskvalitet

**#20 (carry-over): System-prompts per nivå** + `docs/prompt-design.md` med
iterationer. Rutan i routen är medvetet minimal — ersätt den.

**W2-F1: Modell-A/B** — samma 5 frågor genom `CHAT_MODEL=openai/gpt-4o-mini`
vs en utmanare (t.ex. `anthropic/claude-haiku-4.5`), jämför pedagogisk
kvalitet/svenska/vägran i en kort rapport (`docs/model-ab.md`). Ren
env-ändring, ingen kod. VG-guld för README + redovisning.

## Ernest (frontend/UX) — demoredo UI

**W2-E1: #33-utfallet** (behåll/banta/ta bort profil, trådar, hälsningsmodal
enligt gruppbeslutet) + uppdatera `docs/ui-sketch.md` om beslut 10 ändras.

**W2-E2: Markdown-rendering av svaren** — modellen svarar med `**fetstil**`,
listor och kodblock som idag visas råa. Rendera (t.ex. react-markdown — nytt
paket går via Henrik) med styling enligt skissens ton. Störst synlig
kvalitetshöjning för demon.

**W2-E3: Småfix ur smoke-körningen**: Enter skickar (footern lovar det),
+ det UI-strul testprotokollet fångar (max 3 saker, time-boxat).

## Henrik (orchestrator/infra) — berättelsen

**W2-H1: README v2** — väv in alla fyra AI-reflektionerna (kräver Fastuos +
Ernests handoffs!), env-lärdomen ("namn ≠ värde"), modell-A/B-resultatet.

**W2-H2: Demo-manus v1** (`docs/demo-manus.md`) — 10 min: produktidé,
arkitekturbild, live-demo (inkl. vägran-numret), "vad var svårt". Utkast
till rollfördelning från mötet.

## Medvetet INTE i wave 2

Röst, historik-sök, fler datakällor, auth, mörkt tema — wave 3 är enbart
polish/repetition, och efter 8/9 skrivs ingen ny funktionskod (PLAN.md §5).
