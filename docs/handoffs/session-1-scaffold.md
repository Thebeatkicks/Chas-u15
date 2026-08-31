# Session-handoff — issue #1

**Issue:** #1 — Init repo, Next.js-scaffold, .gitignore + .env.example
**Branch/PR:** direktpush till `main` (be9c0d4) — tillåtet för exakt denna issue
**Status:** klar

## Vad ändrades

- `create-next-app` 16.3.3 scaffoldad i tom tempmapp och inflyttad i repo-roten:
  App Router, TypeScript, Tailwind 4, ESLint, pnpm, import-alias `@/*`.
- **Ingen `src/`-katalog** — `app/`, `components/`, `lib/` ligger i roten, så
  filägarskapen i wave 0-prompterna (`app/**`, `app/api/chat/**`, `lib/ai/**`)
  stämmer utan omskrivning.
- Nya filer: `app/`, `public/`, `package.json`, `pnpm-lock.yaml`,
  `pnpm-workspace.yaml`, `next.config.ts`, `tsconfig.json`,
  `postcss.config.mjs`, `eslint.config.mjs`, `AGENTS.md`, `CLAUDE.md`.
- `.gitignore`: scaffoldens regler inflätade i den befintliga. `.env` + `.env.*`
  fortsatt blockerade, `!.env.example` behållet (scaffoldens egen `.gitignore`
  ignorerar `.env*` **utan** undantag — den hade tystat vår mall).
  La även till `.claude/settings.local.json`.
- `.gitattributes` (ny, inte i issuen): `* text=auto eol=lf` så Windows/macOS
  inte ger CRLF-diffbrus när fyra personer skriver i samma filer.
- Orörda: `README.md`, `docs/`, `STATE.md`, `state.json`, `.env.example`.
- Inga extra beroenden utöver scaffolden.

## Så testade jag

**1. Hemligheter kan inte läcka** (i repo-roten):

```
$ git check-ignore -v .env.local
.gitignore:3:.env.*     .env.local
$ git check-ignore -v .env.example
$ echo $?
1                       # = inte ignorerad, mallen committas fortfarande
```

`git status --short` före commit listade varken `.env*`, `node_modules/`,
`.next/` eller `.claude/`.

**2. Bygge och lint i repo-roten:**

```
$ pnpm build
▲ Next.js 16.3.3 (Turbopack)
✓ Compiled successfully in 3.0s
  Finished TypeScript in 5.9s
✓ Generating static pages using 5 workers (4/4) in 755ms
Route (app)
┌ ○ /
└ ○ /_not-found

$ pnpm lint
> eslint
                        # inga fel
```

**3. Bevis — rent klon från GitHub till tom tempmapp:**

```
$ git clone https://github.com/Thebeatkicks/Chas-u15.git clean-clone
Cloning into 'clean-clone'...

$ pnpm install
+ next 16.3.3
+ react 19.2.8
+ react-dom 19.2.8
[...]
Done in 14.9s using pnpm v10.12.2

$ pnpm dev --port 3100
> js-sensei@0.1.0 dev
> next dev "--port" "3100"

▲ Next.js 16.3.3 (Turbopack)
- Local:         http://localhost:3100
✓ Ready in 495ms
✓ Running next.config.ts took 80ms

 GET / 200 in 2.1s (next.js: 1903ms, application-code: 178ms)

$ curl -o /dev/null -w "HTTP %{http_code} - %{size_download} bytes\n" http://localhost:3100
HTTP 200 - 16713 bytes

$ git status --short
                        # tomt — ren tree även efter next dev
```

Startsidan renderades även visuellt i webbläsaren mot `localhost:3000`
(Next.js-standardsidan "To get started, edit the `page.tsx` file").

## Inte klart / avvikelser

- **`main` är skyddad med en PR-regel.** Pushen gick igenom men remoten
  svarade `remote: - Changes must be made through a pull request.` — Henrik
  har bypass som admin, övriga får det som ett hårt stopp. Det är i linje
  med git-reglerna i PLAN.md, men gruppen måste veta det: **alla andra
  måste gå via PR**, inte bara "bör".
- `.gitattributes` fanns inte i issuen — se ovan.
- Ingen chat-UI, inga API-routes, ingen Supabase-koppling (ägs av #7–#12).

## Överraskningar

- Next.js 16 skriver själv `AGENTS.md` (+ `CLAUDE.md` som bara innehåller
  `@AGENTS.md`) vid `next dev` och återskapar blocket om det tas bort. Båda
  är därför committade — annars får varje session en smutsig working tree.
  Blocket säger åt AI-verktyg att läsa `node_modules/next/dist/docs/` innan
  de skriver Next-kod, vilket är precis vad vi vill i wave 1.
- `next-env.d.ts` ignoreras numera av scaffolden själv (genereras vid bygge)
  — den ska alltså **inte** committas.
- `create-next-app` har inget `--turbopack`-flagga längre; Turbopack är
  default i 16. `--rspack` finns som alternativ — rör inte.
- Versioner som resten av gruppen bygger mot: Next 16.3.3, React 19.2.8,
  Tailwind 4.3.3, TypeScript 5.9.3, pnpm 10.12.2, Node 24.13.1.

## Nästa session bör börja med

Issue #2 — koppla repot till Vercel och få en grön deploy av samma scaffold,
sedan #3 (wave 1-issues + bräda); parallellt är repot öppet för kloning för
Yasmin, Fastuo och Ernest.
