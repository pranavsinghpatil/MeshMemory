/*
  # Migration: Add import_batch_id to chunks table for grouped import tracking
*/

ALTER TABLE chunks
ADD COLUMN IF NOT EXISTS import_batch_id UUID;

CREATE INDEX IF NOT EXISTS chunks_import_batch_id_idx ON chunks(import_batch_id);
