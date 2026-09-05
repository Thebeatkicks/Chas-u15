# Inlämningschecklista — Canvas

> Issue #61. Vad som faktiskt ska in i Canvas, och i vilket skick, innan
> **mån 14/9 23:59**. Byggaren av den här listan är inte den som bockar av
> den — var och en kryssar sin egen rad innan deadline.

## Deadline och vad som lämnas in

- **Muntlig redovisning:** tors 11/9 (klar innan denna lista fylls i).
- **Slutinlämning i Canvas:** **mån 14/9 23:59**, ingen förlängning inplanerad.
- Kursens krav (se [docs/PLAN.md §6](PLAN.md)): länk till ett publikt
  GitHub-repo med en komplett, välkommenterad app och en README-reflektion
  som svarar på tre bedömningsfrågor. Kodgranskningen är en **separat**
  skriftlig inlämning — se sista sektionen.

## 1. Repo-länk

- [ ] Länken som läggs i Canvas pekar på **`main`**, inte en feature-branch:
      `https://github.com/Thebeatkicks/Chas-u15`
- [ ] Repot är **publikt** (kontrollerat i GitHub-inställningarna — kravet
      finns redan i [docs/PLAN.md §4](PLAN.md)s git-regler)
- [ ] Senaste commit på `main` är grön: ingen trasig build, ingen känd
      P0-bugg som inte är dokumenterad i en öppen issue
- [ ] Live-URL:en fungerar: <https://chas-u15.vercel.app> (senaste bevis:
      [docs/smoke-runs/wave-3.md](smoke-runs/wave-3.md))

## 2. README komplett

Kontrollpunkter mot den faktiska filen ([README.md](../README.md)), inte mot
minnet av vad den skulle innehålla:

- [ ] Teknik, deploy, "kom igång" och projektstruktur-sektionerna stämmer med
      koden som faktiskt ligger på `main` (inga kvarglömda TODO:er från
      tidigare waves)
- [ ] Reflektionssektionen är märkt med sin version och vad som är kvar —
      **inte** tystare om det som fortfarande saknas
- [ ] Wave 2:s resultat är invävda: retrieval 6/10 → 10/10, prompt-designens
      fem iterationer (inkl. v4:s förbudslistor-lärdom), modell-A/B,
      integrationsbuggen med stackade PR:er — **klart**, se README v3.
- [ ] Wave 2:s personliga AI-reflektioner (Yasmin, Ernest, Fastuo) är
      tillagda — **väntar på [#62](https://github.com/Thebeatkicks/Chas-u15/issues/62)**
      (Fastuos wave-2-handoff). Måste vara klart innan denna rad kan kryssas.
- [ ] Licens/attribution för MDN-innehållet (CC-BY-SA) syns i README

## 3. Alla svarar på de tre frågorna

Uppgiftens tre bedömningsfrågor (se README:s reflektionsrubriker):

1. Vilken ny AI-teknik/bibliotek identifierade vi och hur tillämpade vi det?
2. Varför valde vi den AI-tekniken/det biblioteket?
3. Varför behövdes AI-komponenten? Kunde vi löst det på annat sätt?

Svaren byggs gemensamt i README, men **var och en ska kunna svara på dem
muntligt/individuellt** om det efterfrågas — kryssa din egen rad:

- [ ] Henrik har läst README:s tre svar och kan stå för dem
- [ ] Yasmin har läst README:s tre svar och kan stå för dem
- [ ] Fastuo har läst README:s tre svar och kan stå för dem
- [ ] Ernest har läst README:s tre svar och kan stå för dem

## 4. Kodgranskningen (separat skriftlig inlämning, #59)

Kommentargranskningen i [#59](https://github.com/Thebeatkicks/Chas-u15/issues/59)
är underlaget för den separata skriftliga kodgranskningen — inte samma sak
som README-inlämningen ovan, men klar i samma buffertfönster:

- [ ] Henrik: repo-roten, konfig — [PR #65](https://github.com/Thebeatkicks/Chas-u15/pull/65)
- [ ] Yasmin: `scripts/**`
- [ ] Fastuo: `lib/ai/**`, `app/api/chat/route.ts`
- [ ] Ernest: `components/**`, `app/**`
- [ ] Alla fyra PR:er mergade till `main` innan slutinlämning

## 5. Sista koll innan Canvas-knappen

- [ ] `docs/smoke-runs/wave-3.md` (eller en nyare körning om #64 hunnit
      fixas och testats om) visar **godkänd** eller **godkänd med
      dokumenterad anmärkning** — inget känt rött kryss utan länkad issue
- [ ] STATE.md/state.json uppdaterade så de matchar verkligheten (inte ett
      krav från kursen, men håller repot begripligt för den som granskar)
- [ ] Länken som faktiskt klistras in i Canvas är testad i en inkognitoflik
      (så den inte råkar peka på en privat fork eller kräva inloggning)
