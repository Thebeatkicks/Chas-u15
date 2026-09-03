# Session-handoff — issue #22

**Issue:** #22 — Tomt läge + förslagschips enligt skissen
**Branch/PR:** `issue-22-empty`
**Status:** klar

## Vad ändrades

- `components/empty-state.tsx` + kanonisk copy i `components/copy.ts`
- Tre förslagschips fyller inputen (skickar inte själva)
- Footer: `Källor: MDN Web Docs · CC-BY-SA`
- Tomt läge försvinner när `messages.length > 0`

## Så testade jag

- Första load: rubrik "Ställ din första fråga", brödtext ur skissen, tre chips
- Klick på "Vad är en closure?" fyllde inputen, skickade inte
- Efter skicka: tomt läge borta, footer kvar

## Inte klart / avvikelser

Inga. Ingen extra styling utöver skissen.

## Överraskningar

—

## Nästa session bör börja med

Wave-handoff `docs/handoffs/wave-1-ernest.md` och pinga reviewer.
