'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AppsService } from '@/services/apps.service';
import type { AppMode } from '@/types/dify/app';

export type AppItem = {
  id: string;
  name: string;
  mode: string;
  icon?: string;
  icon_background?: string;
  description?: string;
  updated_at?: number;
  created_at?: number;
};

export function AppsView() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppMode, setNewAppMode] = useState('chat');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      const res = await AppsService.list(1, 30);
      if (res?.data) {
        setApps(res.data as unknown as AppItem[]);
      }
    } catch (err) {
      console.error('Failed to fetch apps', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateApp = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    setCreating(true);
    setCreateError(null);

    try {
      await AppsService.create({
        name: newAppName.trim(),
        description: newAppDesc.trim(),
        mode: newAppMode as AppMode,
        icon: newAppMode === 'workflow' ? '⚡' : newAppMode === 'agent-chat' ? '🔬' : '💬',
        icon_background: '#EBF5FF',
      });

      // Success
      setIsModalOpen(false);
      setNewAppName('');
      setNewAppDesc('');
      setNewAppMode('chat');
      await fetchApps();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setCreating(false);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'chat' && (app.mode === 'chat' || app.mode === 'advanced-chat')) ||
      (filterMode === 'workflow' && app.mode === 'workflow') ||
      (filterMode === 'agent' && (app.mode === 'agent-chat' || app.mode === 'agent'));

    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    return matchesFilter && matchesSearch;
  });

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'workflow':
        return (
          <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-200/50">
            Workflow
          </span>
        );
      case 'agent-chat':
      case 'agent':
        return (
          <span className="rounded-md bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 border border-purple-200/50">
            Agent
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-200/50">
            Chatbot
          </span>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Studio & AI Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Build, test, and deploy intelligent agents, chatbots, and automated workflows.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create App
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-1">
          {[
            { id: 'all', label: 'All Apps' },
            { id: 'chat', label: 'Chatbots' },
            { id: 'workflow', label: 'Workflows' },
            { id: 'agent', label: 'Agents' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterMode === tab.id
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Apps Grid */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 p-6" />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first AI agent or workflow.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Create Application
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-2xs"
                    style={{ backgroundColor: app.icon_background || '#F3F4F6' }}
                  >
                    {app.icon || '🤖'}
                  </div>
                  {getModeBadge(app.mode)}
                </div>

                <h3 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {app.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                  {app.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400">
                <span>
                  {app.updated_at
                    ? `Updated ${new Date(app.updated_at * 1000).toLocaleDateString()}`
                    : 'Recently created'}
                </span>
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                  Configure →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create App Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Create New AI App</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateApp} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Name
                </label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="e.g. Sales Assistant, Document Extractor"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Type
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {[
                    { id: 'chat', label: 'Chatbot', desc: 'Conversational agent' },
                    { id: 'workflow', label: 'Workflow', desc: 'Deterministic DAG' },
                    { id: 'agent-chat', label: 'Agent', desc: 'Tool-calling reasoning' },
                  ].map((modeOption) => (
                    <button
                      type="button"
                      key={modeOption.id}
                      onClick={() => setNewAppMode(modeOption.id)}
                      className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                        newAppMode === modeOption.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {modeOption.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 leading-tight">
                        {modeOption.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  placeholder="What does this application do?"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
