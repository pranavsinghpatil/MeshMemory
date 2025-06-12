/*
  # Enhanced knitter.app Database Schema

  1. New Tables
    - user_profiles: Extended user information
    - conversation_summaries: Cached conversation summaries
    - search_history: Track user search patterns
    - chunk_relationships: Understand chunk relationships
    - thread_tags: Tagging system for threads
    - shared_threads: Thread sharing functionality
    - export_jobs: Track export operations

  2. Enhanced Features
    - Full-text search capabilities
    - Enhanced search function with filters
    - Analytics functions
    - Auto-tagging suggestions
    - Performance indexes

  3. Security
    - RLS policies for all new tables
    - Proper user data isolation
*/

-- User profiles for extended information
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  display_name text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  onboarding_completed boolean DEFAULT false,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversation summaries cache
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES sources(id) UNIQUE,
  summary text NOT NULL,
  key_topics text[],
  participant_count integer DEFAULT 0,
  message_count integer DEFAULT 0,
  generated_at timestamptz DEFAULT now(),
  model_used text,
  confidence_score float
);

-- Search history for analytics and suggestions
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  query text NOT NULL,
  results_count integer DEFAULT 0,
  clicked_result_ids uuid[],
  search_filters jsonb DEFAULT '{}'::jsonb,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Chunk relationships for better context understanding
CREATE TABLE IF NOT EXISTS chunk_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_chunk_id uuid REFERENCES chunks(id),
  target_chunk_id uuid REFERENCES chunks(id),
  relationship_type text NOT NULL CHECK (relationship_type IN ('follows', 'references', 'contradicts', 'elaborates', 'similar')),
  confidence_score float DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_chunk_id, target_chunk_id, relationship_type)
);

-- Thread tagging system
CREATE TABLE IF NOT EXISTS thread_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES threads(id),
  tag_name text NOT NULL,
  tag_color text DEFAULT '#3B82F6',
  auto_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(thread_id, tag_name)
);

-- Shared threads functionality
CREATE TABLE IF NOT EXISTS shared_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES threads(id),
  shared_by uuid REFERENCES auth.users(id),
  share_token text UNIQUE NOT NULL,
  is_public boolean DEFAULT false,
  password_hash text,
  expires_at timestamptz,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Export jobs tracking
