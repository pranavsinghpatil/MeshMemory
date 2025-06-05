-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('chatgpt-link', 'pdf', 'youtube-link', 'text')),
  url text,
  title text,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sources' AND policyname = 'Users can insert own sources'
  ) THEN
    CREATE POLICY "Users can insert own sources"
      ON sources
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sources' AND policyname = 'Users can read own sources'
  ) THEN
    CREATE POLICY "Users can read own sources"
      ON sources
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Chunks table
CREATE TABLE IF NOT EXISTS chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES sources(id),
  text_chunk text NOT NULL,
  embedding vector(1536),
  timestamp timestamptz DEFAULT now(),
  model_name text,
  participant_label text,
  thread_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chunks' AND policyname = 'Users can insert own chunks'
  ) THEN
    CREATE POLICY "Users can insert own chunks"
      ON chunks
      FOR INSERT
      TO authenticated
      WITH CHECK (source_id IN (
        SELECT id FROM sources WHERE user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chunks' AND policyname = 'Users can read own chunks'
  ) THEN
    CREATE POLICY "Users can read own chunks"
      ON chunks
      FOR SELECT
      TO authenticated
      USING (source_id IN (
        SELECT id FROM sources WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS chunks_source_id_idx ON chunks(source_id);
CREATE INDEX IF NOT EXISTS chunks_thread_id_idx ON chunks(thread_id);

-- Threads table
CREATE TABLE IF NOT EXISTS threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  centroid_embedding vector(1536),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'threads' AND policyname = 'Users can insert own threads'
  ) THEN
    CREATE POLICY "Users can insert own threads"
      ON threads
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'threads' AND policyname = 'Users can read own threads'
  ) THEN
    CREATE POLICY "Users can read own threads"
      ON threads
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create vector similarity search index for thread centroids
CREATE INDEX IF NOT EXISTS threads_centroid_idx ON threads
  USING ivfflat (centroid_embedding vector_cosine_ops);

-- Micro-threads table
CREATE TABLE IF NOT EXISTS micro_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_chunk_id uuid REFERENCES chunks(id),
  user_id uuid REFERENCES auth.users(id),
  user_prompt text NOT NULL,
  assistant_response text NOT NULL,
  model_used text NOT NULL,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE micro_threads ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'micro_threads' AND policyname = 'Users can insert own micro_threads'
  ) THEN
    CREATE POLICY "Users can insert own micro_threads"
      ON micro_threads
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'micro_threads' AND policyname = 'Users can read own micro_threads'
  ) THEN
    CREATE POLICY "Users can read own micro_threads"
      ON micro_threads
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS micro_threads_parent_chunk_id_idx ON micro_threads(parent_chunk_id);

-- Models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  api_key_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  config jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'models' AND policyname = 'Users can read models'
  ) THEN
    CREATE POLICY "Users can read models"
      ON models
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Function to match chunks by embedding similarity
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  text_chunk text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chunks.id,
    chunks.text_chunk,
    1 - (chunks.embedding <=> query_embedding) as similarity
  FROM chunks
  WHERE 1 - (chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;