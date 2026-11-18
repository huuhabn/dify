'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Snippet {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

const DEFAULT_SNIPPETS: Snippet[] = [
  {
    id: 'snip-1',
    title: 'Chain-of-Thought (CoT) Reasoning Anchor',
    category: 'reasoning',
    content: 'Before providing your final answer, think step by step. Enclose your internal reasoning process within <thinking>...</thinking> tags, analyzing constraints and edge cases first.',
    tags: ['reasoning', 'cot', 'accuracy'],
  },
  {
    id: 'snip-2',
    title: 'Strict JSON Output Schema Enforcement',
    category: 'formatting',
    content: 'You must respond ONLY with a valid RFC-8259 JSON object matching the requested schema. Do NOT include markdown code blocks, introductory greetings, or concluding remarks.',
    tags: ['json', 'schema', 'api'],
  },
  {
    id: 'snip-3',
    title: 'Hallucination Prevention & Citation Guardrail',
    category: 'guardrail',
    content: 'Rely solely on the provided context retrieved from the knowledge base. If the required information is not explicitly mentioned, state "I do not have sufficient information in the provided context to answer this query."',
    tags: ['rag', 'citations', 'safety'],
  },
  {
    id: 'snip-4',
    title: 'Multi-Perspective Expert Panel Simulation',
    category: 'analysis',
    content: 'Analyze the problem from three distinct specialist perspectives: 1) Senior Software Architect, 2) Security Auditor, 3) Product Operations Manager. Synthesize their consensus recommendation.',
    tags: ['synthesis', 'expert', 'planning'],
  },
  {
    id: 'snip-5',
    title: 'Code Refactoring & Clean Architecture Linter',
    category: 'coding',
    content: 'Review the provided code against SOLID principles, idiomatic patterns, and optimal algorithmic time/space complexity. Highlight security vulnerabilities and provide an annotated, complete refactored version.',
    tags: ['coding', 'refactor', 'solid'],
  },
];

export default function SnippetsPage() {
  const t = useTranslations('Snippets');

  const [snippets, setSnippets] = useState<Snippet[]>(DEFAULT_SNIPPETS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal for new snippet
  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('reasoning');
  const [formContent, setFormContent] = useState('');

  // AI Prompt Optimizer State
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [rawPrompt, setRawPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleCopy = (snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.content);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const newSnippet: Snippet = {
      id: `snip-${Date.now()}`,
      title: formTitle,
      category: formCategory,
      content: formContent,
      tags: [formCategory],
    };

    setSnippets([newSnippet, ...snippets]);
    setModalOpen(false);
    setFormTitle('');
    setFormContent('');
  };

  const handleOptimizePrompt = () => {
    if (!rawPrompt.trim()) return;
    setIsOptimizing(true);

    setTimeout(() => {
      setOptimizedPrompt(
        `### Role & Objective\nYou are an expert autonomous assistant tasked with executing: "${rawPrompt.trim()}".\n\n### Execution Guidelines\n1. Analyze input context thoroughly before formulating conclusions.\n2. Adopt a structured, professional, and deterministic tone.\n3. Verify all factual statements and output structured results.\n\n### Constraints\n- Adhere strictly to domain best practices and avoid unsubstantiated claims.\n- Format deliverables in clean GitHub-flavored markdown.`
      );
      setIsOptimizing(false);
    }, 1200);
  };

  const filtered = snippets.filter((s) => {
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      !query ||
      (s.title?.toLowerCase() || '').includes(query) ||
      (s.content?.toLowerCase() || '').includes(query);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('page_title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('page_description')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOptimizerOpen(true)}
            className="cursor-pointer rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
          >
            ✨ {t('ai_optimizer_button')}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition-colors"
          >
            + {t('create_snippet_button')}
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'reasoning', 'formatting', 'guardrail', 'analysis', 'coding'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? t('category_all') : cat}
            </button>
          ))}
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

      {/* Snippets Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((snip) => (
          <div
            key={snip.id}
            className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:border-blue-300 hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 capitalize">
                  {snip.category}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {snip.content.length} chars
                </span>
              </div>

              <h2 className="mt-3 text-base font-semibold text-gray-900">{snip.title}</h2>
              <p className="mt-2 text-xs text-gray-600 line-clamp-4 leading-relaxed font-mono bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                {snip.content}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {snip.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => handleCopy(snip)}
                className="cursor-pointer rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {copiedId === snip.id ? `✓ ${t('copied')}` : t('copy_snippet')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Snippet Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">{t('modal_create_title')}</h3>
            <p className="mt-1 text-xs text-gray-500">{t('modal_create_subtitle')}</p>

            <form onSubmit={handleCreateSnippet} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700">{t('label_title')}</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. JSON Format Guardrail"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">{t('label_category')}</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="reasoning">Reasoning & Thinking</option>
                  <option value="formatting">Structured Output & Formatting</option>
                  <option value="guardrail">Safety & Grounding Guardrails</option>
                  <option value="analysis">Deep Analytical Thinking</option>
                  <option value="coding">Software Architecture & Coding</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">{t('label_content')}</label>
                <textarea
                  rows={5}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Paste your prompt instructions or directive..."
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-3.5 text-sm text-gray-900 font-mono leading-relaxed focus:border-blue-500 focus:outline-hidden"
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
                  className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
                >
                  {t('save_snippet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Prompt Optimizer Modal */}
      {optimizerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="text-lg font-bold text-gray-900">{t('optimizer_modal_title')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOptimizerOpen(false)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">{t('optimizer_modal_desc')}</p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">{t('raw_prompt_label')}</label>
                <textarea
                  rows={8}
                  value={rawPrompt}
                  onChange={(e) => setRawPrompt(e.target.value)}
                  placeholder="e.g. Write a customer support assistant that handles billing questions politely..."
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-900 focus:border-purple-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">{t('optimized_result_label')}</label>
                <textarea
                  rows={8}
                  readOnly
                  value={optimizedPrompt}
                  placeholder="Optimized prompt with role, context, steps, and guardrails will appear here..."
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900 font-mono leading-relaxed"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOptimizerOpen(false)}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={isOptimizing || !rawPrompt.trim()}
                onClick={handleOptimizePrompt}
                className="cursor-pointer rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                {isOptimizing ? t('optimizing') : `✨ ${t('optimize_now')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
