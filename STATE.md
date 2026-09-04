# STATE — HEAD

> Index över git + issues, aldrig egen sanning. Git vinner vid konflikt.
> Arkiv: `docs/state-archive/` (wave 0 + wave 1 roterade dit).

**Senast uppdaterad:** 2026-09-04 (wave 2 öppnad efter gruppmötet)
**Aktuell wave:** 2 (fre 5/9 + mån 8/9, helg frivillig) · **Mål:** högre
svarskvalitet + demoredo app. Live: https://chas-u15.vercel.app
**Wave 1: KOMPLETT, 12/12 proven** (arkiv: `docs/state-archive/wave-1-state.json`).
**Proven-debt:** 0

**Sveprincipen gäller** (PLAN.md §4). Versioner: Next 16.3.3 · React 19.2.8 ·
ai 7.0.88 · @ai-sdk/react 4.0.91 · pnpm 10.12.2 · ingen `src/`.

## Gruppbeslut fre 4/9

- **#33 avgjort:** profil + trådar BEHÅLLS (localStorage), knappar bantas,
  gäst-banner med ärlig text. **INGEN Supabase-auth före redovisningen** —
  auth + serverlagrade trådar → backlogg efter kursen.
- Fullt pratläge (mic in) → backlogg; TTS-uppläsning = stretch-issue #46.

## Lifecycle per packet (wave 2)

| Issue | Ägare | Lifecycle | Not |
|---|---|---|---|
| #37 retrieval-gap | Yasmin | **proven (6/10, delvis)** | PR #51: hybrid-chunkning, 3547 chunks, rotorsaksanalys; uppföljning #52 |
| #38 regression | Yasmin | planned | efter #37 + F-spårets merges |
| #39 prompts v5 | Fastuo | **proven** | PR #49: regressionsharness, 0/20 huvudmått; vägran 7/20 känd rest |
| #40 modell-A/B | Fastuo | **proven** | PR #50: behåll gpt-4o-mini; README ifylld |
| #41 markdown + kodblock | Ernest | planned | nya paket VIA HENRIK |
| #42 knappar + gäst-banner | Ernest | planned | #33-beslutet + Enter-fix |
| #43 trådlista localStorage | Ernest | planned | INTE Supabase |
| #44 README v2 | Henrik | **proven** | PR #47 + A/B-fyllning (`9f467be`) |
| #45 demo-manus v1 | Henrik | **proven** | PR #48; rollfördelning väntar gruppens OK |
| #46 TTS-uppläsning | stretch | planned | Fastuo/Yasmin klara — fri att ta |
| #52 query-normalisering | Fastuo | planned | FRIVILLIG, ur #51:s analys |

## Kända blockeringar

- Inga vid wave-öppning. #41:s paketinstallation är enda person-beroendet
  (Ernest → Henrik, en pnpm add — hanteras som ping, inte väntan).

## Backlogg (efter kursen)

- Supabase-auth + serverlagrade trådar/profil
- Fullt pratläge (mic-input, STT)
- Nivåstyrd retrieval

## Nästa reconciliation

Mån 8/9 kväll: wave 2-slut, full 3×3-regression, wave 3 (tis–ons: ENBART
polish/demo-repetition, ingen ny funktionskod). Redovisning tors 11/9.
