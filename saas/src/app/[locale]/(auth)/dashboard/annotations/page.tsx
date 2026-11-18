'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AnnotationsService } from '@/services/annotations.service';
import { AppsService } from '@/services/apps.service';
import type { AnnotationItem } from '@/types/dify/annotation';
import type { AppDetail } from '@/types/dify/app';

const MOCK_ANNOTATIONS: AnnotationItem[] = [
  {
    id: 'ann-1',
    question: 'How do I connect my custom PostgreSQL database?',
    answer: 'Navigate to Tools & Providers -> PostgreSQL Connector, enter your host, port, database name, and read-only credentials, then click Test Connection.',
    hit_count: 53,
    created_at: Date.now() - 86400000 * 3,
  },
  {
    id: 'ann-2',
    question: 'What are the token limits for GPT-4o on Dify SaaS?',
    answer: 'The default context window is 128,000 tokens with an output maximum of 4,096 tokens per request. You can customize reasoning tokens in the Studio settings.',
    hit_count: 89,
    created_at: Date.now() - 86400000 * 7,
  },
  {
    id: 'ann-3',
    question: 'Can I self-host the SaaS version on private Kubernetes?',
    answer: 'Yes! Our standalone Dockerfile and docker-compose deployment manifests can be ported directly into Helm charts or Kubernetes statefulsets.',
    hit_count: 31,
    created_at: Date.now() - 86400000 * 12,
  },
];

export default function AnnotationsPage() {
  const t = useTranslations('Annotations');

  const [apps, setApps] = useState<AppDetail[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [annotations, setAnnotations] = useState<AnnotationItem[]>(MOCK_ANNOTATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnotationItem | null>(null);

  // Form inputs
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load apps list
  useEffect(() => {
    let ignore = false;
    async function loadApps() {
      try {
        const res = await AppsService.list(1, 50);
        if (!ignore && res?.data && res.data.length > 0) {
          setApps(res.data);
          const firstApp = res.data[0];
          if (firstApp) {
            setSelectedAppId(firstApp.id);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadApps();
    return () => {
      ignore = true;
    };
  }, []);

  // Load annotations for selected app
  useEffect(() => {
    if (!selectedAppId) return;
    let ignore = false;
    async function loadAnnotations() {
      try {
        const res = await AnnotationsService.list(selectedAppId);
        if (!ignore && res?.data && res.data.length > 0) {
          setAnnotations(res.data);
        }
      } catch {
        // Fallback to mock
      }
    }
    loadAnnotations();
    return () => {
      ignore = true;
    };
  }, [selectedAppId]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormQuestion('');
    setFormAnswer('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AnnotationItem) => {
    setEditingItem(item);
    setFormQuestion(item.question);
    setFormAnswer(item.answer);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) return;
    setIsSubmitting(true);

    try {
      if (editingItem) {
        await AnnotationsService.update(selectedAppId, editingItem.id, formQuestion, formAnswer);
        setAnnotations((prev) =>
          prev.map((a) => (a.id === editingItem.id ? { ...a, question: formQuestion, answer: formAnswer } : a))
        );
      } else {
        const created = await AnnotationsService.create(selectedAppId, formQuestion, formAnswer);
        setAnnotations([created, ...annotations]);
      }
    } catch {
      // Mock update local state
      if (editingItem) {
        setAnnotations((prev) =>
          prev.map((a) => (a.id === editingItem.id ? { ...a, question: formQuestion, answer: formAnswer } : a))
        );
      } else {
        const newItem: AnnotationItem = {
          id: `ann-${Date.now()}`,
          question: formQuestion,
          answer: formAnswer,
          hit_count: 0,
          created_at: Date.now(),
        };
        setAnnotations([newItem, ...annotations]);
      }
    } finally {
      setIsSubmitting(false);
      setModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await AnnotationsService.delete(selectedAppId, id);
    } catch {
      // Local fallback
    }
    setAnnotations(annotations.filter((a) => a.id !== id));
  };

  const totalHits = annotations.reduce((sum, item) => sum + (item.hit_count || 0), 0);

  const query = searchQuery.trim().toLowerCase();
  const filtered = annotations.filter(
    (item) =>
      !query ||
      (item.question?.toLowerCase() || '').includes(query) ||
      (item.answer?.toLowerCase() || '').includes(query)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('page_title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('page_description')}</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
        >
          + {t('add_annotation_button')}
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">{t('metric_cached_pairs')}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{annotations.length}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">✓ Active instant responses</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">{t('metric_total_hits')}</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{totalHits}</p>
          <p className="mt-1 text-xs text-gray-400">Total queries bypassed</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">{t('metric_latency_saved')}</p>
          <p className="mt-2 text-2xl font-bold text-purple-600">~95%</p>
          <p className="mt-1 text-xs text-gray-400">Avg sub-50ms response</p>
        </div>
      </div>

      {/* Controls Bar: App Filter & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">{t('filter_app_label')}:</span>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-hidden"
          >
            {apps.length === 0 && <option value="">Default AI App</option>}
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden"
          />
          <svg
            className="absolute top-2 left-2.5 h-3.5 w-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Annotations Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {t('no_annotations_found')}
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">{t('th_question')}</th>
                <th className="px-6 py-3.5">{t('th_answer')}</th>
                <th className="px-6 py-3.5 text-center">{t('th_hits')}</th>
                <th className="px-6 py-3.5 text-right">{t('th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs">
                    <p className="line-clamp-2">{item.question}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 max-w-md">
                    <p className="line-clamp-2">{item.answer}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {item.hit_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {t('action_edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        {t('action_delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              {editingItem ? t('modal_edit_title') : t('modal_create_title')}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{t('modal_subtitle')}</p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  {t('label_question')}
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder={t('placeholder_question')}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  {t('label_answer')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder={t('placeholder_answer')}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-3.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? t('saving') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
