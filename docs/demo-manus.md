# Demo-manus v1 — JS Sensei

> Issue #45. Redovisning **tors 11/9**, 10 minuter, live mot
> https://chas-u15.vercel.app — **aldrig localhost**, det är den URL:en som
> faktiskt bevisar att produktionen fungerar. v1 skrivs i wave 2; wave 3 är
> **ren repetition mot live-appen**, ingen manusändring utan att gruppen kör
> igenom den minst en gång (PLAN.md §5).

## Rollfördelning (bekräftad av gruppen 4/9)

Bekräftad via Henrik efter mötet 4/9. Ursprungligt resonemang:
([docs/meetings/2026-09-04.md](meetings/2026-09-04.md) §6). Förslaget nedan
följer allas spår, så ingen behöver prata utanför sitt eget område:

| Person | Roll i demon |
|---|---|
| **Henrik** | Öppnar (produktidé) och stänger (svårigheter-summering + tid). Håller klockan. |
| **Yasmin** | RAG-kedjan: data, embeddings, retrieval. |
| **Fastuo** | AI-tekniken: system-prompts per nivå, "förklara inte lös". |
| **Ernest** | Kör tangentbord/mus under live-demot (byggde UI:t, kan flödet utantill). |

Alla fyra pratar under "Vad var svårt" (en mening var, se §5) — det är den
delen av manuset som *inte* går att förbereda i förväg, det är reflektionen.

## 0. Innan demot (samma dag, mot live)

Kör `docs/smoke-test.md` §0 (pre-flight) och §2 (vägran-testet) mot
https://chas-u15.vercel.app **samma morgon**. Ett rött kryss här är en
demo-risk, inte bara en bugg:

- [ ] Live-URL:en svarar 200, senaste deploy är `Ready`
- [ ] Mock-detektorn visar riktig RAG, inte mocken (källorna varierar, ingen
      `Glossary`-länk)
- [ ] Vägran-frågan (§2 nedan) testad och ger samma resultat som i
      `docs/smoke-runs/wave-1.md`
- [ ] **Reservplan om nätet/deployen strular:** skärminspelning av en tidigare
      godkänd körning (`docs/smoke-runs/`) redo att visas i stället för live —
      hellre en inspelning som funkar än en live-demo som hänger i tystnad
