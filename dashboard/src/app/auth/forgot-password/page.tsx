import { Metadata } from 'next';
import { ForgotPassword } from '@/features/auth/components/forgot-password';

export const metadata: Metadata = {
  title: 'Forgot Password | Dify Console',
  description: 'Reset your Dify account password.'
};

export default function Page() {
  return <ForgotPassword />;
}
