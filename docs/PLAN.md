# JS Sensei — Projektplan

> Chas u15 · Gruppuppgift: AI-baserad webbapplikation
> Team: Henrik (orchestrator/infra), Yasmin (data/RAG), Fastuo (AI/backend), Ernest (frontend/UX)
> Redovisning: **tors 11 sep** · Slutinlämning: **mån 14 sep 23:59**

## 1. Produkten

**JS Sensei** är en lärarassistent för JavaScript som **förklarar, inte löser**.
Användaren väljer nivå (nybörjare / student / utvecklare), ställer frågor i en
chatt och får streamade svar grundade i MDN:s dokumentation, med källhänvisningar
under varje svar. Röststyrning är stretch goal — inte krav.

**Kärnresa (MVP):** öppna appen → välj nivå → ställ en JS-fråga → få ett
nivåanpassat, MDN-grundat svar med källänkar. Allt annat är sekundärt.

## 2. Arkitektur

```
mdn/content (GitHub-klon)
      │  ingestion-script (körs lokalt, en gång per indexering)
      ▼
Markdown → chunks → embeddings (OpenRouter) → Supabase (pgvector)
                                                    ▲
Browser ──► Next.js /api/chat ── embedding av frågan ┘
   ▲              │ similarity search → kontext → gpt-4o-mini (OpenRouter)
   └── streamat svar + källor ◄┘
```

- **Ingen separat backend.** Next.js API-routes är backenden (serverless på Vercel).
- **Data:** MDN JavaScript Guide + kurerat referensurval (~200–500 sidor) ur
  `mdn/content`-repot. CC-BY-SA — ingen skrapning, licensnotis i README.
- **Databas:** Supabase free tier (Yasmins konto), pgvector.
  Tabell `documents` + funktion `match_documents`. Schema: `docs/db-schema.md`.
- **AI:** allt via gruppens OpenRouter-nyckel.
  - Chat: `openai/gpt-4o-mini` (konfig-variabel `CHAT_MODEL` — A/B-test i wave 2)
  - Embeddings: `openai/text-embedding-3-small`, 1536 dim (endpoint `/api/v1/embeddings`)
- **App:** Next.js App Router + TypeScript + Tailwind + Vercel AI SDK. Deploy: Vercel.
- **Nivåanpassning:** system-prompt per nivå (genomarbetade, versionerade prompts).
  Nivåstyrd retrieval = stretch.

## 3. Beslut (mini-ADR — ändras bara med gruppbeslut)

| # | Beslut | Varför | Konsekvens |
|---|---|---|---|
| 1 | MDN istället för W3Schools-skrapning | Öppen licens, ren Markdown, bättre innehåll | Ingestion-pipeline istf skrapare |
| 2 | OpenRouter för både chat och embeddings | En nyckel, en klient (embeddings-endpoint sedan juli 2026) | — |
| 3 | `text-embedding-3-small`, 1536 dim | Billig, standard | **Låst:** modellbyte kräver omindexering av allt |
| 4 | `gpt-4o-mini` som default-chatmodell | Billig, stabil, bra svenska | Modell som env-variabel för A/B-test |
| 5 | Supabase + pgvector | Gratis, nämns i uppgiften, riktig SQL-erfarenhet | — |
| 6 | Assistenten förklarar, löser inte | Produktidén + starkt redovisningsmaterial | Ska synas i system-prompten och testas |
| 7 | Text-chat är MVP, röst är stretch | 8 dagars tidslinje | Röst planeras tidigast wave 3 |

## 4. Arbetssätt

### Orchestrator-hierarkin
1. Henrik (main orchestrator) skickar **startprompts** till alla → varje person
   startar en **personlig orchestrator** i sitt AI-verktyg.
2. Personliga orchestratorn ger prompts för **en session per issue**.
3. Klar session → **session-handoff** till personliga orchestratorn
   (mall: `docs/handoffs/TEMPLATE-session-handoff.md`).
4. Klar wave → **wave-handoff** till Henrik
   (mall: `docs/handoffs/TEMPLATE-wave-handoff.md`,
   sparas som `docs/handoffs/wave-N-<namn>.md` i en PR).
5. Henrik reconcilar alla handoffs, mergar, löser knutar, öppnar nästa wave.

### Sveprincipen (regel från wave 1, beslutad ons 3/9 efter wave 0-lärdom)

En wave ska gå att **bränna av i ett svep**, oavsett när på dygnet man jobbar:

1. **Wave-open-grind (orchestratorns ansvar):** innan startprompterna skickas
   ska ALLT en person behöver för ALLA sina issues finnas — nycklar delade och
   i Vercel, paket installerade, kontrakt/stubbar mergade på `main`. En wave
   med odelade nycklar eller ommergade beroenden får inte öppnas.
