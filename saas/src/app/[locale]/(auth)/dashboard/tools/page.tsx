'use client';

import { useState } from 'react';
import { ModelProviderModal } from '@/components/tools/ModelProviderModal';
import { CustomToolModal } from '@/components/tools/CustomToolModal';

type ProviderItem = {
  name: string;
  label: string;
  icon: string;
  configured: boolean;
  models: string[];
};

const providersList: ProviderItem[] = [
  {
    name: 'openai',
    label: 'OpenAI',
    icon: '🤖',
    configured: true,
    models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview'],
  },
  {
    name: 'anthropic',
    label: 'Anthropic',
    icon: '🧠',
    configured: true,
    models: ['claude-3-5-sonnet', 'claude-3-5-haiku'],
  },
  {
    name: 'google',
    label: 'Google Gemini',
    icon: '✨',
    configured: false,
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  },
  {
    name: 'deepseek',
    label: 'DeepSeek',
    icon: '🐋',
    configured: true,
    models: ['deepseek-v3', 'deepseek-r1'],
  },
  {
    name: 'groq',
    label: 'Groq',
    icon: '⚡',
    configured: false,
    models: ['llama-3.3-70b-versatile'],
  },
  {
    name: 'ollama',
    label: 'Ollama (Local)',
    icon: '🦙',
    configured: true,
    models: ['llama3.2', 'deepseek-r1:8b'],
  },
];

const builtInTools = [
  {
    id: 'google-search',
    name: 'Google Web Search',
    author: 'Dify Official',
    description: 'Enables agents to query search indices and extract real-time web results.',
    icon: '🔍',
    category: 'Search',
  },
  {
    id: 'python-code',
    name: 'Python Code Execution',
    author: 'Dify Official',
    description: 'Isolated sandbox for running calculations, data transformations, and algorithms.',
    icon: '🐍',
    category: 'Utilities',
  },
  {
    id: 'dall-e',
    name: 'DALL-E Image Generation',
    author: 'OpenAI',
    description: 'Generates high-resolution creative imagery from natural language prompts.',
    icon: '🎨',
    category: 'Image',
  },
  {
    id: 'sql-query',
    name: 'Database SQL Runner',
    author: 'Community',
    description: 'Executes analytical read queries on PostgreSQL, MySQL, and SQLite databases.',
    icon: '🗄️',
    category: 'Database',
  },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'providers' | 'builtin' | 'custom'>('providers');
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [isCustomToolOpen, setIsCustomToolOpen] = useState(false);

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
          { id: 'builtin', label: 'Built-in Tools' },
          { id: 'custom', label: 'Custom Tools & MCP' },
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
          {providersList.map((prov) => (
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
                  onClick={() => setSelectedProvider(prov)}
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {builtInTools.map((tool) => (
            <div
              key={tool.id}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-2xl border border-gray-100">
                    {tool.icon}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {tool.category}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{tool.name}</h3>
                <p className="text-xs text-blue-600 mt-0.5">by {tool.author}</p>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{tool.description}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Available
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Custom Tools & MCP */}
      {activeTab === 'custom' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-2xs text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
            🔌
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">Custom Tools & MCP Hub</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            Connect any internal REST API via OpenAPI 3.0 specification or bind Model Context Protocol (MCP) tool servers.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsCustomToolOpen(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 cursor-pointer"
            >
              Import OpenAPI Schema
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ModelProviderModal
        isOpen={Boolean(selectedProvider)}
        onClose={() => setSelectedProvider(null)}
        provider={selectedProvider}
      />

      <CustomToolModal
        isOpen={isCustomToolOpen}
        onClose={() => setIsCustomToolOpen(false)}
      />
    </div>
  );
}
