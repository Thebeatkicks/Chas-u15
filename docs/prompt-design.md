# Prompt-design — system-prompts per nivå

> Issue #20. Loggen över hur prompterna faktiskt blev som de blev: vad som
> testades, vad som gick fel och vad ändringen var. Koden ligger i
> `lib/ai/system-prompts.ts` — ändra ingen regel där utan att lägga till en
> rad här.
>
> **Nuvarande version: v3.**

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

## Kvarvarande svagheter — kandidater till wave 2

- **Vägran är fortfarande nära receptet.** v2/v3 räknar upp `split()`,
  `reverse()` och `join()` i den ordning de ska användas. Varje metod
  förklaras för sig och användaren ombeds sätta ihop dem, men ordningen
  är i praktiken halva lösningen. Möjlig åtgärd: förbjud att metoderna
  räknas upp i användningsordning.
- **`developer` öppnar fortfarande förklarande**, om än inte längre med en
  ren definition. Ett hårdare grepp vore att kräva att första meningen
  innehåller en konsekvens eller ett fel.
- **Nivåstyrd retrieval finns inte.** Alla tre nivåer får samma MDN-utdrag;
  bara tonen skiljer. PLAN.md §2 har det som stretch.
- **Längdtaken är inte hårda.** Modellen håller sig inom dem i praktiken,
  men ingenting tvingar den.

## Att köra testerna igen

```bash
pnpm exec next dev --port 3111

curl -sN -X POST http://localhost:3111/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"id":"c1","trigger":"submit-message","level":"developer","messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":"Vad är en closure i JavaScript?"}]}]}'
```

Byt `level` mellan `beginner`, `student` och `developer`, och byt frågan mot
fråga B för att prova vägran.