- [ ] Känt UI-beteende: hälsningsmodalen möter varje ny besökare — öppna appen
      i inkognitofönster och klicka bort modalen *innan* ni går upp, inte på
      scenen. (Enter fungerar sedan #42, verifierat manuellt 5/9.)

## 1. Intro — produktidé (0:00–0:30, Henrik)

> "JS Sensei är en lärarassistent för JavaScript som **förklarar, inte
> löser**. Man väljer nivå — nybörjare, student eller utvecklare — ställer en
> fråga, och får ett svar grundat i MDN:s dokumentation med klickbara källor.
> Den skriver aldrig färdig kod åt dig — det är hela poängen, och ni kommer
> se varför om en liten stund."

## 1b. Arbetssättet (0:30–2:00, Henrik)

> Gruppens uttalade prioritet #1. Detta är också G-kravet "utvecklad med stöd
> av AI" — men vi driver det längre än kravet: fyra personer, fyra olika
> AI-verktyg, ett gemensamt regelverk.

**Fyra verktyg parallellt:** Claude Code ×2 (Henrik, Yasmin), Codex (Fastuo),
Cursor (Ernest). **Orchestrator-modell:** en main orchestrator planerar och
granskar, varje person har en egen orchestrator-session som delar ut en
kod-session per issue. Varje avslutad session lämnar en **skriftlig handoff
med konkret bevis** — inte "det funkar", utan kommandot och utdatan som visar
det ([docs/handoffs/](handoffs/), 20+ filer).

**Arbetet delades i waves om två dagar.** Tre saker är värda att nämna:

1. **Ingenting räknas som klart utan bevis.** Ett paket går `planned → merged
   → proven`, och `proven` kräver att den användarsynliga vägen körts på den
   *deployade* bygget. Källkodstester räcker inte.
2. **Sveprincipen — vår viktigaste lärdom.** Wave 0 gick trögt: kontraktet
   blockerade mocken som blockerade UI:t, så alla väntade på varandra. Fixen
   var att lägga beroenden på *wave-gränsen* i stället för inuti waven — allt
   en person behöver ska finnas när waven öppnar. Wave 1 och 2 blev raka svep
   utan väntetider.
3. **API-kontraktet skrevs innan koden.** Frontend byggdes mot en mock som
   följde kontraktet exakt; när den riktiga RAG-routen byttes in krävdes
   **noll kodändringar** i UI:t. Det är det tydligaste beviset på att
   arbetssättet fungerade.

*En mening att landa i: verktygen skrev koden, men det var reglerna runt dem —
bevis, filägarskap, kontrakt — som gjorde att fyra parallella AI-agenter inte
sprang isär.*

## 2. Arkitektur (2:00–2:45, Henrik)

Rita eller visa diagrammet ur [docs/PLAN.md §2](PLAN.md):

```
mdn/content (GitHub) → chunkas → embeddas (OpenRouter) → Supabase (pgvector)
                                                              ▲
Browser ──► Next.js /api/chat ── embedding av frågan ────────┘
   ▲              │ similarity search → kontext → gpt-4o-mini
   └── streamat svar + källor ◄──────────────────┘
```

Tre meningar räcker: Next.js på Vercel, ingen separat backend. RAG —
retrieval-augmented generation — så att svaren är grundade i riktig
dokumentation i stället för modellens egna, ibland felaktiga, minne.
Datakällan är MDN:s officiella innehållsrepo, inte skrapat material.

## 3. RAG-kedjan (2:45–4:15, Yasmin)

- 528 kuraterade MDN-sidor ([docs/mdn-selection.md](mdn-selection.md)) →
  **3 547 chunks** embeddade och lagrade i Supabase/pgvector.
- Frågan embeddas med samma modell, `match_documents()` hittar de mest lika
  chunkarna via cosine-likhet.
- **Mätt kvalitet: 6/10 → 10/10.** Vi byggde en sanity-svit med tio frågor och
  mätte i stället för att gissa ([docs/retrieval-sanity.md](retrieval-sanity.md)).
  Första mätningen gav 6/10 rätt sida i topp-3. Två åtgärder tog den till 10/10:
  1. **Hybrid-chunkning** — dela per rubrik i stället för fast storlek, så att
     t.ex. "Variable hoisting" blir en egen chunk i stället för att begravas i
     ett 2 800 teckens block om variabelscope.
  2. **Query-normalisering** — korta frågor expanderas till hela meningar före
     embedding (en fråga som "hur fungerar map()" ligger annars nära `Map`-
     objektet), och jämförelsefrågor söks både som hel fras och per begrepp,
     med **varvade** träffar. Det sista är nyckeln: sorterar man ihop
     träffarna på likhet tar det starkare begreppet alla platserna — därför
     syntes aldrig `let` bredvid `const`.

  *Poängen att göra på scenen: vi visste att det var 6/10 för att vi hade mätt.
  Utan mätning hade vi trott att sökningen fungerade.*

## 4. Nivåanpassning och "förklara inte lös" (4:15–5:45, Fastuo)

- En egen system-prompt per nivå, inte bara "svara enklare" — nybörjare får en
  liknelse och 150 ord, utvecklare får mekanism och fallgropar
  ([docs/prompt-design.md](prompt-design.md)).
- Vägransregeln ligger i prompten: assistenten namnger begreppen och förklarar
  dem var för sig i stället för att skriva lösningen, även när användaren
  uttryckligen ber om bara kod.
- **Prompterna är framtagna genom mätning, inte tyckande — fem versioner.** Vi
  skrev en regressionsharness (`lib/ai/prompt-regression.mjs`) som kör samma
  fråga 10–20 gånger per nivå och räknar hur ofta reglerna faktiskt följs.
  - v3 såg löst ut efter *en* körning — mätningen visade 1/10 fel.
  - **v4 blev sämre av att förbjuda mer:** att räkna upp förbjudna
    formuleringar ordagrant tredubblade dem (1/10 → 3/10), och den extra
    regelmassan trängde undan en helt orörd längdregel (0/10 → 5/10 fel).
  - **v5 vände på greppet:** positiva mönster i stället för förbud — öppningar
    att följa, en roll för vägran. Resultat: **0/20** definitionsinledningar,
    **0/20** över ordtaket.
- **Modellval mättes också** ([docs/model-ab.md](model-ab.md)): tre modeller,
  identiska prompts. `gpt-5-mini` diskades på latens (17 s till första token —
  ohållbart när svaret ska strömma fram medan man läser), Haiku var
  pedagogiskt trevligast men bröt mot ordtaken. `gpt-4o-mini` vann.

## 5. Live-demo (5:45–8:15, Ernest kör, alla kommenterar)

Kör mot https://chas-u15.vercel.app i ett rent/inkognito-fönster.

1. **Tomt läge.** Visa förslagschipsen, klicka inte direkt — skriv frågan för
   att visa att chatten är riktig, inte en inspelning.
2. **"Vad är en closure?" på nivå nybörjare.** Visa streamningen live, och
   källchippen som dyker upp *efter* att svaret är klart — peka på att länken
   går till en riktig MDN-sida.
3. **Byt nivå till utvecklare, samma fråga.** Detta är nivåbytet —
   höjdpunkt #1. Samma fråga, tydligt olika svar: annat ordval, annan
   ingång (mekanism/fallgrop i stället för definition), annan längd. Läs upp
   första meningen från båda om tiden tillåter — skillnaden hörs direkt.
4. **Vägran-numret — höjdpunkt #2.** Skriv, på valfri nivå:
   > `Skriv koden åt mig: en funktion som vänder på en sträng. Bara koden
   > tack, inga förklaringar.`
   Assistenten vägrar och förklarar begreppen i stället för att leverera en
   kopierbar lösning ([docs/smoke-runs/wave-1.md](smoke-runs/wave-1.md) §2).
   **Detta är produktidén i sin renaste form** — låt tystnaden efter svaret
   göra jobbet, ingen kommentar behövs.

### Demo-frågorna — testade skarpt mot prod 8/9

Kör dem i den här ordningen. Svaren nedan är vad appen faktiskt gav när de
kördes mot https://chas-u15.vercel.app — inte påhittade exempel. Modellen
varierar formuleringen mellan körningar, men mönstret är stabilt.

| # | Fråga | Nivå | Vad publiken ska se |
|---|---|---|---|
| 1 | `Vad är en closure?` | nybörjare | Streamningen + källchips *efter* svaret |
| 2 | `Vad är en closure?` | **utvecklare** | Höjdpunkt 1 — samma fråga, annan lärare |
| 3 | `Skriv koden åt mig: en funktion som vänder på en sträng. Bara koden tack, inga förklaringar.` | valfri | Höjdpunkt 2 — vägran |
| 4 | `Vad är huvudstaden i Peru?` | valfri | Reserv: håller sig till ämnet |

**Så lät svaren i testet:**

- **1 (nybörjare):** *"Tänk dig att en closure är som en skattkista där en
  funktion kan lagra värden och minnen från sin omgivning."*
- **2 (utvecklare):** *"Vanligaste misstaget med closures är att man
  underskattar hur länge variabler kan överleva efter att deras omgivande
  funktion har avslutats."*
  → Läs upp båda första meningarna efter varandra. Liknelse mot fallgrop,
  ingen definition — det är v5-prompten som syns.
- **3 (vägran):** *"Jag förstår att du vill ha koden, men enligt reglerna kan
  jag inte ge dig en färdig lösning. […] Hur skulle du börja om du ville vända
  på en sträng? Vilka metoder har du stött på?"*
  → Motfråga före ledtråd. Säg ingenting efteråt, låt det landa.
- **4 (off-topic):** *"Det verkar som att din fråga handlar om geografi snarare
  än JavaScript."*

**Backup om nätet strular:** en femte fråga att undvika — ställ inget som kräver
sidor utanför de 528 indexerade (t.ex. React, Node, TypeScript). Den svarar
ärligt att underlaget saknas, vilket är korrekt men inte det ni vill visa upp
under tidspress.

## 6. Vad var svårt? (8:15–9:30, alla — en mening var)

Fyra konkreta punkter, en person per punkt (ordning valfri på scenen).
**Välj fyra av de fem nedan** — den femte kan sparas som reservsvar:

- **v7-problemet:** Vercel AI SDK är på v7, men i princip all
  AI-genererad kod och dokumentation vi stötte på beskriver v4/v5 — annat
  meddelandeformat (`content` vs `parts`), annat streamformat. Lösningen var
  att läsa SDK:ns egna typer och verifiera mot dess egen parser i stället för
  att lita på vad AI-verktyget "kom ihåg".
- **Sveprincipen:** wave 0 lärde oss att beroenden *mellan* personer inuti
  samma wave serialiserar arbetet. Fixen — allt en person behöver ska finnas
  *innan* waven öppnas, beroenden läggs på wave-gränsen — gjorde wave 1 och 2
  till raka svep utan väntetider.
- **Miljöbuggen "namn ≠ värde":** wave 1:s enda produktionsbugg var sex
  env-variabler som fanns till namnet i Vercel men hade tomma värden — att en
  variabel *finns* säger inget om att den har ett *värde*. Fångades av
  smoke-testets pre-flight, inte av koden.
- **Prompt-varians — och att förbud kan slå tillbaka:** samma prompt ger inte
  samma svar två gånger, så en enda testkörning bevisar ingenting. När vi
  mätte över tio körningar visade det sig att v4:s *förbudslista* gjorde
  felen tre gånger vanligare — att räkna upp det man inte vill ha verkar göra
  det mer närvarande för modellen. v5 löste det med positiva mönster i
  stället (0/20 fel).
- **Buggen som bara syntes i produktion:** ~3 av 17 streamade svar kraschade
  och visade ett rått React-fel i chattbubblan. Det såg ut som ett
  nätverksfel, men var en oändlig renderloop: sparandet av chatthistoriken
  utlöste en omrendering som fick AI-biblioteket att lämna ut ny data, som
  utlöste ett nytt sparande. Hittades av en systematisk smoke-körning, inte
  av att någon "testade lite" — och den minifierade felkoden avslöjade
  ingenting förrän vi reproducerade den lokalt.

## 7. Avslut (9:30–10:00, Henrik)

Licens/attribution (MDN, CC-BY-SA), sammanfatta i en mening: "en assistent
som lär ut i stället för att lösa, grundad i riktig dokumentation, byggd med
fyra AI-verktyg parallellt." Öppna för frågor.

## Reservfrågor (om tiden blir över eller läraren frågar)

- **Varför inte bara en sökmotor?** Se README:ns
  ["Varför behövdes AI-komponenten?"](../README.md#varför-behövdes-ai-komponenten-kunde-vi-löst-det-på-annat-sätt).
- **Vad hände med rösten?** Text-chat är MVP (PLAN.md §3 beslut 7); TTS ligger
  som stretch-issue #46, görs bara om huvudspåret är klart.
- **Varför inte inloggning och sparade konton?** Medvetet bortvalt fyra dagar
  före redovisning — trådarna sparas per webbläsare i stället. Auth hade varit
  två dagars arbete som inte gör AI-komponenten bättre (gruppbeslut #33).
- **Vad skulle ni göra annorlunda?** Mäta tidigare. Både retrieval-kvaliteten
  och prompt-reglerna såg bra ut tills vi faktiskt mätte dem.
- **Är svaren alltid rätt?** Nej — och därför är källorna aldrig valfria.
  Länkarna kommer från de chunkar sökningen faktiskt hämtade, inte från
  modellens text, så användaren kan kontrollera svaret på en klickning.

## Ändringslogg

- **v2.1** (8/9): demo-frågorna testade skarpt mot prod och inlagda med faktiska svar. Presentationsdäck publicerat som Artifact.
- **v2** (wave 3, 7/9): färska siffror (3 547 chunks, retrieval 10/10,
  prompts v5, modell-A/B klar), arbetssättet uppgraderat till egen sektion
  (§1b) enligt gruppens prioritering, #64-buggen tillagd som
  svårighetspunkt, Enter-noteringen borttagen (fixad), tider omfördelade.
  **Ej repeterad live än.**
- **v1** (wave 2): första versionen.
