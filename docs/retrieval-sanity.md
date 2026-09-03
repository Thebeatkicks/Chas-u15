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

## Explicit icke-gjort

Ingen tuning. `similarity_threshold`, chunk-storlek och overlap är
oförändrade — det här är bara mätningen wave 2 ska utgå från.
