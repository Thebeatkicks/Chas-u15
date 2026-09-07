# STATE — HEAD

> Index över git + issues, aldrig egen sanning. Git vinner vid konflikt.
> Arkiv: `docs/state-archive/` (wave 0–2 roterade dit).

**Senast uppdaterad:** 2026-09-05 kväll (#59/#60 klara, #61 PR öppen)
**Aktuell wave:** 3 — **polish, dokumentation och demo. INGEN ny funktionskod**
(undantag: villkorad stretch #46). Live: https://chas-u15.vercel.app
**Redovisning:** tors 11/9 · **Slutinlämning:** mån 14/9 23:59
**Proven-debt:** 0

## Wave 2: KLAR — 10/11 proven

- **Retrieval 6/10 → 10/10** (hybrid-chunkning #37 + query-normalisering #52),
  live-bekräftat: let+const, Array.prototype.map() först.
- **Prompts v5**: 0/20 definitionsinledningar, 0/20 över ordtak (vägran 7/20 =
  känd rest). Regressionsharness: `lib/ai/prompt-regression.mjs`.
- **Modell**: gpt-4o-mini behålls, `docs/model-ab.md`.
- **UI**: markdown + kodblock/copy, gäst-banner, trådlista, knappstädning.
- **Integrationsfix**: `COPY.inputPlaceholder` tappades vid squash-merge av
  stackade PR:er → typecheck bruten ~10 min (`7f8bb4a`). Lärdom: stackade
  PR:er ska byggas mot main efter varje merge, inte bara mot sin egen bas.
- Rester: Fastuos wave-2-handoff (→ #62), stretch #46 (→ wave 3).

## Lifecycle per packet (wave 3)

| Issue | Ägare | Lifecycle | Not |
|---|---|---|---|
| #59 kodkommentarer | ALLA | Henrik proven (PR #65), övriga planned | **betygskrav** — en PR per person |
| #60 smoke 3×3 | Henrik | **proven** | `docs/smoke-runs/wave-3.md`, godkänd med anmärkning → #64 |
| #61 README v3 + inlämning | Henrik | **proven** | PR #66 mergad + docs/inlamning.md |
| #62 wave-2-handoff | Fastuo | **proven** | PR #67 — alla fyra wave 2-handoffs nu inne |
| #63 demo-repetition ×2 | ALLA | planned | tidtagning, inkognito, live |
| #64 React-krasch vid streaming | orchestrator | **proven** | PR #69 (`9617cde`): renderloop, ej race. Verifierad lokalt (7 trådar) + prod (3 trådar), ren konsol |
| #68 sanity-doc 6/10→10/10 | Yasmin | planned | dokumentationsinkonsekvens, läsarfälla vid kodgranskning |
| #46 TTS | stretch | planned | ENDAST om eget spår klart |

## Kända rester

- **Enter-tangenten**: avgjord i #60 — Henrik testade manuellt 2026-09-05,
  fungerar. Automationens tidigare "inget svar" var ett verktygsartefakt.
- Vägran räknar upp metoder i användningsordning 7/20 (v5) — accepterad och
  dokumenterad i `docs/prompt-design.md`.
- ~~**Ny (#60):** rått `Minified React error #185`~~ **LÖST 7/9 (PR #69)** — var en
  klient-side `ERR_ABORTED` mitt i streaming (~3/17 svar i smoke-körningen).
  Server är opåverkad (alla `/api/chat`-svar 200). → #64.

## Wave 3-regler

1. **Ingen ny funktionskod.** Buggfix, kommentarer, dokumentation, repetition.
2. En upptäckt bugg som inte syns i demon → backlogg, inte fix.
3. Manuset ändras bara efter en genomkörning, aldrig på magkänsla.

## Backlogg (efter kursen)

Supabase-auth + serverlagrade trådar · fullt pratläge (mic/STT) · nivåstyrd
retrieval · vägrans-formuleringen (7/20)

## Nästa reconciliation

Löpande vid handoffs; slutcheck ons 10/9 kväll (allt grönt inför demon).

## Backlogg tillagd 7/9

- `react-hooks/set-state-in-effect` flaggas på fyra ställen i `chat.tsx` och
  `profile-store.tsx` — samma mönsterfamilj som orsakade #64. Linten är röd
  redan före fixen; att bygga om effektkedjan är refaktorering och hör inte
  hemma i wave 3. Egen issue efter kursen.
