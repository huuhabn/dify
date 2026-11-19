'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { LoadingButton } from '@/components/ui/loading-button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const { t } = useTranslation(['login', 'common']);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useAppForm({
    defaultValues: { email: '' },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        toast.success(t('login:resetPassword.emailSent', `Reset instructions sent to ${value.email}`));
        router.push(`/auth/otp?email=${encodeURIComponent(value.email)}`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to send reset code');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn('grid gap-3', className)}
      {...props}
    >
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
