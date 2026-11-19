'use client';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useQuery } from '@tanstack/react-query';
import { authQueries } from '@/services/auth/queries';

export default function AccountPage() {
  const { data: user } = useQuery(authQueries.currentUser());
  const { data: workspacesData } = useQuery(authQueries.workspaces());

  const currentWorkspace = workspacesData?.workspaces.find((w) => w.current) || workspacesData?.workspaces[0];

  return (
    <PageContainer
      pageTitle='Account & Settings'
      pageDescription='Manage your user profile and active workspace configurations'
    >
      <div className='flex flex-col gap-6 max-w-4xl'>
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Personal details and preferences</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex items-center gap-4'>
              <UserAvatarProfile user={user || null} className='size-14' />
              <div>
                <h3 className='text-base font-semibold'>{user?.name || 'Administrator'}</h3>
                <p className='text-sm text-muted-foreground'>{user?.email || 'admin@dify.ai'}</p>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border'>
              <div>
                <p className='text-xs text-muted-foreground uppercase font-medium'>Interface Language</p>
                <p className='text-sm font-medium mt-1'>{user?.interface_language || 'en-US'}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground uppercase font-medium'>Theme</p>
                <p className='text-sm font-medium mt-1 capitalize'>{user?.interface_theme || 'System / Dynamic'}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground uppercase font-medium'>Timezone</p>
                <p className='text-sm font-medium mt-1'>{user?.timezone || 'UTC'}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground uppercase font-medium'>Active Workspace</p>
                <p className='text-sm font-medium mt-1'>{currentWorkspace?.name || 'Default Workspace'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
