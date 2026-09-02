# Wave 1 — utkast till issues (UTKAST, publiceras tis kväll)

> Skrivet mån 1/9 av main orchestrator. **Detta är inte wave 1** — texterna
> justeras mot wave 0-handoffsen vid tisdagens reconciliation och publiceras
> då som GitHub-issues (stänger #3). Mål för waven (ons 3/9–tors 4/9):
> **en riktig fråga får ett MDN-grundat, nivåanpassat, streamat svar med
> riktiga källänkar — på live-URL:en.**

## Yasmin (data/RAG)

**W1-Y1: Ingestion v1 — alla 528 sidor in i Supabase**
Script som läser `scripts/mdn-selection-list.txt`, hämtar ur sparse-klonen,
chunkar (start: fast storlek + overlap enligt rekommendationen i
`docs/mdn-selection.md`), embeddar via OpenRouter och skriver till `documents`
med metadata `{source, url, title}`. Idempotent/omkörbart (rensa + fyll, eller
upsert). Bevis: radantal i tabellen + körlogg. *Justeras mot #6-spikens fynd.*

**W1-Y2: Retrieval-sanity — 10 testfrågor**
10 frågor (blandade nivåer: closure, let vs const, map(), async/await, fetch,
prototyper …) körs mot `match_documents` — dokumentera vilka sidor som rankas
topp-3 och om rätt sida finns där. Fil: `docs/retrieval-sanity.md`. Detta blir
baseline för wave 2:s tuning. Bevis: filen med resultaten.

## Fastuo (AI/backend)

**W1-F1: Riktig RAG-route bakom kontraktet**
`/api/chat`: embedda senaste frågan → `match_documents` (threshold + count som
konstanter) → kontext till `streamText` (`CHAT_MODEL`) → svar + `source-url`-
händelser ur träffarnas metadata. Kontraktet i `docs/api-contract.md` gäller
oförändrat — Ernests UI ska inte märka bytet. Felhantering enligt §6 inkl.
`model_error`. Bevis: curl-utdrag med riktiga MDN-källor.

**W1-F2: System-prompts per nivå**
Tre genomarbetade system-prompts (beginner/student/developer) med
"förklara, lös inte"-regeln. Iterationerna dokumenteras i
`docs/prompt-design.md` (vad testades, vad ändrades, varför) — VG-material.
Bevis: samma fråga på tre nivåer ger tydligt olika svar (utdrag i PR).

## Ernest (frontend/UX)

**W1-E1: UI mot riktiga routen**
Byt mock → riktig route (ska vara noll kodändring om kontraktet höll — notera
avvikelser!). Källchips renderar riktiga MDN-länkar, `status === 'streaming'`
driver skrivindikator + låst skicka-knapp. Bevis: screencast med streamat svar
+ klickbar källa.

**W1-E2: Tomt läge + förslagschips enligt skissen**
"Ställ din första fråga", brödtext och tre chips ur kanoniska copyn i
`docs/ui-sketch.md`; chips fyller inputen. Footer med MDN-attribution.
Bevis: skärmdump.

## Henrik (orchestrator/infra)

**W1-H1: Smoke-test + live-verifiering**
`docs/smoke-test.md`: 3 frågor × 3 nivåer + källkoll, körs mot
https://chas-u15.vercel.app efter att F1/E1 mergats. Detta är wavens
"proven"-grind. Bevis: ifylld checklista med datum.

**W1-H2: README-reflektion v1**
Första sammanställningen av de fyra AI-reflektionerna ur wave 0-handoffsen in
i README:ns TODO-sektioner. Bevis: PR.

## Medvetet INTE i wave 1

Retrieval-tuning, modell-A/B, mörkt tema, röst, nivåstyrd retrieval,
markdown-rendering av svar — wave 2–3. Wave 1 är: riktig data, riktig route,
riktigt UI, live.
