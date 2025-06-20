import { api } from './api';

export interface MergeChatsRequest {
  chatIds: string[];
  title?: string;
}

export interface MergeChatsResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    message_count: number;
    source_chat_count: number;
  };
}

export const mergeChats = async (request: MergeChatsRequest): Promise<MergeChatsResponse> => {
  try {
    const response = await api.post<MergeChatsResponse>('/api/conversations/merge', request);
    return response.data;
  } catch (error) {
    console.error('Failed to merge chats:', error);
    throw new Error('Failed to merge chats. Please try again.');
  }
};
