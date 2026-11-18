import { request } from './api-client';
import type { ConversationMessage, ConversationSession } from '@/types/dify/log';

export type ConversationsListResponse = {
  data: ConversationSession[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
};

export const LogsService = {
  async listConversations(appId: string, page = 1, limit = 20): Promise<ConversationsListResponse> {
    return request<ConversationsListResponse>(`/console/api/apps/${appId}/messages`, {
      params: { page, limit },
    });
  },

  async getConversationMessages(appId: string, conversationId: string): Promise<{ data: ConversationMessage[] }> {
    return request<{ data: ConversationMessage[] }>(`/console/api/apps/${appId}/messages`, {
      params: { conversation_id: conversationId },
    });
  },

  async annotateMessage(appId: string, messageId: string, rating: 'like' | 'dislike'): Promise<void> {
    return request<void>(`/console/api/apps/${appId}/feedbacks`, {
      method: 'POST',
      body: { message_id: messageId, rating },
    });
  },
};
