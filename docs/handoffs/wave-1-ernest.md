# Wave-handoff — wave 1 — Ernest

**Person:** Ernest · **Wave:** 1 (plus wave 0-skiss) · **Datum:** 2026-09-03

## Klart

| Issue | PR | Bevis (hur testat) |
|---|---|---|
| #10 UI-skiss | #13 | `docs/ui-sketch.md` + SVG/PNG |
| #11 chatkomponent | `issue-11-chat` | localhost:3000, streamat mocksvar |
| #12 nivåväljare | `issue-12-niva` | Nybörjare→`(mock · nybörjare)`; `"nybörjare"` i API = 400 |
| #21 källor + status | `issue-21-status` | MDN-chips `target=_blank`; knapp låst under stream |
| #22 tomt läge | `issue-22-empty` | kanonisk copy, chips fyller input, försvinner efter första meddelande |

## Inte klart + varför

- Verifiering mot Fastuos *riktiga* RAG-route (#19) när den mergas.
  Ska kräva noll UI-kod. Görs då, rapporteras som kontraktsbugg vid avvikelse.

## Beslut jag tagit

- `Level` är bara `'beginner' | 'student' | 'developer'` i koden. Svenska
  ord finns bara som etiketter i `LEVELS`.
- Ljust tema tvingas (`color-scheme: light`). Mörkt tema = wave 2–3.
- Förslagschips fyller input, skickar inte — användaren hinner byta nivå.

## Blockerar / blockeras av

- Andra kan nu chatta mot mocken i UI:t.
- Jag väntar på Fastuos #19 för noll-ändringskollen i #21.

## AI-reflektion (wave 0 och 1)

Wave 0: Cursor ritade snygga PNG-skisser men förstörde svensk text, så
SVG + kanonisk copy i `docs/ui-sketch.md` blev den riktiga sanningen — bra
påminnelse att inte lita på genererad UI-copy. Wave 1: kontraktets §8
(`useChat` + `DefaultChatTransport` + `parts`) var mer värt än googlad
AI-SDK-dokumentation, som fortfarande beskriver v4/v5. När jag följde
kontraktet passade mocken direkt; fällan var att skicka `"nybörjare"`
istället för `"beginner"`.

## Main orchestrator bör först

Merga UI-stacken mot main så smoke-test (#23) kan köras i webbläsaren,
sedan be mig verifiera noll-ändring när Fastuos riktiga route landar.
