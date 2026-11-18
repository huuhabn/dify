'use client';

import { use, useEffect, useState } from 'react';
import { AppsService } from '@/services/apps.service';
import type { AppDetail } from '@/types/dify/app';
import { Link } from '@/libs/I18nNavigation';

export default function AppOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; appId: string }>;
}) {
  const { appId } = use(params);
  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await AppsService.get(appId);
        setApp(data);
      } catch {
        // Fallback mock detail
        setApp({
          id: appId,
          name: 'AI Agent Application',
          description: 'Intelligent AI assistant deployed on Dify SaaS.',
          mode: 'chat',
          icon: '🤖',
          icon_background: '#EBF5FF',
          enable_site: true,
          enable_api: true,
          created_at: Date.now() / 1000 - 86400,
          updated_at: Date.now() / 1000,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const isWorkflow = app?.mode === 'workflow';

  return (
    <div className="space-y-6">
      {/* App Header Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-2xs"
              style={{ backgroundColor: app?.icon_background || '#EBF5FF' }}
            >
              {app?.icon || '🤖'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {app?.name}
                </h1>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/50">
                  {app?.mode}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{app?.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={isWorkflow ? `/dashboard/apps/${appId}/workflow` : `/dashboard/apps/${appId}/studio`}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 transition-colors"
            >
              {isWorkflow ? 'Open Workflow Editor →' : 'Open Prompt Studio →'}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={isWorkflow ? `/dashboard/apps/${appId}/workflow` : `/dashboard/apps/${appId}/studio`}
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-lg">
            ⚡
          </div>
          <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {isWorkflow ? 'Workflow Graph Canvas' : 'Prompt Engineering Studio'}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {isWorkflow
              ? 'Visual DAG canvas to construct multi-step AI orchestration pipelines.'
              : 'Configure model prompts, temperature, context retrieval, and test simulator.'}
          </p>
        </Link>

        <Link
          href={`/dashboard/apps/${appId}/logs`}
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg">
            📊
          </div>
          <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            Logs & Conversation History
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Track user chat sessions, token consumption, latency, and feedback annotations.
          </p>
        </Link>

        <Link
          href={`/dashboard/apps/${appId}/access-point`}
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg">
            🌐
          </div>
          <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            Access Point & WebApp
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Configure custom domains, branding colors, rate limiting, and web embed widgets.
          </p>
        </Link>

        <Link
          href={`/dashboard/apps/${appId}/evaluation`}
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-lg">
            🎯
          </div>
          <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            Evaluation & Benchmark
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Test model output regression against golden benchmark test cases.
          </p>
        </Link>
      </div>
    </div>
  );
}
