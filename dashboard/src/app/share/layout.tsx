import React from 'react';

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col justify-center items-center'>
      {children}
    </div>
  );
}
