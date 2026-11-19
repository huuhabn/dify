'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authQueries, authMutations } from '@/services/auth/queries';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

export default function WorkspacesView() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(authQueries.workspaces());
  const workspaces = data?.workspaces || [];

  const switchMutation = useMutation({
    ...authMutations.switchWorkspace,
    onSuccess: () => {
      toast.success('Switched workspace');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
    >
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {workspaces.map((ws) => (
          <Card key={ws.id} className={ws.current ? 'border-primary ring-1 ring-primary/20' : ''}>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base'>{ws.name}</CardTitle>
                {ws.current && (
                  <span className='bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium'>
                    Active
                  </span>
                )}
              </div>
              <CardDescription className='capitalize text-xs'>
                Role: {ws.role} • Plan: {ws.plan}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!ws.current ? (
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full'
                  disabled={switchMutation.isPending}
                  onClick={() => switchMutation.mutate(ws.id)}
                >
                  Switch Workspace
                </Button>
              ) : (
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <Icons.check className='size-3.5 text-primary' /> Currently active
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
