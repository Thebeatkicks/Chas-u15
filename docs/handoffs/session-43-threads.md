# Session-handoff — issue #43

**Issue:** #43 — Trådlista i vänstermenyn (localStorage)
**Branch/PR:** `issue-43-threads` (stackad på #42 → #41)
**Status:** klar

## Vad ändrades
- `components/profile-store.tsx` — `activeThreadId`, `openThread`, `startNewThread`. Trådar läses med try/catch; trasig JSON eller icke-array ger `[]`. Write-fel (quota) kraschar inte.
- `components/app-shell.tsx` — sektionen **Trådar** i vänstermenyn (titel = första frågan, öppna, ta bort). Namn syns när menyn är öppen.
- `components/chat.tsx` — tråden sparas när man frågar; klick i menyn byter tråd; "Ny fråga" startar ny session. Listan i empty-state bort (ligger i menyn nu).

## Så testade jag
- Skickade "Vad är en closure?" → tråd syntes i menyn som "Vad är en…"
- Klick på tråden återställde bubblan ("1 FRÅGA")
- `localStorage.threads = '{not-json'` + reload → appen startade, ingen crash, tom trådlista

## Inte klart / avvikelser
- Inga. Ingen Supabase, ingen inloggning.

## Överraskningar
- Sparning vid varje `messages`-uppdatering räcker för att titeln ska dyka upp direkt; `saveThread` är `useCallback` så det inte loopar.

## Nästa session bör börja med
Wave-handoff `docs/handoffs/wave-2-ernest.md` om den inte följer med den här PR:en.
