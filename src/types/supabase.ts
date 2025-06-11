export interface Database {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          user_id: string | null;
          type: 'chatgpt-link' | 'pdf' | 'youtube-link' | 'text';
          url: string | null;
          title: string | null;
          created_at: string | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: 'chatgpt-link' | 'pdf' | 'youtube-link' | 'text';
          url?: string | null;
          title?: string | null;
          created_at?: string | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: 'chatgpt-link' | 'pdf' | 'youtube-link' | 'text';
          url?: string | null;
          title?: string | null;
          created_at?: string | null;
          metadata?: any | null;
        };
      };
      chunks: {
        Row: {
          id: string;
          source_id: string | null;
          text_chunk: string;
          embedding: number[] | null;
          timestamp: string | null;
          model_name: string | null;
          participant_label: string | null;
          thread_id: string | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          source_id?: string | null;
          text_chunk: string;
          embedding?: number[] | null;
          timestamp?: string | null;
          model_name?: string | null;
          participant_label?: string | null;
          thread_id?: string | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          source_id?: string | null;
          text_chunk?: string;
          embedding?: number[] | null;
          timestamp?: string | null;
          model_name?: string | null;
          participant_label?: string | null;
          thread_id?: string | null;
          metadata?: any | null;
        };
      };
      threads: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          centroid_embedding: number[] | null;
          created_at: string | null;
          updated_at: string | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          centroid_embedding?: number[] | null;
          created_at?: string | null;
          updated_at?: string | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          centroid_embedding?: number[] | null;
          created_at?: string | null;
          updated_at?: string | null;
          metadata?: any | null;
        };
      };
      micro_threads: {
        Row: {
          id: string;
          parent_chunk_id: string | null;
          user_id: string | null;
          user_prompt: string;
          assistant_response: string;
          model_used: string;
          created_at: string | null;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          parent_chunk_id?: string | null;
          user_id?: string | null;
          user_prompt: string;
          assistant_response: string;
          model_used: string;
          created_at?: string | null;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          parent_chunk_id?: string | null;
          user_id?: string | null;
          user_prompt?: string;
          assistant_response?: string;
          model_used?: string;
          created_at?: string | null;
          metadata?: any | null;
        };
      };
      models: {
        Row: {
          id: string;
          name: string;
          provider: string;
          api_key_name: string;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          config: any | null;
        };
        Insert: {
          id?: string;
          name: string;
          provider: string;
          api_key_name: string;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          config?: any | null;
        };
        Update: {
          id?: string;
          name?: string;
          provider?: string;
          api_key_name?: string;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          config?: any | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          text_chunk: string;
          similarity: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}