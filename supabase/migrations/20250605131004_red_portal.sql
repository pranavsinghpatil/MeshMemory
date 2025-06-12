/*
  # Initial Schema Setup for knitter.app

  1. New Tables
    - `chunks`: Stores text chunks with embeddings
    - `threads`: Manages conversation threads
    - `micro_threads`: Handles follow-up discussions
    - `sources`: Tracks imported content sources
    - `models`: Stores AI model configurations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Sources table to track imported content
CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('chatgpt-link', 'pdf', 'youtube-link', 'text')),
  url TEXT,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Chunks table for storing text segments with embeddings
CREATE TABLE IF NOT EXISTS chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES sources(id),
  text_chunk TEXT NOT NULL,
  embedding vector(1536),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  model_name TEXT,
  participant_label TEXT,
  thread_id uuid,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Threads table for conversation management
CREATE TABLE IF NOT EXISTS threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title TEXT NOT NULL,
  centroid_embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Micro-threads for follow-up discussions
CREATE TABLE IF NOT EXISTS micro_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_chunk_id uuid REFERENCES chunks(id),
  user_id uuid REFERENCES auth.users(id),
  user_prompt TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- AI Models configuration
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  api_key_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  config JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own sources"
  ON sources FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sources"
  ON sources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own chunks"
  ON chunks FOR SELECT
  TO authenticated
  USING (
    source_id IN (
      SELECT id FROM sources WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own chunks"
  ON chunks FOR INSERT
  TO authenticated
  WITH CHECK (
    source_id IN (
      SELECT id FROM sources WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own threads"
  ON threads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads"
  ON threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own micro_threads"
  ON micro_threads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own micro_threads"
  ON micro_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read models"
  ON models FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS threads_centroid_idx ON threads USING ivfflat (centroid_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS chunks_thread_id_idx ON chunks(thread_id);
CREATE INDEX IF NOT EXISTS chunks_source_id_idx ON chunks(source_id);
CREATE INDEX IF NOT EXISTS micro_threads_parent_chunk_id_idx ON micro_threads(parent_chunk_id);