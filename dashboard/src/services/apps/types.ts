export type AppMode = 'chat' | 'agent-chat' | 'completion' | 'workflow' | 'advanced-chat';

export interface App {
  id: string;
  name: string;
  description: string;
  mode: AppMode;
  icon: string;
  icon_background: string;
  created_at: number;
  updated_at: number;
  is_public: boolean;
  model_config?: Record<string, any>;
  workflow?: {
    id: string;
    created_at: number;
    updated_at: number;
  };
}

export interface AppListResponse {
  data: App[];
  has_more: boolean;
  limit: number;
  total: number;
  page: number;
}

export interface CreateAppPayload {
  name: string;
  description?: string;
  icon?: string;
  icon_background?: string;
  mode: AppMode;
}

export interface AppDetailResponse extends App {
  enable_site: boolean;
  enable_api: boolean;
  api_base_url?: string;
  tags?: string[];
}
