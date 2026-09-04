# Modell-A/B — vilken modell ska demon köra?

> Issue #40. Tre modeller, identiska prompts (v5), identisk retrieval, samma
> fem frågor. Ren env-ändring via `CHAT_MODEL` — ingen kodändring behövdes.
>
> **Rekommendation: behåll `openai/gpt-4o-mini`.**

## Metod

Varje modell kördes med `CHAT_MODEL=<modell> pnpm exec next dev --port 3111`
mot samma `main`, samma system-prompts (v5) och samma `documents`-tabell.

Två mätningar per modell:

1. **Regression** — `lib/ai/prompt-regression.mjs 5`: samma fråga fem gånger
   per nivå, mäter automatiskt definitionsinledning, ordtak och om vägran
   räknar upp metoderna i användningsordning.
2. **Fem frågor** — `lib/ai/model-ab.mjs`: en fråga per nivå, ett känt
   retrieval-gap (let vs const, se `docs/retrieval-sanity.md`) och ett
   vägransprov. Svaren lästes för hand.

## Resultat

| | `gpt-4o-mini` | `claude-haiku-4.5` | `gpt-5-mini` |
|---|---|---|---|
| Pris in / ut per Mtok | **$0,15 / $0,60** | $1,00 / $5,00 | $0,25 / $2,00 |
| Första token, median | 1 875 ms | **1 480 ms** | 17 063 ms |
| Helt svar, median | **3 160 ms** | 4 715 ms | 17 850 ms |
| `developer` inleder med definition | **0/5** | 1/5 | **0/5** |
| Svar över ordtaket | **0/15** | 2/15 | **0/15** |
| Vägran räknar upp metoder i ordning | 1/5 | 1/5 | **0/5** |
| Vägran ger färdig kod | **0/5** | **0/5** | **0/5** |

## Bedömning per modell

### `openai/gpt-4o-mini` — nuvarande, rekommenderad

Bäst instruktionsföljning av de tre: noll definitionsinledningar, noll svar
över taket. Snabb, och åtta gånger billigare än Haiku. Följer v5:s
öppningsmall ordagrant:

> "Vanligaste misstaget med `this` i JavaScript är att man missförstår dess
> värde i olika kontexter."

Svagheten är att svaren är torrare — ren löpande text, sparsam struktur.

### `anthropic/claude-haiku-4.5` — pedagogiskt trevligast, sämre disciplin

Klart bäst på ton och pedagogik. Vägran är den mest lärarlika av alla tre:
motfråga först, två ledande delfrågor, en enda metod som ledtråd, och ett
"säg till när du har en idé". Använder fetstil och struktur som skulle lyfta
svaren rejält när @ErnestIssa markdown-rendering (#41) landar.

Men den håller reglerna sämre: **2 av 5 developer-svar sprängde ordtaket**
och **1 av 5 inledde med en definition** — samma två fel som hela #39 gick ut
på att bygga bort. Den hittade också på ordet "strängarratymetoder".

### `openai/gpt-5-mini` — diskvalificerad på latens

Instruktionsföljningen är utmärkt (noll fel på alla mått). Men **17 sekunders
median till första token**, mot under två för de andra, och i värsta fallet
36 sekunder. Hela produktidén bygger på att svaret strömmar fram medan man
läser — med den latensen ser appen trasig ut i en demo.

Den läcker dessutom sitt eget resonemang om kontexten till användaren:

> "Inga av MDN-utdragen ovan visar exakt hur man vänder en sträng, så här
> förklarar jag utifrån generell JavaScript-kunskap"

Det är tekniskt sett regel 3 följd korrekt, men det är inte något en elev ska
behöva läsa.

## Rekommendation

**Behåll `openai/gpt-4o-mini` till redovisningen.** Den vinner på de mått som
avgör: instruktionsföljning, latens och pris. Haiku är trevligare att läsa men
bryter mot två av de regler #39 just bevisade att vi kan hålla, och gpt-5-mini
är för långsam för en streamad demo.

**Ta upp Haiku igen om två saker inträffar:** att markdown-renderingen (#41)
landar, så dess formatering kommer till sin rätt, och att någon hinner tuna
prompterna mot just den. Se begränsningen nedan.

Byte kräver ingen kodändring — bara `CHAT_MODEL` i Vercel-dashboarden.

## Begränsningar i testet

- **Prompterna är tunade mot `gpt-4o-mini`.** v1–v5 utvecklades och mättes med
  den modellen, så jämförelsen gynnar den. Haikus två regelbrott kan lika
  gärna vara en prompt som passar den sämre som en svagare modell.
- **Fem varv per mått** är för lite för att skilja 1/5 från 2/5. Siffrorna
  duger till att sortera modellerna, inte till att rangordna dem exakt.
- **En automatisk flagga var otillförlitlig.** Harnessen rapporterade först
  "färdig lösning 2/5" för `gpt-5-mini`. Tre manuella kontrollprov visade att
  det var falsklarm: den ger kommenterade skelett, aldrig kedjan
  `split().reverse().join()`. Heuristiken letade efter `function ...` plus
  `reverse()` och träffade ordet i prosa. Raden i tabellen är rättad efter
  manuell kontroll — mät aldrig vägran enbart med regex.
- Endast svenska frågor testades, vilket är rätt för produkten men säger
  inget om modellernas engelska.

## Köra om testet

```bash
CHAT_MODEL=anthropic/claude-haiku-4.5 pnpm exec next dev --port 3111
node lib/ai/prompt-regression.mjs 5
node lib/ai/model-ab.mjs anthropic/claude-haiku-4.5
```
