'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { DatasetsService } from '@/services/datasets.service';
import type { Segment } from '@/types/dify/dataset';
import { Link } from '@/libs/I18nNavigation';

const MOCK_SEGMENTS: Segment[] = [
  {
    id: 'seg-1',
    position: 1,
    document_id: 'doc-1',
    content: 'Antigravity AI is an autonomous, agent-first development platform designed to streamline full-stack software workflows with intelligent reasoning and deep contextual awareness.',
    word_count: 24,
    tokens: 31,
    hit_count: 42,
    keywords: ['Antigravity', 'autonomous', 'agents'],
    enabled: true,
    status: 'completed',
  },
  {
    id: 'seg-2',
    position: 2,
    document_id: 'doc-1',
    content: 'The Dify architecture separates API orchestration, background worker tasks via Celery and Redis, and frontend rendering via Next.js for high performance and reliability.',
    word_count: 25,
    tokens: 34,
    hit_count: 18,
    keywords: ['architecture', 'Celery', 'Next.js'],
    enabled: true,
    status: 'completed',
  },
  {
    id: 'seg-3',
    position: 3,
    document_id: 'doc-1',
    content: 'Retrieval Augmented Generation (RAG) splits text into semantic chunks, indexes them into pgvector or Milvus, and executes hybrid search with reranking algorithms.',
    word_count: 23,
    tokens: 30,
    hit_count: 67,
    keywords: ['RAG', 'pgvector', 'reranking'],
    enabled: true,
    status: 'completed',
  },
];

