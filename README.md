# JS Sensei

En lärarassistent för JavaScript som **förklarar, inte löser**. Välj nivå
(nybörjare / student / utvecklare), ställ en fråga och få ett streamat svar
grundat i MDN:s dokumentation — med källhänvisningar.

> Chas u15 — Gruppuppgift: AI-baserad webbapplikation.
> Team: Henrik (orchestrator/infra) · Yasmin (data/RAG) · Fastuo (AI/backend) · Ernest (frontend/UX)

## Teknik

- **Next.js (App Router)** + TypeScript + Tailwind, deploy på Vercel
- **Vercel AI SDK** — chat, streaming
- **OpenRouter** — `openai/gpt-4o-mini` (chat) + `openai/text-embedding-3-small` (embeddings)
- **Supabase + pgvector** — vektorlagring och semantisk sökning (RAG)
- **Data:** [MDN Web Docs](https://github.com/mdn/content) (CC-BY-SA 2.5) — kurerat urval av JavaScript-dokumentationen

## Kom igång

```bash
pnpm install
cp .env.example .env.local   # fyll i nycklar (delas i gruppens privata kanal)
pnpm dev
```

## Projektstruktur och arbetssätt

Planen, arkitekturen och alla beslut finns i [docs/PLAN.md](docs/PLAN.md).
Läget just nu indexeras i [STATE.md](STATE.md). Arbetet sker i 2-dagars *waves*
med issues per person och handoffs i [docs/handoffs/](docs/handoffs/).

## Reflektion (uppgiftens frågor)

> Fylls på löpande ur wave-handoffs och färdigställs i wave 3.

### Vilken ny AI-teknik/bibliotek identifierade vi och hur tillämpade vi det?

*TODO — RAG med embeddings (OpenRouter + pgvector), Vercel AI SDK, streamad chat,
nivåstyrda system-prompts. Konkreta erfarenheter fylls i från handoffs.*

### Varför valde vi den AI-tekniken/det biblioteket?

*TODO — bl.a. beslut 1–5 i docs/PLAN.md §3 (MDN istället för skrapning,
OpenRouter som enda leverantör, pgvector).*

### Varför behövdes AI-komponenten? Kunde vi löst det på annat sätt?

*TODO — jämförelse med nyckelordssökning/FAQ; varför nivåanpassad förklaring
kräver en LLM; var AI *inte* var rätt verktyg.*

### Vad var svårt? (till redovisningen)

*TODO — sammanställs ur AI-reflektionerna i wave-handoffs.*

## Licens och attribution

Kunskapsinnehållet kommer från [MDN Web Docs](https://developer.mozilla.org/)
av Mozilla Contributors, licensierat under
[CC-BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/).
