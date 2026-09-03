# Wave-handoff — wave 0 — Yasmin

> Fylls i av din personliga orchestrator när din wave är klar.
> Sparas som `docs/handoffs/wave-N-<namn>.md` i en PR till main.
> Detta är också bedömningsunderlag — skriv så att en lärare förstår.

**Person:** Yasmin · **Wave:** 0 · **Datum:** 2026-09-03

## Klart
| Issue | PR | Bevis (hur testat) |
|---|---|---|
| #4 Supabase-schema för vektorsök | #15 | SQL kört i Supabase SQL Editor: `create extension vector`, `documents`-tabell (`id`, `content`, `metadata jsonb`, `embedding vector(1536)`), hnsw-index, `match_documents()`. Självtest: manuell insert (id=1) + `match_documents()` mot samma vektor → 1 träff, `similarity=1`. Dokumenterat i `docs/db-schema.md`. |
| #5 MDN-urval definierat och hämtat | #14 | Sparse-klon av `mdn/content`, kuraterat urval kört genom `scripts/generate-mdn-selection.sh` → 528 sidor (JS Guide + referens + utvalda DOM/fetch-sidor) listade i `scripts/mdn-selection-list.txt`. Kriterier, uteslutningsregler, licensnotis (CC BY-SA) och chunkningsalternativ i `docs/mdn-selection.md`. |
| #6 Embedding-spike mot OpenRouter | #27 | `scripts/embed-spike.ts` kört mot riktiga OpenRouter- och Supabase-endpoints: 5 MDN-sidor chunkade, embeddade (`openai/text-embedding-3-small`, dim=1536) och skrivna till `documents`. Självtest: frågan "vad är en closure" → `match_documents()` rankar closure-sidan högst (`similarity=0.4220`, näst högst 0.1868). |

Alla tre issues mergade till `main` (`a9d2da5`, `907d0b9`, `57e2f6e`).

## Inte klart + varför
Inget utestående. Alla tre issues blev klara, men #6 hann inte mergas förrän
efter att Henrik redan öppnat wave 1 och roterat `STATE.md` — den står där som
"carry-over" (c/o) trots att den är en wave-0-issue rakt igenom. Ingen
omdefiniering behövs, bara en notis om tidslinjen.

## Beslut jag tagit
- **RLS påslaget på `documents` utan policies** — Supabase SQL Editor blockerade
  annars en publik tabell utan RLS när Data API är aktiverat. Service role-
  nyckeln (server-side, ingestion + RAG-route) kringgår RLS som vanligt, så
  inget planerat arbetsflöde påverkas. Policies läggs till senare om/när
  klienten ska läsa direkt via Data API:t. **[ADR?]** — värt en rad i PLAN.md §3
  om vi permanent kör utan policies.
- **hnsw-index istf ivfflat** på `embedding` — korpuset är litet (låga tusental
  chunks efter full ingestion), hnsw kräver ingen förhandstuning av `lists`
  som ivfflat gör. pgvex/pgvector rekommenderar hnsw som default för nya projekt.
- **528 sidor istf ≤500** i MDN-urvalet — ytterligare nedskärning hade tagit
  bort metoder (t.ex. `Array.prototype.flatMap`) som eleven faktiskt frågar om,
  bara för att träffa ett rundat tal. Motiverat i `docs/mdn-selection.md`.
- **REST + `fetch()` istf `@supabase/supabase-js`** i spike-scriptet — fyra
  REST-anrop (insert × 5, en rpc-sökning) motiverar inget SDK-beroende för ett
  engångsscript. Om #17 (riktig ingestion) blir mer omfattande kan SDK:n vara
  rätt val där istället.
- **Sparse checkout-mönster för `mdn/content`**: `git clone --filter=blob:none
  --sparse`, följt av `sparse-checkout set <mappar>` — en full `--depth 1`-klon
  slår i Windows path-längdgränsen på grund av djupt nästlade skärmdumpsfiler
  i MDN-repot. Använt i både #5 och #6, bör återanvändas i #17.

## Blockerar / blockeras av
- **#17 (ingestion 528, Fastuo/Ernest väntar indirekt på RAG-routen som bygger
  på detta) kan starta** — schema, urval och embedding-kedjan är alla bevisade.
  Viktigt för den sessionen att veta: `documents`-tabellen har redan 6 rader
  (id=1 dummy-rad från #4:s självtest, id=2–6 från #6:s spike) — ingestionen
  bör antingen rensa dessa eller filtrera bort dem, inte anta att tabellen
  är tom.
- Jag väntar inte på något från andra just nu.

## AI-reflektion (obligatorisk, 2–3 meningar)
Det mest lärorika var hur ofta AI-verktyget löste problem genom att *läsa
tillbaka faktiskt tillstånd* istället för att lita på ett lyckat kommando —
t.ex. när Supabase SQL Editor rapporterade "success" på en `CREATE TABLE` som
i själva verket blockerats bakom en modal, upptäcktes det bara för att
sessionen kollade `select count(*)` efteråt istället för att gå vidare. Mest
friktion gav miljöbegränsningar utanför kodningen: `gh` CLI/GitHub-token
saknades i varje session, så alla tre PR:er fick öppnas manuellt via
webbläsare-länkar — inget kodproblem, men det bröt annars smidiga
autonoma flöden. Windows-specifika problem (path-längd vid full git-klon av
`mdn/content`) hittades och löstes av AI:n själv utan att jag behövde peka på
orsaken.

## Main orchestrator bör först
Notera i STATE.md att #4/#5/#6 är proven (PR #15/#14/#27, alla mergade) och
att `documents`-tabellen redan innehåller 6 testrader som #17 måste hantera
innan den riktiga 528-sidors-ingestionen körs.
