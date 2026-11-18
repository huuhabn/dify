export type ModelType = 'llm' | 'text-embedding' | 'rerank' | 'speech2text' | 'tts' | 'moderation';

export type ModelProvider = {
  provider: string;
  label: string;
  icon_small?: string;
  icon_large?: string;
  status: 'active' | 'no-configure' | 'disabled';
  description?: string;
  supported_model_types: ModelType[];
  models?: {
    model: string;
    label: string;
    model_type: ModelType;
    features?: string[];
  }[];
};

export type ProviderCredential = {
  provider: string;
  credentials: Record<string, string>;
};
