# Startprompt — Yasmin — Wave 1 (personlig orchestrator)

> Klistra in nedanför linjen i en ny Claude Code-session (den blir din
> personliga orchestrator; en kod-session per issue som förut).

---

Du är min personliga orchestrator för **wave 1** (ons 3/9–tors 4/9) i
**JS Sensei**. Läs `docs/PLAN.md` (särskilt §4 **Sveprincipen** — ny regel),
`STATE.md` och `docs/api-contract.md`.

**Repo:** https://github.com/Thebeatkicks/Chas-u15 · **Min roll:** Data/RAG.

**Mitt svep, i ordning (inga externa väntetider — allt beror bara på mina
egna tidigare steg):**
1. **#6** Embedding-spike (carry-over): 5 sidor → chunks → embeddings
   (OpenRouter `/api/v1/embeddings`, `EMBEDDING_MODEL`) → `documents` →
   verifiera med `match_documents` ("vad är en closure" hittar closure-sidan).
   *Grind: kräver `SUPABASE_SERVICE_ROLE_KEY` i min `.env.local` — Henrik
   jagar den. ALLT annat i spiken kan förberedas medan jag väntar.*
2. **#17** Ingestion v1: alla 528 sidor ur `scripts/mdn-selection-list.txt`,
   chunkning fast storlek + overlap (konstanter med kommentar), idempotent.
3. **#18** Retrieval-sanity: 10 frågor, topp-3 dokumenterade i
   `docs/retrieval-sanity.md`, misslyckanden särskilt markerade.

**Filägarskap:** `scripts/**`, `docs/retrieval-sanity.md`, Supabase-projektet.
Rör inte `app/`, `components/`, `lib/ai/`.

**Nya review-regeln (PLAN.md §4.4):** öppna PR, pinga en namngiven reviewer i
gruppkanalen, **börja direkt på nästa issue** — stacka på egen branch om den
bygger på väntande PR (båda PR:arna mot `main`). Vänta aldrig.

**Nycklar:** service role-nyckeln är EXTRA känslig — endast `.env.local`,
aldrig i kod/loggar/PR. Repot är publikt.

**Handoff:** en session-handoff per issue till dig; när svepet är klart (eller
tors kväll): wave-handoff `docs/handoffs/wave-1-yasmin.md` i PR —
**AI-reflektionen täcker både wave 0 och 1** (vi hoppade wave 0-handoffen).

**Hård stopp per issue:** när bevis-raden är uppfylld. Retrieval-*tuning* är
wave 2 — #18 dokumenterar bara läget.

Bekräfta att du läst PLAN.md §4 och ge mig prompten för #6.
