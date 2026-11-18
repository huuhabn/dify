export type AppMode =
  | 'chat'
  | 'agent-chat'
  | 'advanced-chat'
  | 'workflow'
  | 'completion';

export type ModelConfig = {
  provider: string;
  model: string;
  parameters: {
    temperature?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    max_tokens?: number;
    response_format?: string;
  };
};

export type PromptVariable = {
  key: string;
  name: string;
  type: 'string' | 'number' | 'select' | 'api';
  default?: string;
  required?: boolean;
  options?: string[];
};

export type AppDetail = {
  id: string;
  name: string;
  description: string;
  mode: AppMode;
  icon: string;
  icon_background: string;
  enable_site: boolean;
  enable_api: boolean;
  api_rpm?: number;
  api_rph?: number;
  is_demo?: boolean;
  model_config?: {
    model: ModelConfig;
    pre_prompt?: string;
    user_input_form?: PromptVariable[];
    dataset_configs?: {
      retrieval_model?: string;
      datasets?: {
        dataset: {
          id: string;
          name: string;
        };
      }[];
    };
  };
  created_at: number;
  updated_at: number;
};

export type CreateAppRequest = {
  name: string;
  description?: string;
  mode: AppMode;
  icon?: string;
  icon_background?: string;
};

export type UpdateAppRequest = Partial<CreateAppRequest> & {
  model_config?: AppDetail['model_config'];
};
