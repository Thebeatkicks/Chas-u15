# Session-handoff — issue #11

**Issue:** #11 — Grundlayout + chatkomponent mot mock
**Branch/PR:** `issue-11-chat`
**Status:** klar

## Vad ändrades

- `app/page.tsx`, `app/layout.tsx`, `app/globals.css` — tre zoner, sv-metadata, ljust tema
- `components/chat.tsx` — `useChat` + `DefaultChatTransport` mot `/api/chat`
- Streamad text i `parts` med `type === 'text'`
- Källchips ur `source-url`-parts (`components/source-chips.tsx`)

Rörde inte `app/api/**`.

## Så testade jag

- `pnpm dev` → http://localhost:3000 visar header + chatyta + input (inte Next-startsidan)
- Skickade "Vad är en closure?" → mocktext streamades ord för ord
- Efter `text-end` dök källchips upp: Closures — MDN, Scope — MDN

## Inte klart / avvikelser

- Samma filer som #12/#21/#22 — hela chatten byggdes i ett svep så
  den går att verifiera nu. Övriga issues stängs av stackade PR:ar
  med egna handoffs (Sveprincipen §4.4).
- Skärmdump togs i webbläsaren under sessionen; inte committad (publikt repo)

## Överraskningar

- AI SDK v7: text ligger i `parts`, inte `content`. Kontraktets §8 stämde.

## Nästa session bör börja med

#12 — koppla nivåväljaren så body får `beginner`/`student`/`developer`.
