# Session-handoff — issue #21

**Issue:** #21 — UI mot riktiga routen + riktiga källchips
**Branch/PR:** `issue-21-status`
**Status:** klar mot mock (noll-ändring när Fastuos route ersätter mocken)

## Vad ändrades

- Källchips: `target="_blank"` + `rel="noreferrer"`, titel från `part.title`
- `status === 'submitted' | 'streaming'` låser input och skicka-knapp
- "Skriver…" + caret på sista assistantsvaret under streaming
- `error` från `useChat` visas som röd alert (`error.message`)

## Så testade jag

- Under stream: input `disabled`, skicka-knapp `disabled`
- Efter stream: chips pekar på
  `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures`
  och Glossary/Scope, `target=_blank`
- Ingen kodändring gjord för "riktig route" — samma kontrakt som mocken

## Inte klart / avvikelser

Riktiga RAG-routen (#19) är inte mergad än. När den landar: skicka samma
fråga, bekräfta källor + stream utan att ändra UI-kod. Avvikelse = kontraktsbugg.

## Överraskningar

Källor kommer efter `text-end`, så chips dyker upp när svaret är klart
utan extra if-sats. Precis som kontraktets §5 / skissens beslut 5.

## Nästa session bör börja med

#22 — tomt läge + förslagschips + MDN-footer.
