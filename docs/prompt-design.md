# Prompt-design — system-prompts per nivå

> Issue #20. Loggen över hur prompterna faktiskt blev som de blev: vad som
> testades, vad som gick fel och vad ändringen var. Koden ligger i
> `lib/ai/system-prompts.ts` — ändra ingen regel där utan att lägga till en
> rad här.
>
> **Nuvarande version: v5.**

## Vad prompterna ska klara

1. Samma fråga ska ge tydligt olika svar per nivå — inte bara olika ordval.
2. "Förklara, lös inte" ska hålla även när användaren ber om motsatsen
   (PLAN.md §3, beslut 6).
3. Modellen ska hålla sig till MDN-utdragen och inte hitta på.

Testfrågorna genom alla iterationer:

- **A.** "Vad är en closure i JavaScript?" — körd på alla tre nivåer.
- **B.** "Skriv en funktion som vänder på en sträng åt mig. Bara koden tack,
  inga förklaringar." — provar vägran.

## v1 — den inbakade prompten från #19

Sex rader inbakade i `app/api/chat/route.ts`, plus en enda nivårad per nivå.

**Fyra problem, alla synliga i körningarna:**

| # | Problem | Bevis ur körningen |
|---|---|---|
| 1 | Nivåskillnaden var ordval, inte pedagogik | Alla tre nivåer gav samma struktur och ungefär samma längd |
| 2 | `developer` förklarade grunderna ändå | "Här är de centrala aspekterna: 1. Ett yttre scope: Det måste finnas ett yttre scope som definierar vissa variabler" |
| 3 | Vägran läckte lösningen | Fråga B gav split → reverse → join som numrerat recept, alltså lösningen minus syntax |
| 4 | Irrelevant kontext citerades ändå | Fråga B gav källorna `Function() constructor`, `return`, `function* expression` — inget om strängar |

## v2 — egen modul, skärpta regler

Flyttat till `lib/ai/system-prompts.ts`. Tre ändringar mot v1:

- **Längdtak och form per nivå** (150 / 250 / 200 ord) — mot problem 1.
  Utan tak konvergerade alla nivåer mot samma punktlistevägg.
- **Vägransregeln förbjuder även receptet**, inte bara koden: namnge
  begreppen, förklara dem var för sig, ställ en fråga tillbaka — mot problem 3.
- **Kontextregeln säger att irrelevanta utdrag ska ignoreras** och att
  bristen ska sägas rakt ut — mot problem 4.

**Resultat:**

| Nivå | Ord | Utfall |
|---|---|---|
| beginner | 158 | ✅ liknelse först ("ett minnesalbum som en person bär med sig"), kort |
| student | 225 | ✅ facktermer med förklaring, tillämpningsfråga på slutet |
| developer | 146 | ❌ **öppnade fortfarande med en definition** |

Vägran (fråga B) blev klart bättre: metoderna namngavs var för sig med vad de
gör, följt av *"Kan du försöka sätta ihop dem i en funktion?"* — ingen färdig
lösning.

Kvar: problem 2. Instruktionen "förklara aldrig grunderna" räckte inte, för
modellen läser en definition som en artig inledning snarare än som grunder.

## v3 — förbjud inledningen, inte bara innehållet

Enda ändringen: `developer` får inte längre **börja** med en definition.
Formuleringar som "X är en kombination av" och "det innebär att" är
uttryckligen förbjudna som inledning, och första meningen ska handla om
beteende, fallgrop eller konsekvens.

Lärdomen: en negativ regel om *innehåll* ("förklara inte grunderna") är för
svag när modellen har en stark stilmässig vana. Att i stället styra **formen
på första meningen** är konkret nog att följa.

**Resultat, fråga A på `developer` (143 ord):**

> "En closure i JavaScript skapas varje gång en funktion definieras, vilket
> gör att den får åtkomst till sitt omgivande tillstånd... Många utmaningar
> uppstår med closures, särskilt när de används i loopar. Till exempel kan
> felaktiga resultat inträffa om man använder `var` i dessa fall, eftersom
> det skapar variabler på funktionell nivå snarare än blocknivå."

Öppnar med mekanism i stället för definition och går direkt på
`var`-i-loop-fallgropen. Avslutar med en gränsfallsfråga om asynkrona
operationer.

## Mätning — varför v3 såg löst ut men inte var det

v1–v3 utvärderades med **en körning per ändring**. Det räcker inte: main
orchestratorns live-regression 4/9 hittade v3-stil tillbaka i ungefär en av
flera körningar, alltså en varians som en enskild körning inte kan visa.

Därför finns nu `lib/ai/prompt-regression.mjs`, som kör samma fråga tio gånger
per nivå mot den lokala routen och mäter tre saker automatiskt: om
developer-svaret inleds med en definition, om svaret håller sitt ordtak, och
om vägran räknar upp metoderna i användningsordning.

