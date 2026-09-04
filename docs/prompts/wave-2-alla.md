# Startprompts — Wave 2 (fre 5/9 + mån 8/9)

> Kortformat denna gång — ni kan flödet. Var och en klistrar in sin sektion
> i en ny orchestrator-session i sitt verktyg. Gemensamt för alla:
> läs `STATE.md` (gruppbesluten!) + dina issues på GitHub. Sveprincipen
> gäller: PR → pinga reviewer → fortsätt direkt. Handoff per issue till din
> orchestrator; wave-handoff (`docs/handoffs/wave-2-<namn>.md`) när svepet är
> klart eller mån kväll. Hård stopp per issue vid bevis-raden.

---

## Yasmin (Claude Code)

Du är min personliga orchestrator för wave 2 i JS Sensei. Mitt svep:
**#37** (åtgärda de fyra retrieval-gapen ur `docs/retrieval-sanity.md`, mål
≥8/10, omindexering OK) → **#38** (regression när även Fastuos promptändringar
mergats). Jag äger `scripts/**` + sanity-rapporten. Bekräfta att du läst
STATE.md och ge mig prompten för #37.

---

## Fastuo (Codex)

Du är min personliga orchestrator för wave 2 i JS Sensei. Mitt svep:
**#39** (v4 av system-prompterna — åtgärda de svagheter jag själv listade i
`docs/prompt-design.md`, inkl. att developer-inledningen inte är
deterministisk) → **#40** (modell-A/B: gpt-4o-mini vs utmanare, 5 frågor,
rapport i `docs/model-ab.md`). Jag äger `lib/ai/**` + de två docs-filerna.
Bekräfta att du läst STATE.md och ge mig prompten för #39.

---

## Ernest (Cursor)

Du är min personliga orchestrator för wave 2 i JS Sensei. Mitt svep:
**#41** (markdown-rendering + kodblock med editor-känsla och copy-knapp —
nya npm-paket går via Henrik, pinga honom med exakt paketlista FÖRST så det
inte blir väntan) → **#42** (knappstädning + ärlig gäst-banner enligt
#33-beslutet i STATE.md + Enter-fix) → **#43** (trådlista i vänstermenyn,
localStorage — INTE Supabase, ingen inloggning). Jag äger `components/**` och
`app/**` utom `app/api/**`. VIKTIGT från förra waven: en PR per issue, bevis
i PR-bodyn, inga funktioner utanför issuen — design inom issuen är fri.
Bekräfta att du läst STATE.md och ge mig prompten för #41.

---

## Henrik (Claude Code, Sonnet)

Du är en kod-session i JS Sensei. Mitt svep: **#44** (README v2 — väv in alla
fyra AI-reflektionerna ur `docs/handoffs/wave-1-*.md` + env-lärdomen +
prompt-berättelsen; modell-A/B-resultatet läggs till när #40 landar) →
**#45** (demo-manus v1 i `docs/demo-manus.md` — 10 min, rollfördelning,
vägran-numret som demo-höjdpunkt). Äger README.md + docs/demo-manus.md.
Hård stopp: när båda PR:arna är öppnade — handoff och avsluta.
