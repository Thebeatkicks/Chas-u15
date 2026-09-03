# Smoke-körning — wave 1

**Datum:** 2026-09-03 kväll · **Mot:** https://chas-u15.vercel.app (prod)
**Deploy:** `b53552e` (riktig RAG-route, PR #34) + env-fix (se Avvikelser)
**Körd av:** main orchestrator + Henrik · Mall: `docs/smoke-test.md`

## §0 Pre-flight

- [x] Live-URL svarar 200
- [x] Env-variabler i Production — **FÅNGADE WAVENS ENDA PRODUKTIONSBUGG:**
  alla sex variabler fanns till namnet men hade tomma värden (aldrig upptäckt
  tidigare eftersom RAG-routen är första deployade koden som läser dem).
  Henrik fyllde i värdena i dashboarden + redeploy → grönt.
- [x] Mock-detektorn: INTE mock — källorna varierar med frågan och ingen
  Glossary-länk förekommer (fetch-frågan gav Using Fetch API, Window.fetch,
  Fetch API, Request)

## §1 Frågor × nivåer (körda; ej hela 3×3-matrisen — se Avvikelser)

| Fråga | Nivå | Streamning | Källa visas | Rätt sida | Förklarar |
|---|---|---|---|---|---|
| Vad är en closure? | student (UI) | ✅ | ✅ Functions · Closures | ✅ | ✅ inkl. följdfråga |
| Hur fungerar fetch? | beginner (curl) | ✅ | ✅ 4 st | ✅ Using Fetch API m.fl. | ✅ |
| Hur fungerar fetch? | developer (curl) | ✅ | ✅ | ✅ | ✅ teknisk ton, skiljer sig från beginner |
| Skillnad let vs const? | beginner (curl) | ✅ | ✅ | ✅ **både let- och const-sidan** (baselinens gap #2 syns inte med helmeningsfråga) | ✅ |

## §2 "Förklarar, löser inte"

- [x] "Skriv en funktion som vänder på en sträng åt mig. Bara koden tack." →
  *"Jag kan tyvärr inte skriva färdig kod åt dig…"* + begrepp + vägledning. ✅

## §3 UI-kontroller (via browser mot prod)

- [x] Nivåväljare syns och går att växla (Student vald)
- [x] Streamat svar renderas löpande
- [x] Källchips under färdigt svar, inte under streamning
- [x] Tomt läge med "Ställ din första fråga" + förslagschips
- [ ] Klick på källchip öppnar MDN i ny flik — ej klickat (URL:erna verifierade
  korrekta via wire-formatet)
- Notering: Enter skickade inte i testet — skicka-knappen krävdes. Ernest
  verifierar (footern säger "Enter skickar").

## §4 Felfall (curl mot prod)

- [x] `level: "nybörjare"` → 400 `invalid_level`
- [x] tom `messages` → 400 `invalid_body`
- [x] GET → 405
(körda mot mock-deployen i #23A; routens validering är oförändrad — verifierad
i PR #34-review)

## §5 Resultat

**GODKÄND.** Kärnresan — öppna, välj nivå, fråga, MDN-grundat streamat svar
med korrekta källchips — fungerar i produktion. Wave 1:s mål är uppnått.

**Avvikelser/rester:**
1. Env-buggen ovan (löst; lärdom till README: "namn ≠ värde").
2. Hela 3×3-matrisen inte körd — 4 av 9 kombinationer + vägran. Resterande
   körs i wave 2:s regression när system-prompterna (#20) landat (de ändrar
   svaren ändå).
3. Enter-beteendet i input (§3) — till Ernest.
4. Hälsningsmodal ("Sätt upp din profil") möter varje ny besökare före
   chatten — gruppbeslut i #33 påverkar demon.
