# STATE — HEAD

> Index över git + issues, aldrig egen sanning. Om detta motsäger git: git vinner.
> Uppdateras av main orchestrator vid varje reconciliation (mån/ons/fre).
> Arkiv: `docs/state-archive/`.

**Senast uppdaterad:** 2026-09-01 ~13 (reconciliation: fyra PR:er mergade)
**Aktuell wave:** 0 (mån 1/9–tis 2/9)
**Proven-debt:** 0

**AI SDK-paketen är installerade på main** (`cfd5da7`, exakta versioner ur
kontraktets §0) — #8 och #11 är avblockerade.

**Versioner alla bygger mot** (låsta av #1): Next 16.3.3 · React 19.2.8 ·
Tailwind 4.3.3 · TS 5.9.3 · pnpm 10.12.2 · Node 24.13.1 · ingen `src/`-katalog.

## Lifecycle per packet (wave 0)

| Issue | Ägare | Lifecycle | Bevis |
|---|---|---|---|
| #1 scaffold | Henrik | **proven** | `be9c0d4`, rent klon → dev/build/lint OK, `docs/handoffs/session-1-scaffold.md` |
| #2 Vercel-deploy | Henrik | **proven** | `89d09cb` → auto-deploy Ready ~16s, https://chas-u15.vercel.app = 200, `vercel env ls` visar 5 variabler |
| #3 wave1-issues + bräda | Henrik | delvis | Bräda: https://github.com/users/Thebeatkicks/projects/2 · collaborators + nycklar klart · wave1-issues väntar på tis-handoffs |
| #4 Supabase-schema | Yasmin | **proven** | PR #15 (`a9d2da5`), självtest i SQL editor: similarity 1.0 |
| #5 MDN-urval | Yasmin | **proven** | PR #14 (`907d0b9`), 528 sidor, reproducerbart script |
| #6 embedding-spike | Yasmin | planned | avblockerad när service role-nyckeln är delad |
| #7 API-kontrakt | Fastuo | **proven** | PR #16 (`f9cff5c`), verifierat mot SDK:ns readUIMessageStream; Ernests efterhands-OK väntas i PR:en |
| #8 mock-route | Fastuo | planned | avblockerad (paket + kontrakt på main) |
| #9 chat-spike | Fastuo | planned | avblockerad |
| #10 UI-skiss | Ernest | **proven** | PR #13 (`3ed9658`), skiss + kanonisk copy; dela i gruppkanalen kvarstår |
| #11 chatkomponent | Ernest | planned | avblockerad (väntar #8 för riktig mock, kan börja mot kontraktet) |
| #12 nivåväljare | Ernest | planned | OBS: skicka "beginner", inte "nybörjare" (kontraktet §3) |

## Kända blockeringar

- ~~#1 blockerar all kod~~ **Löst 31/8** — repot är öppet för kloning.
- `main`-skyddet är tekniskt tvingande: medlemmars push avvisas med
  "Changes must be made through a pull request" — detta är förväntat, inte
  ett fel. Endast Henrik (admin) kan pusha direkt.
- ~~Projektbrädan väntar på gh-scope~~ **Löst 31/8** — brädan finns (publik) med alla 12 issues.
- Live-URL: https://chas-u15.vercel.app (auto-deploy från `main`).
- **#6 blockeras av nyckel:** RLS är på utan policies → `SUPABASE_SERVICE_ROLE_KEY`
  måste delas (Yasmin → privata kanalen) och läggas i Vercel (Henrik).
  `.env.example` har raden sedan `cfd5da7`.

## Beslut noterade från #1 (kandidater till PLAN.md §3 vid wave-slut)

- Ingen `src/`-katalog — filägarskapen i prompterna (`app/**`, `components/**`,
  `lib/ai/**`) gäller från repo-roten.
- `.gitattributes` med `* text=auto eol=lf` — förhindrar CRLF-brus i PR:er.

## Nästa reconciliation

Mån 1/9 kväll: avstämning, lifecycle-promotering, ev. knutar.
