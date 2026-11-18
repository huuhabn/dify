'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/libs/I18nNavigation';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  href?: string;
  action?: () => void;
  icon: string;
}

export function CommandPalette() {
  const t = useTranslations('CommandPalette');
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'nav-apps',
      title: 'Studio & Applications',
      category: 'Navigation',
      href: '/dashboard',
      icon: '🤖',
    },
    {
      id: 'nav-explore',
      title: 'Explore & App Templates',
      category: 'Navigation',
      href: '/dashboard/explore',
      icon: '🧭',
    },
    {
      id: 'nav-knowledge',
      title: 'Knowledge Base & Datasets',
      category: 'Navigation',
      href: '/dashboard/knowledge',
      icon: '📚',
    },
    {
      id: 'nav-plugins',
      title: 'Plugin Marketplace',
      category: 'Navigation',
      href: '/dashboard/plugins',
      icon: '🧩',
    },
    {
      id: 'nav-tools',
      title: 'Tools & Model Providers',
      category: 'Navigation',
      href: '/dashboard/tools',
      icon: '⚙️',
    },
    {
      id: 'nav-annotations',
      title: 'Annotations & Q&A Cache',
      category: 'Navigation',
      href: '/dashboard/annotations',
      icon: '💬',
    },
    {
      id: 'nav-snippets',
      title: 'Prompt Snippets & AI Optimizer',
      category: 'Navigation',
      href: '/dashboard/snippets',
      icon: '✨',
    },
    {
      id: 'nav-members',
      title: 'Workspace Members & Roles',
      category: 'Settings',
      href: '/dashboard/settings/members',
      icon: '👥',
    },
    {
      id: 'nav-profile',
      title: 'User Profile & Preferences',
      category: 'Settings',
      href: '/dashboard/user-profile',
      icon: '👤',
    },
  ];

  // Listen for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (cmd: CommandItem) => {
    setOpen(false);
    if (cmd.action) {
      cmd.action();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20 backdrop-blur-xs">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-gray-200 px-4 py-3">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder={t('search_placeholder')}
            className="flex-1 border-none bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden"
          />
          <kbd className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">{t('no_results')}</div>
          ) : (
            <div className="space-y-1">
              {filtered.map((cmd, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{cmd.icon}</span>
                      <span>{cmd.title}</span>
                    </div>
                    <span className="text-xs text-gray-400">{cmd.category}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-2xs text-gray-400">
          <span>{t('navigation_hint')}</span>
          <span>{t('palette_title')}</span>
        </div>
      </div>
    </div>
  );
}
