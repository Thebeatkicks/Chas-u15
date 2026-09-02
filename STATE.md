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
| #6 embedding-spike (c/o) | Yasmin | planned | **GRIND: service role-nyckel — Henrik jagar** |
| #17 ingestion 528 | Yasmin | planned | efter #6 |
| #18 retrieval-sanity | Yasmin | planned | efter #17 |
| #9 chat-spike (c/o) | Fastuo | planned | oblockerad |
| #19 riktig RAG-route | Fastuo | planned | efter #9; utvecklas mot #6:s testrader |
| #20 system-prompts | Fastuo | planned | efter #19 |
| #11 chatkomponent (c/o) | Ernest | planned | oblockerad — mocken på main (`fc490e5`) |
| #12 nivåväljare (c/o) | Ernest | planned | efter #11; skicka "beginner", inte "nybörjare" |
| #21 UI mot riktig route | Ernest | planned | efter #12; ska kräva NOLL kodändring |
| #22 tomt läge + chips | Ernest | planned | efter #21 |
| #23 smoke-test + live | Henrik | **del A proven** | `9803bf6`: checklista + mock-detektor på main, §4-felfall körda mot live; del B (körningen) tors kväll → `docs/smoke-runs/wave-1.md` |
| #24 README-reflektion v1 | Henrik | **proven** | PR #26 mergad (`f51b14e`), faktakontrollerad mot källdokumenten |

## Kända blockeringar

- Inga. ~~Service role-nyckeln~~ **Löst ons 3/9**: nyckeln ligger i Vercel
  (Production + Preview) och alla fyra startprompts är utskickade —
  wave-open-grinden är passerad, alla spår rullar.

## Wave 2-kandidater (upptäckta under wave 1)

- Kontraktsförtydligande §6: 405 kommer från Next utan JSON-kropp
  (routen exporterar bara POST) — statuskod är krav, felkroppen önskvärd.
- Mock-detektorn i smoke-test §0 kan tas bort när mocken pensioneras.

## Wave-gräns-integration (orchestratorns lista, tors kväll)

- Fastuos riktiga route ersätter mocken → Ernests #21 verifierar noll-ändring.
- Yasmins fulla data möter Fastuos route i produktion → Henriks #23 smoke-testar.
- Wave-handoffs (inkl. AI-reflektion för wave 0+1) → README-underlag (#24).

## Nästa reconciliation

Tors 4/9 kväll: wave-slut, smoke-test, wave 2 planeras (fre + mån).
