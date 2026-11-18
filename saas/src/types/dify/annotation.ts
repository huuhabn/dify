export interface AnnotationItem {
  id: string;
  app_id?: string;
  question: string;
  content?: string; // Some endpoints use content for question or answer
  answer: string;
  hit_count: number;
  created_at: number;
  account?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AnnotationListResponse {
  data: AnnotationItem[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