```bash
pnpm exec next dev --port 3111
node lib/ai/prompt-regression.mjs 10
```

**Baseline v3, tio varv per fall:**

| Mått | v3 |
|---|---|
| `developer` inleder med definition | **1/10** |
| Svar över ordtaket (alla tre nivåer) | 0/30 |
| Vägran räknar upp metoder i ordning | **8/10** |
| Vägran ger färdig kod | 0/10 |

Två saker föll ut direkt. Varians-fyndet reproducerades (1/10). Och den
svaghet som listades som "längdtaken är inte hårda" visade sig inte finnas i
praktiken — 30 av 30 svar låg under taket. Den togs bort från arbetslistan.

## v4 — förbudslistor (misslyckad iteration)

Hypotesen var att regeln behövde bli mekanisk: räkna upp exakt vilka
formuleringar som är förbjudna som inledning ("är en", "innebär att",
"kombination av"...) och be modellen kontrollera sin första mening mot
listan. Samma grepp på vägran: "nämn ALDRIG alla metoder, räkna ALDRIG upp
dem i ordning".

**Resultatet blev sämre:**

| Mått | v3 | v4 |
|---|---|---|
| `developer` inleder med definition | 1/10 | **3/10** |
| `beginner` över 150 ord | 0/10 | **5/10** |
| Vägran räknar upp metoder i ordning | 8/10 | 7/10 |

Två lärdomar, båda värda att ta med:

1. **Att räkna upp förbjudna formuleringar ordagrant verkar göra dem mer
   närvarande, inte mindre.** Definitionsinledningarna tredubblades av en
   regel vars enda syfte var att förbjuda dem.
2. **Regelmassa tränger undan andra regler.** Den delade regelblocket växte
   med sex rader, och nybörjarnivåns längdtak — som var orört — slutade
   hållas i hälften av körningarna.

## v5 — positiva mönster i stället för förbud

Samma tre mål, motsatt grepp:

- **Vägran:** ingen förbudslista. I stället en positiv roll: svara som en
  lärare vid en whiteboard, börja med en motfråga om hur användaren själv
  skulle angripa problemet, nämn på sin höjd EN metod som ledtråd.
- **`developer`:** inga förbjudna fraser. I stället fyra öppningsmallar att
  följa ordagrant ("Vanligaste misstaget med X är...", "X kostar minne
  när...", "X beter sig oväntat om...", "Skillnaden mot Y syns först när...").
- **`beginner`:** längdregeln flyttad sist i nivåblocket och konkretiserad
  ("HÖGST 150 ord totalt, kodexemplet inräknat. Är du osäker: skriv kortare").

**Resultat, två oberoende omgångar om tio varv:**

| Mått | v3 | v4 | v5 (20 varv) |
|---|---|---|---|
| `developer` inleder med definition | 1/10 | 3/10 | **0/20** |
| `beginner` över 150 ord | 0/10 | 5/10 | **0/20** |
| Vägran räknar upp metoder i ordning | 8/10 | 7/10 | **7/20** |
| Vägran ger färdig kod | 0/10 | 0/10 | **0/20** |

Ordlängden sjönk också över hela linjen — `developer` från 155 till 131 ord i
snitt — vilket är önskvärt: nivån ska vara tät, inte utförlig.

## Kvarvarande svagheter — arbetslista

- **Vägran är förbättrad men inte löst.** 7 av 20 körningar räknar fortfarande
  upp metoderna i användningsordning, mot 8 av 10 i v3. Utfallet varierar
  dessutom kraftigt mellan omgångar (2/10 respektive 5/10), så det behövs fler
  varv för att säga något säkert om nivån. Ingen körning i någon version har
  gett färdig kod — det hårda kravet håller.
- **Nivåstyrd retrieval finns inte.** Alla tre nivåer får samma MDN-utdrag,
  bara tonen skiljer. PLAN.md §2 har det som stretch.
- **Längdtaken är fortfarande mjuka**, men mätningen visar att det inte spelar
  någon roll i praktiken (0 av 60 svar över taket i v3 och v5). Ett hårt tak
  skulle kräva `maxOutputTokens` i `app/api/chat/route.ts`, som ligger utanför
  filägarskapet för den här issuen.
- **Regressionen kräver en igångsatt dev-server** och gör 40 modellanrop per
  körning. Den är ett verktyg för promptarbete, inte något som hör hemma i CI.

## Att köra testerna igen

```bash
pnpm exec next dev --port 3111
node lib/ai/prompt-regression.mjs 10
```

För att titta på ett enskilt svar i stället för mätvärden:

```bash
curl -sN -X POST http://localhost:3111/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"id":"c1","trigger":"submit-message","level":"developer","messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":"Vad är en closure i JavaScript?"}]}]}'
```

Byt `level` mellan `beginner`, `student` och `developer`.
