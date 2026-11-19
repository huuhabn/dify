'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { LoadingButton } from '@/components/ui/loading-button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { authMutations } from '@/services/auth/queries';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(
        passwordPattern,
        'Password must contain letters and numbers, and be at least 8 characters.'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password.')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

export function ResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const { t } = useTranslation(['login', 'common']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetPasswordMutation = useMutation({
    ...authMutations.resetPassword,
    onSuccess: () => {
      toast.success(
        t('login:resetPasswordSuccess', 'Password has been reset successfully!')
      );
      router.push('/sign-in');
    },
    onError: (err: any) => {
      const msg =
        err?.message ||
        t('login:resetPasswordFailed', 'Failed to reset password. Please try again.');
      setErrorMessage(msg);
      toast.error(msg);
    }
  });

  const form = useAppForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    },
    validators: {
      onChange: formSchema
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      if (!token) {
        setErrorMessage(
          'Reset token is missing or has expired. Please request a new link.'
        );
        return;
      }

      await resetPasswordMutation.mutateAsync({
        token,
        new_password: value.password,
        password_confirm: value.confirmPassword
      });
    }
  });

  if (!token) {
    return (
      <div className='flex flex-col items-center gap-4 py-4 text-center'>
        <p className='text-sm text-muted-foreground'>
          Reset token is missing or expired. Please request a new verification code.
        </p>
        <Link href='/forgot-password' className='w-full'>
          <Button variant='outline' className='w-full'>
            Back to Forgot Password
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn('grid gap-4', className)}
      {...props}
    >
      {email && (
        <p className='text-xs text-muted-foreground'>
          Resetting password for: <span className='font-medium text-foreground'>{email}</span>
        </p>
      )}

      {errorMessage && (
        <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
          {errorMessage}
        </div>
      )}

      <FieldGroup className='space-y-3'>
        <form.Field name='password'>
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !!field.state.meta.errors.length;
            return (
              <div className='grid gap-1.5'>
                <label
                  htmlFor='password'
                  className='text-xs font-medium text-muted-foreground'
                >
                  {t('login:newPassword', 'New Password')}
                </label>
                <PasswordInput
                  id='password'
                  placeholder='••••••••'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={resetPasswordMutation.isPending}
                  aria-invalid={isInvalid}
                />
                {isInvalid && (
                  <p className='text-xs text-destructive'>
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>

        <form.Field name='confirmPassword'>
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !!field.state.meta.errors.length;
            return (
              <div className='grid gap-1.5'>
                <label
                  htmlFor='confirmPassword'
                  className='text-xs font-medium text-muted-foreground'
                >
                  {t('login:confirmPassword', 'Confirm New Password')}
                </label>
                <PasswordInput
                  id='confirmPassword'
                  placeholder='••••••••'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={resetPasswordMutation.isPending}
                  aria-invalid={isInvalid}
                />
                {isInvalid && (
                  <p className='text-xs text-destructive'>
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>
      </FieldGroup>

      <LoadingButton
        type='submit'
        className='w-full'
        loading={resetPasswordMutation.isPending}
        disabled={resetPasswordMutation.isPending}
      >
        {t('login:resetPassword', 'Reset Password')}
      </LoadingButton>
    </form>
  );
}
