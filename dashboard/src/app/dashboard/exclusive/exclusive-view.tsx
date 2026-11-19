'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useQuery } from '@tanstack/react-query';
import { authQueries } from '@/services/auth/queries';

export default function ExclusiveView() {
  const { data } = useQuery(authQueries.workspaces());
  const currentWorkspace = data?.workspaces.find((w) => w.current) || data?.workspaces[0];

  return (
    <PageContainer pageTitle='Exclusive Area' pageDescription='Exclusive features and capabilities'>
      <div className='space-y-6'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
            <Icons.badgeCheck className='h-6 w-6 text-primary' />
            Workspace: {currentWorkspace?.name}
          </h1>
          <p className='text-muted-foreground text-sm'>
            Current active plan: <span className='font-semibold text-foreground uppercase'>{currentWorkspace?.plan || 'Standard'}</span>
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Dify Studio Pro</CardTitle>
            <CardDescription>
              Orchestrate advanced AI agents, RAG pipelines, and enterprise workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-sm text-muted-foreground'>
              All features and extensions are ready to use with your workspace.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
