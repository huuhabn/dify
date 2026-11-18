'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/libs/I18nNavigation';

interface EvaluationCase {
  id: string;
  query: string;
  expected: string;
  actual: string;
  score: number; // 0 - 100
  status: 'passed' | 'failed';
  latency_ms: number;
}

const DEFAULT_EVAL_CASES: EvaluationCase[] = [
  {
    id: 'tc-1',
    query: 'What is the refund policy for annual enterprise licenses?',
    expected: 'Full refund within 30 days of purchase upon written notice to enterprise support.',
    actual: 'Customers may request a full refund within 30 days of their annual plan purchase through enterprise support.',
    score: 96,
    status: 'passed',
    latency_ms: 640,
  },
  {
    id: 'tc-2',
    query: 'How do I generate an API key with read-only permissions?',
    expected: 'Go to Settings -> API Access -> Create Key -> select Read-Only role.',
    actual: 'Navigate to Settings -> API Access, click Create Key and assign the Read-Only permission role.',
    score: 98,
    status: 'passed',
    latency_ms: 580,
  },
  {
    id: 'tc-3',
    query: 'Can we install custom Python wheels in workflow code nodes?',
    expected: 'Yes, by specifying requirements in the sandbox container configuration or plugin manifest.',
    actual: 'Yes, custom wheels can be mounted via docker volume or configured in the plugin manifest.',
    score: 92,
    status: 'passed',
    latency_ms: 710,
  },
  {
    id: 'tc-4',
    query: 'What happens if a webhook callback times out after 10 seconds?',
    expected: 'The workflow marks the node as failed and triggers the configured error branch or retry policy.',
    actual: 'The workflow will retry up to 3 times before failing the execution.',
    score: 74,
    status: 'failed',
    latency_ms: 850,
  },
];

export default function EvaluationPage({
  params,
}: {
  params: Promise<{ locale: string; appId: string }>;
}) {
  const { appId } = use(params);
  const t = useTranslations('Evaluation');

  const [testCases, setTestCases] = useState<EvaluationCase[]>(DEFAULT_EVAL_CASES);
  const [isRunning, setIsRunning] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState<EvaluationCase | null>(null);

  const passedCount = testCases.filter((tc) => tc.status === 'passed').length;
  const avgScore = Math.round(
    testCases.reduce((sum, tc) => sum + tc.score, 0) / (testCases.length || 1)
  );
  const avgLatency = Math.round(
    testCases.reduce((sum, tc) => sum + tc.latency_ms, 0) / (testCases.length || 1)
  );

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Simulate refreshed evaluation scores
      setTestCases((prev) =>
        prev.map((tc) => {
          const newScore = Math.min(100, Math.max(65, tc.score + Math.floor(Math.random() * 7 - 3)));
          return {
            ...tc,
            score: newScore,
            status: newScore >= 80 ? 'passed' : 'failed',
            latency_ms: Math.floor(Math.random() * 300 + 500),
          };
        })
      );
      setIsRunning(false);
    }, 1500);
  };

  const filtered = testCases.filter(
    (tc) =>
      tc.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tc.actual.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/apps/${appId}`}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              ← {t('back_to_app')}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-medium text-gray-700">{t('breadcrumb_evaluation')}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{t('page_title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('page_description')}</p>
        </div>

        <button
          type="button"
          disabled={isRunning}
          onClick={handleRunBenchmark}
          className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {isRunning ? t('running_benchmark') : `▶ ${t('run_benchmark_button')}`}
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">{t('metric_pass_rate')}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {Math.round((passedCount / (testCases.length || 1)) * 100)}%
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            {passedCount} / {testCases.length} {t('cases_passed')}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">{t('metric_avg_score')}</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{avgScore} / 100</p>
          <p className="mt-1 text-xs text-gray-400">Semantic similarity</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">{t('metric_avg_latency')}</p>
          <p className="mt-2 text-2xl font-bold text-purple-600">{avgLatency} ms</p>
          <p className="mt-1 text-xs text-gray-400">Response speed</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-gray-500">{t('metric_total_cases')}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{testCases.length}</p>
          <p className="mt-1 text-xs text-gray-400">Evaluation gold set</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 pl-9 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden"
          />
          <svg
            className="absolute top-2.5 left-3 h-3.5 w-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Evaluation Results Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">{t('th_query')}</th>
              <th className="px-6 py-3.5">{t('th_actual_output')}</th>
              <th className="px-6 py-3.5 text-center">{t('th_similarity_score')}</th>
              <th className="px-6 py-3.5 text-center">{t('th_status')}</th>
              <th className="px-6 py-3.5 text-right">{t('th_action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((tc) => (
              <tr key={tc.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs">
                  <p className="line-clamp-2 text-xs">{tc.query}</p>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600 max-w-sm">
                  <p className="line-clamp-2 leading-relaxed">{tc.actual}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-mono text-xs font-bold text-gray-800">{tc.score}%</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      tc.status === 'passed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {tc.status === 'passed' ? t('status_passed') : t('status_failed')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedCase(tc)}
                    className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {t('inspect_details')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Case Inspection Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">{t('modal_title')}</h3>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-semibold text-gray-500 uppercase tracking-wider">{t('th_query')}:</span>
                <p className="mt-1 rounded-xl bg-gray-50 p-3 text-gray-900 font-medium">{selectedCase.query}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-500 uppercase tracking-wider">{t('expected_output')}:</span>
                <p className="mt-1 rounded-xl bg-emerald-50/60 p-3 text-emerald-900 leading-relaxed border border-emerald-100">
                  {selectedCase.expected}
                </p>
              </div>

              <div>
                <span className="font-semibold text-gray-500 uppercase tracking-wider">{t('th_actual_output')}:</span>
                <p className="mt-1 rounded-xl bg-blue-50/60 p-3 text-blue-900 leading-relaxed border border-blue-100">
                  {selectedCase.actual}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 text-gray-500">
                <span>Score: <b className="text-gray-900">{selectedCase.score}/100</b></span>
                <span>Latency: <b className="text-gray-900">{selectedCase.latency_ms} ms</b></span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                {t('close_modal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
