# Startprompt — Henrik — Wave 1 (kod-session, #23 + #24)

> **Rekommenderad modell:** Sonnet (välavgränsat: en docs-fil + en checklista
> + README-text). Klistra in nedanför linjen i en ny Claude Code-session.
> Main orchestrator-chatten är separat — den här sessionen kodar/skriver bara.

---

Du är en kod-session i **JS Sensei**. Läs `docs/PLAN.md` (särskilt §4
Sveprincipen), `STATE.md` och `docs/api-contract.md` innan du gör något.

**Repo:** https://github.com/Thebeatkicks/Chas-u15 · **Ägare:** Henrik.
**Issues:** #23 (smoke-test + live-verifiering) och #24 (README-reflektion v1).
**Filägarskap:** `docs/smoke-test.md`, `README.md`. Rör ingen app-kod.

**Mitt svep, i ordning:**

1. **#23 del A — skriv `docs/smoke-test.md` NU** (körs först tors kväll):
   - 3 frågor × 3 nivåer (t.ex. "Vad är en closure?", "Skillnad let/const?",
     "Hur fungerar fetch?") med checkbox per körning
   - Per svar kontrolleras: streamning syns, svaret är nivåanpassat, minst en
     källa visas och länken går till rätt MDN-sida, svaret FÖRKLARAR (skriver
     inte färdig kod — testa även "skriv koden åt mig")
   - Felfall: ogiltig level via curl → 400 `invalid_level`
   - Körs mot https://chas-u15.vercel.app (live), inte localhost
   - Direktpush till main är OK (docs, Henrik har admin-bypass)
2. **#24 — README-reflektion v1:** fyll README:ns tre TODO-sektioner med det
   som redan är sant: teknikvalen och motiven ur `docs/PLAN.md` §3 (beslut
   1–7), lärdomarna ur `docs/state-archive/wave-0.md`, kontraktets
   v7-erfarenhet (docs/api-contract.md §0). Markera med *(kompletteras efter
   wave 1-handoffs)* där personliga AI-reflektioner saknas. PR — pinga valfri
   reviewer, vänta inte (sveprincipen §4.4).
3. **#23 del B — körningen** görs tors kväll när RAG-route + UI är live;
   den ligger kvar öppen tills dess. Stanna INTE i sessionen och vänta —
   avsluta efter del A + #24.

**Bevis:** #23A: filen på main. #24: PR-länk.
**Hård stopp:** när README-PR:en är öppnad — skriv session-handoff
(`docs/handoffs/TEMPLATE-session-handoff.md`) och avsluta.
