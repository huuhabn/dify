'use client';

import { useState } from 'react';

type CustomToolModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function CustomToolModal({
  isOpen,
  onClose,
  onSuccess,
}: CustomToolModalProps) {
  const [name, setName] = useState('');
  const [schema, setSchema] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900">Create Custom API Tool</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700">Tool Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. WeatherService, SlackNotifier"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700">
                OpenAPI 3.0 Schema (YAML / JSON)
              </label>
              <button
                type="button"
                onClick={() =>
                  setSchema(`openapi: 3.0.0
info:
  title: Sample Weather API
  version: 1.0.0
paths:
  /weather:
    get:
      summary: Get current temperature
      parameters:
        - name: city
          in: query
          required: true
          schema:
            type: string`)
                }
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Insert Sample
              </button>
            </div>
            <textarea
              rows={8}
              required
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder="Paste openapi: 3.0.0 specification..."
              className="mt-1 block w-full rounded-xl border border-gray-300 p-3 font-mono text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !schema.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Validating Schema...' : 'Create Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
