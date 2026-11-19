'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { useQuery } from '@tanstack/react-query';
import { authQueries } from '@/services/auth/queries';

export default function BillingView() {
  const { data } = useQuery(authQueries.workspaces());
  const currentWorkspace = data?.workspaces.find((w) => w.current) || data?.workspaces[0];

  return (
    <PageContainer
      pageTitle='Billing & Plans'
      pageDescription={`Manage subscription and usage limits for ${currentWorkspace?.name || 'Workspace'}`}
    >
      <div className='space-y-6'>
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            You are currently on the <strong className='uppercase'>{currentWorkspace?.plan || 'Community / Standard'}</strong> plan.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Plan Usage & Quotas</CardTitle>
            <CardDescription>View credits, model quotas, and vector storage limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-sm text-muted-foreground'>
              Usage information is synchronized with your Dify self-hosted or cloud subscription.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
