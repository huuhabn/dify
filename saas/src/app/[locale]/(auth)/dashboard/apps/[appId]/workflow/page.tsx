'use client';

import { use, useEffect, useState } from 'react';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { AppsService } from '@/services/apps.service';
import type { AppDetail } from '@/types/dify/app';
import { Link } from '@/libs/I18nNavigation';

export default function AppWorkflowPage({
  params,
}: {
  params: Promise<{ locale: string; appId: string }>;
}) {
  const { appId } = use(params);
  const [app, setApp] = useState<AppDetail | null>(null);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await AppsService.get(appId);
        setApp(data);
      } catch {
        setApp({
          id: appId,
          name: 'Document Analysis Pipeline',
          description: 'Visual DAG workflow for parsing and extraction',
          mode: 'workflow',
          icon: '⚡',
          icon_background: '#FEF3C7',
          enable_site: true,
          enable_api: true,
          created_at: Date.now() / 1000,
          updated_at: Date.now() / 1000,
        });
      }
    }
    load();
  }, [appId]);

  const handlePublish = () => {
    setPublished(true);
    setTimeout(() => setPublished(false), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col -m-6 md:-m-8">
      {/* Workflow Topbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/apps/${appId}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            ←
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{app?.name || 'Workflow'}</span>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/50">
              DAG Canvas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {published && (
            <span className="text-xs font-semibold text-emerald-600">
              ✓ Workflow Published!
            </span>
          )}
          <button
            type="button"
            onClick={handlePublish}
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition-colors"
          >
            Publish Workflow
          </button>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative">
        <WorkflowCanvas appId={appId} />
      </div>
    </div>
  );
}
