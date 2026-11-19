import PageContainer from '@/components/layout/page-container';
import { appQueries } from '@/services/apps/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { AppListing } from '@/features/apps/components/app-listing';

export default async function AppsPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(appQueries.list({ page: 1, limit: 30 })).catch(() => {});

  return (
    <PageContainer
      pageTitle='Apps Studio'
      pageDescription='Build, orchestrate, and deploy LLM applications and autonomous AI agents'
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AppListing />
      </HydrationBoundary>
    </PageContainer>
  );
}
