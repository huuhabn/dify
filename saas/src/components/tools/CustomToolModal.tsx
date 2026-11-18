'use client';

import { useState } from 'react';
import { ToolsService } from '@/services/tools.service';

type CustomToolModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const SAMPLE_SCHEMA = `openapi: 3.0.0
info:
  title: Sample Weather API
  version: 1.0.0
  description: A simple weather query service
servers:
  - url: https://api.weather.example.com
paths:
  /current:
    get:
      summary: Get current weather
      operationId: getCurrentWeather
      parameters:
        - name: city
          in: query
          required: true
          schema:
            type: string
          description: City name
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  city:
                    type: string
                  temperature:
                    type: number
                  condition:
                    type: string`;

export function CustomToolModal({
  isOpen,
  onClose,
  onSuccess,
}: CustomToolModalProps) {
  const [name, setName] = useState('');
  const [schema, setSchema] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !schema.trim()) return;

    setSaving(true);
    setError(null);

    const provider = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    try {
      await ToolsService.createCustomTool({
        provider,
        icon: {
          background: '#2563EB',
          content: '🔧',
        },
        credentials: {
          auth_type: 'none',
        },
        schema_type: 'openapi',
        schema: schema.trim(),
        privacy_policy: '',
        custom_disclaimer: '',
        labels: [],
      });

      setName('');
      setSchema('');
      setSaving(false);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setSaving(false);
      const message = err instanceof Error ? err.message : 'Failed to save custom tool. Please check the schema format.';
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
          <h3 className="font-bold text-gray-900">Create Custom API Tool</h3>
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
            <label className="block text-xs font-semibold text-gray-700">Tool Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. WeatherService, PetStore"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-2xs text-gray-400">
              Identifier: {name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || '...'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700">
                OpenAPI 3.0 Schema (YAML / JSON)
              </label>
              <button
                type="button"
                onClick={() => setSchema(SAMPLE_SCHEMA)}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Insert Sample
              </button>
            </div>
            <textarea
              rows={9}
              required
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder="Paste openapi: 3.0.0 specification (must include servers)..."
              className="mt-1 block w-full rounded-xl border border-gray-300 p-3 font-mono text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            />
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
              disabled={saving || !name.trim() || !schema.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Validating & Saving...' : 'Create Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
