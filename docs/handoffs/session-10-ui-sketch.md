# Session-handoff — issue #10

**Issue:** #10 — UI-skiss för JS Sensei
**Branch/PR:** `issue-10-ui-skiss` (PR inte öppnad än)
**Status:** klar lokalt — väntar på commit, PR och delning i gruppkanalen

## Vad ändrades

- `docs/ui-sketch.md` — layout, copy, 10 designbeslut, vad #11/#12 ska bygga
- `docs/sketches/ui-sketch-empty.svg` + `.png` — tomt läge
- `docs/sketches/ui-sketch-chat.svg` + `.png` — svar, källchips, streaming

Ingen kod under `app/` eller `components/`.

## Så testade jag

- Öppnade båda SVG:erna i webbläsare: header, nivåväljare, tomt-läge,
  källchips och input syns med läsbar svensk copy.
- PNG:erna är stämning; suddig AI-text i PNG räknas inte — SVG +
  `docs/ui-sketch.md` är sanningen.

## Inte klart / avvikelser

- Skissen är inte delad i gruppkanalen än (måste göras av Ernest).
- Ingen PR än. Issuens bevis är "PR med skissen".
- PNG-texten är inte pixelperfekt; därför finns SVG + kanonisk copy i md.

## Överraskningar

- Default-nivå i skissen är **Nybörjare**. #12 bör följa det om inte
  gruppen säger annat när Fastuos kontrakt landar.

## Nästa session bör börja med

Vänta på Fastuos `docs/api-contract.md` + mock (#7/#8), sen bygg #11
mot den skissen.
