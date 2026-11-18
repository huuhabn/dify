'use client';

import { useState } from 'react';
import { DatasetsService } from '@/services/datasets.service';
import type { Dataset } from '@/types/dify/dataset';

type CreateDatasetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (dataset: Dataset) => void;
};

export function CreateDatasetModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDatasetModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [indexingTechnique, setIndexingTechnique] = useState<'economy' | 'high_quality'>('economy');
  const [permission, setPermission] = useState<'only_me' | 'all_team_members'>('all_team_members');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const created = await DatasetsService.create(
        name.trim(),
        description.trim(),
        indexingTechnique,
        permission,
      );

      setName('');
      setDescription('');
      setSaving(false);
      onSuccess?.(created);
      onClose();
    } catch (err: unknown) {
      setSaving(false);
      const message = err instanceof Error ? err.message : 'Failed to create knowledge base';
      setError(message);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-lg">
              📚
            </span>
            <h3 className="font-bold text-gray-900">Create Knowledge Base</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700">Knowledge Base Name</label>
            <input
              type="text"
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product Documentation, HR Guidelines"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the knowledge base content..."
              className="mt-1 block w-full rounded-xl border border-gray-300 p-3 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Indexing Method</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex cursor-pointer flex-col rounded-xl border p-3 transition-colors ${
                  indexingTechnique === 'economy'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="indexingTechnique"
                    value="economy"
                    checked={indexingTechnique === 'economy'}
                    onChange={() => setIndexingTechnique('economy')}
                    className="text-blue-600"
                  />
                  <span className="text-xs font-bold text-gray-900">Economy (Inverted Index)</span>
                </div>
                <p className="mt-1 text-2xs text-gray-500">
                  Keyword-based search. Does not consume token quotas or require embedding models.
                </p>
              </label>

              <label
                className={`flex cursor-pointer flex-col rounded-xl border p-3 transition-colors ${
                  indexingTechnique === 'high_quality'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="indexingTechnique"
                    value="high_quality"
                    checked={indexingTechnique === 'high_quality'}
                    onChange={() => setIndexingTechnique('high_quality')}
                    className="text-blue-600"
                  />
                  <span className="text-xs font-bold text-gray-900">High Quality (Vector)</span>
                </div>
                <p className="mt-1 text-2xs text-gray-500">
                  Vector semantic embedding search. Requires configured embedding model provider.
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Permissions</label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'only_me' | 'all_team_members')}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all_team_members">All Workspace Members (Read & Write)</option>
              <option value="only_me">Only Me (Private)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Creating...' : 'Create Knowledge Base'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
