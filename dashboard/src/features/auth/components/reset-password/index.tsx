'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AuthLayout } from '../auth-layout';
import { ResetPasswordForm } from './components/reset-password-form';

export function ResetPassword() {
  const { t } = useTranslation(['login', 'common']);

  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4 border-border bg-card'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold tracking-tight'>
            {t('login:resetPassword', 'Set New Password')}
          </CardTitle>
          <CardDescription>
            {t(
              'login:resetPasswordDesc',
              'Please enter your new password below. It must be at least 8 characters and contain letters and numbers.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
        <CardFooter>
          <p className='mx-auto px-4 text-center text-xs text-muted-foreground'>
            Remember your password?{' '}
            <Link
              href='/sign-in'
              className='font-medium text-primary underline underline-offset-4 hover:opacity-85'
            >
              {t('login:signBtn', 'Sign in')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
