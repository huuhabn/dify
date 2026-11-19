import { Metadata } from 'next';
import { Otp } from '@/features/auth/components/otp';

export const metadata: Metadata = {
  title: 'Two-Factor Authentication | Dify Console',
  description: 'Verify your two-factor authentication code.'
};

export default function Page() {
  return <Otp />;
}
