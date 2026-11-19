import { Logo } from '@/assets/logo';
import Link from 'next/link';

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container relative grid min-h-svh max-w-none items-center justify-center px-4 py-8 lg:px-8'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-3 sm:w-[400px]'>
        <div className='mb-2 flex items-center justify-center gap-2'>
          <Link href='/' className='flex items-center gap-2 transition-opacity hover:opacity-90'>
            <Logo className='size-7 text-primary' />
            <h1 className='text-xl font-semibold tracking-tight'>Dify Console</h1>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
