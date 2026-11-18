'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import { DatasetsService } from '@/services/datasets.service';

type DatasetItem = {
  id: string;
  name: string;
  description?: string;
  document_count?: number;
  word_count?: number;
  updated_at?: number;
  permission?: string;
};

export default function KnowledgePage() {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDatasets() {
      try {
        const res = await DatasetsService.list(1, 30);
        if (res?.data) {
          setDatasets(res.data as unknown as DatasetItem[]);
        }
      } catch (err) {
        console.error('Failed to load datasets', err);
      } finally {
        setLoading(false);
      }
    }
    loadDatasets();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Knowledge & Datasets
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect and manage external documents, vectorized data sources, and knowledge spaces.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Knowledge Base
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Dataset Name
              </th>
              <th scope="col" className="px-6 py-3.5">
                Documents
              </th>
              <th scope="col" className="px-6 py-3.5">
                Word Count
              </th>
              <th scope="col" className="px-6 py-3.5">
                Updated
              </th>
              <th scope="col" className="relative px-6 py-3.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Loading datasets...
                </td>
              </tr>
            ) : datasets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No datasets configured yet.
                </td>
              </tr>
            ) : (
              datasets.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        📄
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {item.document_count ?? 0} files
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {(item.word_count ?? 0).toLocaleString()} words
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {item.updated_at
                      ? new Date(item.updated_at * 1000).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/knowledge/${item.id}`}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