2. **Vertikala spår:** inom en wave får en persons issues bara bero på
   (a) det som låg på `main` när waven öppnade, och (b) personens egna
   tidigare issues. Beroenden MELLAN personer läggs alltid på wave-gränsen —
   aldrig inuti en wave.
3. **Integration sker på wave-gränsen:** orchestratorn mergar, integrerar och
   löser krockar mellan spåren vid reconciliation — inte personerna mitt i.
4. **Reviews blockerar aldrig flödet:** öppna PR:en, pinga en namngiven
   reviewer i gruppkanalen, och **börja direkt på nästa issue** (stacka på
   egen branch om den bygger på din väntande PR — båda PR:arna mot `main`).
   Orchestratorn är fallback-reviewer med en halv dags SLA.

### Git-regler
- Feature-branch per issue → PR mot `main` → **minst en review av annan
  gruppmedlem** → merge. Endast Henrik har direktpush.
- Ingen force-push. Repot är **publikt** — inga hemligheter i kod, issues eller PR:er.
- Filägarskap per issue (står i varje issue) — två parallella sessions rör
  aldrig samma filer.

### Nyckelhantering
- `.env.local` (gitignorad) för alla hemligheter. `.env.example` visar vilka
  variabler som behövs.
- Henrik delar OpenRouter-nyckeln, Yasmin delar Supabase-uppgifterna — **endast
  i den privata gruppchatten**, aldrig i GitHub. Spending-limit satt på OpenRouter.
- Vercel-deployens env-variabler sätts av Henrik i Vercel-dashboarden.

### Test = human-gated självtest
Byggaren testar själv att det blev som tänkt **före** handoff, och beskriver i
handoffens "Så testade jag" exakt vad som kördes (kommando, fråga, resultat).
Från wave 1 finns `docs/smoke-test.md` (3 frågor × 3 nivåer + källkoll) som körs
före varje wave-handoff. En handoff utan konkret bevis räknas som *mergad men
inte bevisad*.

### AI-reflektion (bedömningsguld)
Varje wave-handoff innehåller 2–3 meningar: *vad var svårt/förvånande med
AI-verktyget denna wave?* Henrik sammanställer till README-reflektionen och
redovisningen. 4 personer × 4 waves = 16 stycken färdigt underlag.

## 5. Tidslinje

Avstämningar **mån, ons, fre**. Planen justeras där — inte mellan.

| Wave | Dagar | Fokus | Klart när |
|---|---|---|---|
| **0 Setup** | mån 1/9–tis 2/9 | Scaffold, Supabase-schema, API-kontrakt+mock, spikes (issues #1–#12) | Alla spikes bevisade, Ernest chattar mot mock |
| **1 Kärna** | ons 3/9–tors 4/9 | Ingestion v1, riktig RAG-route, UI mot riktigt API, nivåväljare end-to-end | En riktig fråga får MDN-grundat svar med källor, per nivå |
| **2 Kvalitet** | fre 5/9 + mån 8/9 | Retrieval-tuning, system-prompts per nivå, källvisning polerad, deploy, dokumentation, modell-A/B | Kärnresan funkar på live-URL:en |
| **3 Polish** | tis 9/9–ons 10/9 | Buggfix, README-reflektion, demo-manus, ev. röst. **Ingen ny feature-kod.** | Demon är repeterad mot live-appen |
| — | tors 11/9 | **Muntlig redovisning** | |
| Buffert | fre 12/9–mån 14/9 | README-finish, kodkommentarer, inlämning i Canvas | |

Helgjobb 6–7/9 är frivilligt = bonusbuffert.

## 6. Uppgiftskraven → var de uppfylls

| Krav | Täcks av |
|---|---|
| LLM/AI-teknik med tydlig funktion | RAG-chatten (LLM + embeddings + semantisk sökning) |
| Utvecklad med AI-stöd | 4 verktyg: Claude Code ×2, Codex, Cursor — dokumenterat i handoffs |
| Väldokumenterad/välkommenterad | PR-reviews, docs/, kodkommentarer (wave 2–3) |
| README-reflektion (3 frågor) | Byggs löpande ur wave-handoffs, sammanställs wave 3 |
| VG: avancerade tekniker | RAG, avancerade system-instructions per nivå, modell-A/B, ev. tool-calling/röst |
| VG: avgörande om AI är lämpligt | "Förklara-inte-lösa"-avvägningen + licens/skrapnings-beslutet + reflektion |

## 7. Risker

- **Nyckelläcka i publikt repo** → `.gitignore` före första hemligheten, spending-limit. Läckt nyckel roteras omedelbart.
- **Wave 3 blir kodnings-wave** → main orchestrator säger nej till ny feature-kod efter mån 8/9.
- **Retrieval-kvalitet dålig** → wave 2 har uttrycklig tuning-tid; chunknings-beslut dokumenteras så det går att göra om.
- **Beroende-kedjan mån fm** (scaffold blockerar allt) → Henrik börjar 09:00, övriga har research-uppgifter som inte kräver repot.
