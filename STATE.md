# STATE — HEAD

> Index över git + issues, aldrig egen sanning. Om detta motsäger git: git vinner.
> Arkiv: `docs/state-archive/` (wave 0 roterad dit ons 3/9).

**Senast uppdaterad:** 2026-09-03 fm (wave 1 öppnad med sveprincipen)
**Aktuell wave:** 1 (ons 3/9–tors 4/9) · **Mål:** hela kedjan live på
https://chas-u15.vercel.app torsdag kväll
**Proven-debt:** 0

**Versioner** (låsta): Next 16.3.3 · React 19.2.8 · ai 7.0.88 ·
@ai-sdk/react 4.0.91 · @openrouter/ai-sdk-provider 3.0.0 · pnpm 10.12.2 ·
ingen `src/`-katalog.

**Sveprincipen gäller** (PLAN.md §4): vertikala spår, inga väntetider mellan
personer inom waven, reviews blockerar aldrig (pinga + fortsätt, orchestrator
är fallback-reviewer, halvdags-SLA).

## Lifecycle per packet (wave 1)

| Issue | Ägare | Lifecycle | Not |
|---|---|---|---|
| #6 embedding-spike (c/o) | Yasmin | **proven** | PR #27 (`57e2f6e`), match_documents rankar rätt, similarity 0.4220 |
| #17 ingestion 528 | Yasmin | **proven** | PR #30 (`09358bd`), körlogg 528 sidor, ~1200+ chunks |
| #18 retrieval-sanity | Yasmin | **proven** | PR #31, baseline 6/10 + gap-analys |
| #9 chat-spike (c/o) | Fastuo | **proven** | PR #25 (`5a8c4d9`), streaming verifierad, "förklara-inte-lösa" demonstrerad |
| #19 riktig RAG-route | Fastuo | **proven** | PR #34 + live-verifierad (smoke-runs/wave-1.md) |
| #20 system-prompts | Fastuo | planned | efter #19 |
| #11 chatkomponent (c/o) | Ernest | **proven** | PR #28 (`e1d208b`) |
| #12 nivåväljare (c/o) | Ernest | **proven** | PR #28, 400-fällan verifierad |
| #21 UI mot riktig route | Ernest | **proven** | noll-ändringskoll live OK — kontraktet höll |
| #22 tomt läge + chips | Ernest | **proven** | PR #28, kanonisk copy |
| #23 smoke-test + live | Henrik | **proven** | smoke-runs/wave-1.md GODKÄND — env-buggen fångad och löst |
| #24 README-reflektion v1 | Henrik | **proven** | PR #26 mergad (`f51b14e`), faktakontrollerad mot källdokumenten |

## Kända blockeringar

- Inga. ~~Service role-nyckeln~~ **Löst ons 3/9**: nyckeln ligger i Vercel
  (Production + Preview) och alla fyra startprompts är utskickade —
  wave-open-grinden är passerad, alla spår rullar.

## Wave 2-kandidater (upptäckta under wave 1)

- Kontraktsförtydligande §6: 405 kommer från Next utan JSON-kropp
  (routen exporterar bara POST) — statuskod är krav, felkroppen önskvärd.
- Mock-detektorn i smoke-test §0 kan tas bort när mocken pensioneras.
- #33: gruppbeslut om Ernests extra profil/trådar/hälsning (funktioner utanför issues).
- Ernests scope-lärdom: en PR per issue, PR-body med bevis, inga funktioner utanför issuen (design är fri).

## Wave-gräns-integration (orchestratorns lista, tors kväll)

- Fastuos riktiga route ersätter mocken → Ernests #21 verifierar noll-ändring.
- Yasmins fulla data möter Fastuos route i produktion → Henriks #23 smoke-testar.
- Wave-handoffs (inkl. AI-reflektion för wave 0+1) → README-underlag (#24).

## Nästa reconciliation

Tors 4/9 kväll: wave-slut, smoke-test, wave 2 planeras (fre + mån).

## Kända egenheter (inte blockerande)

- `npx tsc --noEmit` på main klagar på `LayoutProps` tills en build körts
  (Next 16 genererar typerna) — kör `pnpm build` först. Vercel-byggen påverkas ej.
- Node varnar `MODULE_TYPELESS_PACKAGE_JSON` vid spike-scripten; `"type": "module"`
  i package.json vore fixen men rörs inte utan Henrik (kan påverka bygget).
