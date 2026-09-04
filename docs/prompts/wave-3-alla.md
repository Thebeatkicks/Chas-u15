# Startprompts — Wave 3 (polish, dokumentation, demo)

> **Wave 3-regel nr 1: ingen ny funktionskod.** Buggfix, kommentarer,
> dokumentation och repetition. En bugg som inte syns i demon går till
> backloggen, inte till en fix. Undantag: villkorad stretch #46 (TTS).
>
> Gemensamt: läs `STATE.md`. PR → pinga reviewer → fortsätt. Handoff per
> issue; wave-handoff `docs/handoffs/wave-3-<namn>.md` när ditt spår är klart.

---

## Yasmin (Claude Code)

Wave 3 i JS Sensei. Mitt spår:
1. **#59** — kodkommentar-granskning av `scripts/**` (ingest.ts,
   embed-spike.ts, generate-mdn-selection.sh). Detta är ett **betygskrav**:
   appen ska vara välkommenterad och koden ska hålla för en kodgranskning.
   Kommentera *varför* och *constraints*, inte vad raden gör. Rensa
   AI-genererad platsfyllnad.
2. **#63** — delta i demo-repetitionen (du presenterar RAG-kedjan).

Ingen ny funktionalitet. Bekräfta att du läst STATE.md och ge mig prompten
för #59.

---

## Fastuo (Codex)

Wave 3 i JS Sensei. Mitt spår:
1. **#62** — min wave-2-handoff saknas (`docs/handoffs/wave-2-fastuo.md`).
   AI-reflektionen är det viktiga: v4-lärdomen att förbudslistor gjorde felen
   *vanligare*, att mäta över upprepade körningar istället för en, och
   regex-falsklarmet i A/B-testet. Den går rakt in i README:ns reflektion.
2. **#59** — kodkommentar-granskning av `lib/ai/**` och
   `app/api/chat/route.ts` (betygskrav, se ovan).
3. **#63** — demo-repetition (du presenterar AI-tekniken/prompterna).

Ingen ny funktionalitet. Bekräfta att du läst STATE.md och ge mig prompten
för #62.

---

## Ernest (Cursor)

Wave 3 i JS Sensei. Mitt spår:
1. **#59** — kodkommentar-granskning av `components/**` och `app/**`.
   **Extra viktigt för dig:** Cursor-genererad kod är snabbt skriven och
   tunnast kommenterad, och den kommer granskas i kodgranskningen. Förklara
   de icke-uppenbara besluten (streaming-parsningen som stänger öppna
   kodfences, localStorage-hanteringen). Betygskrav.
2. **#63** — demo-repetition (du kör tangentbordet under live-demon).
3. **#46** (villkorad stretch): TTS-uppläsning — ENDAST om ovanstående är
   klart. En trasig TTS-knapp under demon kostar mer än den ger.

Ingen ny funktionalitet i övrigt. Bekräfta att du läst STATE.md och ge mig
prompten för #59.

---

## Henrik (Claude Code, Sonnet)

Kod-session i JS Sensei. Mitt spår:
1. **#60** — kör hela `docs/smoke-test.md` mot https://chas-u15.vercel.app
   (3 frågor × 3 nivåer + vägran + felfall + UI) → `docs/smoke-runs/wave-3.md`.
   **Testa Enter-tangenten manuellt** — automationen fick inget svar, Ernests
   manuella test säger OK; avgör det med ett mänskligt finger. Klicka också en
   källchip och verifiera att MDN-sidan öppnas.
2. **#59** — kommentarsgranskning av repo-roten/konfig (litet).
3. **#61** — README v3 + `docs/inlamning.md` (Canvas-checklista). Vänta med
   reflektionsdelen tills Fastuos #62 landat.

Hård stopp: när #60:s körning är dokumenterad och #61:s PR är öppnad.
