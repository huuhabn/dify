'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useAppForm } from '@/lib/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeMutations } from '@/services/knowledge/queries';
import type { IndexingTechnique } from '@/services/knowledge/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { LoadingButton } from '@/components/ui/loading-button';
import { useTranslation } from 'react-i18next';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  indexing_technique: z.enum(['high_quality', 'economy'] as const)
});

export function DatasetCreateDialog() {
  const { t } = useTranslation(['dataset', 'common']);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...knowledgeMutations.create,
    onSuccess: () => {
      toast.success(t('dataset:createSuccess', 'Knowledge dataset created successfully!'));
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || t('dataset:createFailed', 'Failed to create dataset'));
    }
  });

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      indexing_technique: 'high_quality' as IndexingTechnique
    },
    validators: {
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      createMutation.mutate({
        name: value.name,
        description: value.description || '',
        indexing_technique: value.indexing_technique
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className='gap-2 shadow-sm'>
            <Icons.add className='size-4' />
            {t('dataset:createDataset', 'Create Dataset')}
          </Button>
        }
      />
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('dataset:createDataset', 'Create Knowledge Dataset')}</DialogTitle>
          <DialogDescription>
            {t('dataset:firstEmpty.createDescription', 'Create an empty dataset or connect documents to start semantic retrieval.')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-4 py-2'
        >
          <form.AppField
            name='name'
            children={(field) => (
              <field.TextField
                label={t('dataset:metadata.createMetadata.name', 'Dataset Name')}
                placeholder='e.g. Product Knowledge Base'
                disabled={createMutation.isPending}
              />
            )}
          />

          <form.AppField
            name='description'
            children={(field) => (
              <field.TextareaField
                label={t('common:apiBasedExtension.modal.name.title', 'Description (Optional)')}
                placeholder={t('dataset:intro.desc', 'What knowledge does this dataset contain?')}
                disabled={createMutation.isPending}
              />
            )}
          />

          <form.AppField
            name='indexing_technique'
            children={(field) => (
              <field.SelectField
                label={t('dataset:indexingTechnique', 'Indexing Technique')}
                options={[
                  { label: 'High Quality (Vector embeddings + Hybrid search)', value: 'high_quality' },
                  { label: 'Economy (Keyword inverted index)', value: 'economy' }
                ]}
              />
            )}
          />

          <DialogFooter className='pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              {t('common:operation.cancel', 'Cancel')}
            </Button>
            <LoadingButton
              type='submit'
              loading={createMutation.isPending}
            >
              {t('common:operation.create', 'Create')}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
