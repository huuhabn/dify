'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { CommandPalette } from '@/components/CommandPalette';
import { useAuth } from '@/context/AuthContext';
import { Link, usePathname } from '@/libs/I18nNavigation';

export function DashboardShell({ children }: { children: ReactNode }) {
  const t = useTranslations('DashboardLayout');
  const { user, workspace, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: t('nav_apps'),
      href: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      current: pathname === '/dashboard',
    },
    {
      name: t('nav_explore'),
      href: '/dashboard/explore',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
      current: pathname.startsWith('/dashboard/explore'),
    },
    {
      name: t('nav_knowledge'),
      href: '/dashboard/knowledge',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      current: pathname.startsWith('/dashboard/knowledge'),
    },
    {
      name: t('nav_tools'),
      href: '/dashboard/tools',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      current: pathname.startsWith('/dashboard/tools'),
    },
    {
      name: t('nav_plugins'),
      href: '/dashboard/plugins',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
          />
        </svg>
      ),
      current: pathname.startsWith('/dashboard/plugins'),
    },
    {
      name: t('nav_annotations'),
      href: '/dashboard/annotations',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
      current: pathname.startsWith('/dashboard/annotations'),
    },
    {
      name: t('nav_snippets'),
      href: '/dashboard/snippets',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      current: pathname.startsWith('/dashboard/snippets'),
    },
    {
      name: t('nav_members'),
      href: '/dashboard/settings/members',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      current: pathname.startsWith('/dashboard/settings/members'),
    },
    {
      name: t('nav_profile'),
      href: '/dashboard/user-profile',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      current: pathname.startsWith('/dashboard/user-profile'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar for Desktop - Fixed to left */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Dify <span className="text-blue-600">SaaS</span>
          </span>
        </div>

        {/* Workspace Card */}
        <div className="p-4 shrink-0">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-gray-500">
                Workspace
              </p>
              <p className="truncate text-sm font-semibold text-gray-900">
                {workspace?.name || 'Default Workspace'}
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {workspace?.plan || 'Community'}
            </span>
          </div>
        </div>

        {/* Nav Links - Scrollable */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                item.current
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className={item.current ? 'text-blue-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Area: Language Switcher + User Card */}
        <div className="shrink-0 border-t border-gray-200 p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              🌐 {t('language')}
            </span>
            <div className="w-28">
              <LocaleSwitcher />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user?.name || (isLoading ? t('loading') : 'User')}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {user?.email || (isLoading ? t('loading') : '')}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title={t('sign_out')}
              className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Shifted with md:pl-64 */}
      <div className="flex flex-1 flex-col min-w-0 md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white/95 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 md:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <nav className="flex items-center text-sm font-medium text-gray-500">
              <Link href="/dashboard" className="hover:text-gray-700">
                Dashboard
              </Link>
              {pathname !== '/dashboard' && (
                <>
                  <span className="mx-2 text-gray-300">/</span>
                  <span className="text-gray-900 capitalize">
                    {pathname.split('/').pop()?.replace('-', ' ')}
                  </span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              <span>Search or jump to...</span>
              <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">⌘K</kbd>
            </button>
            <div className="md:hidden">
              <LocaleSwitcher />
            </div>
          </div>
        </header>

        <CommandPalette />

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-gray-200 bg-white p-4 md:hidden">
            <div className="mb-3 rounded-lg bg-gray-50 p-2 text-xs font-semibold text-gray-600">
              Workspace: {workspace?.name || 'Default Workspace'}
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    item.current ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span className="h-5 w-5">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => logout()}
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                {t('sign_out')}
              </button>
            </nav>
          </div>
        )}

        {/* Body content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