export default function DocumentSegmentsPage({
  params,
}: {
  params: Promise<{ locale: string; datasetId: string; documentId: string }>;
}) {
  const { datasetId, documentId } = use(params);
  const t = useTranslations('DocumentSegments');

  const [segments, setSegments] = useState<Segment[]>(MOCK_SEGMENTS);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(MOCK_SEGMENTS[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Editor form state for currently selected segment
  const [editContent, setEditContent] = useState('');
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const activeSegment = segments.find((s) => s.id === selectedSegmentId) || segments[0] || null;

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await DatasetsService.listSegments(datasetId, documentId);
        if (!ignore && res?.data && res.data.length > 0 && res.data[0]) {
          setSegments(res.data);
          setSelectedSegmentId(res.data[0].id);
        }
      } catch {
        // Fallback to initial mock segments
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [datasetId, documentId]);

  useEffect(() => {
    if (activeSegment) {
      setEditContent(activeSegment.content);
      setEditKeywords(activeSegment.keywords || []);
    }
  }, [activeSegment]);

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!editKeywords.includes(keywordInput.trim())) {
        setEditKeywords([...editKeywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (tag: string) => {
    setEditKeywords(editKeywords.filter((k) => k !== tag));
  };

  const handleSaveSegment = async () => {
    if (!activeSegment) return;
    setIsSaving(true);
    try {
      await DatasetsService.updateSegment(datasetId, documentId, activeSegment.id, {
        content: editContent,
        keywords: editKeywords,
      });
      setSegments((prev) =>
        prev.map((s) =>
          s.id === activeSegment.id
            ? { ...s, content: editContent, keywords: editKeywords, word_count: editContent.split(/\s+/).length }
            : s
        )
      );
    } catch {
      // Mock update local state
      setSegments((prev) =>
        prev.map((s) =>
          s.id === activeSegment.id
            ? { ...s, content: editContent, keywords: editKeywords, word_count: editContent.split(/\s+/).length }
            : s
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnable = async (segment: Segment) => {
    const nextEnabled = !segment.enabled;
    try {
      await DatasetsService.updateSegment(datasetId, documentId, segment.id, {
        enabled: nextEnabled,
      });
    } catch {
      // Local state fallback
    }
    setSegments((prev) =>
      prev.map((s) => (s.id === segment.id ? { ...s, enabled: nextEnabled } : s))
    );
  };

  const handleAddNewSegment = async () => {
    const newPosition = segments.length + 1;
    const newContent = 'Enter new chunk content here...';
    try {
      const res = await DatasetsService.createSegment(datasetId, documentId, newContent);
      const created = res.data;
      setSegments([...segments, created]);
      setSelectedSegmentId(created.id);
    } catch {
      const mockNew: Segment = {
        id: `seg-${Date.now()}`,
        position: newPosition,
        document_id: documentId,
        content: newContent,
        word_count: 6,
        tokens: 8,
        hit_count: 0,
        keywords: [],
        enabled: true,
        status: 'completed',
      };
      setSegments([...segments, mockNew]);
      setSelectedSegmentId(mockNew.id);
    }
  };

  const handleDeleteSegment = async () => {
    if (!activeSegment) return;
    try {
      await DatasetsService.deleteSegment(datasetId, documentId, activeSegment.id);
    } catch {
      // Local fallback
    }
    const remaining = segments.filter((s) => s.id !== activeSegment.id);
    setSegments(remaining);
    if (remaining.length > 0 && remaining[0]) {
      setSelectedSegmentId(remaining[0].id);
    }
  };

  const filteredSegments = segments.filter(
    (s) =>
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/knowledge`}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900"
          >
            ← {t('back_to_knowledge')}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-medium text-gray-700">{t('document_chunks_title')}</span>
        </div>

        <button
          type="button"
          onClick={handleAddNewSegment}
          className="cursor-pointer rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500"
        >
          + {t('add_segment_button')}
        </button>
      </div>

      {/* 2-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-h-[680px]">
        {/* Master: Left Column (5 of 12 cols, ~41%) */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-xs lg:col-span-5">
          {/* Segment Search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder={t('search_segments_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
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

          <div className="flex items-center justify-between px-1 py-1 text-xs text-gray-400">
            <span>{segments.length} {t('total_segments')}</span>
            <span>{t('click_to_inspect')}</span>
          </div>

          {/* Scrollable Segment Cards */}
          <div className="mt-2 flex-1 space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
            {filteredSegments.map((segment) => {
              const isSelected = segment.id === selectedSegmentId;
              return (
                <div
                  key={segment.id}
                  onClick={() => setSelectedSegmentId(segment.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 shadow-xs'
                      : 'border-gray-100 bg-gray-50/50 hover:border-gray-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-gray-700 border border-gray-200 shadow-2xs">
                      #{segment.position}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {segment.word_count}w • {segment.tokens}t • {segment.hit_count} hits
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleEnable(segment);
                        }}
                        className={`h-4 w-7 cursor-pointer rounded-full transition-colors ${
                          segment.enabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block h-3 w-3 rounded-full bg-white transition-transform ${
                            segment.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {segment.content}
                  </p>

                  {segment.keywords && segment.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {segment.keywords.map((k) => (
                        <span key={k} className="rounded-sm bg-gray-200/60 px-1 py-0.2 text-[10px] text-gray-600">
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail: Right Column (7 of 12 cols, ~59%) */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-7">
          {activeSegment ? (
            <div className="space-y-5">
              {/* Detail Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {t('segment_editor_title')} #{activeSegment.position}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span>{t('tokens_count')}: <b>{activeSegment.tokens}</b></span>
                    <span>•</span>
                    <span>{t('words_count')}: <b>{activeSegment.word_count}</b></span>
                    <span>•</span>
                    <span>{t('hit_count')}: <b>{activeSegment.hit_count}</b></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDeleteSegment}
                  className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  {t('delete_segment')}
                </button>
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  {t('content_label')}
                </label>
                <textarea
                  rows={10}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder={t('content_placeholder')}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-3.5 text-sm text-gray-800 leading-relaxed placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              {/* Keywords Tag Manager */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  {t('keywords_label')}
                </label>
                <p className="mt-0.5 text-xs text-gray-400">{t('keywords_hint')}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/50 p-2.5">
                  {editKeywords.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(tag)}
                        className="cursor-pointer text-blue-500 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    placeholder={t('add_keyword_placeholder')}
                    className="flex-1 min-w-[120px] bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              {t('no_segment_selected')}
            </div>
          )}

          {/* Action Footer */}
          {activeSegment && (
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveSegment}
                className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
              >
                {isSaving ? t('saving') : t('save_changes')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
