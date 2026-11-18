'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PluginsService } from '@/services/plugins.service';
import type { Plugin } from '@/types/dify/plugin';

const MARKETPLACE_PLUGINS: Plugin[] = [
  {
    id: 'plg-web-search',
    plugin_id: 'plg-web-search',
    plugin_unique_identifier: 'dify/tavily-search:0.1.0',
    declaration: {
      name: 'Tavily Web Search',
      author: 'Tavily AI',
      version: '0.1.0',
      category: 'tool',
      description: 'Search the live web with AI-optimized search queries and extract clean markdown content.',
      tags: ['search', 'real-time', 'web'],
      verified: true,
    },
    source: 'marketplace',
    created_at: Date.now(),
    updated_at: Date.now(),
    installed: true,
  },
  {
    id: 'plg-dalle3',
    plugin_id: 'plg-dalle3',
    plugin_unique_identifier: 'openai/dall-e-3:0.2.1',
    declaration: {
      name: 'OpenAI DALL-E 3',
      author: 'OpenAI',
      version: '0.2.1',
      category: 'tool',
      description: 'Generate high-resolution creative images and artwork from natural language prompts.',
      tags: ['image-generation', 'vision', 'creative'],
      verified: true,
    },
    source: 'marketplace',
    created_at: Date.now(),
    updated_at: Date.now(),
    installed: false,
  },
  {
    id: 'plg-slack-notifier',
    plugin_id: 'plg-slack-notifier',
    plugin_unique_identifier: 'community/slack-integration:1.0.0',
    declaration: {
      name: 'Slack Notification Dispatcher',
      author: 'Community',
      version: '1.0.0',
      category: 'extension',
      description: 'Send automated workflow results, alert messages, and approvals directly to Slack channels.',
      tags: ['messaging', 'slack', 'webhook'],
      verified: true,
    },
    source: 'marketplace',
    created_at: Date.now(),
    updated_at: Date.now(),
    installed: false,
  },
  {
    id: 'plg-claude-bundle',
    plugin_id: 'plg-claude-bundle',
    plugin_unique_identifier: 'anthropic/claude-tools-pack:1.1.0',
    declaration: {
      name: 'Anthropic Claude Tool Bundle',
      author: 'Anthropic',
      version: '1.1.0',
      category: 'bundle',
      description: 'Comprehensive suite of tools tailored for Claude 3.5 Sonnet including artifacts and code sandbox.',
      tags: ['bundle', 'claude', 'coding'],
      verified: true,
    },
    source: 'marketplace',
    created_at: Date.now(),
    updated_at: Date.now(),
    installed: true,
  },
  {
    id: 'plg-arxiv-reader',
    plugin_id: 'plg-arxiv-reader',
    plugin_unique_identifier: 'research/arxiv-papers:0.3.0',
    declaration: {
      name: 'Arxiv Academic Paper Researcher',
      author: 'Research Team',
      version: '0.3.0',
      category: 'tool',
      description: 'Query, fetch, and summarize computer science, physics, and AI papers directly from Arxiv.',
      tags: ['research', 'papers', 'academic'],
      verified: false,
    },
    source: 'marketplace',
    created_at: Date.now(),
    updated_at: Date.now(),
    installed: false,
  },
  {
    id: 'plg-postgres-connector',
    plugin_id: 'plg-postgres-connector',
    plugin_unique_identifier: 'database/postgres-vector:0.4.0',
    declaration: {
      name: 'PostgreSQL & pgvector Connector',
      author: 'Database Lab',
      version: '0.4.0',
      category: 'extension',
      description: 'Execute read-only SQL queries and vector similarity searches against PostgreSQL instances.',
      tags: ['database', 'sql', 'pgvector'],
      verified: true,
    },
    source: 'marketplace',
    created_at: Date.now(),
    updated_at: Date.now(),
    installed: false,
  },
];

