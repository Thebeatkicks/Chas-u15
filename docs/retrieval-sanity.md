# Retrieval-sanity — baseline inför wave 2 (issue #18)

> Svarar på: hittar sökningen rätt sida, innan vi börjar tuna något?
> **Ingen tuning gjord här** — chunk-storlek, overlap och
> `similarity_threshold` är orörda. Det är wave 2:s jobb, se
> [`mdn-selection.md`](./mdn-selection.md) §"Chunkningsstrategi".

## Metod

- 10 frågor, blandade nivåer (nybörjare–utvecklare), utspridda över samma
  ämnen som `mdn-selection.md`s urvalskategorier.
- Varje fråga: embeddad med `openai/text-embedding-3-small` via OpenRouter
  (samma REST-mönster som `scripts/embed-spike.ts`, #6) → `match_documents()`
  RPC mot Supabase → topp-3 träffar, `similarity_threshold=0.0` (ingen
  gräns, för att se hela bilden av vad som faktiskt rankas högst).
- Körd mot `documents`-tabellen, verifierad till 1738 rader före testet
  (528 MDN-sidor, #17:s ingestion — se handoff nedan för exakt kommando).
- Bedömning "rätt sida" (ja/nej) är eget omdöme baserat på urvalet i
  `docs/mdn-selection.md` — inte en exakt titel-match, utan "skulle den här
  sidan faktiskt svara på frågan en elev ställde".
- Testscriptet (`scratchpad/retrieval-sanity.ts`, ej committat — se
  filägarskap i issuen) återanvänder `embed()`/`matchDocuments()`-mönstret
  från `scripts/embed-spike.ts` rakt av.

## Resultat

| # | Fråga | Topp-3 (titel — similarity) | Rätt sida bland träffarna? |
|---|---|---|---|
| 1 | vad är en closure | Functions — 0.4873 · **Closures — 0.4459** · Closures — 0.3980 | **Ja** (rank 2, dubblett på rank 3) |
| 2 | skillnaden mellan let och const | const — 0.2668 · const — 0.2637 · "Literal character: a, b" (regex) — 0.2258 | **Nej** — se misslyckade |
| 3 | hur fungerar map() | Map — 0.4668 · Map — 0.4425 · Map.groupBy() — 0.4380 | **Nej** — se misslyckade |
| 4 | vad är async/await | async function — 0.5788 · await — 0.5509 · await — 0.5497 | **Ja** |
| 5 | hur använder man fetch för att hämta data | Using the Fetch API — 0.5203 · Fetch API — 0.4329 · Window: fetch() method — 0.4310 | **Ja** |
| 6 | vad är en prototyp i JavaScript | Function: prototype — 0.5583 · Object.getOwnPropertyDescriptors() — 0.5391 · Function: prototype — 0.5369 | **Nej** — se misslyckade |
| 7 | vad är hoisting | async function — 0.2905 · function expression — 0.2322 · Functions — 0.2192 | **Nej** — se misslyckade |
| 8 | skillnad på == och === | Strict equality (===) — 0.4288 · Strict inequality (!==) — 0.4182 · Inequality (!=) — 0.4040 | **Ja** |
| 9 | hur fungerar this | Functions — 0.2899 · Functions — 0.2879 · this — 0.2846 | **Ja**, men svagt (rätt sida rankad sist av tre, låg similarity) |
| 10 | vad gör reduce() | Array.prototype.reduce() — 0.4764 (×3, alla tre träffar) | **Ja**, starkt |

**Träffsäkerhet: 6/10.**

## Misslyckade frågor — wave 2:s arbetslista

Dessa fyra är inte "sidan saknas i korpuset" — jag verifierade mot
`scripts/mdn-selection-list.txt` att den förväntade sidan **finns ingest:ad**
i alla fyra fall. Det här är renodlade retrieval-gap (embedding/ranking),
inte täckningsluckor.

- **#2 — "skillnaden mellan let och const"**: `let`-sidan
  (`reference/statements/let/index.md`) finns i korpuset men syns aldrig i
  topp-3 — bara `const` (dubblett) plus en helt orelaterad regex-sida
  ("Literal character: a, b") på rank 3. En jämförelsefråga hittar bara ena
  halvan av jämförelsen.

- **#3 — "hur fungerar map()"**: `Array.prototype.map()`
  (`global_objects/array/map/index.md`) finns i korpuset men slås ut helt av
  `Map`-objektet (den inbyggda datastrukturen). Namnkollisionen
  `map()`/`Map` verkar dominera embeddingen — parentesen i frågan räckte
  inte för att disambiguera mot arraymetoden, vilket sannolikt är den
  vanligare avsikten i en nybörjarkurs.

- **#6 — "vad är en prototyp i JavaScript"**: guide-sidan
  `Inheritance and the prototype chain`
  (`guide/inheritance_and_the_prototype_chain/index.md`) — den konceptuella
  förklaringen — finns i korpuset men dyker aldrig upp. Istället två träffar
  på den tekniska referenssidan `Function: prototype` och en helt orelaterad
  träff (`Object.getOwnPropertyDescriptors()`). Konceptuell "vad är X"-fråga
  hittar referens-detaljer istället för guiden.

- **#7 — "vad är hoisting"**: klart lägst similarity av alla tio frågor
  (0.22–0.29 mot 0.4–0.6+ för de flesta andra). Ingen av de tre träffarna
  nämner hoisting direkt — `grammar_and_types`-guiden, som normalt är MDN:s
  ställe för hoisting-förklaringen, finns i korpuset men syns inte i topp-3.
  Tyder på att "hoisting" som begrepp är svagt representerat i hur sidorna
  är skrivna/chunkade, snarare än att sidan saknas.

**Gemensamt mönster:** alla fyra missar är frågor där svaret kräver en
*konceptuell* eller *jämförande* sida (guide/förklaring), medan sökningen
konsekvent drar mot *referens*-sidor för enskilda API:er/nyckelord. De tre
starkaste träffarna (closure, fetch, reduce) är alla frågor där fråga och
sidtitel delar samma unika, otvetydiga nyckelord.

## Terminalutdrag (fullständigt, från körningen)

```
=== FRÅGA: "vad är en closure" ===
  #1 similarity=0.4873  "Functions"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
  #2 similarity=0.4459  "Closures"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  #3 similarity=0.3980  "Closures"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures

=== FRÅGA: "skillnaden mellan let och const" ===
  #1 similarity=0.2668  "const"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
  #2 similarity=0.2637  "const"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
  #3 similarity=0.2258  ""Literal character: a, b""  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Literal_character

=== FRÅGA: "hur fungerar map()" ===
  #1 similarity=0.4668  "Map"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  #2 similarity=0.4425  "Map"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  #3 similarity=0.4380  "Map.groupBy()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy

=== FRÅGA: "vad är async/await" ===
  #1 similarity=0.5788  "async function"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  #2 similarity=0.5509  "await"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  #3 similarity=0.5497  "await"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await

=== FRÅGA: "hur använder man fetch för att hämta data" ===
  #1 similarity=0.5203  "Using the Fetch API"  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  #2 similarity=0.4329  "Fetch API"  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
  #3 similarity=0.4310  ""Window: fetch() method""  https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch

=== FRÅGA: "vad är en prototyp i JavaScript" ===
  #1 similarity=0.5583  ""Function: prototype""  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype
  #2 similarity=0.5391  "Object.getOwnPropertyDescriptors()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors
  #3 similarity=0.5369  ""Function: prototype""  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype

=== FRÅGA: "vad är hoisting" ===
  #1 similarity=0.2905  "async function"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  #2 similarity=0.2322  "function expression"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function
  #3 similarity=0.2192  "Functions"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions

=== FRÅGA: "skillnad på == och ===" ===
  #1 similarity=0.4288  "Strict equality (===)"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality
  #2 similarity=0.4182  "Strict inequality (!==)"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_inequality
  #3 similarity=0.4040  "Inequality (!=)"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Inequality

=== FRÅGA: "hur fungerar this" ===
  #1 similarity=0.2899  "Functions"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
  #2 similarity=0.2879  "Functions"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
  #3 similarity=0.2846  "this"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this

=== FRÅGA: "vad gör reduce()" ===
  #1 similarity=0.4764  "Array.prototype.reduce()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  #2 similarity=0.4531  "Array.prototype.reduce()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  #3 similarity=0.4474  "Array.prototype.reduce()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
```

## Explicit icke-gjort (baseline)

Ingen tuning. `similarity_threshold`, chunk-storlek och overlap är
oförändrade — det här är bara mätningen wave 2 ska utgå från.

---

# Efter-mätning — issue #37 (2026-09-04)

> Svarar på: hjälpte tuningen? Samma metod som baseline (samma 10 frågor,
> topp-3, `similarity_threshold=0.0`, samma bedömningskriterium "skulle den
> här sidan faktiskt svara på frågan"). Kört mot en **fullständig
> ombindexering** av alla 528 sidor (inte en delmängd) — `documents`
> verifierad till **3547 rader** efter körningen (upp från baseline-mätningens
> 1738, se "Vad ändrades" nedan för varför).

## Vad ändrades i `scripts/ingest.ts`

1. **Sidtitel i embedding-texten.** Varje chunk embeddas som
   `${title}\n\n${chunkText}` istället för bara `chunkText`. `content`-fältet
   som lagras i databasen är **oförändrat** (utan titelprefix) — 
   `app/api/chat/route.ts` prependar redan `"## title"` runt `content` vid
   promptbygge, så att duplicera titeln i lagrad `content` hade varit
   redundant för den konsumenten (och den filen ägs inte av den här issuen).
2. **Chunkning: hybrid rubrik + max-storlek-tak**, istället för ren fast
   storlek. `##`-rubriker är primärregeln; en `##`-sektion som överskrider
   `CHUNK_SIZE` (2800 tecken, oförändrat) provas först med `###`-underrubriker
   inom sektionen, och faller sist tillbaka till fast delning+overlap. Se
   filhuvudet i `scripts/ingest.ts` för fullständig motivering.
3. **Boilerplate-filter.** Sektioner rubricerade "See also", "Specifications"
   eller "Browser compatibility" (near-identiska länklistor/tabeller på
   nästan varje referens-sida, ingen prosa) filtreras bort helt — mindre brus,
   lägre embedding-kostnad.

**Kostnadsavvägning, uttryckligen:** hybrid-chunkningen ger fler, mindre
chunks — 3547 mot baseline-mätningens 1738 (≈2,04×). Verifierat i en
scratchpad-simulering över alla 528 sidor **innan** den skarpa körningen
(se "Så testade jag" i sessionens handoff) att detta var det förväntade
utfallet, inte en bugg. Motiveringen: exakt den här typen av finkornig
rubrik-isolering var vad som faktiskt löste hoisting-gapet (se #7 nedan) —
en fast-storlek-chunk hade begravt "### Variable hoisting" i 2227 tecken
orelaterad text om variabelscope.

## Resultat — efter

| # | Fråga | Topp-3 EFTER (titel — similarity) | Rätt sida bland träffarna? | Jämfört med baseline |
|---|---|---|---|---|
| 1 | vad är en closure | Closures — 0.6207 · Closures — 0.4746 · Closures — 0.4642 | **Ja** | Oförändrat (starkare — alla tre nu closure-sidan, mot en Functions-distraktor på rank 1 tidigare) |
| 2 | skillnaden mellan let och const | const — 0.3074 · const — 0.2813 · **static** — 0.2758 | **Nej** | Oförändrat resultat. `let` nu rank 4 (0.2752) — **0,0006** bakom rank 3. Regex-distraktorn från baseline är borta, ersatt av en ny (Classes/`static`), lika irrelevant. |
| 3 | hur fungerar map() | Map — 0.5087 · Map() constructor — 0.4841 · Map — 0.4829 | **Nej** | Oförändrat resultat. `Array.prototype.map()` nu rank 4 (0.4740) — 0,009 bakom rank 3. En tidigare osedd `Map`-undersida (`Map() constructor`) tog den plats titelfixen skulle gett arraymetoden. |
| 4 | vad är async/await | await — 0.6089 · await — 0.5720 · async function — 0.5669 | **Ja** | Oförändrat |
| 5 | hur använder man fetch för att hämta data | Using the Fetch API — 0.5339 · Fetch API — 0.5016 · Using the Fetch API — 0.4726 | **Ja** | Oförändrat |
| 6 | vad är en prototyp i JavaScript | "Function: prototype" ×3 (0.5712/0.5592/0.5585) | **Nej** | Oförändrat resultat, men kvaliteten på rank 2/3 höjd (två `Function: prototype`-delsektioner istf en helt orelaterad `Object.getOwnPropertyDescriptors()`-träff i baseline). Guide-sidan (`Inheritance and the prototype chain`) nu rank 4 (0.5487) — 0,0098 bakom rank 3. Syntes inte alls i baseline. |
| 7 | vad är hoisting | function — 0.4254 · **Grammar and types — 0.3603** · import — 0.3576 | **Ja** | **FIXAD.** Var `Nej` i baseline (lägst similarity av alla tio, 0.22–0.29, ingen relevant sida i topp-3). Målsidan syns nu i topp-3 med väsentligt högre similarity. |
| 8 | skillnad på == och === | Expressions and operators — 0.4359 · Equality (==) — 0.4285 · Strict equality (===) — 0.4235 | **Ja** | Oförändrat resultat, bredare/mer relevant sidmix (täcker nu båda operatorerna som jämförs, inte bara varianter av `===`) |
| 9 | hur fungerar this | Functions — 0.2970 · **Function.prototype.apply() — 0.2948** · Functions — 0.2921 | **Nej** | **REGRESSION.** Var `Ja` (svagt, rank 3) i baseline. `this`-sidan syns inte längre i topp-3 — se rotorsak nedan. |
| 10 | vad gör reduce() | Array.prototype.reduce() ×3 (0.4981/0.4967/0.4847) | **Ja** | Oförändrat, starkt |

**Träffsäkerhet: 6/10 — målet ≥8/10 nåddes INTE.**

Samma råa antal som baseline, men sammansättningen är en annan: ett av de
fyra namngivna gapen (#7, hoisting) är löst. De tre andra (#2, #3, #6) är
**inte** lösta enligt det strikta topp-3-kriteriet, men har gått från tydliga
förluster (baseline: målsidan syns inte alls, eller trängs undan av en helt
orelaterad träff) till **jämna lopp** — målsidan ligger nu på rank 4, mindre
än 0,01 similarity bakom rank 3 i alla tre fallen (0,0006 / 0,009 / 0,0098).
Utöver de fyra namngivna gapen regredierade en femte, tidigare svagt godkänd
fråga (#9, "this") till underkänd.

## Terminalutdrag (fullständigt, från den skarpa körningen 2026-09-04)

```
=== FRÅGA: "vad är en closure" ===
  #1 similarity=0.6207  "Closures"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  #2 similarity=0.4746  "Closures"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  #3 similarity=0.4642  "Closures"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures

=== FRÅGA: "skillnaden mellan let och const" ===
  #1 similarity=0.3074  "const"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
  #2 similarity=0.2813  "const"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
  #3 similarity=0.2758  "static"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static

=== FRÅGA: "hur fungerar map()" ===
  #1 similarity=0.5087  "Map"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  #2 similarity=0.4841  "Map() constructor"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Map
  #3 similarity=0.4829  "Map"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

=== FRÅGA: "vad är async/await" ===
  #1 similarity=0.6089  "await"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  #2 similarity=0.5720  "await"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  #3 similarity=0.5669  "async function"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

=== FRÅGA: "hur använder man fetch för att hämta data" ===
  #1 similarity=0.5339  "Using the Fetch API"  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  #2 similarity=0.5016  "Fetch API"  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
  #3 similarity=0.4726  "Using the Fetch API"  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

=== FRÅGA: "vad är en prototyp i JavaScript" ===
  #1 similarity=0.5712  ""Function: prototype""  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype
  #2 similarity=0.5592  ""Function: prototype""  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype
  #3 similarity=0.5585  ""Function: prototype""  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype

=== FRÅGA: "vad är hoisting" ===
  #1 similarity=0.4254  "function"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function
  #2 similarity=0.3603  "Grammar and types"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types
  #3 similarity=0.3576  "import"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

=== FRÅGA: "skillnad på == och ===" ===
  #1 similarity=0.4359  "Expressions and operators"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators
  #2 similarity=0.4285  "Equality (==)"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality
  #3 similarity=0.4235  "Strict equality (===)"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality

=== FRÅGA: "hur fungerar this" ===
  #1 similarity=0.2970  "Functions"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
  #2 similarity=0.2948  "Function.prototype.apply()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
  #3 similarity=0.2921  "Functions"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions

=== FRÅGA: "vad gör reduce()" ===
  #1 similarity=0.4981  "Array.prototype.reduce()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  #2 similarity=0.4967  "Array.prototype.reduce()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  #3 similarity=0.4847  "Array.prototype.reduce()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
```

## Rotorsaksanalys — varför #2/#3/#6 inte flippade, och varför #9 regredierade

Ett **scratchpad-delmängdstest** (23 utvalda sidor, inte de fulla 528) kördes
innan den skarpa ombindexeringen, för att testa chunkning/titel-ändringar
billigt (se sessionens handoff). Där **löste** samma kod alla tre av
#2/#3/#7 (8/10 totalt i delmängden). Mot den fulla korpusen dök nya
distraktorer upp som inte fanns i delmängden och åt upp marginalen:

- **#2 (let/const):** delmängden innehöll bara `let`, `const` och en
  regex-sida som konkurrenter. Fulla korpusen introducerar `static`
  (`Classes/static`) — en helt orelaterad deklarations-sida vars
  boilerplate-friserade text råkar likna `let`/`const`-sidornas generiska
  "the `X` statement declares..."-fras tillräckligt för att tränga sig in på
  rank 3, 0,0006 före `let`.
- **#3 (map()):** delmängden innehöll bara `Array.prototype.map()`, `Map` och
  `Map.groupBy()`. Fulla korpusen har fler `Map`-undersidor (`Map()
  constructor`, `Map.prototype[Symbol.iterator]()`, m.fl.) som alla drar nytta
  av samma sidtitel-fix (`Map`/`Map()`) och förstärker `Map`-klustrets
  dominans ytterligare.
- **#6 (prototype):** guide-sidan klättrade från att inte synas alls i
  baseline till rank 4 (0,0098 bakom rank 3) — en reell förbättring, men
  `Function: prototype`-referenssidan har helt enkelt fler nästan identiskt
  rankade delsektioner (fem `Function: prototype`-chunks i topp-8) som fyller
  topp-3 innan guiden får plats.
- **#9 (this, regression):** finkornig rubrik-chunkning delade upp
  `this`-referenssidan i fler, mindre chunks. En ny distraktor
  (`Function.prototype.apply()`, som diskuterar `this`-bindning via `apply()`)
  fick plats i topp-3 istället. `this`-sidans egna chunks syns fortfarande i
  korpuset, bara inte längre i topp-3 för den här frågan.

**Gemensamt mönster:** när flera sidor är genuint nära besläktade i
MDN:s eget vokabulär (deklarationssatser, `Map`-familjen,
`prototype`-relaterade referenssidor, `this`-bindning i funktionsmetoder)
sitter de nära varandra i embeddingrymden oavsett lokala chunk-/titel-knep —
marginalerna som avgör topp-3 är brøkdelar av en similaritetspoäng, inte
något en chunkningsstrategi ensam kan garantera att vinna. Det här är i
linje med det ursprungliga gapet ("konceptuell/jämförande fråga tappar mot
referens-sida för enskilt API") men visar att åtgärden krymper problemet
utan att helt eliminera det för alla fyra gap.

## Rekommendation till nästa steg (INTE implementerad — utanför filägarskapet)

Query-time-normalisering eller sönderdelning av jämförande frågor (t.ex.
"skillnaden mellan let och const" → två separata sökningar, en per begrepp,
med union av träffarna) skulle sannolikt lösa #2 och liknande
jämförelsefrågor mer robust än vidare chunkningsjustering. Det hör hemma i
`lib/ai/retrieval.ts` (Fastuos yta, #19/#38) — rör INTE den filen härifrån
per issue #37:s filägarskapsregel. Dokumenteras här som rekommendation till
den sessionen istället.

## Explicit icke-gjort (efter-mätningen)

`similarity_threshold` (0.2 i produktion, `lib/ai/retrieval.ts`) och
`MATCH_COUNT` (5 i produktion) är oförändrade — den här mätningen använder
fortfarande topp-3/tröskel-0.0 för att vara direkt jämförbar med baseline,
inte produktionens faktiska hämtningsparametrar.

---

# Slut-checkpoint wave 2 — issue #38 (2026-09-04)

> Svarar på: stämmer sanity-baselinen fortfarande nu när både retrieval-
> tuningen (#37) och Fastuos promptjusteringar (#39) ligger på `main`?
> Samma metod som baseline och #37s efter-mätning (samma 10 frågor, samma
> ordning, topp-3, `similarity_threshold=0.0`, embed → `match_documents()`
> RPC). Testscriptet (`scratchpad/retrieval-sanity.ts`, ej committat — se
> filägarskap i #38) återanvänder `embed()`/`matchDocuments()`-mönstret från
> `scripts/embed-spike.ts` rakt av, precis som tidigare körningar.

## Föregående verifiering

Innan sviten kördes: `git log` bekräftade att både PR #51 (#37, hybrid-
rubrik-chunkning i `scripts/ingest.ts`) och PR #49 (#39, `system-prompts v5`
i `lib/ai/system-prompts.ts`) finns på `main`. `documents`-tabellens
radantal verifierades oberoende via en egen REST-`HEAD`-fråga innan sviten
kördes: `Content-Range: 0-0/3547` — identiskt med #37s efter-mätning, inget
har rört tabellen sedan dess.

## Resultat

| # | Fråga | Topp-3 (titel — similarity) | Rätt sida bland träffarna? | Jämfört med #37s efter-mätning |
|---|---|---|---|---|
| 1 | vad är en closure | Closures — 0.6207 · Closures — 0.4746 · Closures — 0.4642 | **Ja** | Identiskt |
| 2 | skillnaden mellan let och const | const — 0.3074 · const — 0.2813 · static — 0.2758 | **Nej** | Identiskt |
| 3 | hur fungerar map() | Map — 0.5087 · Map() constructor — 0.4841 · Map — 0.4829 | **Nej** | Identiskt |
| 4 | vad är async/await | await — 0.6089 · await — 0.5719 · async function — 0.5669 | **Ja** | Identiskt (0,5719 mot 0,5720 — fjärde decimalen, brus) |
| 5 | hur använder man fetch för att hämta data | Using the Fetch API — 0.5339 · Fetch API — 0.5016 · Using the Fetch API — 0.4726 | **Ja** | Identiskt |
| 6 | vad är en prototyp i JavaScript | "Function: prototype" ×3 (0.5712/0.5592/0.5585) | **Nej** | Identiskt |
| 7 | vad är hoisting | function — 0.4254 · Grammar and types — 0.3604 · import — 0.3576 | **Ja** | Identiskt (0,3604 mot 0,3603 — fjärde decimalen, brus) |
| 8 | skillnad på == och === | Expressions and operators — 0.4359 · Equality (==) — 0.4285 · Strict equality (===) — 0.4235 | **Ja** | Identiskt |
| 9 | hur fungerar this | Functions — 0.2970 · Function.prototype.apply() — 0.2948 · Functions — 0.2921 | **Nej** | Identiskt |
| 10 | vad gör reduce() | Array.prototype.reduce() ×3 (0.4981/0.4967/0.4847) | **Ja** | Identiskt |

**Träffsäkerhet: 6/10 — oförändrat mot #37s efter-mätning, som förväntat.**

Alla tio similarity-värden matchar #37s efter-mätning på tre decimaler; de
två enda avvikelserna (fråga 4 och 7) skiljer sig på fjärde decimalen
(0,0001), vilket är brus från embedding-API:ets flyttalsprecision mellan
anrop, inte en verklig förändring. Samma sex frågor godkända (1, 4, 5, 7, 8,
10), samma fyra underkända (2, 3, 6, 9) — inklusive #9 ("this"), som
förblir den regression #37s efter-mätning identifierade (målsidan trängs
fortfarande ut av `Function.prototype.apply()`).

**Slutsats:** Fastuos promptjusteringar (#39) påverkar — precis som
förväntat — inte retrieval-siffrorna. `match_documents()`-anropet i
`lib/ai/retrieval.ts` sker före prompten någonsin används; en ändring i hur
`system-prompts.ts` formulerar svaret runt de hämtade dokumenten kan inte
ändra vilka dokument som hämtas. Sanity-baselinen från #37 står fast som
slut-checkpoint för wave 2:s retrieval-arbete. #52 (query-normalisering) är
den rekommenderade uppföljningen för #2/#3/#6/#9, redan dokumenterad ovan.

## Terminalutdrag (fullständigt, från körningen)

```
=== FRÅGA: "vad är en closure" ===
  #1 similarity=0.6207  "Closures"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  #2 similarity=0.4746  "Closures"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  #3 similarity=0.4642  "Closures"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures

=== FRÅGA: "skillnaden mellan let och const" ===
  #1 similarity=0.3074  "const"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
  #2 similarity=0.2813  "const"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
  #3 similarity=0.2758  "static"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static

=== FRÅGA: "hur fungerar map()" ===
  #1 similarity=0.5087  "Map"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  #2 similarity=0.4841  "Map() constructor"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Map
  #3 similarity=0.4829  "Map"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

=== FRÅGA: "vad är async/await" ===
  #1 similarity=0.6089  "await"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  #2 similarity=0.5719  "await"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  #3 similarity=0.5669  "async function"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

=== FRÅGA: "hur använder man fetch för att hämta data" ===
  #1 similarity=0.5339  "Using the Fetch API"  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  #2 similarity=0.5016  "Fetch API"  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
  #3 similarity=0.4726  "Using the Fetch API"  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

=== FRÅGA: "vad är en prototyp i JavaScript" ===
  #1 similarity=0.5712  "Function: prototype"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype
  #2 similarity=0.5592  "Function: prototype"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype
  #3 similarity=0.5585  "Function: prototype"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype

=== FRÅGA: "vad är hoisting" ===
  #1 similarity=0.4254  "function"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function
  #2 similarity=0.3604  "Grammar and types"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types
  #3 similarity=0.3576  "import"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

=== FRÅGA: "skillnad på == och ===" ===
  #1 similarity=0.4359  "Expressions and operators"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators
  #2 similarity=0.4285  "Equality (==)"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality
  #3 similarity=0.4235  "Strict equality (===)"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality

=== FRÅGA: "hur fungerar this" ===
  #1 similarity=0.2970  "Functions"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
  #2 similarity=0.2948  "Function.prototype.apply()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
  #3 similarity=0.2921  "Functions"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions

=== FRÅGA: "vad gör reduce()" ===
  #1 similarity=0.4981  "Array.prototype.reduce()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  #2 similarity=0.4967  "Array.prototype.reduce()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  #3 similarity=0.4847  "Array.prototype.reduce()"  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
```

## Explicit icke-gjort (slut-checkpoint)

Ingen ny tuning här — enligt filägarskapet i #38 rördes bara denna fil.
`scripts/ingest.ts`, `lib/ai/retrieval.ts`, `lib/ai/system-prompts.ts` och
`app/**` är oförändrade av den här sessionen. Query-time-normalisering
(#52) är fortfarande rekommendationen för #2/#3/#6/#9, inte implementerad
här.
