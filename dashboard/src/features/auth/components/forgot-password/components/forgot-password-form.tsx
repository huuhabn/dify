'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { LoadingButton } from '@/components/ui/loading-button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { authMutations } from '@/services/auth/queries';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const { t, i18n } = useTranslation(['login', 'common']);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const forgotPasswordMutation = useMutation({
    ...authMutations.sendForgotPasswordEmail,
    onSuccess: (res, variables) => {
      toast.success(t('login:resetPassword.emailSent', `Reset instructions sent to ${variables.email}`));
      const params = new URLSearchParams();
      params.set('email', variables.email);
      if (res?.data) {
        params.set('token', res.data);
      }
      router.push(`/otp?${params.toString()}`);
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to send reset email';
      setErrorMessage(msg);
      toast.error(msg);
    }
  });

  const form = useAppForm({
    defaultValues: { email: '' },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      forgotPasswordMutation.mutate({
        email: value.email,
        language: i18n.language || 'en-US'
      });
    },
  });

  const isLoading = forgotPasswordMutation.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn('grid gap-3', className)}
      {...props}
    >
      {errorMessage && (
        <div className='bg-destructive/15 text-destructive rounded-md p-3 text-sm'>
          {errorMessage}
        </div>
      )}

      <FieldGroup className='space-y-3'>
        <form.AppField
          name='email'
          children={(field) => (
            <field.TextField
              label={t('login:email', 'Email')}
              type='email'
              placeholder={t('login:emailPlaceholder', 'name@example.com')}
              autoComplete='email'
              disabled={isLoading}
            />
          )}
        />
      </FieldGroup>

      <LoadingButton
        className='mt-2 w-full'
        loading={isLoading}
        type='submit'
      >
        <Icons.arrowRight className='size-4 me-2' />
        {t('common:operation.continue', 'Continue')}
      </LoadingButton>
    </form>
  );
}
