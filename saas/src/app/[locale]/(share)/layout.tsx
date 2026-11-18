import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

export default async function ShareLayout(props: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <header className="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
            D
          </div>
          <span className="text-xs font-semibold tracking-tight text-gray-700">
            Dify <span className="text-blue-600">AI</span>
          </span>
        </div>
        <div className="text-2xs text-gray-400">
          Powered by Dify SaaS
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        {props.children}
      </main>
    </div>
  );
}
