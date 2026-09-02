# Arkiv — Wave 0 (1–2 sep, stängd ons 3/9 fm)

Slutstatus: 8/12 proven vid ordinarie slut; #8 proven ons fm (orchestratorn
byggde mocken som wave-open-grind); #6, #9, #11, #12 carry-over till wave 1.
Formella wave-handoffs hoppades över (beslut ons fm) — AI-reflektionerna
lämnas i wave 1-handoffen istället.

| Issue | Ägare | Slutläge | Bevis |
|---|---|---|---|
| #1 scaffold | Henrik | proven | `be9c0d4`, rent klon, `docs/handoffs/session-1-scaffold.md` |
| #2 Vercel-deploy | Henrik | proven | `89d09cb`, https://chas-u15.vercel.app 200, auto-deploy ~16s |
| #3 wave1+bräda | Henrik | proven | bräda publik, 20 issues, wave 1 publicerad |
| #4 Supabase-schema | Yasmin | proven | PR #15 `a9d2da5`, självtest similarity 1.0 |
| #5 MDN-urval | Yasmin | proven | PR #14 `907d0b9`, 528 sidor + script |
| #6 embedding-spike | Yasmin | **carry-over → w1** | blockerades av service role-nyckel |
| #7 API-kontrakt | Fastuo | proven | PR #16 `f9cff5c` |
| #8 mock-route | Fastuo→orch | proven | `fc490e5`, curl-verifierad mot kontraktet |
| #9 chat-spike | Fastuo | **carry-over → w1** | — |
| #10 UI-skiss | Ernest | proven | PR #13 `3ed9658` |
| #11 chatkomponent | Ernest | **carry-over → w1** | — |
| #12 nivåväljare | Ernest | **carry-over → w1** | — |

## Lärdomar (checkpoint-frågan "vad gick sönder?")

1. **Beroendekedjor mellan personer inom waven** serialiserade arbetet
   (kontrakt→mock→UI). Fix: sveprincipen, PLAN.md §4 (`10c6ff7`).
2. **Nyckel delades inte vid wave-öppning** — #6 stod still i två dagar på
   `SUPABASE_SERVICE_ROLE_KEY`. Fix: wave-open-grinden.
3. **Reviews blockerade** — 0 reviews på ett dygn, orchestratorn mergade i
   klump. Fix: pinga namngiven reviewer + fortsätt direkt; orchestrator
   fallback med halvdags-SLA.