export default function PluginsPage() {
  const t = useTranslations('Plugins');
  const [activeTab, setActiveTab] = useState<'marketplace' | 'installed'>('marketplace');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState<Plugin[]>(MARKETPLACE_PLUGINS);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await PluginsService.listInstalled();
        if (!ignore && res?.plugins && res.plugins.length > 0) {
          // Merge installed status
          const installedIds = new Set(res.plugins.map((p) => p.plugin_unique_identifier || p.id));
          setPlugins((prev) =>
            prev.map((p) => ({
              ...p,
              installed: installedIds.has(p.plugin_unique_identifier) || installedIds.has(p.id) || p.installed,
            }))
          );
        }
      } catch {
        // Fallback gracefully
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleToggleInstall = async (plugin: Plugin) => {
    setActionLoading(true);
    try {
      if (plugin.installed) {
        await PluginsService.uninstall(plugin.id);
        setPlugins((prev) =>
          prev.map((p) => (p.id === plugin.id ? { ...p, installed: false } : p))
        );
      } else {
        await PluginsService.install(plugin.plugin_unique_identifier);
        setPlugins((prev) =>
          prev.map((p) => (p.id === plugin.id ? { ...p, installed: true } : p))
        );
      }
    } finally {
      setActionLoading(false);
      setSelectedPlugin(null);
    }
  };

  const filtered = plugins.filter((plugin) => {
    if (activeTab === 'installed' && !plugin.installed) return false;
    if (categoryFilter !== 'all' && plugin.declaration?.category !== categoryFilter) return false;
    const name = plugin.declaration?.name || '';
    const desc =
      typeof plugin.declaration?.description === 'string'
        ? plugin.declaration.description
        : JSON.stringify(plugin.declaration?.description || '');
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      name.toLowerCase().includes(query) ||
      desc.toLowerCase().includes(query);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('page_title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('page_description')}</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
          <svg
            className="absolute top-2.5 left-3 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs and Categories */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        {/* Main Tabs */}
        <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('marketplace')}
            className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'marketplace'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t('tab_marketplace')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('installed')}
            className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'installed'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t('tab_installed')} ({plugins.filter((p) => p.installed).length})
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'tool', 'model', 'extension', 'bundle'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat === 'all'
                ? t('category_all')
                : cat === 'tool'
                ? t('category_tools')
                : cat === 'model'
                ? t('category_models')
                : cat === 'extension'
                ? t('category_extensions')
                : t('category_bundles')}
            </button>
          ))}
        </div>
      </div>

      {/* Plugins Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="mt-3 text-sm font-semibold text-gray-900">{t('empty_title')}</p>
          <p className="mt-1 text-xs text-gray-500">{t('empty_description')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plugin) => {
            const desc =
              typeof plugin.declaration.description === 'string'
                ? plugin.declaration.description
                : JSON.stringify(plugin.declaration.description);

            return (
              <div
                key={plugin.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-lg">
                      {plugin.declaration.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 uppercase">
                      {plugin.declaration.category}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <h2 className="text-base font-semibold text-gray-900">{plugin.declaration.name}</h2>
                    {plugin.declaration.verified && (
                      <span className="text-blue-500" title="Verified Plugin">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    v{plugin.declaration.version} • {plugin.declaration.author}
                  </p>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-3 leading-relaxed">{desc}</p>

                  {plugin.declaration.tags && plugin.declaration.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {plugin.declaration.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPlugin(plugin)}
                    className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-900"
                  >
                    {t('details_button')}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleInstall(plugin)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      plugin.installed
                        ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xs'
                    }`}
                  >
                    {plugin.installed ? t('uninstall_button') : t('install_button')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Config Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xl">
                  {selectedPlugin.declaration.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedPlugin.declaration.name}</h3>
                  <span className="text-xs text-gray-400">
                    v{selectedPlugin.declaration.version} • {selectedPlugin.declaration.author}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlugin(null)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              {typeof selectedPlugin.declaration.description === 'string'
                ? selectedPlugin.declaration.description
                : JSON.stringify(selectedPlugin.declaration.description)}
            </p>

            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-700">Plugin Identifier:</p>
              <code className="mt-1 block text-xs text-blue-600 font-mono">
                {selectedPlugin.plugin_unique_identifier}
              </code>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlugin(null)}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t('close_button')}
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleToggleInstall(selectedPlugin)}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  selectedPlugin.installed
                    ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xs'
                }`}
              >
                {actionLoading
                  ? t('processing')
                  : selectedPlugin.installed
                  ? t('uninstall_button')
                  : t('install_button')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
