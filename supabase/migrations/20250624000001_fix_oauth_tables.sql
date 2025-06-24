-- Fix OAuth-related functions and schema issues
-- This migration addresses issues with the auth triggers and user management

-- Drop existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Fix the auth.users sync function to properly handle OAuth providers
CREATE OR REPLACE FUNCTION sync_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    avatar_url, 
    provider, 
    provider_id,
    created_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    CASE 
      WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN NEW.raw_user_meta_data->>'sub'
      WHEN NEW.raw_app_meta_data->>'provider' = 'github' THEN NEW.raw_user_meta_data->>'sub'
      ELSE NULL
    END,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN EXCLUDED.full_name IS NOT NULL THEN EXCLUDED.full_name
      ELSE public.users.full_name
    END,
    avatar_url = CASE 
      WHEN EXCLUDED.avatar_url IS NOT NULL THEN EXCLUDED.avatar_url
      ELSE public.users.avatar_url
    END,
    provider = EXCLUDED.provider,
    provider_id = CASE 
      WHEN EXCLUDED.provider_id IS NOT NULL THEN EXCLUDED.provider_id
      ELSE public.users.provider_id
    END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_auth_user();

-- Add more comprehensive indexes
CREATE INDEX IF NOT EXISTS idx_users_provider ON public.users(provider);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Add helpful function to handle authentication checks
CREATE OR REPLACE FUNCTION is_valid_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;
