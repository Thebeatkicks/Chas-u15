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
- [ ] Känt UI-beteende att komma ihåg: Enter skickar inte ännu (Ernest, #42) —
      använd skicka-knappen; hälsningsmodalen från #33 möter varje ny
      besökare — öppna appen i inkognitofönster *innan* ni går upp, inte på
      scenen

## 1. Intro — produktidé (0:00–0:30, Henrik)

> "JS Sensei är en lärarassistent för JavaScript som **förklarar, inte
> löser**. Man väljer nivå — nybörjare, student eller utvecklare — ställer en
> fråga, och får ett svar grundat i MDN:s dokumentation med klickbara källor.
> Den skriver aldrig färdig kod åt dig — det är hela poängen, och ni kommer
> se varför om en liten stund."

## 2. Arkitektur (0:30–2:00, Henrik)

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
dokumentation i stället för modellens egna, ibland felaktiga, minne. Fyra
AI-verktyg användes för att bygga det (Claude Code ×2, Codex, Cursor) i en
orchestrator-modell — kommer tillbaka till det i svårigheterna.

## 3. RAG-kedjan (2:00–4:00, Yasmin)

- 528 kuraterade MDN-sidor ([docs/mdn-selection.md](mdn-selection.md)) →
  **1 738 chunks** embeddade och lagrade i Supabase/pgvector.
- Frågan embeddas med samma modell, `match_documents()` hittar de mest lika
  chunkarna via cosine-likhet.
- Retrieval-baseline just nu: **6/10** rätt sida i topp-3
  ([docs/retrieval-sanity.md](retrieval-sanity.md)) — nämn öppet att det är
  uppmätt, inte påstått, och att de fyra missarna är namngivna och redan
  wave 2:s jobb (#37). En dokumenterad brist väger tyngre än ett odokumenterat
  påstått 100 %.

## 4. Nivåanpassning och "förklara inte lös" (4:00–5:30, Fastuo)

- En egen system-prompt per nivå, inte bara "svara enklare" — nybörjare får
  en liknelse och 150 ord, utvecklare får mekanism och fallgropar på 150–200
  ord ([docs/prompt-design.md](prompt-design.md)).
- Vägransregeln är hårdkodad i prompten: assistenten namnger metoderna och
  förklarar dem var för sig i stället för att skriva lösningen, även när
  användaren uttryckligen ber om bara kod.

## 5. Live-demo (5:30–8:30, Ernest kör, alla kommenterar)

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

## 6. Vad var svårt? (8:30–9:30, alla — en mening var)

Fyra konkreta punkter, en person per punkt (ordning valfri på scenen):

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
- **Prompt-varians:** `developer`-nivåns inledning är inte deterministisk —
  samma prompt kan fortfarande öppna med en definition ibland. En regel om
  *form* (inte innehåll) hjälpte men löste det inte helt — kvar som
  wave 2-jobb (#39).

## 7. Avslut (9:30–10:00, Henrik)

Licens/attribution (MDN, CC-BY-SA), sammanfatta i en mening: "en assistent
som lär ut i stället för att lösa, grundad i riktig dokumentation, byggd med
fyra AI-verktyg parallellt." Öppna för frågor.

## Reservfrågor (om tiden blir över eller läraren frågar)

- **Varför inte bara en sökmotor?** Se README:ns
  ["Varför behövdes AI-komponenten?"](../README.md#varför-behövdes-ai-komponenten-kunde-vi-löst-det-på-annat-sätt).
- **Vad hände med rösten?** Text-chat är MVP (PLAN.md §3 beslut 7); TTS ligger
  som stretch-issue #46, görs bara om huvudspåret är klart.
- **Modell-A/B?** #40, wave 2 — läggs till i README och här när den landar.

## Ändringslogg

- **v1** (wave 2, denna PR): första versionen. Ej repeterad live än.
