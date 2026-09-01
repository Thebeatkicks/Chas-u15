# MDN-urval för RAG v1 (issue #5)

> Definierar exakt vilka sidor ur [`mdn/content`](https://github.com/mdn/content)
> som ska ingå i v1 av RAG-datan för JS Sensei, samt kriterierna urvalet
> byggdes på. Beslutas här — **hämtas/chunkas/embeddas i #6**.

## Resultat

**528 sidor** ingår i urvalet. Full lista med relativa sökvägar (relativt
`mdn/content`-repots rot) finns i
[`scripts/mdn-selection-list.txt`](../scripts/mdn-selection-list.txt) — en
sökväg per rad, t.ex.:

```
files/en-us/web/javascript/guide/functions/index.md
files/en-us/web/javascript/reference/global_objects/array/map/index.md
files/en-us/web/api/fetch_api/using_fetch/index.md
```

Listan är **genererad**, inte handskriven — reproducerbar med
[`scripts/generate-mdn-selection.sh`](../scripts/generate-mdn-selection.sh)
(se skriptets header för exakt användning). Ändras urvalskriterierna, kör om
skriptet — redigera inte `mdn-selection-list.txt` för hand.

528 ligger ~5 % över den ~500-sidor-gräns issuen skisserade. Det är ett
medvetet avvägt val, inte ett missat mål — se "Varför 528 och inte ≤500?"
nedan.

## Källträd som klonas

```
git clone --depth 1 --filter=blob:none --sparse https://github.com/mdn/content
cd content
git sparse-checkout set files/en-us/web/javascript files/en-us/web/api/<relevanta mappar>
```

Ett **fullständigt** `--depth 1`-klon misslyckades på Windows (`Filename too
long` på djupt nästlade skärmdumpsfiler under `learn_web_development/` och
`games/`) — därför `--filter=blob:none --sparse`: hämtar bara trädstrukturen
initialt, sen checkas endast de mappar vi faktiskt behöver ut. Snabbare också
(hela `mdn/content` är >10 GB historik även med `--depth 1`, sparse ger bara
MB). **Vi committar inte klonen** — bara urvalslistan och genereringsskriptet.

## Urvalskriterier per kategori

| Kategori | Källa i `mdn/content` | Regel | Antal |
|---|---|---|---|
| JS Guide (allt) | `web/javascript/guide/**` | Hela guiden — det är kärnan i "förklara, inte lösa" | 33 |
| Referens, syntax-kategorier (allt) | `web/javascript/reference/{classes,execution_model,functions,iteration_protocols,javascript_technologies_overview,lexical_grammar,regular_expressions,statements,strict_mode,template_literals,trailing_commas}/**` + `reference/index.md` | Hela kategorin — litet, konceptuellt tätt, sällan mer än 1–2 nivåer djupt | 79 |
| Operatorer | `web/javascript/reference/operators/**` | Alla utom bitwise-operatorer och sammansatta tilldelningsoperatorer (`+=` m.fl.) — se uteslutning nedan | 54 |
| Globala kärnobjekt (fullt, inkl. metoder) | `web/javascript/reference/global_objects/{array,object,string,number,boolean,math,json,date,regexp,map,set,promise,function,error,typeerror,rangeerror,referenceerror,syntaxerror,globalthis,nan,infinity,undefined}/**` | Alla instans-/statiska metodsidor för objekt som direkt täcker "variabler, funktioner, arrayer, objekt" — minus de generella uteslutningsreglerna nedan | 328 (varav dessa) |
| Nischade objekt (bara översikt) | `.../global_objects/{weakmap,weakset,iterator,proxy,reflect,symbol,generator,generatorfunction,asyncfunction,bigint}/` | Bara översiktssidan, inte enskilda metoder — avancerad meta-programmering som ligger utanför MVP-nivåerna nybörjare/student/utvecklare | (ingår i raden ovan) |
| Globala funktioner | `.../global_objects/{decodeuri,decodeuricomponent,encodeuri,encodeuricomponent,eval,isfinite,isnan,parsefloat,parseint}/` | De globala funktioner som faktiskt används i vardaglig JS | (ingår i raden ovan) |
| DOM + Fetch (`web/api`) | Utvalda sidor under `Document`, `Element`, `EventTarget`, `Event`, `Node`, `NodeList`, `HTMLElement`, `Window`, `Console`, `fetch()`, `Response`, `Request`, `Headers`, `FormData`, `URL`, `URLSearchParams`, `Storage`, plus vanliga metoder (`querySelector`, `addEventListener`, `appendChild`, `fetch_api/using_fetch` m.fl.) | Manuellt utvald lista (se skriptets `DOM_FETCH_PAGES`) — `web/api` är alldeles för stort (tusentals sidor) för kategori-baserade regler, så det här är den enda handplockade delen | 34 |
| **Totalt** | | | **528** |

### Uteslutet (och varför)

Tillämpas som filter ovanpå kategorireglerna, se skriptets kommentarer för
exakta mönster:

- **Föråldrat/legacy**: `Date.prototype.getYear`/`setYear`,
  `String`:s HTML-wrapper-metoder (`anchor`, `big`, `blink`, `bold`, `fixed`,
  `fontcolor`, `fontsize`, `italics`, `link`, `small`, `strike`, `sub`, `sup`),
  `Object`:s dunder-accessorer (`__proto__`, `__defineGetter__` m.fl.),
  `RegExp.prototype.compile`, `Function.prototype.caller`/`displayName`.
- **UTC-dubbletter**: `Date`:s `getUTCX`/`setUTCX`-varianter — samma koncept
  som lokal-tid-varianterna, som redan ingår.
- **Locale-varianter**: `toLocaleString`/`toLocaleDateString`/
  `localeCompare` m.fl. — hör ihop med Intl, som är utanför v1-scope.
- **Bitwise & sammansatta tilldelningsoperatorer**: `&`, `|`, `^`, `~`,
  `<<`, `>>`, `>>>` samt `+=`/`-=`/... — avancerat/sällan använt i en
  nybörjar–utvecklare-kurs; basoperatorn (t.ex. `addition`) räcker för att
  förklara mönstret.
- **Nya (ES2023/2024) samlingsmetoder**: `Array.prototype.toReversed/
  toSorted/toSpliced/with`, `Set`:s mängd-operationer (`union`,
  `intersection`, ...), `Promise.withResolvers` — duplicerar redan täckta
  metoder (`reverse`, `sort`, `splice`, spread) eller är för nischat för v1.
- **Math**: hyperboliska/bitmanipulerande metoder (`acosh`, `clz32`, `fround`,
  `imul`, `log1p`, ...) — matematiskt avancerat, sällan relevant för
  "förklara JS", inte "förklara matte".
- **Symbol/RegExp well-known symbols**: `Symbol.hasInstance`,
  `RegExp.prototype[Symbol.match]` m.fl. — meta-programmering, egen nisch.
- **Helt exkluderade globalobjekt**: `Proxy`, `Reflect` (metoder, bara
  översikt kvar), `ArrayBuffer`, `SharedArrayBuffer`, `DataView`, `Atomics`,
  `WeakRef`, `FinalizationRegistry`, alla `TypedArray`-varianter (`Int8Array`
  osv.), `Intl`, `Temporal`, `AggregateError`/`EvalError`/`InternalError`/
  `URIError`, `DisposableStack`/`AsyncDisposableStack`/`SuppressedError` —
  låg-nivå/experimentellt/nischat, ingen av nivåerna (nybörjare/student/
  utvecklare) behöver detta i v1. Kan läggas till i en senare wave om
  retrieval-luckor upptäcks.

### Varför 528 och inte ≤500?

Efter flera trimningsrundor (operatorer 76→54, generator-familjen till bara
översikt, BigInt till bara översikt, m.fl.) landade urvalet på 528 — cirka 28
sidor över riktvärdet. Återstoden är i huvudsak `Array`/`String`/`Object`/
`Date`-metoder som var och en är genuint vanlig JS (`Array.prototype.flatMap`,
`String.prototype.padStart`, `Object.groupBy`, ...). Att skära djupare där
hade betytt att ta bort metoder en JS-elev faktiskt frågar om, bara för att
träffa ett rundat mål — bedömdes som fel avvägning. Om wave 2:s
retrieval-tuning visar att detta är för mycket (långsam indexering, för bred
kontext) är näst-enklaste nedskärning: släng `Date`:s 32 sidor till en
kärnlista på ~15 (behåll get/set för år/månad/dag/timme, släng
millisekunder/sekunder-varianter).

## Licens

MDN-innehåll är licensierat under **CC BY-SA 2.5** (vissa nyare sidor
CC BY-SA 4.0). Vi skrapar inte — vi klonar det officiella, öppna
`mdn/content`-repot och citerar källa + länk under varje svar i appen
(krav från produktbeslut #6 i `PLAN.md`, "MDN-grundat svar med källänkar").

- Licenstext: https://creativecommons.org/licenses/by-sa/2.5/
- MDN:s egen attribueringsguide: https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license
- Attribueringsformat vi använder i UI:t: `Källa: MDN Web Docs — <sidtitel>,
  <url till developer.mozilla.org/en-US/docs/...>` (CC BY-SA 2.5). Det räcker
  att länka till den engelska docs-sidan (`en-us`) eftersom det är den vi
  indexerar — beslutas slutgiltigt i #6 om chunkningen ändrar url-mappningen.

## Chunkningsstrategi — alternativ (inget beslut ännu)

Ingen av dessa är valda. Listas här så #6 (embedding-spiken) kan experimentera
och wave 1/2 kan fatta beslutet med data i handen (se `PLAN.md` risk
"Retrieval-kvalitet dålig" — beslutet ska vara omgörbart).

| Strategi | Hur | Fördel | Risk |
|---|---|---|---|
| **Per rubrik (heading-based)** | Splitta varje `index.md` vid `##`/`###`-rubriker, en chunk per sektion | Semantiskt sammanhängande, matchar hur MDN redan strukturerar innehåll (varje metod-sida har ofta "Syntax"/"Parameters"/"Examples") | Ojämn chunk-storlek — vissa sektioner (t.ex. en lång exempel-lista) kan bli för stora för embedding-modellens kontext eller för dyra att söka i |
| **Fast storlek (fixed-size)** | T.ex. 500–800 tokens per chunk, ingen hänsyn till struktur | Förutsägbar kostnad/latens, enkelt att implementera | Kan klippa mitt i ett kodexempel eller en förklaring — dålig retrieval-kvalitet om en chunk saknar kontext |
| **Fast storlek + overlap** | Som ovan men med t.ex. 10–15 % overlap mellan chunks | Minskar risken att viktig kontext hamnar exakt på en chunk-gräns | Mer lagring/embedding-kostnad (samma text embeddas två gånger), måste dedupa i UI:t om två overlappande chunks båda matchar |
| **Hybrid: rubrik + max-storlek-tak** | Splitta per rubrik som primärregel, men om en sektion överskrider t.ex. 800 tokens — falla tillbaka till fast delning inom den sektionen (med overlap) | Bäst av båda: semantisk gräns när möjligt, skydd mot jätte-sektioner | Mest komplex att implementera och testa |

**Rekommendation att ta med till wave 1-diskussionen** (ingen bindande
prioritering här, bara en riktning): hybrid-alternativet passar MDN:s
struktur bäst eftersom sidorna redan är skrivna i tydliga sektioner
("Syntax", "Parameters", "Return value", "Examples") — men börja enklast
möjligt (fast storlek + overlap) för att få en fungerande pipeline i #6,
och byt till hybrid i wave 2 om retrieval-kvaliteten kräver det. Varje sidas
metadata (chunk → käll-url, sidtitel) måste sparas oavsett strategi, för
källhänvisningarna i produktkravet.

## Filer i detta urval (ägarskap)

- `docs/mdn-selection.md` — den här filen.
- `scripts/generate-mdn-selection.sh` — genereringsskript, körs manuellt mot
  en lokal `mdn/content`-klon.
- `scripts/mdn-selection-list.txt` — genererad output, 528 sökvägar.

`scripts/` delas med #6 (embedding-spiken). `mdn-selection-list.txt` är tänkt
att vara den fil #6:s hämtnings-/chunknings-script läser filsökvägarna ifrån.
