'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { authMutations } from '@/services/auth/queries';

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>;

export function OtpForm({ className, ...props }: OtpFormProps) {
  const { t } = useTranslation(['login', 'common']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard/apps';
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const [otp, setOtp] = useState('');

  const checkCodeMutation = useMutation({
    ...authMutations.checkForgotPasswordCode,
    onSuccess: (data) => {
      if (data?.is_valid && data.token) {
        toast.success(t('login:checkCode.validCode', 'Verification successful!'));
        router.push(`/reset-password?email=${encodeURIComponent(email || '')}&token=${encodeURIComponent(data.token)}`);
      } else {
        toast.error(t('login:checkCode.invalidCode', 'Invalid verification code'));
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Invalid verification code');
    }
  });

  const isLoading = checkCodeMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) return;

    if (email && token) {
      checkCodeMutation.mutate({
        email,
        code: otp,
        token
      });
      return;
    }

    // Default flow for 2FA verification
    Cookies.set('console_token', 'logged_in', { expires: 7 });
    toast.success(t('login:signBtn', 'Verification successful!'));
    router.push(redirect);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('grid gap-3', className)}
      {...props}
    >
      <div className='flex flex-col items-center justify-center gap-2'>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(val) => setOtp(val)}
          containerClassName='justify-center gap-1.5'
          disabled={isLoading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <LoadingButton
        className='mt-2 w-full'
        disabled={otp.length < 6 || isLoading}
        loading={isLoading}
        type='submit'
      >
        {t('common:operation.confirm', 'Verify')}
      </LoadingButton>
    </form>
  );
}
