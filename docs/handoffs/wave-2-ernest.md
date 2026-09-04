# Wave-handoff — wave 2 — Ernest

**Person:** Ernest · **Wave:** 2 · **Datum:** 2026-09-04

## Klart
| Issue | PR | Bevis (hur testat) |
|---|---|---|
| #41 markdown + kodblock | `issue-41-markdown` | Fixture: **fetstil**, lista, `javascript`-block med Kopiera. Streaming: progressiv parse + stäng öppet fence. |
| #42 knappar + gäst-banner + Enter | `issue-42-buttons` | Profil under Dojo borta, bottenkort kvar. Gäst-banner utan inloggningslöfte. Enter skickade "Vad är en closure?" (rubrik → 1 FRÅGA). |
| #43 trådlista localStorage | `issue-43-threads` | Fråga → tråd i menyn → klick återställer. Trasig JSON i localStorage → ingen crash. |

## Inte klart + varför
Inget. Stretch #46 (TTS) togs inte.

## Beslut jag tagit
- Streaming-markdown: re-parse hela bufferten per chunk, stäng ofullständigt ` ``` `-staket. [dokumenterat i #41-handoff]
- Trådar auto-sparas i localStorage när man frågar (inte bara vid "Ny fråga") så menyn matchar bevis-raden.
- Paket till #41 lades i PR:en (sveprincipen) — Henrik pingas med samma lista.

## Blockerar / blockeras av
- Blockerar inte Fastuo/Yasmin. Paketen i #41 behöver Henriks OK vid merge.

## AI-reflektion (obligatorisk, 2–3 meningar)
Cursor kunde bygga tre stacked PR:ar snabbt, men det var lätt att släppa in extra UX från wave 1 i fel issue — den här waven tvingade en-PR-per-issue. Markdown-paketen var den enda grind jag inte äger; att pinga Henrik med exakt lista först och sedan lägga dem i PR:en undvek väntan utan att gömma beroendet. Största lärdomen: bevis i PR-bodyn (Enter faktiskt skickade, trasig localStorage kraschade inte) är mer värt än "det ser bra ut".

## Main orchestrator bör först
Merga #41 → #42 → #43 i den ordningen (stackade brancher) och kör `pnpm add` / lockfilen från #41 mot main.
