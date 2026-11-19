'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { Dataset } from '@/services/knowledge/types';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface DatasetCardProps {
  dataset: Dataset;
  onDelete?: (id: string) => void;
}

export function DatasetCard({ dataset, onDelete }: DatasetCardProps) {
  const { t } = useTranslation(['dataset', 'common']);

  return (
    <Card className='group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50'>
      <CardHeader className='p-5 pb-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg font-semibold'>
              <Icons.workspace className='size-5' />
            </div>
            <div>
              <CardTitle className='line-clamp-1 text-base font-semibold group-hover:text-primary transition-colors'>
                <Link href={`/dashboard/knowledge/${dataset.id}/documents`} className='hover:underline'>
                  {dataset.name}
                </Link>
              </CardTitle>
              <div className='mt-1 flex items-center gap-2'>
                <Badge variant='outline' className='text-xs font-normal'>
                  {dataset.document_count || 0} {t('dataset:documentCount', 'Docs')}
                </Badge>
                <Badge variant='outline' className='text-xs font-normal capitalize'>
                  {dataset.indexing_technique || 'High Quality'}
                </Badge>
              </div>
            </div>
          </div>
          {onDelete && (
            <Button
              variant='ghost'
              size='icon-sm'
              className='text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={() => onDelete(dataset.id)}
            >
              <Icons.trash className='size-4' />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='p-5 pt-0'>
        <CardDescription className='line-clamp-2 text-xs min-h-[2rem] text-muted-foreground'>
          {dataset.description || t('dataset:intro.desc', 'No description provided.')}
        </CardDescription>
        <div className='mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground'>
          <span>{dataset.app_count || 0} {t('dataset:appCount', 'Apps linked')}</span>
          <Link
            href={`/dashboard/knowledge/${dataset.id}/documents`}
            className='inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors'
          >
            {t('dataset:documents', 'Manage Docs')}
            <Icons.arrowRight className='size-3' />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
