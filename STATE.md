# STATE — HEAD

> Index över git + issues, aldrig egen sanning. Git vinner vid konflikt.
> Arkiv: `docs/state-archive/` (wave 0 + wave 1 roterade dit).

**Senast uppdaterad:** 2026-09-04 kväll — **WAVE 2 I MÅL: 10/11 proven** (endast stretch #46 TTS otagen). Sanity-sviten 6/10 → **10/10**. Allt live-verifierat.
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
| #38 regression | Yasmin | **proven** | PR #53: prompt-lagret påverkar ej retrieval (identiska värden) |
| #39 prompts v5 | Fastuo | **proven** | PR #49: regressionsharness, 0/20 huvudmått; vägran 7/20 känd rest |
| #40 modell-A/B | Fastuo | **proven** | PR #50: behåll gpt-4o-mini; README ifylld |
| #41 markdown + kodblock | Ernest | **proven** | PR #56 + live: inline-kod renderas, paket godkända |
| #42 knappar + gäst-banner | Ernest | **proven** | PR #57 + live; Enter: verifiera manuellt före demo |
| #43 trådlista localStorage | Ernest | **proven** | PR #58 + live: tråd syns i menyn |
| #44 README v2 | Henrik | **proven** | PR #47 + A/B-fyllning (`9f467be`) |
| #45 demo-manus v1 | Henrik | **proven** | PR #48; rollfördelning väntar gruppens OK |
| #46 TTS-uppläsning | stretch | planned | Fastuo/Yasmin klara — fri att ta |
| #52 query-normalisering | Fastuo | **proven** | PR #54 + live: 6/10 → 10/10, let+const bekräftat i prod |

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

## Wave 2-resultat (kort)

- **Retrieval: 10/10** på sanity-sviten (var 6/10) — hybrid-chunkning (#37) +
  query-normalisering (#52). Live-bekräftat: let+const, Array.prototype.map().
- **Prompts v5:** 0/20 definitionsinledningar, 0/20 över ordtak. Vägran 7/20 =
  känd rest. Regressionsharness finns (`lib/ai/prompt-regression.mjs`).
- **Modell:** gpt-4o-mini behålls (A/B i `docs/model-ab.md`).
- **UI:** markdown + kodblock/copy, gäst-banner, trådlista, knappstädning.
- **Integrationsfix av orchestratorn:** `COPY.inputPlaceholder` tappades vid
  squash-merge av Ernests stackade PR:er → typecheck på main var trasig i
  ~10 min (`7f8bb4a`). Lärdom till wave 3: stackade PR:er ska byggas mot main
  efter varje merge, inte bara mot sin egen bas.

## Öppet inför wave 3 (tis 9/9–ons 10/9, ENBART polish/repetition)

- Enter-tangenten: mitt automatiserade test fick inget svar; Ernests manuella
  test säger OK. **Verifiera för hand före demon.**
- Stretch #46 (TTS) — fri att ta, men bara om allt annat är klart.
- README slutversion + demo-repetition mot live (rollfördelning bekräftad).
