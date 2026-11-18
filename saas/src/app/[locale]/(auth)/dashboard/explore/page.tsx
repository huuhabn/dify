'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AppsService } from '@/services/apps.service';
import type { AppTemplate } from '@/types/dify/app';
import { useRouter } from '@/libs/I18nNavigation';

const DEFAULT_TEMPLATES: AppTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Customer Support Assistant',
    description: 'An AI assistant trained to handle common customer inquiries, ticket routing, and FAQs with polite tone.',
    mode: 'chat',
    icon: '💬',
    icon_background: '#EFF6FF',
    category: 'customer-service',
    author: 'Dify Community',
  },
  {
    id: 'tpl-2',
    name: 'Technical Documentation Writer',
    description: 'Generates structured API documentation, user guides, and markdown specs from code repositories.',
    mode: 'completion',
    icon: '📝',
    icon_background: '#F0FDF4',
    category: 'writing',
    author: 'Dify Official',
  },
  {
    id: 'tpl-3',
    name: 'Multi-lingual Document Translator',
    description: 'Accurately translates technical and business documents across English, Vietnamese, French, and Arabic preserving terminology.',
    mode: 'workflow',
    icon: '🌐',
    icon_background: '#FEF3C7',
    category: 'translate',
    author: 'Localization Team',
  },
  {
    id: 'tpl-4',
    name: 'SQL Query Generator & Analyzer',
    description: 'Converts natural language questions into optimized PostgreSQL/MySQL queries with schema safety verification.',
    mode: 'chat',
    icon: '💻',
    icon_background: '#FAF5FF',
    category: 'programming',
    author: 'Data Engineering',
  },
  {
    id: 'tpl-5',
    name: 'HR Policy & Employee Onboarding Bot',
    description: 'Answers internal company policies, leave entitlements, benefits, and guides newcomers through onboarding checklists.',
    mode: 'agent-chat',
    icon: '👥',
    icon_background: '#FFF1F2',
    category: 'hr',
    author: 'People Ops',
  },
  {
    id: 'tpl-6',
    name: 'Financial Report Synthesizer',
    description: 'Analyzes quarterly income statements, balance sheets, and key ratios to extract insights and generate executive summaries.',
    mode: 'workflow',
    icon: '📊',
    icon_background: '#F5F3FF',
    category: 'analysis',
    author: 'Finance AI',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Templates' },
  { id: 'writing', name: 'Writing & Content' },
  { id: 'translate', name: 'Translation' },
  { id: 'analysis', name: 'Data Analysis' },
  { id: 'programming', name: 'Programming' },
  { id: 'customer-service', name: 'Customer Service' },
  { id: 'hr', name: 'Human Resources' },
];

export default function ExplorePage() {
  const t = useTranslations('Explore');
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<AppTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<AppTemplate | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await AppsService.listRecommendedApps(selectedCategory);
        if (!ignore && res?.recommended_apps && res.recommended_apps.length > 0) {
          setTemplates(res.recommended_apps);
        }
      } catch {
        // Fallback to default templates
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [selectedCategory]);

  const filtered = templates.filter((tpl) => {
    const matchCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchQuery =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const handleUseTemplate = async (template: AppTemplate) => {
    setInstalling(true);
    try {
      const result = await AppsService.installAppFromTemplate(template.id, template.name);
      const newAppId = result?.app?.id || result?.id || template.id;
      router.push(`/dashboard/apps/${newAppId}/studio`);
    } catch {
      // In dev environment or mock, fallback to creating standard app
      try {
        const created = await AppsService.create({
          name: `${template.name} (Copy)`,
          description: template.description,
          mode: template.mode,
          icon: template.icon,
          icon_background: template.icon_background,
        });
        router.push(`/dashboard/apps/${created.id}/studio`);
      } catch {
        router.push('/dashboard');
      }
    } finally {
      setInstalling(false);
      setActiveTemplate(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('page_title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('page_description')}</p>
        </div>

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

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:border-blue-300 hover:shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: tpl.icon_background || '#EFF6FF' }}
                >
                  {tpl.icon || '🤖'}
                </div>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 uppercase">
                  {tpl.mode}
                </span>
              </div>

              <h2 className="mt-3.5 text-base font-semibold text-gray-900">{tpl.name}</h2>
              <p className="mt-1.5 text-sm text-gray-500 line-clamp-3">{tpl.description}</p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-400">By {tpl.author}</span>
              <button
                type="button"
                onClick={() => setActiveTemplate(tpl)}
                className="cursor-pointer rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
              >
                {t('use_template_button')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview / Confirmation Modal */}
      {activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: activeTemplate.icon_background || '#EFF6FF' }}
              >
                {activeTemplate.icon || '🤖'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{activeTemplate.name}</h3>
                <span className="text-xs text-gray-400">{activeTemplate.mode} • by {activeTemplate.author}</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{activeTemplate.description}</p>

            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-700">Capabilities included:</p>
              <ul className="mt-2 space-y-1.5 text-xs text-gray-500">
                <li>• Pre-configured System Prompt & Context injection</li>
                <li>• Recommended temperature and reasoning parameters</li>
                <li>• Ready for immediate testing in Prompt Studio</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTemplate(null)}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={installing}
                onClick={() => handleUseTemplate(activeTemplate)}
                className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
              >
                {installing ? t('installing') : t('confirm_use_template')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
