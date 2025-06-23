
import { api } from './api';

export interface UsageStats {
  totalMessages: number;
  totalChats: number;
  totalGroups: number;
  activeUsers: number;
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
}

export interface EngagementMetrics {
  messagesPerDay: { date: string; count: number }[];
  activeUsersPerDay: { date: string; count: number }[];
  topChannels: { name: string; messageCount: number }[];
  responseTime: {
    average: number;
    median: number;
  };
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number;
  daily: { date: string; sentiment: number }[];
  topics: { topic: string; sentiment: number; count: number }[];
}

export const analyticsService = {
  async getUsageStats(): Promise<UsageStats> {
    const response = await api.get('/analytics/usage');
    return response.data;
  },

  async getEngagementMetrics(days = 30): Promise<EngagementMetrics> {
    const response = await api.get('/analytics/engagement', {
      params: { days }
    });
    return response.data;
  },

  async getSentimentAnalysis(days = 30): Promise<SentimentAnalysis> {
    const response = await api.get('/analytics/sentiment', {
      params: { days }
    });
    return response.data;
  }
};
