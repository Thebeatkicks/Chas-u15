# Session-handoff — issue #12

**Issue:** #12 — Nivåväljare kopplad till requesten
**Branch/PR:** `issue-12-niva`
**Status:** klar

## Vad ändrades

- `components/level-picker.tsx` + `components/levels.ts`
- `sendMessage({ text }, { body: { level } })` med `Level = 'beginner' | 'student' | 'developer'`
- UI-etiketter svenska; API-värden engelska

## Så testade jag

- Nybörjare vald → svaret började `(mock · nybörjare)` (ryggsäcksanalogin)
- Student vald → `(mock · student)` (lexikalt scope)
- `level: "nybörjare"` mot `/api/chat` gav **400** `invalid_level`
- `level: "beginner"` gav **200** + `source-url`

## Inte klart / avvikelser

Inga. Default är `beginner` (första segmentet).

## Överraskningar

Svensk etikett i UI och engelskt värde i body är lätta att blanda ihop.
Typen `Level` finns bara i `components/levels.ts` så strängen `"nybörjare"` inte kan skickas.

## Nästa session bör börja med

#21 — skrivindikator, låst knapp, felrad, klickbara källor.
