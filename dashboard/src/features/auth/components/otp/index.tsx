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
import { OtpForm } from './components/otp-form';

export function Otp() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { t } = useTranslation(['login', 'common']);

  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4 border-border bg-card'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold tracking-tight'>
            Verification Code
          </CardTitle>
          <CardDescription>
            Please enter the 6-digit verification code.{' '}
            {email ? (
              <>We sent the code to <strong className='text-foreground'>{email}</strong>.</>
            ) : (
              <>We have sent the code to your registered email address.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter>
          <p className='mx-auto px-4 text-center text-xs text-muted-foreground'>
            Haven't received it?{' '}
            <Link
              href='/signin'
              className='font-medium text-primary underline underline-offset-4 hover:opacity-85'
            >
              Back to Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
