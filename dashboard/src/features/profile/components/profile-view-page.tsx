'use client';
import { useQuery } from '@tanstack/react-query';
import { authQueries } from '@/services/auth/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatarProfile } from '@/components/user-avatar-profile';

export default function ProfileViewPage() {
  const { data: user, isLoading } = useQuery(authQueries.currentUser());

  if (isLoading) {
    return <div className='p-6 text-muted-foreground'>Loading profile...</div>;
  }

  return (
    <div className='flex w-full flex-col gap-6 p-4 max-w-4xl'>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Manage your personal profile and account credentials</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center gap-4'>
            <UserAvatarProfile user={user || null} className='size-16' />
            <div>
              <h2 className='text-lg font-semibold'>{user?.name}</h2>
              <p className='text-sm text-muted-foreground'>{user?.email}</p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t'>
            <div>
              <p className='text-xs text-muted-foreground uppercase font-medium'>Interface Language</p>
              <p className='text-sm font-medium mt-1'>{user?.interface_language || 'en-US'}</p>
            </div>
            <div>
              <p className='text-xs text-muted-foreground uppercase font-medium'>Interface Theme</p>
              <p className='text-sm font-medium mt-1 capitalize'>{user?.interface_theme || 'light'}</p>
            </div>
            <div>
              <p className='text-xs text-muted-foreground uppercase font-medium'>Timezone</p>
              <p className='text-sm font-medium mt-1'>{user?.timezone || 'UTC'}</p>
            </div>
            <div>
              <p className='text-xs text-muted-foreground uppercase font-medium'>Last Active</p>
              <p className='text-sm font-medium mt-1'>{user?.last_active_at || 'Recently'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
