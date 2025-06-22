/*
  # Row Level Security Policies for MeshMemory
  
  This migration enables RLS on all tables and creates appropriate policies
  to ensure users can only access their own data.
*/

-- Enable RLS on all tables
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hybrid_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Sources policies
CREATE POLICY "Users can insert own sources"
  ON sources
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own sources"
  ON sources
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Chats policies
CREATE POLICY "Users can insert own chats"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Chunks policies
CREATE POLICY "Users can insert own chunks"
  ON chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (source_id IN (
    SELECT id FROM sources WHERE user_id = auth.uid()
  ) OR chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can read own chunks"
  ON chunks
  FOR SELECT
  TO authenticated
  USING (source_id IN (
    SELECT id FROM sources WHERE user_id = auth.uid()
  ) OR chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  ));

-- Hybrid chats policies
CREATE POLICY "Users can insert own hybrid_chats"
  ON hybrid_chats
  FOR INSERT
  TO authenticated
  WITH CHECK (merged_by = auth.uid());

CREATE POLICY "Users can read own hybrid_chats"
  ON hybrid_chats
  FOR SELECT
  TO authenticated
  USING (merged_by = auth.uid());

-- Micro-threads policies
CREATE POLICY "Users can insert own micro_threads"
  ON micro_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own micro_threads"
  ON micro_threads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Models policies (all authenticated users can read)
CREATE POLICY "Users can read models"
  ON models
  FOR SELECT
  TO authenticated
  USING (true);

-- User profiles policies
CREATE POLICY "Users can insert own user_profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own user_profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own user_profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can insert own user_settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own user_settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own user_settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
