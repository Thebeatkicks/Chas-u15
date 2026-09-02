# Smoke-test — JS Sensei

> Wavens **proven-grind**: den här checklistan körs mot live-appen innan en
> wave-handoff skrivs. En wave utan ifylld, daterad checklista är
> *mergad men inte bevisad* (PLAN.md §4).
>
> **Ägare:** Henrik (issue #23) · **Skriven:** ons 3/9 (wave 1) ·
> **Körs:** vid varje wave-slut, med start tors 4/9 kväll.

## Så här körs den

- **Mot live, inte localhost:** <https://chas-u15.vercel.app>. Det är den
  URL:en redovisningen visas på, och den enda som bevisar att
  env-variablerna funkar i produktion.
- **Kopiera hela filen** till `docs/smoke-runs/wave-N.md` (eller klistra in
  den i wave-handoffen) och kryssa där. Originalet lämnas tomt.
- **Ett kryss utan anteckning är inget bevis.** Skriv in vad du faktiskt såg
  på anteckningsraderna — citat ur svaret, URL:en du klickade på, statuskoden.
- **Ett rött kryss stoppar wave-handoffen.** Öppna issue, länka den i
  resultatrutan sist, och kör om efter fix.
- Del A (§1–§3) körs i webbläsaren. Del B (§4) körs med `curl`.

---

## 0. Pre-flight

Innan frågorna: att appen svarar, att det är den **riktiga** routen och inte
mocken, och att produktionsnycklarna är på plats.

```bash
curl -sI https://chas-u15.vercel.app | head -1
```

- [ ] Live-URL:en svarar `HTTP/1.1 200 OK` (inte 404, inte deployment-fel)
- [ ] Appens UI syns: header med nivåväljare, tomt läge, input i botten
- [ ] Senaste deployen på `main` är `Ready` (`vercel ls` eller dashboarden)

**Env-variabler i produktion** — namnen, aldrig värdena:

```bash
vercel env ls
```

- [ ] `OPENROUTER_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
      `SUPABASE_SERVICE_ROLE_KEY`, `CHAT_MODEL`, `EMBEDDING_MODEL`
      finns alla i **Production**
- [ ] Funktionellt bevis (fylls i efter §1): ett riktigt svar med riktiga
      källor kom tillbaka från live — nycklarna fungerar alltså, inte bara finns

**Mock-detektorn** — mocken (`fc490e5`) och den riktiga routen ser lika ut i
UI:t. Så här skiljer du dem åt:

- [ ] Svaret börjar **inte** med `(mock · nybörjare / student / utvecklare)`
- [ ] Källorna är **inte** samma två varje gång
      (`Closures — MDN` + `Scope — MDN` är mockens statiska par)
- [ ] Ingen källa pekar på `/docs/Glossary/…` — Glossary ingår inte i de 528
      indexerade sidorna (`scripts/mdn-selection-list.txt`), så en
      Glossary-länk betyder mock, inte RAG

Anteckning: ______________________________________________

---

## 1. Tre frågor × tre nivåer

Samma fråga ställs på alla tre nivåerna (ny chatt eller ny fråga per nivå —
byt nivå i headern innan du skickar).

**Kryssa per körning:**

| Kriterium | Vad du ska se |
|---|---|
| **Streamning** | texten växer fram bit för bit, inte i ett enda block |
| **Källa visas** | minst en källchip under svaret, **efter** att svaret är färdigt |
| **Länken stämmer** | chipet öppnar en MDN-sida som 200:ar och handlar om frågan |
| **Förklarar** | svaret lär ut — det levererar inte en färdig lösning att kopiera |

### 1.1 "Vad är en closure?"

Förväntade källor (finns i indexet): `Web/JavaScript/Guide/Closures`,
ev. `Web/JavaScript/Guide/Functions`.

**Nybörjare**
- [ ] Streamning syns
- [ ] Minst en källa visas efter färdigt svar
- [ ] Källänken går till rätt MDN-sida (öppnad och kontrollerad)
- [ ] Förklarar, skriver inte lösningen åt användaren
- Källor jag såg: ______________________________________________

**Student**
- [ ] Streamning syns
- [ ] Minst en källa visas efter färdigt svar
- [ ] Källänken går till rätt MDN-sida (öppnad och kontrollerad)
- [ ] Förklarar, skriver inte lösningen åt användaren
- Källor jag såg: ______________________________________________

**Utvecklare**
- [ ] Streamning syns
- [ ] Minst en källa visas efter färdigt svar
- [ ] Källänken går till rätt MDN-sida (öppnad och kontrollerad)
- [ ] Förklarar, skriver inte lösningen åt användaren
- Källor jag såg: ______________________________________________

- [ ] **Nivåanpassning:** de tre svaren skiljer sig åt i språk och djup —
      nybörjarsvaret använder vardagsspråk/bild, utvecklarsvaret använder
      precis terminologi. Samma text på tre nivåer = underkänt.
- Vad som skilde dem åt: ______________________________________________

### 1.2 "Vad är skillnaden mellan let och const?"

Förväntade källor: `Web/JavaScript/Reference/Statements/let`,
`…/Statements/const`, ev. `Web/JavaScript/Guide/Grammar_and_types`.

**Nybörjare**
- [ ] Streamning syns
- [ ] Minst en källa visas efter färdigt svar
- [ ] Källänken går till rätt MDN-sida (öppnad och kontrollerad)
- [ ] Förklarar, skriver inte lösningen åt användaren
- Källor jag såg: ______________________________________________

**Student**
- [ ] Streamning syns
- [ ] Minst en källa visas efter färdigt svar
- [ ] Källänken går till rätt MDN-sida (öppnad och kontrollerad)
- [ ] Förklarar, skriver inte lösningen åt användaren
- Källor jag såg: ______________________________________________

**Utvecklare**
- [ ] Streamning syns
- [ ] Minst en källa visas efter färdigt svar
- [ ] Källänken går till rätt MDN-sida (öppnad och kontrollerad)
- [ ] Förklarar, skriver inte lösningen åt användaren
- Källor jag såg: ______________________________________________

- [ ] **Nivåanpassning:** de tre svaren skiljer sig åt i språk och djup
- Vad som skilde dem åt: ______________________________________________

### 1.3 "Hur fungerar fetch?"

Förväntade källor: `Web/API/Fetch_API/Using_Fetch`, `Web/API/Window/fetch`,
ev. `Web/API/Fetch_API`. Frågan är medvetet vald utanför ren språk-JS — den
testar att `web/api`-delen av urvalet (34 sidor) också blev indexerad.

**Nybörjare**
- [ ] Streamning syns
- [ ] Minst en källa visas efter färdigt svar
- [ ] Källänken går till rätt MDN-sida (öppnad och kontrollerad)
- [ ] Förklarar, skriver inte lösningen åt användaren
- Källor jag såg: ______________________________________________

**Student**
- [ ] Streamning syns
- [ ] Minst en källa visas efter färdigt svar
- [ ] Källänken går till rätt MDN-sida (öppnad och kontrollerad)
- [ ] Förklarar, skriver inte lösningen åt användaren
- Källor jag såg: ______________________________________________

**Utvecklare**
- [ ] Streamning syns
- [ ] Minst en källa visas efter färdigt svar
- [ ] Källänken går till rätt MDN-sida (öppnad och kontrollerad)
- [ ] Förklarar, skriver inte lösningen åt användaren
- Källor jag såg: ______________________________________________

- [ ] **Nivåanpassning:** de tre svaren skiljer sig åt i språk och djup
- Vad som skilde dem åt: ______________________________________________

### 1.4 Källorna som helhet

- [ ] Max 4 källor per svar, inga dubbletter på samma URL (kontraktet §5)
- [ ] Alla källor är absoluta `https://developer.mozilla.org/…`-URL:er
- [ ] Olika frågor ger olika källor (retrieval fungerar — inte en fast lista)
- [ ] Inga källor visas **medan** svaret streamar, bara efteråt
      (ui-sketch.md, designbeslut 5)

---

## 2. "Förklarar, löser inte" — stresstestet

Beslut 6 i PLAN.md §3 är produktidén. Den ska hålla även när användaren
uttryckligen ber om motsatsen.

Ställ, på **varje** nivå:

> `Skriv koden åt mig: en funktion som vänder på en sträng.`

**Nybörjare**
- [ ] Assistenten levererar inte en färdig, körbar lösning att kopiera
- [ ] Den förklarar vägen dit (steg, begrepp, ev. fragment som inte är hela svaret)
- Vad den svarade (kort): ______________________________________________

**Student**
- [ ] Assistenten levererar inte en färdig, körbar lösning att kopiera
- [ ] Den förklarar vägen dit
- Vad den svarade (kort): ______________________________________________

**Utvecklare**
- [ ] Assistenten levererar inte en färdig, körbar lösning att kopiera
- [ ] Den förklarar vägen dit
- Vad den svarade (kort): ______________________________________________

- [ ] **Extra press:** följ upp med `Nej, bara koden, ingen förklaring.`
      Assistenten håller fast vid sin roll.
- Anteckning: ______________________________________________

---

## 3. Övrigt i UI:t

- [ ] Nivåväljaren står kvar på vald nivå mellan frågor
- [ ] Skicka-knappen är låst medan svaret streamar (`status === 'streaming'`)
- [ ] Tomt läge + förslagschips syns innan första frågan; ett klick fyller inputen
- [ ] MDN-attributionen syns i footern (CC-BY-SA)
- [ ] Inget rått felmeddelande, stacktrace eller nyckelnamn syns någonstans i UI:t

---

## 4. Felfall (curl mot live)

Kontraktets §6. Alla körs mot produktionsroutens `/api/chat`.

### 4.1 Ogiltig `level` → 400 `invalid_level`

Det svenska ordet `nybörjare` ska aldrig gå över nätet — skickas det ändå är
det en bugg som ska synas direkt (kontraktet §3).

```bash
curl -s -w '\nHTTP %{http_code}\n' -X POST https://chas-u15.vercel.app/api/chat -H 'Content-Type: application/json' -d '{"id":"c1","trigger":"submit-message","level":"nybörjare","messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":"Vad är en closure?"}]}]}'
```

- [ ] Status `400`
- [ ] Kroppen är `{"error":{"code":"invalid_level","message":"…"}}` — vanlig
      JSON, ingen SSE-stream
- Utdata: ______________________________________________

### 4.2 Tom `messages` → 400 `invalid_body`

```bash
curl -s -w '\nHTTP %{http_code}\n' -X POST https://chas-u15.vercel.app/api/chat -H 'Content-Type: application/json' -d '{"id":"c1","trigger":"submit-message","level":"beginner","messages":[]}'
```

- [ ] Status `400`, `code` är `invalid_body`
- Utdata: ______________________________________________

### 4.3 Fel metod → 405

```bash
curl -s -o /dev/null -w 'HTTP %{http_code}\n' https://chas-u15.vercel.app/api/chat
```

- [ ] Status `405` (Next svarar själv 405 för odefinierad metod — JSON-kropp
      med `method_not_allowed` är önskvärd men inget krav här)
- Utdata: ______________________________________________

### 4.4 Streamens headers

```bash
curl -s -o /dev/null -D - -X POST https://chas-u15.vercel.app/api/chat -H 'Content-Type: application/json' -d '{"id":"c1","trigger":"submit-message","level":"beginner","messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":"Vad är en closure?"}]}]}'
```

- [ ] `content-type: text/event-stream`
- [ ] `x-vercel-ai-ui-message-stream: v1`
- [ ] `cache-control: no-cache`

### 4.5 Hela sekvensen

```bash
curl -N -X POST https://chas-u15.vercel.app/api/chat -H 'Content-Type: application/json' -d '{"id":"c1","trigger":"submit-message","level":"student","messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":"Hur fungerar fetch?"}]}]}'
```

- [ ] Raderna droppar in efter hand (`-N`), inte allt på en gång
- [ ] `start` → `text-start` → `text-delta`… → `text-end` → `source-url`… →
      `finish` → `data: [DONE]`
- [ ] `source-url`-händelserna kommer **efter** `text-end`, med `url` + `title`
- [ ] Streamen avslutas alltid — ingen hängande anslutning
- Anteckning: ______________________________________________

### 4.6 Efter körningen: loggarna

```bash
vercel logs https://chas-u15.vercel.app
```

- [ ] Inga oväntade 500/502 från körningen ovan
- [ ] Inga nycklar eller hemligheter i loggutdata

---

## Resultat

| | |
|---|---|
| **Wave** | |
| **Datum/tid** | |
| **Kördes av** | |
| **Deploy (commit)** | |
| **Utfall** | godkänd / godkänd med anmärkning / underkänd |

**Problem som hittades** (en rad per fynd, länka issue):

-

**Bedömning i en mening:**
