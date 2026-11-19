'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeQueries, knowledgeMutations } from '@/services/knowledge/queries';
import { DatasetCard } from './dataset-card';
import { DatasetCreateDialog } from './dataset-create-dialog';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function KnowledgeListing() {
  const { t } = useTranslation(['dataset', 'common']);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(knowledgeQueries.list({ page: 1, limit: 100 }));
  const datasets = data?.data || [];

  const deleteMutation = useMutation({
    ...knowledgeMutations.delete,
    onSuccess: () => {
      toast.success(t('dataset:didDelete', 'Knowledge dataset deleted'));
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
    onError: (err: any) => {
      toast.error(err.message || t('dataset:deleteFailed', 'Failed to delete dataset'));
    }
  });

  const filteredDatasets = useMemo(() => {
    if (!search.trim()) return datasets;
    const q = search.toLowerCase();
    return datasets.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [datasets, search]);

  const handleDelete = (id: string) => {
    if (confirm(t('common:operation.confirm', 'Are you sure you want to delete this dataset? This will delete all indexed documents.'))) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            placeholder={t('common:operation.search', 'Search knowledge datasets...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9 bg-card'
          />
        </div>
        <DatasetCreateDialog />
      </div>

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
          <p className='font-semibold'>{t('common:error.network', 'Failed to load knowledge datasets')}</p>
          <p className='text-xs mt-1 opacity-80'>
            Please check connection to Dify Backend.
          </p>
        </div>
      ) : filteredDatasets.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card/30'>
          <div className='bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full mb-3'>
            <Icons.workspace className='size-6' />
          </div>
          <h3 className='text-base font-semibold text-foreground'>{t('dataset:firstEmpty.title', 'No datasets yet')}</h3>
          <p className='text-xs text-muted-foreground max-w-sm mt-1 mb-4'>
            {search
              ? t('common:apiBasedExtension.selector.placeholder', 'No datasets match your search query.')
              : t('dataset:firstEmpty.createDescription', 'Create a knowledge dataset to connect text, PDFs, or website pages to your AI apps.')}
          </p>
          {!search && <DatasetCreateDialog />}
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredDatasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
