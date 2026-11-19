'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { App } from '@/services/apps/types';
import { AppModeBadge } from './app-mode-badge';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface AppCardProps {
  app: App;
  onDelete?: (id: string) => void;
}

export function AppCard({ app, onDelete }: AppCardProps) {
  const { t } = useTranslation(['app', 'common']);

  return (
    <Card className='group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50'>
      <CardHeader className='p-5 pb-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg text-lg font-semibold'>
              {app.icon || '🤖'}
            </div>
            <div>
              <CardTitle className='line-clamp-1 text-base font-semibold group-hover:text-primary transition-colors'>
                <Link href={`/dashboard/apps/${app.id}/overview`} className='hover:underline'>
                  {app.name}
                </Link>
              </CardTitle>
              <div className='mt-1 flex items-center gap-2'>
                <AppModeBadge mode={app.mode} />
              </div>
            </div>
          </div>
          {onDelete && (
            <Button
              variant='ghost'
              size='icon-sm'
              className='text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={() => onDelete(app.id)}
            >
              <Icons.trash className='size-4' />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='p-5 pt-0'>
        <CardDescription className='line-clamp-2 text-xs min-h-[2rem] text-muted-foreground'>
          {app.description || t('app:newApp.appDescriptionPlaceholder', 'No description provided.')}
        </CardDescription>
        <div className='mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground'>
          <span>
            {t('common:time.updated', 'Updated')} {new Date(app.updated_at * 1000).toLocaleDateString()}
          </span>
          <Link
            href={`/dashboard/apps/${app.id}/overview`}
            className='inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors'
          >
            {t('app:overview.title', 'Orchestrate')}
            <Icons.arrowRight className='size-3' />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
