import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function saveChunk(params: {
  textChunk: string;
  embedding: number[];
  sourceId: string;
  modelName?: string;
  participantLabel?: string;
}) {
  const { textChunk, embedding, sourceId, modelName, participantLabel } = params;
  
  const { data, error } = await supabase
    .from('chunks')
    .insert({
      text_chunk: textChunk,
      embedding,
      source_id: sourceId,
      model_name: modelName,
      participant_label: participantLabel,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUnassignedChunks() {
  const { data, error } = await supabase
    .from('chunks')
    .select('*')
    .is('thread_id', null);

  if (error) throw error;
  return data;
}

export async function getThreadCentroids() {
  const { data, error } = await supabase
    .from('threads')
    .select('id, centroid_embedding');

  if (error) throw error;
  return data;
}

export async function upsertThread(params: {
  threadId?: string;
  title: string;
  chunkIds: string[];
  centroidEmbedding: number[];
}) {
  const { threadId, title, chunkIds, centroidEmbedding } = params;

  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .upsert({
      id: threadId,
      title,
      centroid_embedding: centroidEmbedding,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (threadError) throw threadError;

  // Update chunks with thread_id
  const { error: chunksError } = await supabase
    .from('chunks')
    .update({ thread_id: thread.id })
    .in('id', chunkIds);

  if (chunksError) throw chunksError;

  return thread;
}

export async function saveMicroThread(params: {
  parentChunkId: string;
  userPrompt: string;
  assistantResponse: string;
  modelUsed: string;
}) {
  const { parentChunkId, userPrompt, assistantResponse, modelUsed } = params;

  const { data, error } = await supabase
    .from('micro_threads')
    .insert({
      parent_chunk_id: parentChunkId,
      user_prompt: userPrompt,
      assistant_response: assistantResponse,
      model_used: modelUsed,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function searchChunksByEmbedding(queryEmbedding: number[], limit = 5) {
  const { data, error } = await supabase
    .rpc('match_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.75,
      match_count: limit,
    });

  if (error) throw error;
  return data;
}