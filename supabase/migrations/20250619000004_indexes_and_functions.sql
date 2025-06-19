/*
  # Indexes and Functions for knitter.app
  
  This migration creates:
  - Performance indexes for all tables
  - Vector similarity search indexes
  - Utility functions for search and matching
*/

-- Create vector similarity search indexes
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks
  USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS chats_centroid_idx ON chats
  USING ivfflat (centroid_embedding vector_cosine_ops);

-- Create regular indexes for performance
CREATE INDEX IF NOT EXISTS chunks_source_id_idx ON chunks(source_id);
CREATE INDEX IF NOT EXISTS chunks_chat_id_idx ON chunks(chat_id);
CREATE INDEX IF NOT EXISTS chunks_artefact_id_idx ON chunks(artefact_id);
CREATE INDEX IF NOT EXISTS chunks_artefact_order_idx ON chunks(artefact_order);
CREATE INDEX IF NOT EXISTS chats_is_hybrid_idx ON chats(is_hybrid);
CREATE INDEX IF NOT EXISTS micro_threads_parent_chunk_id_idx ON micro_threads(parent_chunk_id);
CREATE INDEX IF NOT EXISTS sources_user_id_idx ON sources(user_id);
CREATE INDEX IF NOT EXISTS sources_type_idx ON sources(type);
CREATE INDEX IF NOT EXISTS sources_title_idx ON sources(title);

-- Function to match chunks by embedding similarity
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  text_chunk TEXT,
  similarity FLOAT
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

-- Function to find similar chats based on centroid embedding
CREATE OR REPLACE FUNCTION find_similar_chats(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chats.id,
    chats.title,
    1 - (chats.centroid_embedding <=> query_embedding) as similarity
  FROM chats
  WHERE 
    chats.centroid_embedding IS NOT NULL AND
    1 - (chats.centroid_embedding <=> query_embedding) > match_threshold
  ORDER BY chats.centroid_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
