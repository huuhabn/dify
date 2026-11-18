export type IndexingTechnique = 'high_quality' | 'economy';
export type ProcessMode = 'automatic' | 'custom';

export type Dataset = {
  id: string;
  name: string;
  description?: string;
  permission: 'only_me' | 'all_team_members' | 'partial_members';
  data_source_type?: 'upload_file' | 'notion' | 'web';
  indexing_technique: IndexingTechnique;
  app_count?: number;
  document_count: number;
  word_count: number;
  created_by?: string;
  created_at: number;
  updated_at: number;
};

export type Document = {
  id: string;
  position: number;
  data_source_type: string;
  name: string;
  doc_type?: string;
  word_count: number;
  tokens?: number;
  indexing_status: 'waiting' | 'parsing' | 'cleaning' | 'indexing' | 'completed' | 'error';
  error?: string;
  enabled: boolean;
  disabled_at?: number;
  created_at: number;
  updated_at: number;
};

export type Segment = {
  id: string;
  position: number;
  document_id: string;
  content: string;
  answer?: string;
  word_count: number;
  tokens: number;
  hit_count: number;
  keywords?: string[];
  index_node_id?: string;
  index_node_hash?: string;
  enabled: boolean;
  status: string;
  error?: string;
};

export type HitTestingRecord = {
  segment: Segment;
  score: number;
};

export type HitTestingResponse = {
  records: HitTestingRecord[];
  total: number;
};
