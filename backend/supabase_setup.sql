-- ============================================================
-- Supabase Dashboard > SQL Editor'da bir kez çalıştırın
-- ============================================================

-- 1. pgvector eklentisini etkinleştir
create extension if not exists vector;

-- 2. Vektör chunk tablosu (all-MiniLM-L6-L2 → 384 boyut)
create table if not exists document_embeddings (
  id        bigserial primary key,
  content   text        not null,
  metadata  jsonb       default '{}',
  embedding vector(384)
);

-- 3. Benzerlik arama fonksiyonu (LangChain SupabaseVectorStore tarafından çağrılır)
create or replace function match_document_embeddings(
  query_embedding vector(384),
  match_count     int     default 4,
  filter          jsonb   default '{}'
)
returns table (
  id         bigint,
  content    text,
  metadata   jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) as similarity
  from document_embeddings
  where metadata @> filter
  order by document_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 4. IVFFlat index (vektör aramasını hızlandırır; en az ~1000 satır varsa etkili olur)
create index if not exists document_embeddings_embedding_idx
  on document_embeddings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
