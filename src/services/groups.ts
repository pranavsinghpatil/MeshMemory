
import { api } from './api';

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
  }[];
  threadsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  createdBy: string;
  messagesCount: number;
  lastActivity: string;
  createdAt: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  avatar?: string;
}

export interface CreateThreadData {
  title: string;
  description?: string;
  initialMessage?: string;
}

export const groupsService = {
  async getGroups(): Promise<Group[]> {
    const response = await api.get('/groups');
    return response.data;
  },

  async createGroup(data: CreateGroupData): Promise<Group> {
    const response = await api.post('/groups', data);
    return response.data;
  },

  async getGroupDetails(groupId: string): Promise<Group> {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  async getThreads(groupId: string): Promise<Thread[]> {
    const response = await api.get(`/groups/${groupId}/threads`);
    return response.data;
  },

  async createThread(groupId: string, data: CreateThreadData): Promise<Thread> {
    const response = await api.post(`/groups/${groupId}/threads`, data);
    return response.data;
  }
};
