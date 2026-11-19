'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { IconGithub, IconGoogle } from '@/assets/brand-icons';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { authMutations } from '@/services/auth/queries';

const formSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const { t } = useTranslation(['login', 'common']);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setupMutation = useMutation({
    ...authMutations.setup,
    onSuccess: () => {
      toast.success(t('login:signup.signUpSuccess', 'Account created successfully! Please sign in.'));
      router.push('/auth/sign-in');
    },
    onError: (error: any) => {
      const msg = error.message || 'Registration failed. The system may have registration disabled.';
      setErrorMessage(msg);
      toast.error(msg);
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      setupMutation.mutate({
        name: value.name,
        email: value.email,
        password: value.password,
        language: 'en-US',
      });
    },
  });

  const isLoading = setupMutation.isPending;

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
          name='name'
          children={(field) => (
            <field.TextField
              label={t('login:name', 'Name')}
              placeholder='John Doe'
              autoComplete='name'
              disabled={isLoading}
            />
          )}
        />

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

        <form.AppField
          name='password'
          children={(field) => (
            <field.TextField
              label={t('login:password', 'Password')}
              type='password'
              placeholder='••••••••'
              autoComplete='new-password'
              disabled={isLoading}
            />
          )}
        />

        <form.AppField
          name='confirmPassword'
          children={(field) => (
            <field.TextField
              label={t('login:confirmPassword', 'Confirm Password')}
              type='password'
              placeholder='••••••••'
              autoComplete='new-password'
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
        <Icons.user className='size-4 me-2' />
        {t('login:signup.signUp', 'Create Account')}
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
