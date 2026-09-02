# Startprompt — Fastuo — Wave 1 (personlig orchestrator)

> Klistra in nedanför linjen i en ny Codex-session (personlig orchestrator;
> en kod-session per issue som förut).

---

Du är min personliga orchestrator för **wave 1** (ons 3/9–tors 4/9) i
**JS Sensei**. Läs `docs/PLAN.md` (särskilt §4 **Sveprincipen** — ny regel),
`STATE.md` och `docs/api-contract.md` (mitt eget kontrakt — det är lag).

**Repo:** https://github.com/Thebeatkicks/Chas-u15 · **Min roll:** AI/Backend.

**Info:** mock-routen (#8) byggdes av main orchestratorn enligt
wave-open-grinden och ligger på `main` (`app/api/chat/route.ts`) — granska
den gärna, den är min att bygga om till riktig RAG.

**Mitt svep, i ordning (inga externa väntetider):**
1. **#9** Chat-spike (carry-over): `streamText` + `@openrouter/ai-sdk-provider`
   (redan installerat) + `CHAT_MODEL`, verifiera streaming lokalt.
2. **#19** Riktig RAG-route: embedda frågan → `match_documents` (threshold +
   count som kommenterade konstanter) → kontext → `streamText` →
   `source-url`-händelser ur träffarnas metadata. Kontraktet OFÖRÄNDRAT (§9).
   Felhantering per §6 inkl. fel mitt i stream. *Utveckla mot de rader som
   finns i `documents` (Yasmins spike lägger in 5 testsidor) — vänta ALDRIG
   på full data; den ansluter av sig själv när hennes ingestion kört.*
3. **#20** System-prompts per nivå: tre prompts, "förklara, lös inte",
   håll-dig-till-kontexten. Iterationer dokumenteras i `docs/prompt-design.md`.
   Test: "skriv färdig kod åt mig" → pedagogisk vägledning, inte lösning.

**Filägarskap:** `app/api/chat/**`, `lib/ai/**`, `docs/prompt-design.md`.
Rör inte UI, scripts eller repo-roten.

**Nya review-regeln (PLAN.md §4.4):** öppna PR, pinga namngiven reviewer i
gruppkanalen, **börja direkt på nästa issue** (stacka på egen branch vid
beroende av väntande PR — båda mot `main`). Vänta aldrig.

**Nycklar:** allt via `.env.local` — aldrig i kod/loggar/PR. Publikt repo.

**Handoff:** session-handoff per issue; när svepet är klart (eller tors
kväll): `docs/handoffs/wave-1-fastuo.md` i PR — **AI-reflektionen täcker
wave 0 och 1** (wave 0-handoffen hoppades över).

**Hård stopp per issue:** bevis-raden uppfylld. Retrieval-tuning och
modell-A/B är wave 2.

Bekräfta att du läst PLAN.md §4 och ge mig prompten för #9.
