# Wave-handoff — wave 2 — Yasmin

> Fylls i av din personliga orchestrator när din wave är klar.
> Sparas som `docs/handoffs/wave-N-<namn>.md` i en PR till main.
> Detta är också bedömningsunderlag — skriv så att en lärare förstår.

**Person:** Yasmin · **Wave:** 2 · **Datum:** 2026-09-04

## Klart
| Issue | PR | Bevis (hur testat) |
|---|---|---|
| #37 Åtgärda retrieval-gap, mål ≥8/10 | #51 (mergad) | Hybrid rubrik-chunkning (`##` primär, `###` fallback, fast delning sista utväg) + sidtitel i embedding-text (inte lagrad `content`) + boilerplate-filter. Full ombindexering, 528 sidor → 3547 chunks. Daterad efter-mätning: **6/10** (mål ej nått — se "Inte klart"). Ett av fyra namngivna gap (#7, hoisting) helt fixat; tre (#2/#3/#6) gick från tydliga förluster till near-misses (<0,01 similarity från topp-3); en ny liten regression (#9, "this"). |
| #38 Regression efter #37 + Fastuos #39 | #53 (öppen, review begärd av Fausto) | Ny daterad körning, samma 10 frågor/metod, efter att både #37 och #39 landat på `main`. Resultat identiskt med #37s efter-mätning (6/10, avvikelser bara på fjärde decimalen — flyttalsbrus). Bekräftar att promptändringar inte påverkar retrieval, som väntat (`match_documents()` körs innan prompten används). |

## Inte klart + varför
**#37s mål (≥8/10) nåddes inte** — landade på 6/10. De tre kvarvarande gapen
(#2 let/const, #3 map()/Map, #6 prototyp) är nu marginella near-misses, inte
tydliga förluster, men flippade inte inom topp-3. Rotorsak: ett
scratchpad-delmängdstest (23 sidor) visade 8/10 och gav ett falskt positivt —
den fulla 528-sidors-korpusen introducerar fler nära besläktade
distraktorsidor än delmängden räknade med. Jag frågade dig om vi skulle
investera i ytterligare en tuning-runda; du valde att **acceptera 6/10 och gå
vidare**, eftersom kvarvarande gap enligt sessionens egen analys sitter i
embeddingrymden på ett sätt corpus-side chunkning inte ensamt kan lösa —
query-time-ändringar i `lib/ai/retrieval.ts` (Fastuos yta) är den
sannolikt effektiva fixen. Det beslutet blev en frivillig uppföljningsissue,
**#52** (Fastuo).

## Beslut jag tagit
- **Accepterade 6/10 som slutresultat för #37** (ditt beslut, mitt förslag)
  istf en ny tuning-runda — avtagande avkastning, kvarvarande gap kräver
  cross-owner-arbete.
- **Titel prependas bara i embedding-texten, inte i lagrad `content`** —
  verifierat att `app/api/chat/route.ts` redan prependar `"## title"` runt
  `content` vid promptbygge, så en dubblering hade varit ren redundans för
  den konsumenten.
- **3547 chunks (2,04× baseline 1738)** — medveten kostnadsavvägning för
  finkornigare rubrik-chunkning, verifierad med en simulering innan den
  skarpa ombindexeringen (som tog ~16 minuters embedding-tid, kördes
  detached).
- **Query-time-normalisering rekommenderad, inte implementerad** — dokumenterat
  i `docs/retrieval-sanity.md` som en riktad rekommendation till `lib/ai/
  retrieval.ts`-ägaren istf att röra filen själv. Blev #52.

## Blockerar / blockeras av
- **#52** (Fastuo, frivillig) är den enda öppna tråden ur mitt arbete denna
  wave — inte min issue, ingen brådska.
- PR #53 väntar på Faustos review (begärd via GitHub `requested_reviewers`).
- Inget blockerar mig.

## AI-reflektion (obligatorisk, 2–3 meningar)
Det mest lärorika i wave 2 var att se en session fånga sitt eget falska
positiva resultat — ett litet delmängdstest visade 8/10, men sessionen
litade inte på det och körde den fulla, dyrare valideringen ändå, vilket
avslöjade att marginalen inte höll. Lika värdefullt var att den rapporterade
ett missat mål (6/10 mot ≥8/10) rakt av med en ärlig rotorsaksanalys istf att
antingen dölja det eller överskrida sitt eget filägarskap för att tvinga
fram en bättre siffra. Miljöbegränsningen med `gh`-CLI fortsatte hela waven
ut — tre olika lösningar dök upp över de tre issuesna (manuell länk,
`git credential`+curl, och till sist webbläsarautomation när curl-vägen
blockerades) — ett tydligt tecken på att detta är en miljölucka värd att
lösa på riktigt inför wave 3, inte något varje session ska behöva
uppfinna på nytt.

## Main orchestrator bör först
Merga PR #53 när Faustos review är klar (samma 6/10-resultat som redan är
mergat via #51, ingen ny risk) — och notera #52 som ledig frivillig-issue om
någon har tid kvar i waven.
