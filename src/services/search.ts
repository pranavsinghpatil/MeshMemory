
import { api } from './api';
import { Message } from './chat';
import { User } from './auth';

export interface SearchFilters {
  query: string;
  dateFrom?: string;
  dateTo?: string;
  participants?: string[];
  channels?: string[];
}

export interface SearchResults {
  messages: (Message & { snippet: string; highlights: string[] })[];
  users: User[];
  groups: { id: string; name: string; description?: string }[];
  total: number;
}

export const searchService = {
  async globalSearch(query: string): Promise<SearchResults> {
    const response = await api.get('/search', {
      params: { q: query }
    });
    return response.data;
  },

  async searchMessages(filters: SearchFilters): Promise<SearchResults['messages']> {
    const response = await api.get('/search/messages', {
      params: filters
    });
    return response.data;
  },

  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get('/search/users', {
      params: { q: query }
    });
    return response.data;
  }
};
