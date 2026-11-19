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
import { SignUpForm } from './components/sign-up-form';

export function SignUp() {
  const { t } = useTranslation(['login', 'common']);

  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4 border-border bg-card'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold tracking-tight'>
            {t('login:signup.signUp', 'Create an account')}
          </CardTitle>
          <CardDescription>
            Enter your details below to create your account.{' '}
            <br className='max-sm:hidden' />
            Already have an account?{' '}
            <Link
              href='/auth/sign-in'
              className='font-medium text-primary underline underline-offset-4 hover:opacity-85'
            >
              {t('login:signBtn', 'Sign In')}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
        <CardFooter>
          <p className='px-4 text-center text-xs text-muted-foreground'>
            By creating an account, you agree to our{' '}
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
