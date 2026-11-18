import { request } from './api-client';
import type { Dataset, Document, HitTestingResponse, Segment } from '@/types/dify/dataset';

export type DatasetsListResponse = {
  data: Dataset[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
};

export type DocumentsListResponse = {
  data: Document[];
  total: number;
  page: number;
  limit: number;
};

export type SegmentsListResponse = {
  data: Segment[];
  doc_form?: string;
};

export const DatasetsService = {
  async list(page = 1, limit = 30): Promise<DatasetsListResponse> {
    return request<DatasetsListResponse>('/console/api/datasets', {
      params: { page, limit },
    });
  },

  async get(id: string): Promise<Dataset> {
    return request<Dataset>(`/console/api/datasets/${id}`);
  },

  async create(
    name: string,
    description?: string,
    indexingTechnique: 'high_quality' | 'economy' = 'economy',
    permission: 'only_me' | 'all_team_members' = 'all_team_members',
  ): Promise<Dataset> {
    return request<Dataset>('/console/api/datasets', {
      method: 'POST',
      body: {
        name,
        description: description || '',
        permission,
        indexing_technique: indexingTechnique,
      },
    });
  },

  async listDocuments(datasetId: string, page = 1, limit = 20): Promise<DocumentsListResponse> {
    return request<DocumentsListResponse>(`/console/api/datasets/${datasetId}/documents`, {
      params: { page, limit },
    });
  },

  async toggleDocument(datasetId: string, documentId: string, enable: boolean): Promise<void> {
    return request<void>(`/console/api/datasets/${datasetId}/documents/${documentId}/processing/${enable ? 'enable' : 'disable'}`, {
      method: 'PATCH',
    });
  },

  async hitTesting(datasetId: string, query: string, topK = 4): Promise<HitTestingResponse> {
    return request<HitTestingResponse>(`/console/api/datasets/${datasetId}/hit-testing`, {
      method: 'POST',
      body: {
        query,
        retrieval_model: {
          search_method: 'semantic_search',
          top_k: topK,
          score_threshold_enabled: false,
        },
      },
    });
  },

  async listSegments(datasetId: string, documentId: string): Promise<SegmentsListResponse> {
    return request<SegmentsListResponse>(`/console/api/datasets/${datasetId}/documents/${documentId}/segments`);
  },

  async createSegment(
    datasetId: string,
    documentId: string,
    content: string,
    answer?: string,
    keywords?: string[],
  ): Promise<{ data: Segment }> {
    return request<{ data: Segment }>(`/console/api/datasets/${datasetId}/documents/${documentId}/segments`, {
      method: 'POST',
      body: {
        segment: {
          content,
          answer,
          keywords,
        },
      },
    });
  },

  async updateSegment(
    datasetId: string,
    documentId: string,
    segmentId: string,
    segment: { content?: string; answer?: string; keywords?: string[]; enabled?: boolean },
  ): Promise<{ data: Segment }> {
    return request<{ data: Segment }>(`/console/api/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`, {
      method: 'POST',
      body: { segment },
    });
  },

  async deleteSegment(datasetId: string, documentId: string, segmentId: string): Promise<void> {
    return request<void>(`/console/api/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`, {
      method: 'DELETE',
    });
  },
};
