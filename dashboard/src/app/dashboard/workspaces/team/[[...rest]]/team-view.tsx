'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { authQueries } from '@/services/auth/queries';

export default function TeamView() {
  const { data } = useQuery(authQueries.workspaces());
  const currentWorkspace = data?.workspaces.find((w) => w.current) || data?.workspaces[0];

  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
    >
      <Card>
        <CardHeader>
          <CardTitle>Workspace: {currentWorkspace?.name}</CardTitle>
          <CardDescription>Role and access control for this workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-muted-foreground'>
            Current role in workspace: <span className='font-semibold text-foreground capitalize'>{currentWorkspace?.role}</span>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
