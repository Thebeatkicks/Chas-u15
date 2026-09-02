# DB-schema — vektorsök (Supabase + pgvector)

> Issue #4. Skapat/körd i Supabase SQL editor (dashboard → SQL Editor),
> inte som migrations-fil i repot — detta är en ren SQL+dokumentations-issue.

## 1. Extension

```sql
create extension if not exists vector;
```

## 2. Tabell `documents`

```sql
create table documents (
  id bigserial primary key,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);
```

- `embedding vector(1536)` — **låst dimension**, se `docs/PLAN.md` §3 beslut 3:
  1536 dim matchar `openai/text-embedding-3-small`. Byt inte modell/dimension
  utan gruppbeslut — det kräver omindexering av alla rader.
- `metadata jsonb` — tänkt för källa/URL/rubrik per chunk (t.ex.
  `{"source": "mdn", "url": "...", "title": "..."}`), sätts av ingestion-scriptet (#6).
- `content text` — chunk-texten som skickas till LLM:en som kontext.

RLS aktiverades på tabellen (Supabase SQL editor flaggade annars att en
publik `documents`-tabell utan RLS skulle vara läsbar av `anon`/`authenticated`
via Data API:t):

```sql
alter table documents enable row level security;
```

Inga policies är satta ännu — det betyder att ingen läsning/skrivning sker
via `anon`/`authenticated`-nycklarna just nu. Ingestion (#6) och
RAG-routen körs server-side med service role-nyckeln, som alltid kringgår
RLS, så detta blockerar inget planerat arbetsflöde. Policies läggs till
i en senare wave om/när klienten behöver läsa direkt via Data API:t.

## 3. Index

```sql
create index on documents
  using hnsw (embedding vector_cosine_ops);
```

- **hnsw** vald istf **ivfflat**: ivfflat behöver ett rimligt antal rader
  (`lists`) satt i förväg för bra recall, och vårt korpus är litet
  (~200–500 MDN-sidor → i storleksordningen låga tusentalet chunks, se
  `docs/mdn-selection.md`). hnsw kräver ingen sådan förhandstuning och ger
  bra recall/prestanda direkt, vilket pgvector själva rekommenderar som
  default för nya projekt.
- Vid detta datavolym-läge (låga tusental rader) hade sekventiell scan utan
  index också dugt prestandamässigt — indexet läggs in nu för att vara
  redo när korpus växer i senare waves, utan att någon behöver komma
  tillbaka och skapa det då.
- Operatorklass `vector_cosine_ops` matchar `<=>`-operatorn (cosine distance)
  som används i `match_documents()` nedan.

## 4. Funktion `match_documents()`

```sql
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 5,
  similarity_threshold float default 0.0
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > similarity_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
```

- Similarity-mått: **cosine distance** (`<=>`), standardvalet med pgvector
  för normaliserade embeddings som `text-embedding-3-small` producerar.
  `similarity = 1 - cosine_distance` så 1.0 = identiska vektorer.
- `similarity_threshold` filtrerar bort svaga träffar innan `limit`, så
  RAG-routen (#kommande issue) kan sätta en tröskel istf att alltid få
  `match_count` träffar även när inget är relevant.

## 5. Självtest

Kördes manuellt i Supabase SQL Editor mot ett projekt med tom `documents`-tabell.

**Insert av en dummy-rad** (konstant, icke-noll 1536-dim vektor — en
nollvektor ger odefinierad cosine-distance eftersom magnituden blir 0):

```sql
insert into documents (content, metadata, embedding)
values (
  'Self-test rad för match_documents',
  '{"source": "manual-test"}'::jsonb,
  (select array_fill(0.1, array[1536])::vector)
)
returning id, content, metadata;
```

**Körning av `match_documents()`** mot samma vektor (ska ge similarity ≈ 1.0
för test-raden):

```sql
select * from match_documents(
  (select array_fill(0.1, array[1536])::vector),
  5,
  0.0
);
```

**Resultat** (kört mot ett nyskapat Supabase-projekt, tomt schema):

Insert:

| id | content | metadata |
|---|---|---|
| 1 | Self-test rad för match_documents | `{"source":"manual-test"}` |

`match_documents()`-anrop:

| id | content | metadata | similarity |
|---|---|---|---|
| 1 | Self-test rad för match_documents | `{"source":"manual-test"}` | 1 |

Similarity = 1 eftersom testet frågar med exakt samma vektor som lagrades
(cosine distance 0 mellan en vektor och sig själv) — bekräftar att
`<=>`-jämförelsen och `match_documents()` fungerar end-to-end. Fullständig
körningslogg finns i session-handoffen för issue #4.

## 6. Nycklar / åtkomst

Inget Supabase-projekt fanns sedan tidigare, så ett nytt projekt (org "JS
Sensei", projekt "js-sensei", region eu-west-1, free tier) skapades som en
del av denna issue. Projekt-URL och nycklar delas endast i gruppens privata
kanal och läggs i `.env.local` (gitignorad) som `SUPABASE_URL` /
`SUPABASE_ANON_KEY` — aldrig i denna fil eller i commits. Referens till
projektet i dokumentation använder platshållaren `<ditt-projekt>.supabase.co`.
