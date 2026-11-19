import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    avatar_url?: string | null;
    avatar?: string | null;
    imageUrl?: string | null;
    name?: string | null;
    fullName?: string | null;
    email?: string | null;
    emailAddresses?: Array<{ emailAddress: string }>;
  } | null;
}

export function UserAvatarProfile({ className, showInfo = false, user }: UserAvatarProfileProps) {
  const name = user?.name || user?.fullName || 'User';
  const email = user?.email || user?.emailAddresses?.[0]?.emailAddress || '';
  const avatarUrl = user?.avatar_url || user?.avatar || user?.imageUrl || '';

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className='bg-muted text-muted-foreground rounded-lg text-xs font-medium'>
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-medium'>{name}</span>
          <span className='text-muted-foreground truncate text-xs'>{email}</span>
        </div>
      )}
    </div>
  );
}
