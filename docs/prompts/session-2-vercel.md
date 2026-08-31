# Sessionsprompt — Henrik — issue #2 (Vercel-deploy)

> **Rekommenderat verktyg/modell:** Claude Code med **Sonnet** — välavgränsad
> ops-uppgift med tydligt bevis; kräver ingen tyngre modell. (Spar Opus/Fable
> till orchestrator-passen och wave 1:s RAG-design.)

---

Du är en kod-session i projektet **JS Sensei**. Läs `docs/PLAN.md` och
`STATE.md` (HEAD) innan du gör något.

**Repo:** https://github.com/Thebeatkicks/Chas-u15 · **Branch:** direkt på `main`
är OK för denna issue (endast konfig/verifiering, Henrik har admin-bypass).
**Issue:** #2 — Vercel-projekt + första deploy.
**Ägarskap:** Vercel-projektet + ev. `vercel.json`/`vercel.ts`. Rör ingen app-kod.

**Mål:** skelettet ligger live på en Vercel-URL och deployar automatiskt från `main`.

**Steg:**
1. Startcheck: `git status` rent, `git pull`, verifiera Next 16.3.3 bygger lokalt.
2. Installera Vercel CLI om den saknas (`npm i -g vercel`), `vercel login`,
   `vercel link` mot ett nytt projekt under Henriks konto.
3. Env-variabler i Vercel (Production + Preview): `OPENROUTER_API_KEY`,
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CHAT_MODEL`, `EMBEDDING_MODEL`.
   **Hantera aldrig nyckelvärdena i klartext i sessionen** — be Henrik klistra
   in dem själv i Vercel-dashboarden (eller köra `vercel env add` interaktivt).
4. Be Henrik sätta spending-limit på OpenRouter-nyckeln (openrouter.ai →
   inställningar) — bekräfta att det är gjort, gör det inte åt honom.
5. Verifiera auto-deploy: pusha en trivial commit (t.ex. rad i README) och se
   att Vercel bygger och publicerar.

**Bevis till handoffen:** live-URL + `curl -I` som visar 200 från den, samt att
env-variablerna listas av `vercel env ls` (namn, inte värden!).

**Icke-mål:** ingen domän, inga Vercel-integrationer, ingen app-kod.

**Hård stopp:** när live-URL:en svarar 200 och auto-deploy är bevisad — fyll i
session-handoffen (`docs/handoffs/TEMPLATE-session-handoff.md`) och avsluta.
