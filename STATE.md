# STATE — HEAD

> Index över git + issues, aldrig egen sanning. Om detta motsäger git: git vinner.
> Uppdateras av main orchestrator vid varje reconciliation (mån/ons/fre).
> Arkiv: `docs/state-archive/`.

**Senast uppdaterad:** 2026-08-31 kväll (reconciliation efter #1)
**Aktuell wave:** 0 (mån 1/9–tis 2/9)
**Proven-debt:** 0

**Versioner alla bygger mot** (låsta av #1): Next 16.3.3 · React 19.2.8 ·
Tailwind 4.3.3 · TS 5.9.3 · pnpm 10.12.2 · Node 24.13.1 · ingen `src/`-katalog.

## Lifecycle per packet (wave 0)

| Issue | Ägare | Lifecycle | Bevis |
|---|---|---|---|
| #1 scaffold | Henrik | **proven** | `be9c0d4`, rent klon → dev/build/lint OK, `docs/handoffs/session-1-scaffold.md` |
| #2 Vercel-deploy | Henrik | planned | — |
| #3 wave1-issues + bräda | Henrik | planned | — |
| #4 Supabase-schema | Yasmin | planned | — |
| #5 MDN-urval | Yasmin | planned | — |
| #6 embedding-spike | Yasmin | planned | — |
| #7 API-kontrakt | Fastuo | planned | — |
| #8 mock-route | Fastuo | planned | — |
| #9 chat-spike | Fastuo | planned | — |
| #10 UI-skiss | Ernest | planned | — |
| #11 chatkomponent | Ernest | planned | — |
| #12 nivåväljare | Ernest | planned | — |

## Kända blockeringar

- ~~#1 blockerar all kod~~ **Löst 31/8** — repot är öppet för kloning.
- `main`-skyddet är tekniskt tvingande: medlemmars push avvisas med
  "Changes must be made through a pull request" — detta är förväntat, inte
  ett fel. Endast Henrik (admin) kan pusha direkt.
- Projektbrädan väntar på `gh auth refresh -s project,read:project` (ingår i #3).

## Beslut noterade från #1 (kandidater till PLAN.md §3 vid wave-slut)

- Ingen `src/`-katalog — filägarskapen i prompterna (`app/**`, `components/**`,
  `lib/ai/**`) gäller från repo-roten.
- `.gitattributes` med `* text=auto eol=lf` — förhindrar CRLF-brus i PR:er.

## Nästa reconciliation

Mån 1/9 kväll: avstämning, lifecycle-promotering, ev. knutar.
