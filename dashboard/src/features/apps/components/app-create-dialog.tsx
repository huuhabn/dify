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
import { appMutations } from '@/services/apps/queries';
import type { AppMode } from '@/services/apps/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { LoadingButton } from '@/components/ui/loading-button';
import { useTranslation } from 'react-i18next';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  mode: z.enum(['chat', 'agent-chat', 'completion', 'workflow', 'advanced-chat'] as const)
});

interface AppCreateDialogProps {
  onSuccess?: (appId: string) => void;
}

export function AppCreateDialog({ onSuccess }: AppCreateDialogProps) {
  const { t } = useTranslation(['app', 'common']);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...appMutations.create,
    onSuccess: (newApp) => {
      toast.success(t('app:newApp.appCreated', 'Application created successfully!'));
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setOpen(false);
      if (onSuccess && newApp?.id) {
        onSuccess(newApp.id);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || t('app:newApp.appCreateFailed', 'Failed to create application'));
    }
  });

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      mode: 'chat' as AppMode
    },
    validators: {
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      createMutation.mutate({
        name: value.name,
        description: value.description || '',
        mode: value.mode
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className='gap-2 shadow-sm'>
            <Icons.add className='size-4' />
            {t('app:newApp.startFromBlank', 'Create App')}
          </Button>
        }
      />
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('app:newApp.startFromBlank', 'Create Application')}</DialogTitle>
          <DialogDescription>
            {t('app:newApp.captionName', 'Choose an app orchestration mode to start building your agent or workflow.')}
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
                label={t('common:apiBasedExtension.modal.name.title', 'Application Name')}
                placeholder={t('app:newApp.appNamePlaceholder', 'e.g. Customer Support Copilot')}
                disabled={createMutation.isPending}
              />
            )}
          />

          <form.AppField
            name='description'
            children={(field) => (
              <field.TextareaField
                label={t('app:newApp.captionDescription', 'Description (Optional)')}
                placeholder={t('app:newApp.appDescriptionPlaceholder', 'What does this application do?')}
                disabled={createMutation.isPending}
              />
            )}
          />

          <form.AppField
            name='mode'
            children={(field) => (
              <field.SelectField
                label={t('app:types.chatbot.title', 'Orchestration Mode')}
                options={[
                  { label: t('app:types.chatbot.title', 'Chatbot (Conversational Assistant)'), value: 'chat' },
                  { label: t('app:types.agent.title', 'Agent (Tool calling & autonomous reasoning)'), value: 'agent-chat' },
                  { label: t('app:types.completion.title', 'Text Generator (Single prompt execution)'), value: 'completion' },
                  { label: t('app:types.workflow.title', 'Workflow (Visual graph automation)'), value: 'workflow' },
                  { label: t('app:types.advanced.title', 'Chatflow (Advanced conversational workflow)'), value: 'advanced-chat' }
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
              {t('app:newApp.Create', 'Create')}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
