import PageContainer from '@/components/layout/page-container';
import { knowledgeQueries } from '@/services/knowledge/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { KnowledgeListing } from '@/features/knowledge/components/knowledge-listing';

export default async function KnowledgePage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(knowledgeQueries.list({ page: 1, limit: 30 })).catch(() => {});

  return (
    <PageContainer
      pageTitle='Knowledge (Datasets)'
      pageDescription='Manage documents, indexes, and vector stores for your retrieval-augmented generation (RAG)'
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <KnowledgeListing />
      </HydrationBoundary>
    </PageContainer>
  );
}
