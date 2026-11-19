export type DatasetPermission = 'only_me' | 'all_team_members' | 'partial_members';
export type IndexingTechnique = 'high_quality' | 'economy';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  permission: DatasetPermission;
  data_source_type: string;
  indexing_technique: IndexingTechnique;
  app_count: number;
  document_count: number;
  word_count: number;
  created_by: string;
  created_at: number;
  updated_at: number;
  embedding_model?: string;
  embedding_model_provider?: string;
}

export interface DatasetListResponse {
  data: Dataset[];
  has_more: boolean;
  limit: number;
  total: number;
  page: number;
}

export interface CreateDatasetPayload {
  name: string;
  description?: string;
  permission?: DatasetPermission;
  indexing_technique?: IndexingTechnique;
}

export interface DocumentItem {
  id: string;
  position: number;
  data_source_type: string;
  name: string;
  tokens: number;
  word_count: number;
  hit_count: number;
  indexing_status: 'waiting' | 'parsing' | 'cleaning' | 'indexing' | 'completed' | 'error';
  enabled: boolean;
  disabled_at?: number;
  created_at: number;
}

export interface DocumentListResponse {
  data: DocumentItem[];
  total: number;
  page: number;
  limit: number;
}
