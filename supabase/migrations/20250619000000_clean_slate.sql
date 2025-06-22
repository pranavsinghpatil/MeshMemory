/*
  # Clean Slate Migration for MeshMemory
  
  This migration drops all existing tables to start fresh.
  Run this as the first migration to ensure a clean database state.
*/

-- Drop all existing tables in reverse order of dependencies
DROP TABLE IF EXISTS hybrid_chats CASCADE;
DROP TABLE IF EXISTS micro_threads CASCADE;
DROP TABLE IF EXISTS chunks CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS models CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- Drop any functions
DROP FUNCTION IF EXISTS match_chunks CASCADE;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
