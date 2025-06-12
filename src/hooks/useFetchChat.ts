import { useState, useEffect } from 'react';
import { conversationsAPI } from '../lib/api';

export function useFetchChat(chatId: string | undefined) {
  const [chat, setChat] = useState<any>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    const fetchChat = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const conversation = await conversationsAPI.getConversation(chatId);
        
        setChat({
          id: conversation.sourceId,
          title: conversation.title,
          type: conversation.sourceType,
          created_at: new Date().toISOString(),
          metadata: conversation.metadata
        });
        
        // Process chunks
        const processedChunks = conversation.chunks.map((chunk: any) => ({
          id: chunk.id,
          text_chunk: chunk.text,
          participant_label: chunk.participantLabel,
          timestamp: chunk.timestamp,
          model_name: chunk.modelName,
          microThreads: chunk.microThreads || []
        }));
        
        setChunks(processedChunks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat:', error);
        setError('Failed to load conversation');
        setLoading(false);
      }
    };
    
    fetchChat();
  }, [chatId]);

  return { chat, chunks, loading, error, refetch: () => {} };
}