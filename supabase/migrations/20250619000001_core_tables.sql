/*
  # Core Tables Migration for MeshMemory
  
  This migration creates the core tables for the application:
  - sources: Stores imported content sources
  - chats: Main conversation container (formerly threads)
  - chunks: Stores text chunks/messages with embeddings and artefact info
  - models: Stores AI model configurations
*/

-- Sources table for imported content
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('chatgpt-link', 'pdf', 'youtube-link', 'text')),
  url TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Chats table (formerly threads)
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  centroid_embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_hybrid BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Chunks table for storing text segments/messages with embeddings and artefact info
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  chat_id UUID REFERENCES chats(id),
  text_chunk TEXT NOT NULL,
  embedding VECTOR(1536),
  timestamp TIMESTAMPTZ DEFAULT now(),
  model_name TEXT,
  participant_label TEXT,
  artefact_id UUID,
  artefact_order INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Models table for AI configuration
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  api_key_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  config JSONB DEFAULT '{}'::jsonb
);
