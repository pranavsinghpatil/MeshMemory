
import { api } from './api';

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  attachments?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'hybrid';
  name?: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  sourceChats?: string[]; // IDs of source chats for hybrid chats
}

export interface SendMessageData {
  content: string;
  type?: 'text' | 'file' | 'image';
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

export const chatService = {
  async getChats(): Promise<Chat[]> {
    const response = await api.get('/chats');
    return response.data;
  },

  async createChat(participantIds: string[]): Promise<Chat> {
    const response = await api.post('/chats/new', { 
      title: "New Chat",
      source_type: "manual",
      metadata: {
        participantIds
      }
    });
    return response.data.chat;
  },

  async getChatDetails(chatId: string): Promise<Chat> {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  async getMessages(chatId: string, page = 1, limit = 50): Promise<Message[]> {
    const response = await api.get(`/messages`, {
      params: { source_id: chatId, offset: (page-1)*limit, limit }
    });
    return response.data;
  },

  async sendMessage(chatId: string, data: SendMessageData): Promise<Message> {
    const messageData = {
      source_id: chatId,
      content: data.content,
      participant_label: localStorage.getItem('meshmemory-username') || 'User'
    };
    const response = await api.post(`/messages`, messageData);
    return response.data;
  }
};
