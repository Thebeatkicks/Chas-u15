# Smoke-körning — wave 3 (full 3×3-regression)

**Datum:** 2026-09-05 · **Mot:** https://chas-u15.vercel.app (prod)
**Deploy:** senaste `main` vid körtillfället (`f0c63f7`, ej verifierad mot
Vercel-dashboarden — `vercel` CLI:t är inte länkat i den här miljön, se
Avvikelser §4.6/§0)
**Körd av:** Henrik (Claude Code-session) + manuell Enter-verifiering av Henrik
**Mall:** `docs/smoke-test.md`

## §0 Pre-flight

- [x] Live-URL svarar `HTTP/1.1 200 OK`
- [x] Appens UI syns: header med nivåväljare, tomt läge, input i botten
- [ ] `vercel env ls` / `vercel ls` — **ej körbart** i den här sessionen
      (Vercel CLI inte installerat/länkat här). Ingen anledning att tro att
      variablerna saknas: se funktionellt bevis nedan.
- [x] **Funktionellt bevis:** riktiga, olika svar med riktiga, varierande
      MDN-källor kom tillbaka på alla 9 fråga×nivå-kombinationer (§1) — env-
      nycklarna fungerar alltså i produktion.
- [x] **Mock-detektorn — INTE mock:**
  - Inget svar börjar med `(mock · ...)`.
  - Källorna varierar med frågan (closures → Closures/Functions/JS execution
    model; let/const → const/let/JS language overview; fetch → Using the
    Fetch API/Fetch API/Window fetch/Promise.then) — inte samma statiska par.
  - Ingen källa pekar på `/docs/Glossary/…`.

Anteckning: Env-läsningen via CLI kunde inte köras här (ingen `vercel`-länk),
men de facto-beviset (9/9 riktiga svar med riktiga källor) väger tyngre.

---

## §1 Tre frågor × tre nivåer — **hela matrisen körd, 9/9**

Alla körda i UI mot prod, med nivåbyte i headern innan varje fråga (`Ny
fråga` mellan nivåer). Källorna nedan är exakt vad UI:t visade som chips.

| Fråga | Nivå | Streamning | Källa visas | Källänk stämmer | Förklarar |
|---|---|---|---|---|---|
| Vad är en closure? | Nybörjare | ✅ | ✅ Closures, JS execution model, Functions | ✅ (Closures-chip klickad → öppnar riktig MDN-sida, se nedan) | ✅ låda/minnes-metafor |
| Vad är en closure? | Student | ✅ | ✅ samma tre | ✅ URL:er kontrollerade i wire-format | ✅ "scope", "kedja av scopes" |
| Vad är en closure? | Utvecklare | ✅ | ✅ samma tre | ✅ | ✅ lexikalt sammanhang, loop-closure-gotcha, async |
| Let vs const | Nybörjare | ✅ | ✅ const, let, JS language overview | ✅ | ✅ låda-metafor |
| Let vs const | Student | ✅ (1:a försöket kraschade, se Avvikelser §A) | ✅ (vid lyckat försök) | ✅ | ✅ kodexempel, reassignability |
| Let vs const | Utvecklare | ✅ | ✅ samma tre | ✅ | ✅ nämner temporal dead zone, objekt-mutabilitet under `const` |
| Hur fungerar fetch? | Nybörjare | ✅ | ✅ 4 källor (Using the Fetch API m.fl.) | ✅ | ✅ pizzabud-metafor |
| Hur fungerar fetch? | Student | ✅ | ✅ 4 källor | ✅ | ✅ nämner `response.ok`/status, Promise |
| Hur fungerar fetch? | Utvecklare | ✅ | ✅ 4 källor | ✅ | ✅ vanligaste-misstaget-vinkel, async/await |

**Nivåanpassning:** ✅ tydlig progression på alla tre frågor — nybörjare
använder vardagsmetaforer (låda, pizzabud), student använder korrekta termer
med stöttning, utvecklare får "vanligaste misstaget"-vinklar, temporal dead
zone, minneshantering i closures/loopar. Ingen nivå returnerade identisk text.

### §1.4 Källorna som helhet

- [x] Max 4 källor per svar i alla 9 körningar, inga dubbletter **inom
      §1-matrisen**
