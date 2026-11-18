'use client';

import { useEffect, useState } from 'react';
import { ModelProviderModal } from '@/components/tools/ModelProviderModal';
import { CustomToolModal } from '@/components/tools/CustomToolModal';
import {
  ToolsService,
  type BuiltInToolProvider,
  type ApiToolProvider,
} from '@/services/tools.service';

type ProviderItem = {
  name: string;
  targetProvider?: string;
  label: string;
  icon: string;
  configured: boolean;
  models: string[];
};

const defaultProvidersList: ProviderItem[] = [
  {
    name: 'google',
    targetProvider: 'langgenius/gemini/google',
    label: 'Google Gemini',
    icon: '✨',
    configured: false,
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  },
  {
    name: 'openai',
    targetProvider: 'langgenius/openai/openai',
    label: 'OpenAI',
    icon: '🤖',
    configured: false,
    models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview'],
  },
  {
    name: 'anthropic',
    targetProvider: 'langgenius/anthropic/anthropic',
    label: 'Anthropic',
    icon: '🧠',
    configured: false,
    models: ['claude-3-5-sonnet', 'claude-3-5-haiku'],
  },
  {
    name: 'deepseek',
    targetProvider: 'langgenius/deepseek/deepseek',
    label: 'DeepSeek',
    icon: '🐋',
    configured: false,
    models: ['deepseek-v3', 'deepseek-r1'],
  },
  {
    name: 'groq',
    targetProvider: 'langgenius/groq/groq',
    label: 'Groq',
    icon: '⚡',
    configured: false,
    models: ['llama-3.3-70b-versatile'],
  },
  {
    name: 'ollama',
    targetProvider: 'langgenius/ollama/ollama',
    label: 'Ollama (Local)',
    icon: '🦙',
    configured: false,
    models: ['llama3.2', 'deepseek-r1:8b'],
  },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'providers' | 'builtin' | 'custom'>('providers');
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [isCustomToolOpen, setIsCustomToolOpen] = useState(false);

  // Dynamic state
  const [providers, setProviders] = useState<ProviderItem[]>(defaultProvidersList);
  const [builtinTools, setBuiltinTools] = useState<BuiltInToolProvider[]>([]);
  const [customTools, setCustomTools] = useState<ApiToolProvider[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [deletingTool, setDeletingTool] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingTools(true);
    try {
      const [modelRes, builtinRes, customRes] = await Promise.allSettled([
        ToolsService.listModelProviders(),
        ToolsService.listBuiltInTools(),
        ToolsService.listCustomTools(),
      ]);

      if (modelRes.status === 'fulfilled' && modelRes.value?.data) {
        const configuredNames = new Set(
          modelRes.value.data
            .filter(
              (p) =>
                p.status === 'active' ||
                (p as { custom_configuration?: { status?: string } }).custom_configuration?.status === 'active',
            )
            .map((p) => p.provider),
        );
        setProviders(
          defaultProvidersList.map((p) => ({
            ...p,
            configured:
              configuredNames.has(p.targetProvider || '') ||
              configuredNames.has(p.name),
          })),
        );
      }

      if (builtinRes.status === 'fulfilled' && Array.isArray(builtinRes.value)) {
        setBuiltinTools(builtinRes.value);
      }

      if (customRes.status === 'fulfilled' && Array.isArray(customRes.value)) {
        setCustomTools(customRes.value);
      }
    } finally {
      setLoadingTools(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCustomTool = async (providerName: string) => {
    if (!confirm(`Are you sure you want to delete custom tool "${providerName}"?`)) return;

    setDeletingTool(providerName);
    try {
      await ToolsService.deleteCustomTool(providerName);
      setCustomTools((prev) => prev.filter((t) => t.name !== providerName));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete tool');
    } finally {
      setDeletingTool(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Model Providers & Tools
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect AI models, configure API keys, and equip your agents with tools and plugins.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomToolOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Custom API Tool
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'providers', label: 'AI Model Providers' },
          { id: 'builtin', label: `Built-in Tools (${builtinTools.length || '...'})` },
          { id: 'custom', label: `Custom Tools & MCP (${customTools.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'providers' | 'builtin' | 'custom')}
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

      {/* Tab 1: AI Model Providers */}
      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((prov) => (
            <div
              key={prov.name}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-2xl border border-gray-100 shadow-2xs">
                    {prov.icon}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      prov.configured
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {prov.configured ? 'Configured' : 'No API Key'}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-gray-900">{prov.label}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {prov.models.map((m) => (
                    <span
                      key={m}
                      className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-2xs text-gray-600"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedProvider({
                      ...prov,
                      name: prov.targetProvider || prov.name,
                    })
                  }
                  className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {prov.configured ? 'Edit Credentials' : 'Add API Key'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Built-in Tools */}
      {activeTab === 'builtin' && (
        <div>
          {loadingTools && builtinTools.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading tools catalog...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {builtinTools.map((tool) => {
                const label = typeof tool.label === 'object' ? tool.label.en_US || Object.values(tool.label)[0] : tool.name;
                const description = typeof tool.description === 'object' ? tool.description.en_US || Object.values(tool.description)[0] : '';
                return (
                  <div
                    key={tool.id || tool.name}
                    className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-2xl border border-gray-100 overflow-hidden">
                          {typeof tool.icon === 'string' && tool.icon.startsWith('http') ? (
                            <img src={tool.icon} alt={label} className="h-8 w-8 object-contain" />
                          ) : (
                            '🛠️'
                          )}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {tool.type || 'Built-in'}
                        </span>
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-gray-900">{label}</h3>
                      {tool.author && <p className="text-xs text-blue-600 mt-0.5">by {tool.author}</p>}
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {description || 'Built-in utility tool for agents.'}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Available ({tool.tools?.length || 1} actions)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Custom Tools & MCP */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                🔌
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Custom Tools & MCP Hub</h3>
                <p className="text-xs text-gray-500">
                  Connect any REST API via OpenAPI 3.0 specification or bind Model Context Protocol tool servers.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomToolOpen(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 cursor-pointer whitespace-nowrap"
            >
              + Import OpenAPI Schema
            </button>
          </div>

          {customTools.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-2xl">
                📦
              </div>
              <h4 className="mt-3 text-sm font-semibold text-gray-900">No custom tools added yet</h4>
              <p className="mt-1 text-xs text-gray-500">
                Import an OpenAPI 3.0 specification to expose your custom APIs to Dify agents.
              </p>
              <button
                type="button"
                onClick={() => setIsCustomToolOpen(true)}
                className="mt-4 rounded-lg bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 cursor-pointer"
              >
                Import OpenAPI Schema
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {customTools.map((tool) => {
                const label = typeof tool.label === 'object' ? tool.label.en_US || Object.values(tool.label)[0] : tool.name;
                const description = typeof tool.description === 'object' ? tool.description.en_US || Object.values(tool.description)[0] : '';
                const iconContent = typeof tool.icon === 'object' ? tool.icon.content : '🔧';
                const iconBg = typeof tool.icon === 'object' ? tool.icon.background : '#2563EB';

                return (
                  <div
                    key={tool.id || tool.name}
                    className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white shadow-2xs"
                          style={{ backgroundColor: iconBg || '#2563EB' }}
                        >
                          {iconContent || '🔧'}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          Custom API
                        </span>
                      </div>

                      <h3 className="mt-4 text-base font-bold text-gray-900">{label}</h3>
                      <p className="font-mono text-2xs text-gray-400 mt-0.5">provider: {tool.name}</p>
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {description || 'Custom API tool imported via OpenAPI.'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tool.tools?.map((action) => (
                          <span
                            key={action.name}
                            className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-2xs text-gray-600"
                          >
                            {action.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Active ({tool.tools?.length || 0} endpoints)
                      </span>
                      <button
                        type="button"
                        disabled={deletingTool === tool.name}
                        onClick={() => handleDeleteCustomTool(tool.name)}
                        className="text-xs font-semibold text-red-600 hover:text-red-500 disabled:opacity-50 cursor-pointer"
                      >
                        {deletingTool === tool.name ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ModelProviderModal
        isOpen={Boolean(selectedProvider)}
        onClose={() => setSelectedProvider(null)}
        provider={selectedProvider}
        onSuccess={loadData}
      />

      <CustomToolModal
        isOpen={isCustomToolOpen}
        onClose={() => setIsCustomToolOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
