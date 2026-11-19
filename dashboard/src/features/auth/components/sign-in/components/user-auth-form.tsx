'use client';

import { useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { IconGithub, IconGoogle } from '@/assets/brand-icons';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { authMutations } from '@/services/auth/queries';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string;
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const { t } = useTranslation(['login', 'common']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const targetRedirect = redirectTo || searchParams.get('redirect') || '/dashboard/apps';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    ...authMutations.login,
    onSuccess: (data) => {
      if (data?.result === 'success' || data?.data?.access_token) {
        Cookies.set('console_token', data?.data?.access_token || 'logged_in', { expires: 7 });
        toast.success(t('login:signBtn', 'Signed in successfully!'));
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        router.push(targetRedirect);
      } else {
        toast.error(t('login:error.invalidPassword', 'Login failed. Please check your credentials.'));
      }
    },
    onError: (error: any) => {
      const msg = error.message || t('login:error.invalidPassword', 'Invalid email or password');
      setErrorMessage(msg);
      toast.error(msg);
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      loginMutation.mutate({
        email: value.email,
        password: value.password,
      });
    },
  });

  const isLoading = loginMutation.isPending;

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
              disabled={isLoading}
            />
          )}
        />

        <div className='relative'>
          <form.AppField
            name='password'
            children={(field) => (
              <field.TextField
                label={t('login:password', 'Password')}
                type='password'
                placeholder='••••••••'
                disabled={isLoading}
              />
            )}
          />
          <Link
            href='/forgot-password'
            className='absolute inset-e-0 top-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors text-end'
          >
            {t('login:forget', 'Forgot password?')}
          </Link>
        </div>
      </FieldGroup>

      <LoadingButton
        className='mt-2 w-full'
        loading={isLoading}
        type='submit'
      >
        <Icons.login className='size-4 me-2' />
        {t('login:signBtn', 'Sign in')}
      </LoadingButton>

      <div className='relative my-2'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-border' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-card px-2 text-muted-foreground'>
            {t('login:or', 'Or continue with')}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <Button variant='outline' type='button' disabled={isLoading}>
          <IconGithub className='size-4 me-2' /> GitHub
        </Button>
        <Button variant='outline' type='button' disabled={isLoading}>
          <IconGoogle className='size-4 me-2' /> Google
        </Button>
      </div>
    </form>
  );
}
