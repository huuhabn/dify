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
import { ForgotPasswordForm } from './components/forgot-password-form';

export function ForgotPassword() {
  const { t } = useTranslation(['login', 'common']);

  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4 border-border bg-card'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold tracking-tight'>
            {t('login:forget', 'Forgot Password')}
          </CardTitle>
          <CardDescription>
            Enter your registered email and we will send you instructions to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter>
          <p className='mx-auto px-4 text-center text-xs text-muted-foreground'>
            Remember your password?{' '}
            <Link
              href='/auth/sign-in'
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
