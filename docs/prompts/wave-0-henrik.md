# Startprompt — Henrik — Wave 0 (kod-sessions under main orchestrator)

> Henrik är main orchestrator (den här Claude Code-sessionen/dess efterföljare).
> Nedan är prompten för Henriks FÖRSTA KOD-SESSION (#1). Main orchestrator
> skriver #2 och #3 när #1 är bevisad.

---

Du är en kod-session i projektet **JS Sensei** (RAG-baserad
JavaScript-lärarassistent, skolprojekt). Läs `docs/PLAN.md` och `STATE.md` innan
du gör något.

**Verktyg:** Claude Code · **Repo:** https://github.com/Thebeatkicks/Chas-u15
**Issue:** #1 — Init repo, Next.js-scaffold, .gitignore + .env.example
**Ägarskap:** hela repo-roten (enda skrivande sessionen tills detta är mergat).

**Mål:** `main` innehåller en körbar Next.js-grund som resten av gruppen kan
klona och bygga vidare på.

**Steg:**
1. Startcheck: `git status` i `C:\Users\henri\Desktop\chas-u15` — repot är redan
   initierat med docs/ committade (main orchestrator gjorde det 31/8). Verifiera
   remote mot `Thebeatkicks/Chas-u15` och att du är på `main`.
2. Scaffolda Next.js (App Router, TypeScript, Tailwind, pnpm) i en TOM tempmapp
   (`create-next-app` vägrar icke-tomma mappar) och flytta in filerna. Behåll
   befintlig `README.md`, `docs/`, `STATE.md`, `state.json`, `.gitignore`.
3. Säkerställ att `.gitignore` täcker `.env*` (utom `.env.example`) — repot är
   PUBLIKT. Committa aldrig en hemlighet; `.env.local` skapas lokalt från
   `.env.example`.
4. Verifiera: `pnpm install && pnpm dev` visar startsidan.
5. Bevis: klona repot till en ren tempmapp, kör `pnpm install && pnpm dev`,
   spara terminalutdraget.

**Direktpush till `main` är OK för exakt denna issue** (Henrik är orchestrator
och inget annat kan konflikta ännu). Alla senare issues går via PR + review.

**Icke-mål:** ingen chat-UI, inga API-routes, ingen Supabase-koppling — det ägs
av andra issues. Lägg inte till fler beroenden än scaffolden ger.

**Hård stopp:** när det rena klonet kör `pnpm dev` felfritt — fyll i
session-handoffen (`docs/handoffs/TEMPLATE-session-handoff.md`) och avsluta.
Meddela i gruppkanalen att repot är öppet för kloning.

---

## Main orchestrators egna wave 0-uppgifter (utanför kod-sessions)

- [ ] Skicka startprompterna (`docs/prompts/wave-0-*.md`) till Yasmin, Fastuo, Ernest
- [ ] Dela OpenRouter-nyckeln i privata gruppchatten (ALDRIG GitHub) + sätta
      spending-limit; be Yasmin dela Supabase-uppgifterna samma väg
- [ ] Lägga till Yasmin, Fastuo, Ernest som collaborators (issue #3)
- [ ] Efter #1: dispatcha #2 (Vercel) och #3 (wave 1-issues + bräda)
- [ ] Avstämning mån kväll: reconciliera handoffs, uppdatera STATE.md/state.json,
      lös knutar
- [ ] Tis kväll: samla wave-handoffs, merga, checkpoint-frågorna i
      orchestrator-skillen, öppna wave 1