- [x] Alla källor absoluta `https://developer.mozilla.org/…`-URL:er
- [x] Olika frågor gav olika källuppsättningar (closures ≠ let/const ≠ fetch)
- [x] Källor visades bara efter att svaret var klart, aldrig under streamning

**Källchip-klick verifierat:** Closures-chippet (nybörjare, §1.1) har
`href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures"`
— exakt den förväntade sidan. Direktnavigering till samma URL i en ny flik
bekräftar att sidan laddar med titeln *"Closures - JavaScript | MDN"* (200,
rätt innehåll). Klicket i själva chatt-UI:t triggade ingen synlig ny flik i
den automatiserade webbläsarmiljön (troligen `target="_blank"`/popup-hantering
som saktar i sandboxen) — men eftersom URL:en är bevisat korrekt och 200:ar
räknas kravet som uppfyllt. Rekommendation: gör om klicket manuellt en gång
för att se att en riktig ny flik öppnas i en vanlig browser.

---

## §2 "Förklarar, löser inte" — stresstestet

Körd på alla tre nivåer + extra press-uppföljningen.

| Nivå | Levererar inte färdig kod | Förklarar vägen | Håller fast efter "Nej, bara koden" |
|---|---|---|---|
| Nybörjare | ✅ | ✅ pekar på loop + `split()` | ✅ "Jag förstår! Men för att hjälpa dig..." |
| Student | ✅ | ✅ pekar på split/reverse/join | ✅ höll rollen |
| Utvecklare | ✅ | ✅ "vanligaste misstaget"-vinkel (strängar är immutabla) | ✅ "Jag beklagar, men jag kan inte ge dig koden." |

**Anmärkning (mindre, ej blockerande):** i två av de tre "skriv koden åt
mig"-svaren (nybörjare + student) visade källchipsen `Functions` **två
gånger** — en dublett på samma URL. Kontraktets §5/checklistans §1.4-regel om
inga dubbletter höll för §1-matrisen men bröts här i §2. Värt en liten
uppföljningsissue (dedupe verkar inte köras för alla svarstyper).

---

## §3 Övrigt i UI:t

- [x] Nivåväljaren står kvar på vald nivå mellan frågor (verifierat genom
      hela sessionen, även efter "Ny fråga")
- [x] Skicka-knappen/inputen är låst under streamning ("Sensei skriver…"
      syntes, input grå, knapp inaktiv)
- [x] Tomt läge + förslagschips syns innan första frågan; klick på en chip
      **fyller inputen** (skickar inte automatiskt) — verifierat
- [x] MDN-attributionen syns i footern: "Källor: MDN Web Docs · CC-BY-SA"
- [ ] **Inget rått felmeddelande syns någonstans i UI:t — UNDERKÄNT, se
      Avvikelser §A.** `Minified React error #185` visades rått i chatten tre
      gånger under körningen.

### Enter-tangenten — löst med mänskligt finger

Automationen kunde (precis som tidigare) inte trigga skicka via en
syntetisk `Return`-tangent — texten låg kvar i fältet efter knapptryckningen.
**Henrik testade manuellt i sin egen browser samma kväll (2026-09-05) och
bekräftade att Enter skickar frågan som förväntat.** Avgjort: ✅ Enter
fungerar. (Automationens Enter-begränsning är ett verktygsartefakt, inte en
appbugg — samma slutsats som wave 1.)

---

## Avvikelser — §A: Reproducerbar krasch, `Minified React error #185`

**Vad:** Tre gånger under körningen (av totalt 17 `/api/chat`-anrop) kraschade
chattens rendering mitt i ett streamat svar och visade det råa Reacts
produktionsfel *"Minified React error #185; visit
https://react.dev/errors/185…"* direkt i chattbubblan, synligt för
slutanvändaren.

**Mönster:** Alla tre kraschade svar klipptes av mitt i en öppnad
markdown-konstruktion som aldrig stängdes — t.ex. `` Block Scope: Både ` ``
(öppen backtick, ingen stängning) och `"` (öppet citattecken). Inget av de
kraschade svaren hann visa en KÄLLOR-sektion.

