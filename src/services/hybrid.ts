import { api } from './api';

// Import chat text via copy-paste source
export const importChatText = async (content: string, title?: string): Promise<string> => {
  try {
    const response = await api.post('/import', {
      type: 'copy_paste',
      content,
      title,
    });
    return response.data.chatId;
  } catch (error) {
    console.error('Error importing chat text:', error);
    throw new Error('Failed to import chat text');
  }
};

export const importChatFromUrl = async (url: string, title?: string): Promise<string> => {
  try {
    const response = await api.post('/import', {
      type: 'url',
      url,
      title,
    });
    return response.data.chatId;
  } catch (error) {
    console.error('Error importing chat from URL:', error);
    throw new Error('Failed to import chat from URL');
  }
};

export const importChatFromFile = async (file: File, title?: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'file');
    if (title) formData.append('title', title);
    
    const response = await api.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.chatId;
  } catch (error) {
    console.error('Error importing chat from file:', error);
    throw new Error('Failed to import chat from file');
  }
};

export interface HybridCreatePayload {
  title: string;
  chatIds: string[];
}

// Create hybrid chat
export const createHybridChat = async (payload: HybridCreatePayload) => {
  try {
    const response = await api.post('/chats/merge', {
      title: payload.title,
      source_chat_ids: payload.chatIds,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating hybrid chat:', error);
    throw new Error('Failed to create hybrid chat');
  }
};
