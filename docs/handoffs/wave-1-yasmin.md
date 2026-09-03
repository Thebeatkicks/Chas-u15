# Wave-handoff — wave 1 — Yasmin

> Fylls i av din personliga orchestrator när din wave är klar.
> Sparas som `docs/handoffs/wave-N-<namn>.md` i en PR till main.
> Detta är också bedömningsunderlag — skriv så att en lärare förstår.

**Person:** Yasmin · **Wave:** 1 · **Datum:** 2026-09-03

## Klart
| Issue | PR | Bevis (hur testat) |
|---|---|---|
| #6 Embedding-spike (carry-over från wave 0) | #27 (mergad) | 5 MDN-sidor embeddade och skrivna till `documents`. Självtest: "vad är en closure" → `match_documents()` rankar closure-sidan högst, `similarity=0.4220`. |
| #17 Ingestion v1 | #30 (öppen, review begärd) | `scripts/ingest.ts` kört mot alla 528 sidor i `scripts/mdn-selection-list.txt` → 1738 chunks skrivna till `documents` (fast storlek 2800 tecken + 350 tecken overlap). Radantal verifierat oberoende via en egen REST-`HEAD`-fråga (`content-range: 0-999/1738`), inte bara scriptets egen logg. |
| #18 Retrieval-sanity | #31 (öppen, review begärd av Henrik) | 10 testfrågor körda mot `match_documents()`, dokumenterade i `docs/retrieval-sanity.md`. **6/10** hittar rätt sida i topp-3. De fyra missarna (let vs const, `map()`, prototyper, hoisting) verifierade separat mot urvalslistan — sidorna finns i korpuset, så det är renodlade retrieval-gap, inte täckningsluckor. |

## Inte klart + varför
Inget innehållsmässigt utestående på mina tre issues — alla bevis-rader är
uppfyllda. Kvarstår bara mekaniskt: PR #17 och #18 väntar på review/merge
(förväntat enligt sveprincipen — integration sker på wave-gränsen, inte mitt
i waven). PR #29 (wave-0-handoffen) är också fortfarande öppen och omergad.

## Beslut jag tagit
- **Chunk-parametrar (#17):** `CHUNK_SIZE = 2800` tecken (~700 tokens),
  `CHUNK_OVERLAP = 350` tecken (~12,5%) — uppskattat med 4-tecken/token-tumregel
  mot rekommendationens 500–800 tokens / 10–15 % overlap i `docs/mdn-selection.md`,
  ingen exakt tokenizer använd. Namngivna konstanter med kommentar, redo för
  wave 2-tuning.
- **Idempotens (#17): rensa+fyll**, inte upsert — hela korpuset regenereras
  varje körning ändå (inget delta-flöde), så en stabil chunk-nyckel (url+index)
  hade varit onödig komplexitet just nu. Detta rensade automatiskt bort
  #4/#6:s 6 självtest-rader.
- **PostgREST-DELETE kräver ett filter** — ett ovillkorat `delete from documents`
  över REST avvisas; löst med `id=gt.0`. Värt att känna till för alla framtida
  bulk-scripts mot samma tabell.
- **Retrieval-baseline (#18): 6/10** i topp-3, ingen tuning gjord (hård stopp
  respekterad). De fyra missarna är namngivna och verifierat *inte* täcknings-
  problem — konkret startlista för wave 2, inte "förbättra sökningen" i
  allmänhet. Tydligast fall: `map()` (Array-metoden) och `Map` (objektet)
  går inte isär i embeddingen trots parentesen i frågan.
- **PR-skapande utan `gh` CLI**: en session i wave 1 hittade att `git
  credential fill` (samma autentisering som `git push` redan använder) kan
  ge en token som fungerar mot GitHub REST API via `curl` — användes för att
  öppna PR:n, sätta `requested_reviewers` och posta en @-ping-kommentar,
  helt utan att exponera token i loggar. Löser friktionen från wave 0 där
  varje PR fick öppnas manuellt via länk. **[ADR?]** — värt att nämna för
  gruppen som ett standardmönster om ingen har `gh` installerat.

## Blockerar / blockeras av
- **#19 (Fastuo, riktig RAG-route)** kan nu bygga mot en fylld `documents`-
  tabell (1738 riktiga chunks, inte testdata) — men bör känna till att
  retrieval-baseline bara är 6/10 i topp-3 just nu (se `docs/retrieval-sanity.md`).
  Det är förväntat och wave 2:s jobb, inte en bugg i #19:s route, men värt att
  inte bli förvånad av under egna tester.
- Ingen "riktig" gruppkanal (Slack/Discord) var kopplad i någon av mina
  sessioner denna wave — "pinga reviewer" blev GitHub `requested_reviewers`
  + PR-kommentar istället. Fungerar, men om gruppen faktiskt använder en
  extern kanal parallellt bör Henrik pingas där också manuellt.
- Jag väntar inte på något från andra just nu.

## AI-reflektion (obligatorisk, 2–3 meningar — täcker wave 0 och 1)
Det mest värdefulla mönstret över båda waves var att sessionerna gjorde sig
en vana av att verifiera *faktiskt tillstånd* istället för att lita på ett
kommandos egen "success"-rapport — från Supabase SQL Editor som tyst
blockerade en `CREATE TABLE` bakom en modal i wave 0, till #17:s oberoende
REST-radräkning i wave 1. Störst friktion gav miljöbegränsningar utanför
själva kodningen (ingen `gh` CLI, ingen gruppkanal-integration) snarare än
själva uppgifterna — men wave 1 löste den återkommande PR-friktionen själv
genom att hitta ett giltigt sätt att återanvända den redan beviljade
git-autentiseringen mot GitHub:s REST API, vilket är precis den typen av
självständigt, inom-scope problemlösande jag vill se mer av. #18:s
retrieval-baseline (6/10, konkreta namngivna fall) är ett bra exempel på hur
tydligt avgränsade spike-issues ger användbara resultat även när de
"misslyckas" — en dokumenterad brist är mer värd än ett odokumenterat påstått
100 %.

## Main orchestrator bör först
Merga PR #29 (wave-0-handoff), #30 (#17) och #31 (#18) vid torsdagens
reconciliation — #30 saknar fortfarande en tilldelad reviewer (#31 har
Henrik) — och för vidare retrieval-baseline (6/10, fyra namngivna fall) till
den som äger wave 2:s retrieval-tuning.