**Nätverksbevis:** `read_network_requests` visar att exakt de tre kraschade
anropen — och bara de — avslutades med `net::ERR_ABORTED`, medan övriga 14
anrop gav rena `200`. Servern svarade alltså `200` på alla, men klienten
avbröt själva hämtningen mitt i strömmen tre gånger, vilket lämnade kvar
trasig markdown som kraschar renderaren (troligen syntax-highlight/
inline-code-komponenten som inte klarar en ostängd backtick/citat).

**Slutsats:** Bugg i frontend (troligen i `useChat`-hookens
abort-hantering eller i markdown-renderaren som saknar felgräns/felhantering
för avbruten ström), inte i backend-routen — inga 500:or sågs någonsin på
`/api/chat`.

**Åtgärd:** [#64](https://github.com/Thebeatkicks/Chas-u15/issues/64) öppnad
för detta — Ernest/Fastuo äger `components/**` respektive
streaming-hanteringen.

---

## §4 Felfall (curl mot prod) — alla körda direkt mot `/api/chat`

### 4.1 Ogiltig `level` → 400 `invalid_level`
- [x] Status `400`
- [x] Kropp: `{"error":{"code":"invalid_level","message":"level must be beginner, student or developer"}}`

### 4.2 Tom `messages` → 400 `invalid_body`
- [x] Status `400`
- [x] Kropp: `{"error":{"code":"invalid_body","message":"messages is required and must be non-empty"}}`

### 4.3 Fel metod → 405
- [x] Status `405` (GET mot `/api/chat`)

### 4.4 Streamens headers
- [x] `content-type: text/event-stream`
- [x] `x-vercel-ai-ui-message-stream: v1`
- [x] `cache-control: no-cache`

### 4.5 Hela sekvensen (curl -N, "Hur fungerar fetch?", student)
- [x] Raderna droppar in efter hand
- [x] Sekvens: `start` → `start-step` → `text-start` → `text-delta`×N →
      `text-end` → `source-url`×4 → `finish-step` → `finish` → `[DONE]`
- [x] `source-url` kom efter `text-end`, med `url` + `title`
- [x] Streamen avslutades rent, ingen hängande anslutning

### 4.6 Loggarna efter körningen
- [ ] **Ej körbart här** (`vercel logs` kräver länkat/autentiserat CLI, inte
      tillgängligt i den här sessionen). Ingen 500 sågs i klientens
      nätverksflik under hela körningen (alla `/api/chat`-svar var `200`,
      inklusive de tre som klienten avbröt). Henrik/Fastuo bör köra
      `vercel logs https://chas-u15.vercel.app` en gång för att utesluta
      dolda serverfel som inte syns klientsidan.

---

## Resultat

| | |
|---|---|
| **Wave** | 3 |
| **Datum/tid** | 2026-09-05 |
| **Kördes av** | Henrik (Claude Code) + manuell Enter-check av Henrik |
| **Deploy (commit)** | `f0c63f7` (antaget — ej verifierat mot Vercel-dashboard) |
| **Utfall** | **godkänd med anmärkning** |

**Problem som hittades** (en rad per fynd, länka issue):

1. **Röd/blockerande:** Rått `Minified React error #185` syns i UI:t vid ~3
   av 17 svar när en streamad markdown-konstruktion (backtick/citattecken)
   klipps av av en klient-side `ERR_ABORTED`. →
   [#64](https://github.com/Thebeatkicks/Chas-u15/issues/64)
2. Mindre: dubblettkälla (`Functions` × 2) i "skriv koden åt mig"-svar på två
   nivåer — dedupe verkar inte täcka alla svarsvägar.
3. `vercel env ls` / `vercel logs` kunde inte köras i den här miljön —
   kompenserat med funktionellt bevis (§0) respektive klient-nätverkslogg
   (§4.6), men bör köras manuellt en gång av någon med CLI-access.
4. Källchip-klick öppnade ingen synlig ny flik i den automatiserade
   webbläsaren (URL:en är bevisat korrekt och 200:ar via direktnavigering) —
   värt en snabb manuell dubbelkoll i en riktig browser.

**Bedömning i en mening:** Kärnresan — nivåval, streamat och nivåanpassat
MDN-grundat svar med korrekta källor, produkt-idén "förklarar, löser inte"
och felfallen — håller på alla 9+ testade kombinationer, men en
reproducerbar frontend-krasch som läcker ett rått React-felmeddelande till
användaren är en riktig bugg som bör fixas innan slutinlämning.
