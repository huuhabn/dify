export type FeedbackType = 'like' | 'dislike' | null;

export type ConversationMessage = {
  id: string;
  conversation_id: string;
  query: string;
  inputs?: Record<string, unknown>;
  answer: string;
  feedback?: {
    rating: FeedbackType;
    content?: string;
  };
  total_tokens?: number;
  provider_response_latency?: number;
  created_at: number;
};

export type ConversationSession = {
  id: string;
  status: string;
  from_source: string;
  from_end_user_id?: string;
  from_account_name?: string;
  name?: string;
  summary?: string;
  read_at?: number;
  created_at: number;
  updated_at: number;
  message_count: number;
};
