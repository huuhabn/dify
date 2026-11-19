import { Metadata } from 'next';
import { SignIn } from '@/features/auth/components/sign-in';

export const metadata: Metadata = {
  title: 'Sign In | Dify Console',
  description: 'Sign In to your Dify account.'
};

export default function Page() {
  return <SignIn />;
}
