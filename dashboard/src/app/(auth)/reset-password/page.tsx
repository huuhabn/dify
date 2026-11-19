import { Metadata } from 'next';
import { ResetPassword } from '@/features/auth/components/reset-password';

export const metadata: Metadata = {
  title: 'Reset Password | Dify Console',
  description: 'Set a new password for your Dify account.'
};

export default function Page() {
  return <ResetPassword />;
}
