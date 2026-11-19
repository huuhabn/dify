import { Metadata } from 'next';
import { SignUp } from '@/features/auth/components/sign-up';

export const metadata: Metadata = {
  title: 'Sign Up | Dify Console',
  description: 'Create your Dify account.'
};

export default function Page() {
  return <SignUp />;
}
