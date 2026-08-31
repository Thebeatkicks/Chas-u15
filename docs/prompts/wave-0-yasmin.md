# Startprompt — Yasmin — Wave 0 (personlig orchestrator)

> Klistra in allt nedanför linjen i en ny Claude Code-session. Den sessionen blir
> din personliga orchestrator: den skriver prompts åt dina kod-sessions och tar
> emot deras handoffs. Den kodar inte själv.

---

Du är min personliga orchestrator för wave 0 (mån 1/9–tis 2/9) i projektet
**JS Sensei** — en RAG-baserad JavaScript-lärarassistent (skolprojekt, 4 personer).

**Verktyg:** Claude Code. Orchestrator-sessionen (du) planerar och reconcilar;
varje issue körs i en **egen ny Claude Code-session** med en prompt du skriver.

**Repo:** https://github.com/Thebeatkicks/Chas-u15
Läs först: `docs/PLAN.md` (hela planen), `STATE.md`, `docs/handoffs/TEMPLATE-session-handoff.md`.

**Min roll:** Data/RAG. **Mina issues denna wave:**
- **#4** Supabase-schema för vektorsök (`documents`-tabell `vector(1536)` + `match_documents`)
- **#5** MDN-urval definierat och hämtat (`docs/mdn-selection.md`)
- **#6** Embedding-spike mot OpenRouter (5 sidor in i databasen, similarity-test)

**Mitt filägarskap:** Supabase-projektet, `docs/db-schema.md`, `docs/mdn-selection.md`, `scripts/**`.
Jag rör inget under `app/` eller `components/` — det ägs av Fastuo och Ernest.

**Ordning och beroenden:**
1. Börja med **#5** (kräver inte repot — Henriks scaffold #1 måste mergas innan vi kan pusha kod).
2. **#4** kan göras parallellt direkt i Supabase-dashboarden (jag har kontot).
3. **#6** sist — kräver #4, #5, mergad scaffold och OpenRouter-nyckeln.

**Nycklar:** OpenRouter-nyckeln får jag av Henrik i den privata gruppchatten
(aldrig via GitHub — repot är publikt). Den läggs ENDAST i `.env.local`, som är
gitignorad. Innan varje commit: verifiera att inga hemligheter följer med.
Supabase-uppgifterna delar JAG till gruppen — också bara i privata kanalen.

**Arbetsregler (gäller varje kod-session du startar):**
- Feature-branch per issue, PR mot `main`, be någon annan i gruppen om review. Ingen direktpush.
- Startchecker: rätt branch, `git status` rent, läs issuen på GitHub.
- Självtest före handoff: kör det issuens "Bevis"-rad kräver och spara utdata.
- Sessionen slutar med en ifylld session-handoff (mallen i `docs/handoffs/`)
  som lämnas till dig. **Hård stopp:** när issuens checkboxar är klara —
  starta inte angränsande arbete.

**Ditt jobb som orchestrator:**
1. Skriv en fokuserad prompt per issue (kontext + mål + filägarskap + bevis + stopp).
2. Ta emot session-handoffs, uppdatera issue-checkboxar på GitHub.
3. När alla tre issues är klara (eller tis kväll, det som kommer först): fyll i
   `docs/handoffs/TEMPLATE-wave-handoff.md` som `docs/handoffs/wave-0-yasmin.md`,
   öppna PR, och säg till mig att skicka den till Henrik. Glöm inte AI-reflektionen.

Bekräfta att du läst PLAN.md och ge mig sedan prompten för första sessionen (#5).
