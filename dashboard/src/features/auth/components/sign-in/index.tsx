'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { UserAuthForm } from './components/user-auth-form';

export function SignIn() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || undefined;
  const { t } = useTranslation(['login', 'common']);

  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4 border-border bg-card'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold tracking-tight'>
            {t('login:signBtn', 'Sign in')}
          </CardTitle>
          <CardDescription>
            Enter your email and password to log into your account.{' '}
            <br className='max-sm:hidden' />
            {t('login:signup.noAccount', "Don't have an account?")}{' '}
            <Link
              href='/signup'
              className='text-nowrap font-medium text-primary underline underline-offset-4 hover:opacity-85'
            >
              {t('login:signup.signUp', 'Sign Up')}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter>
          <p className='px-4 text-center text-xs text-muted-foreground'>
            By clicking sign in, you agree to our{' '}
            <Link
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
