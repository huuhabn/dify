'use client';

import { use, useEffect, useState } from 'react';
import { DatasetsService } from '@/services/datasets.service';
import type { Dataset, Document, HitTestingRecord } from '@/types/dify/dataset';
import { DocumentUploadWizard } from '@/components/knowledge/DocumentUploadWizard';
import { Link } from '@/libs/I18nNavigation';

export default function DatasetDetailPage({
  params,
}: {
  params: Promise<{ locale: string; datasetId: string }>;
}) {
  const { datasetId } = use(params);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<'documents' | 'hit-testing' | 'settings'>('documents');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Hit testing state
  const [testQuery, setTestQuery] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<HitTestingRecord[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [ds, docs] = await Promise.all([
          DatasetsService.get(datasetId),
          DatasetsService.listDocuments(datasetId),
        ]);
        setDataset(ds);
        setDocuments(docs.data || []);
      } catch {
        // Fallback sample data
        setDataset({
          id: datasetId,
          name: 'Company Product Documentation',
          description: 'Technical manuals, API specs, and FAQ for customer support',
          permission: 'all_team_members',
          indexing_technique: 'high_quality',
          document_count: 3,
          word_count: 85200,
          created_at: Date.now() / 1000 - 86400 * 5,
          updated_at: Date.now() / 1000,
        });
        setDocuments([
          {
            id: 'doc-1',
            position: 1,
            data_source_type: 'upload_file',
            name: 'API_Reference_Manual_v2.pdf',
            word_count: 42100,
            indexing_status: 'completed',
            enabled: true,
            created_at: Date.now() / 1000 - 86400 * 3,
            updated_at: Date.now() / 1000,
          },
          {
            id: 'doc-2',
            position: 2,
            data_source_type: 'upload_file',
            name: 'Troubleshooting_Guide_2026.docx',
            word_count: 28400,
            indexing_status: 'completed',
            enabled: true,
            created_at: Date.now() / 1000 - 86400 * 2,
            updated_at: Date.now() / 1000,
          },
          {
            id: 'doc-3',
            position: 3,
            data_source_type: 'upload_file',
            name: 'Release_Notes_Q1.md',
            word_count: 14700,
            indexing_status: 'completed',
            enabled: false,
            created_at: Date.now() / 1000 - 86400,
            updated_at: Date.now() / 1000,
          },
        ]);
      }
    }
    loadData();
  }, [datasetId]);

  const handleToggleDoc = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, enabled: !d.enabled } : d)),
    );
  };

  const handleRunHitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim() || testing) return;

    setTesting(true);
    try {
      const res = await DatasetsService.hitTesting(datasetId, testQuery);
      setTestResults(res.records || []);
    } catch {
      // Mock hit testing results
      setTimeout(() => {
        setTestResults([
          {
            score: 0.94,
            segment: {
              id: 'seg-1',
              position: 1,
              document_id: 'doc-1',
              content: 'The Dify Next.js SaaS Boilerplate uses Tailwind CSS v4 and provides modular clean architecture for AI agents and workflows.',
              word_count: 24,
              tokens: 32,
              hit_count: 15,
              enabled: true,
              status: 'completed',
            },
          },
          {
            score: 0.82,
            segment: {
              id: 'seg-2',
              position: 2,
              document_id: 'doc-1',
              content: 'Authentication reverse proxy handles session verification and forwards all /console/api calls directly to Python backend.',
              word_count: 21,
              tokens: 28,
              hit_count: 8,
              enabled: true,
              status: 'completed',
            },
          },
        ]);
        setTesting(false);
      }, 500);
      return;
    }
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/knowledge"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {dataset?.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{dataset?.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
          >
            + Add Document
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-gray-100">
          {[
            { id: 'documents', label: 'Documents & Files' },
            { id: 'hit-testing', label: 'Hit Testing (Retrieval Playground)' },
            { id: 'settings', label: 'Knowledge Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'documents' | 'hit-testing' | 'settings')}
              className={`cursor-pointer px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Documents List */}
      {activeTab === 'documents' && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  Document
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Word Count
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Enabled
                </th>
                <th scope="col" className="relative px-6 py-3.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <span className="font-semibold text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {doc.word_count.toLocaleString()} words
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      {doc.indexing_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleDoc(doc.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        doc.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          doc.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/knowledge/${datasetId}/documents/${doc.id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                    >
                      Manage Chunks →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Hit Testing */}
      {activeTab === 'hit-testing' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
            <h3 className="text-base font-semibold text-gray-900">
              Retrieval Playground (Hit Testing)
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Test semantic search and chunk relevance scores against this dataset before connecting to your agent.
            </p>

            <form onSubmit={handleRunHitTest} className="mt-4 flex gap-3">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Enter sample query (e.g. How does authentication work?)..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={testing || !testQuery.trim()}
                className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
              >
                {testing ? 'Searching...' : 'Test Retrieval'}
              </button>
            </form>
          </div>

          {/* Results List */}
          {testResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Matched Segments ({testResults.length})
              </h4>
              {testResults.map((rec, idx) => (
                <div
                  key={rec.segment.id || idx}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-xs font-semibold text-gray-500">
                      Segment #{idx + 1}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/50">
                      Similarity Score: {(rec.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-800 leading-relaxed font-mono">
                    {rec.segment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Dataset Configuration</h3>
          <div>
            <label className="block text-xs font-medium text-gray-700">Dataset Name</label>
            <input
              type="text"
              defaultValue={dataset?.name}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              defaultValue={dataset?.description}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900"
            />
          </div>
          <div className="pt-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
            >
              Update Settings
            </button>
          </div>
        </div>
      )}

      {/* Document Upload Wizard Modal */}
      <DocumentUploadWizard
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        datasetId={datasetId}
      />
    </div>
  );
}
