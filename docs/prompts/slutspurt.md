# Slutspurt — korta startprompts (klistra in i kanalen)

> Tre saker kvar före redovisningen torsdag 11/9. Var och en tar sin ruta,
> klistrar in i en ny session i sitt verktyg. Korta med flit — ni kan flödet.

---

## Yasmin (Claude Code) — två uppgifter, ~1 h totalt

```
Wave 3 i JS Sensei (github.com/Thebeatkicks/Chas-u15). Läs STATE.md först.
Ingen ny funktionskod — det här är polish före redovisningen på torsdag.

Två uppgifter:

1. Issue #68 (10 min): docs/retrieval-sanity.md säger fortfarande 6/10, men
   sviten är 10/10 sedan Fastuos query-normalisering (#52, PR #54). Lägg till
   ett daterat slutavsnitt: 6/10 baseline → 6/10 efter min chunkning → 10/10
   efter #52. Behåll historiken, resan 6→10 är bra material.

2. Issue #59 (30-45 min) — BETYGSKRAV: gå igenom mina egna filer i scripts/
   (ingest.ts, embed-spike.ts, generate-mdn-selection.sh) och säkerställ att
   någon som aldrig sett projektet förstår VARFÖR, inte bara vad. Kommentera
   beslut och constraints ("chunkstorleken är X för att Y"), inte vad raden
   gör. Ta bort AI-genererad platsfyllnad. Uppgiften kräver uttryckligen
   välkommenterad kod, och den ska hålla för kodgranskningen.

En PR per uppgift. Bocka av dig i #59 med en kommentar när du är klar.
```

---

## Fastuo (Codex) — en uppgift, ~45 min

```
Wave 3 i JS Sensei (github.com/Thebeatkicks/Chas-u15). Läs STATE.md först.
Ingen ny funktionskod — polish före redovisningen på torsdag.

Issue #59 (30-45 min) — BETYGSKRAV: gå igenom mina egna filer, lib/ai/** och
app/api/chat/route.ts, och säkerställ att någon som aldrig sett projektet
förstår VARFÖR, inte bara vad. Kommentera beslut och constraints
("SIMILARITY_THRESHOLD är 0.2 för att baseline visade 0.22-0.29"), inte vad
raden gör. Ta bort AI-genererad platsfyllnad.

Uppgiften kräver uttryckligen välkommenterad kod, och den ska hålla för
kodgranskningen — mina filer är projektets AI-kärna, så de blir sannolikt
mest lästa.

En PR. Bocka av dig i #59 med en kommentar när du är klar.
```

---

## Ernest (Cursor) — en uppgift, ~45 min

```
Wave 3 i JS Sensei (github.com/Thebeatkicks/Chas-u15). Läs STATE.md först.
Ingen ny funktionskod — polish före redovisningen på torsdag.

Issue #59 (30-45 min) — BETYGSKRAV: gå igenom mina egna filer, components/**
och app/** (utom app/api), och säkerställ att någon som aldrig sett projektet
förstår VARFÖR, inte bara vad.

Extra viktigt för mig: Cursor-genererad kod är snabbt skriven och tunnast
kommenterad, och det är den koden som granskas. Förklara de icke-uppenbara
besluten — streaming-parsningen som stänger öppna kodfences, hanteringen av
trasig localStorage. Kommentera beslut och constraints, inte vad raden gör.

Läs också PR #69 innan du börjar: orchestratorn fixade en renderloop i
components/chat.tsx (issue #64) medan jag var upptagen — ändringen är
kommenterad, säg till om du vill ha den gjord annorlunda.

En PR. Bocka av dig i #59 med en kommentar när du är klar.
```

---

## Alla — demo-repetition (#63), boka en tid

```
Demo-repetition inför torsdag. Manus: docs/demo-manus.md (v2 — läs din egen
sektion före vi ses).

Uppdelning: Henrik öppnar + arbetssättet + arkitektur, Yasmin RAG-kedjan,
Fastuo prompts + modellval, Ernest kör tangentbordet under live-demon.
Alla säger en mening var under "Vad var svårt".

Två genomkörningar:
1. Med tidtagning. Ska landa på 10 min. Notera vad som drar över.
2. Skarp: inkognitofönster, live-URL (aldrig localhost), modalen bortklickad
   innan vi börjar.

Efter körning 1: skriv in i issue #63 vad som skavde, så justeras manuset
till v3. Ingen manusändring utan att vi kört igenom den minst en gång.
```
