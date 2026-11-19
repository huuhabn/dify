'use client';
import { LoadingButton } from '@/components/ui/loading-button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authMutations } from '@/services/auth/queries';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

const formSchema = z.object({
  email: z.email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export default function UserAuthForm() {
  const { t } = useTranslation(['login', 'common']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard/apps';
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    ...authMutations.login,
    onSuccess: (data) => {
      if (data?.result === 'success' || data?.data?.access_token) {
        // Backend sets access_token cookie automatically via Set-Cookie.
        // Set console_token in client cookie as well for client-side and middleware checks.
        Cookies.set('console_token', data?.data?.access_token || 'logged_in', { expires: 7 });
        toast.success(t('login:signBtn', 'Signed in successfully!'));
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        router.push(redirect);
      } else {
        toast.error(t('login:error.invalidPassword', 'Login failed. Please check your credentials.'));
      }
    },
    onError: (error: any) => {
      const msg = error.message || t('login:error.invalidPassword', 'Invalid email or password');
      setErrorMessage(msg);
      toast.error(msg);
    }
  });

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: ''
    },
    validators: {
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      loginMutation.mutate({
        email: value.email,
        password: value.password
      });
    }
  });

  return (
    <form
      className='w-full space-y-4'
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
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
              disabled={loginMutation.isPending}
            />
          )}
        />
        <form.AppField
          name='password'
          children={(field) => (
            <field.TextField
              label={t('login:password', 'Password')}
              type='password'
              placeholder='••••••••'
              disabled={loginMutation.isPending}
            />
          )}
        />
      </FieldGroup>
      <LoadingButton
        loading={loginMutation.isPending}
        type='submit'
        className='w-full mt-2'
      >
        {t('login:signBtn', 'Sign In')}
      </LoadingButton>
    </form>
  );
}
