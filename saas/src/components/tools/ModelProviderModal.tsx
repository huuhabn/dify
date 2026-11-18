'use client';

import { useState } from 'react';
import { ToolsService } from '@/services/tools.service';

type ModelProviderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    name: string;
    label: string;
    icon: string;
  } | null;
  onSuccess?: () => void;
};

export function ModelProviderModal({
  isOpen,
  onClose,
  provider,
  onSuccess,
}: ModelProviderModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !provider) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const credentials: Record<string, string> = {
        api_key: apiKey.trim(),
      };
      if (baseUrl.trim()) {
        credentials.api_base = baseUrl.trim();
        credentials.openai_api_base = baseUrl.trim();
      }

      await ToolsService.saveModelProviderCredentials(
        provider.name,
        credentials,
        `${provider.name}-credential`,
      );

      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setApiKey('');
        setBaseUrl('');
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setSaving(false);
      const message = err instanceof Error ? err.message : 'Validation failed. Please verify your credentials.';
      setError(message);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xl">
              {provider.icon}
            </span>
            <div>
              <h3 className="font-bold text-gray-900">{provider.label}</h3>
              <p className="text-xs text-gray-500">Configure Credentials & Endpoint</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {success ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm font-semibold text-green-800">
            ✓ Provider credentials validated and saved!
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700">API Key</label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-2xs text-gray-400">
                Your API key is encrypted and stored securely in Dify.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Custom API Base URL (Optional)
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
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
                disabled={saving || !apiKey.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Validating Connection...' : 'Save & Validate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