CREATE TABLE IF NOT EXISTS export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  export_type text NOT NULL CHECK (export_type IN ('pdf', 'markdown', 'json', 'csv')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url text,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunk_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for conversation_summaries
CREATE POLICY "Users can read summaries for own sources"
  ON conversation_summaries FOR SELECT
  TO authenticated
  USING (source_id IN (
    SELECT id FROM sources WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert summaries for own sources"
  ON conversation_summaries FOR INSERT
  TO authenticated
  WITH CHECK (source_id IN (
    SELECT id FROM sources WHERE user_id = auth.uid()
  ));

-- RLS Policies for search_history
CREATE POLICY "Users can read own search history"
  ON search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON search_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chunk_relationships
CREATE POLICY "Users can read relationships for own chunks"
  ON chunk_relationships FOR SELECT
  TO authenticated
  USING (source_chunk_id IN (
    SELECT c.id FROM chunks c
    JOIN sources s ON c.source_id = s.id
    WHERE s.user_id = auth.uid()
  ));

-- RLS Policies for thread_tags
CREATE POLICY "Users can manage tags for own threads"
  ON thread_tags FOR ALL
  TO authenticated
  USING (thread_id IN (
    SELECT id FROM threads WHERE user_id = auth.uid()
  ));

-- RLS Policies for shared_threads
CREATE POLICY "Users can manage own shared threads"
  ON shared_threads FOR ALL
  TO authenticated
  USING (shared_by = auth.uid());

CREATE POLICY "Anyone can read public shared threads"
  ON shared_threads FOR SELECT
  TO anon, authenticated
  USING (is_public = true AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for export_jobs
CREATE POLICY "Users can manage own export jobs"
  ON export_jobs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Add full-text search to chunks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chunks' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE chunks ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_chunks_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.text_chunk, '') || ' ' ||
    COALESCE(NEW.participant_label, '') || ' ' ||
    COALESCE(NEW.model_name, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS chunks_search_vector_update ON chunks;
CREATE TRIGGER chunks_search_vector_update
  BEFORE INSERT OR UPDATE ON chunks
  FOR EACH ROW EXECUTE FUNCTION update_chunks_search_vector();

-- Update existing chunks with search vectors
UPDATE chunks SET search_vector = to_tsvector('english', 
  COALESCE(text_chunk, '') || ' ' ||
  COALESCE(participant_label, '') || ' ' ||
  COALESCE(model_name, '')
) WHERE search_vector IS NULL;

-- Enhanced search function with filters (fixed timestamp issue)
CREATE OR REPLACE FUNCTION enhanced_search_chunks(
  query_text text DEFAULT NULL,
  query_embedding vector(1536) DEFAULT NULL,
  user_id_filter uuid DEFAULT NULL,
  source_types text[] DEFAULT NULL,
  date_from timestamptz DEFAULT NULL,
  date_to timestamptz DEFAULT NULL,
  participant_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  text_chunk text,
  similarity float,
  text_rank float,
  combined_score float,
  source_id uuid,
  source_title text,
  source_type text,
  participant_label text,
  chunk_timestamp timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.text_chunk,
    CASE 
      WHEN query_embedding IS NOT NULL THEN 1 - (c.embedding <=> query_embedding)
      ELSE 0.0
    END as similarity,
    CASE 
      WHEN query_text IS NOT NULL THEN ts_rank(c.search_vector, plainto_tsquery('english', query_text))
      ELSE 0.0
    END as text_rank,
    CASE 
      WHEN query_embedding IS NOT NULL AND query_text IS NOT NULL THEN
        (1 - (c.embedding <=> query_embedding)) * 0.7 + ts_rank(c.search_vector, plainto_tsquery('english', query_text)) * 0.3
      WHEN query_embedding IS NOT NULL THEN
        1 - (c.embedding <=> query_embedding)
      WHEN query_text IS NOT NULL THEN
        ts_rank(c.search_vector, plainto_tsquery('english', query_text))
      ELSE 0.0
    END as combined_score,
    c.source_id,
    s.title as source_title,
    s.type as source_type,
    c.participant_label,
    c."timestamp" as chunk_timestamp
  FROM chunks c
  JOIN sources s ON c.source_id = s.id
  WHERE 
    (user_id_filter IS NULL OR s.user_id = user_id_filter)
    AND (source_types IS NULL OR s.type = ANY(source_types))
    AND (date_from IS NULL OR c."timestamp" >= date_from)
    AND (date_to IS NULL OR c."timestamp" <= date_to)
    AND (participant_filter IS NULL OR c.participant_label ILIKE '%' || participant_filter || '%')
    AND (
      (query_embedding IS NOT NULL AND 1 - (c.embedding <=> query_embedding) > match_threshold)
      OR (query_text IS NOT NULL AND c.search_vector @@ plainto_tsquery('english', query_text))
    )
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- Function to get conversation analytics
CREATE OR REPLACE FUNCTION get_conversation_analytics(user_id_param uuid)
RETURNS TABLE (
  total_sources bigint,
  total_chunks bigint,
  total_threads bigint,
  total_micro_threads bigint,
  avg_chunks_per_source numeric,
  most_active_day text,
  top_participants text[],
  conversation_growth jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM sources WHERE user_id = user_id_param) as total_sources,
    (SELECT COUNT(*) FROM chunks c JOIN sources s ON c.source_id = s.id WHERE s.user_id = user_id_param) as total_chunks,
    (SELECT COUNT(*) FROM threads WHERE user_id = user_id_param) as total_threads,
    (SELECT COUNT(*) FROM micro_threads WHERE user_id = user_id_param) as total_micro_threads,
    (SELECT ROUND(AVG(chunk_count), 2) FROM (
      SELECT COUNT(c.id) as chunk_count 
      FROM sources s 
      LEFT JOIN chunks c ON s.id = c.source_id 
      WHERE s.user_id = user_id_param 
      GROUP BY s.id
    ) subq) as avg_chunks_per_source,
    (SELECT EXTRACT(DOW FROM c."timestamp")::text FROM chunks c 
     JOIN sources s ON c.source_id = s.id 
     WHERE s.user_id = user_id_param 
     GROUP BY EXTRACT(DOW FROM c."timestamp") 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as most_active_day,
    (SELECT ARRAY_AGG(participant_label ORDER BY chunk_count DESC) 
     FROM (
       SELECT participant_label, COUNT(*) as chunk_count 
       FROM chunks c 
       JOIN sources s ON c.source_id = s.id 
       WHERE s.user_id = user_id_param AND participant_label IS NOT NULL
       GROUP BY participant_label 
       ORDER BY chunk_count DESC 
       LIMIT 5
     ) subq) as top_participants,
    (SELECT jsonb_build_object(
      'last_30_days', COUNT(*),
      'last_7_days', COUNT(*) FILTER (WHERE c."timestamp" > now() - interval '7 days'),
      'today', COUNT(*) FILTER (WHERE c."timestamp" > now() - interval '1 day')
    ) FROM chunks c 
     JOIN sources s ON c.source_id = s.id 
     WHERE s.user_id = user_id_param AND c."timestamp" > now() - interval '30 days') as conversation_growth;
END;
$$;

-- Function to suggest tags for threads
CREATE OR REPLACE FUNCTION suggest_thread_tags(thread_id_param uuid)
RETURNS TABLE (
  suggested_tag text,
  confidence float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH chunk_text AS (
    SELECT string_agg(text_chunk, ' ') as full_text
    FROM chunks 
    WHERE thread_id = thread_id_param
  ),
  keywords AS (
    SELECT word, nentry as frequency
    FROM ts_stat('SELECT to_tsvector(''english'', full_text) FROM chunk_text')
    WHERE length(word) > 3 AND nentry > 1
    ORDER BY nentry DESC
    LIMIT 10
  )
  SELECT 
    word as suggested_tag,
    LEAST(frequency::float / 10.0, 1.0) as confidence
  FROM keywords;
END;
$$;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS chunks_search_vector_idx ON chunks USING gin(search_vector);
CREATE INDEX IF NOT EXISTS chunks_timestamp_idx ON chunks("timestamp");
CREATE INDEX IF NOT EXISTS sources_type_idx ON sources(type);
CREATE INDEX IF NOT EXISTS sources_created_at_idx ON sources(created_at);
CREATE INDEX IF NOT EXISTS conversation_summaries_source_id_idx ON conversation_summaries(source_id);
CREATE INDEX IF NOT EXISTS search_history_user_id_created_at_idx ON search_history(user_id, created_at);
CREATE INDEX IF NOT EXISTS chunk_relationships_source_chunk_idx ON chunk_relationships(source_chunk_id);
CREATE INDEX IF NOT EXISTS thread_tags_thread_id_idx ON thread_tags(thread_id);
CREATE INDEX IF NOT EXISTS shared_threads_share_token_idx ON shared_threads(share_token);
CREATE INDEX IF NOT EXISTS export_jobs_user_id_status_idx ON export_jobs(user_id, status);

-- Add audit columns to existing tables
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sources' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE sources ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chunks' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE chunks ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'micro_threads' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE micro_threads ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers
DROP TRIGGER IF EXISTS update_sources_updated_at ON sources;
CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chunks_updated_at ON chunks;
CREATE TRIGGER update_chunks_updated_at
  BEFORE UPDATE ON chunks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_micro_threads_updated_at ON micro_threads;
CREATE TRIGGER update_micro_threads_updated_at
  BEFORE UPDATE ON micro_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();