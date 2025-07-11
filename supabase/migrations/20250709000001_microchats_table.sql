/*
  # Microchats with Branching Support for MeshMemory
  
  This migration creates:
  - microchats: Stores focused conversations about specific messages
  - microchat_messages: Stores messages within microchats
  
  Added branching support with:
  - is_branch flag to identify branches
  - parent_message_id to link to the originating message
  - branch_type for template types
  - branch_status for ephemeral/pinned state
*/

-- Microchats table
CREATE TABLE IF NOT EXISTS microchats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_message_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Branching support
  is_branch BOOLEAN DEFAULT FALSE,
  parent_chat_id UUID,
  branch_type TEXT CHECK (branch_type IN ('deep-dive', 'refactor', 'translate', 'summarize', 'custom', NULL)),
  branch_status TEXT CHECK (branch_status IN ('ephemeral', 'pinned')) DEFAULT 'ephemeral',
  promoted_to_message_id UUID,
  
  -- Context and metadata
  title TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Messages within microchats
CREATE TABLE IF NOT EXISTS microchat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  microchat_id UUID REFERENCES microchats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_microchats_parent_message_id ON microchats(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_microchats_user_id ON microchats(user_id);
CREATE INDEX IF NOT EXISTS idx_microchats_parent_chat_id ON microchats(parent_chat_id);
CREATE INDEX IF NOT EXISTS idx_microchats_branch_type ON microchats(branch_type);
CREATE INDEX IF NOT EXISTS idx_microchats_branch_status ON microchats(branch_status);
CREATE INDEX IF NOT EXISTS idx_microchat_messages_microchat_id ON microchat_messages(microchat_id);

-- Add RLS policies
ALTER TABLE microchats ENABLE ROW LEVEL SECURITY;
ALTER TABLE microchat_messages ENABLE ROW LEVEL SECURITY;

-- Users can select, insert, update, and delete their own microchats
CREATE POLICY microchats_select ON microchats
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
  
CREATE POLICY microchats_insert ON microchats
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY microchats_update ON microchats
  FOR UPDATE USING (user_id = auth.uid());
  
CREATE POLICY microchats_delete ON microchats
  FOR DELETE USING (user_id = auth.uid());

-- Users can access messages in microchats they own
CREATE POLICY microchat_messages_select ON microchat_messages
  FOR SELECT USING (
    microchat_id IN (SELECT id FROM microchats WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY microchat_messages_insert ON microchat_messages
  FOR INSERT WITH CHECK (
    microchat_id IN (SELECT id FROM microchats WHERE user_id = auth.uid())
  );
