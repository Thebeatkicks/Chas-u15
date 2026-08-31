# Session-handoff — issue #2

**Issue:** #2 — Vercel-projekt + första deploy
**Branch/PR:** direktpush till `main` (89d09cb) — tillåtet för denna issue
**Status:** klar

## Vad ändrades

- Vercel-projektet `thebeatkicks-projects/chas-u15` fanns redan (skapat/länkat
  till GitHub-repot och env-variabler tidigare samma dag) — sessionen
  verifierade och band ihop resten:
  - `vercel link --yes --scope thebeatkicks-projects --project chas-u15` →
    lokal `.vercel/project.json` skapad.
  - `vercel git connect` bekräftade: `Thebeatkicks/Chas-u15 is already
    connected to your project`.
  - `vercel env ls` bekräftade alla fem variabler satta i Production +
    Preview: `OPENROUTER_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
    `CHAT_MODEL`, `EMBEDDING_MODEL`. Endast namn kontrollerades, inga värden
    sågs eller hanterades i sessionen.
- `README.md`: nytt `## Deploy`-avsnitt med live-URL, committat och pushat
  som bevis-commit för auto-deploy (`89d09cb`).
- Ingen app-kod rörd, inga domäner, inga nya integrationer.

## Så testade jag

**1. Lokalt bygge innan något annat:**

```
$ pnpm build
▲ Next.js 16.3.3 (Turbopack)
✓ Compiled successfully in 684ms
✓ Generating static pages using 5 workers (4/4) in 615ms
Route (app)
┌ ○ /
└ ○ /_not-found
```

**2. Auto-deploy bevisad live** — pushade en trivial README-ändring och
pollade `vercel ls`:

```
$ git push origin main   # 89d09cb
--- poll 1 (5s) ---
chas-u15-8jkkayrjt...   ● Building   Production
--- poll 3 (21s) ---
chas-u15-8jkkayrjt...   ● Ready     Production   16s
```

Byggd och publicerad automatiskt ~16s efter push, ingen manuell `vercel
deploy` kördes.

**3. Live-URL svarar 200:**

```
$ curl -sI https://chas-u15.vercel.app
HTTP/1.1 200 OK
...
Server: Vercel
Etag: "8d14dda3c3ee2b29547e167d9a23d19e"   # ny etag = ny build, inte cachead gammal sida
```

**4. Env-variabler listade (namn, inte värden):**

```
$ vercel env ls
 name                       value               environments
 OPENROUTER_API_KEY         Encrypted           Production, Preview
 CHAT_MODEL                 Encrypted           Production, Preview
 EMBEDDING_MODEL            Encrypted           Production, Preview
 SUPABASE_URL               Encrypted           Production, Preview
 SUPABASE_ANON_KEY          Encrypted           Production, Preview
```

**5. Spending-limit på OpenRouter-nyckeln:** bekräftat muntligt av Henrik —
satt innan denna handoff skrevs. Sessionen satte den inte själv.

## Inte klart / avvikelser

- Ingen egen `vercel.json`/`vercel.ts` behövdes — Next.js-scaffolden
  auto-detekteras av Vercel utan konfig. Skapas först om ett faktiskt behov
  (redirects, headers, crons) dyker upp senare.
- Live-sidan visar fortfarande default `create-next-app`-innehållet — väntat,
  ingen app-kod ägs av denna issue.
- Vercel CLI var redan installerad globalt (v54.14.2, uppdatering till
  v59.5.0 finns men inte kritisk) och redan inloggad som `thebeatkicks` —
  steg 2 i sessionsprompten ("installera + logga in") var redan klart innan
  sessionen startade.

## Överraskningar

- Projektet, GitHub-kopplingen och alla fem env-variablerna fanns redan när
  sessionen började (skapade ~1h tidigare, sannolikt av Henrik direkt i
  Vercel-dashboarden enligt PLAN.md §4 "Nyckelhantering"). Sessionens jobb
  blev mest att **verifiera och bevisa**, inte att bygga upp från noll —
  värt att veta för nästa liknande issue: kolla alltid `vercel projects ls`
  och `vercel git connect` (idempotent, säger bara "already connected" om
  redan klart) innan man antar att ett Vercel-projekt måste skapas.
- `main`-skyddet (känt från #1) bekräftades igen: pushen gick igenom med
  admin-bypass men varnade `remote: Changes must be made through a pull
  request` — samma förväntade beteende som STATE.md redan noterat.

## Nästa session bör börja med

Issue #3 — wave1-issues + projektbräda (gh auth-utökning väntar sen tidigare).
