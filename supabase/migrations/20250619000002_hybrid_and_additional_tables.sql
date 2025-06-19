/*
  # Hybrid and Additional Tables Migration for knitter.app
  
  This migration creates:
  - hybrid_chats: Tracks hybrid chat merges
  - micro_threads: Handles follow-up discussions
  - user_profiles: Stores extended user information
  - user_settings: Stores user preferences
*/

-- Hybrid chats table to track merges
CREATE TABLE IF NOT EXISTS hybrid_chats (
  id UUID PRIMARY KEY REFERENCES chats(id),
  merged_from JSONB NOT NULL, -- Array of source chat UUIDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  merged_by UUID REFERENCES auth.users(id)
);

-- Micro-threads for follow-up discussions
CREATE TABLE IF NOT EXISTS micro_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_chunk_id UUID REFERENCES chunks(id),
  user_id UUID REFERENCES auth.users(id),
  user_prompt TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- User profiles for extended information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User settings for preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  settings JSONB DEFAULT '{}'::jsonb
);
