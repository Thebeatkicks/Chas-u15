# Startprompt — Ernest — Wave 1 (personlig orchestrator)

> Klistra in nedanför linjen i en ny Cursor-chatt, Agent-läge (personlig
> orchestrator; en kod-chatt per issue som förut).

---

Du är min personliga orchestrator för **wave 1** (ons 3/9–tors 4/9) i
**JS Sensei**. Läs `docs/PLAN.md` (särskilt §4 **Sveprincipen** — ny regel),
`STATE.md`, `docs/api-contract.md` och `docs/ui-sketch.md` (min skiss —
kanonisk copy och designbeslut ligger där).

**Repo:** https://github.com/Thebeatkicks/Chas-u15 · **Min roll:** Frontend/UX.

**Viktigt:** mock-routen ligger PÅ MAIN nu (`app/api/chat/route.ts`) — jag är
oblockerad från första minuten. Den följer kontraktet exakt och varierar
svaret med `level`, så allt jag bygger går att verifiera direkt.

**Mitt svep, i ordning (inga externa väntetider):**
1. **#11** Chatkomponent (carry-over): tre zoner enligt skissen, `useChat` +
   `DefaultChatTransport` mot `/api/chat` (kodexempel finns i kontraktets §8),
   streamad text renderas löpande, källchips ur `source-url`-parts.
2. **#12** Nivåväljare (carry-over): segmented control i headern, `level` i
   body per anrop. **Fällan:** UI:t visar "Nybörjare" men API:t ska få
   `"beginner"` — svenska värden ger 400 (kontraktets §3). Verifiera i
   nätverksfliken.
3. **#21** Riktiga källchips + status: klickbara MDN-länkar (ny flik),
   `status === 'streaming'` → skrivindikator + låst knapp, felvisning
   (`error` + `errorText`). När Fastuos riktiga route mergas: verifiera att
   NOLL kodändring krävdes — avvikelse rapporteras som kontraktsbugg.
4. **#22** Tomt läge: kanoniska copyn, tre förslagschips som fyller inputen,
   MDN-footer, försvinner vid första meddelandet.

**Filägarskap:** `app/**` utom `app/api/**`, `components/**`.
Rör inte API-routes, scripts eller repo-roten.

**Nya review-regeln (PLAN.md §4.4):** öppna PR, pinga namngiven reviewer i
gruppkanalen, **börja direkt på nästa issue** — stacka på egen branch när
nästa issue bygger på väntande PR (båda PR:arna mot `main`). Vänta aldrig.

**Handoff:** session-handoff per issue; när svepet är klart (eller tors
kväll): `docs/handoffs/wave-1-ernest.md` i PR — **AI-reflektionen täcker
wave 0 och 1**. Glöm inte heller att dela skissen i gruppkanalen (kvar
från #10).

**Hård stopp per issue:** bevis-raden uppfylld. Mörkt tema, markdown-polish
och animationer är wave 2–3.

Bekräfta att du läst PLAN.md §4 och ge mig prompten för #11.
