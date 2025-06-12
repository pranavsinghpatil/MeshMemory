-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  theme text DEFAULT 'system',
  notifications_enabled boolean DEFAULT true,
  api_keys text, -- Encrypted JSON string
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  model_used text NOT NULL,
  prompt_tokens integer NOT NULL,
  completion_tokens integer NOT NULL,
  total_tokens integer NOT NULL,
  latency_ms integer NOT NULL,
  success boolean NOT NULL,
  error_message text,
  timestamp timestamptz DEFAULT now()
);

-- Create thread_changelog table
CREATE TABLE IF NOT EXISTS thread_changelog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES threads(id),
  change_type text NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'merge', 'split')),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Add RLS policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add RLS policies for usage_logs
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage logs"
  ON usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add RLS policies for thread_changelog
ALTER TABLE thread_changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read changelog for own threads"
  ON thread_changelog
  FOR SELECT
  TO authenticated
  USING (thread_id IN (
    SELECT id FROM threads WHERE user_id = auth.uid()
  ));

-- Add merge/split endpoints to threads table
ALTER TABLE threads ADD COLUMN IF NOT EXISTS parent_thread_id uuid REFERENCES threads(id);
ALTER TABLE threads ADD COLUMN IF NOT EXISTS split_from_thread_id uuid REFERENCES threads(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS usage_logs_timestamp_idx ON usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS thread_changelog_thread_id_idx ON thread_changelog(thread_id);
CREATE INDEX IF NOT EXISTS thread_changelog_timestamp_idx ON thread_changelog(timestamp);
CREATE INDEX IF NOT EXISTS threads_parent_thread_id_idx ON threads(parent_thread_id);
CREATE INDEX IF NOT EXISTS threads_split_from_thread_id_idx ON threads(split_from_thread_id);