'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appQueries, appMutations } from '@/services/apps/queries';
import { AppCard } from './app-card';
import { AppCreateDialog } from './app-create-dialog';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function AppListing() {
  const { t } = useTranslation(['app', 'common']);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(appQueries.list({ page: 1, limit: 100 }));
  const apps = data?.data || [];

  const deleteMutation = useMutation({
    ...appMutations.delete,
    onSuccess: () => {
      toast.success(t('app:appDeleted', 'App deleted successfully'));
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
    onError: (err: any) => {
      toast.error(err.message || t('app:appDeleteFailed', 'Failed to delete app'));
    }
  });

  const filteredApps = useMemo(() => {
    if (!search.trim()) return apps;
    const q = search.toLowerCase();
    return apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
    );
  }, [apps, search]);

  const handleDelete = (id: string) => {
    if (confirm(t('common:operation.confirm', 'Are you sure you want to delete this application?'))) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Top action toolbar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            placeholder={t('common:operation.search', 'Search applications...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9 bg-card'
          />
        </div>
        <AppCreateDialog />
      </div>

      {/* Grid or States */}
      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='h-44 rounded-xl border border-border bg-card/50 p-5 animate-pulse'
            />
          ))}
        </div>
      ) : error ? (
        <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-8 text-center text-destructive'>
          <p className='font-semibold'>{t('common:error.network', 'Failed to load applications')}</p>
          <p className='text-xs mt-1 opacity-80'>
            Please ensure Dify Backend is accessible via reverse proxy.
          </p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card/30'>
          <div className='bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full mb-3'>
            <Icons.product className='size-6' />
          </div>
          <h3 className='text-base font-semibold text-foreground'>{t('common:apiBasedExtension.modal.name.noResult', 'No applications found')}</h3>
          <p className='text-xs text-muted-foreground max-w-sm mt-1 mb-4'>
            {search
              ? t('common:apiBasedExtension.selector.placeholder', 'No applications match your search query.')
              : t('app:newApp.startFromBlank', 'Get started by creating your first AI application or workflow.')}
          </p>
          {!search && <AppCreateDialog />}
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
