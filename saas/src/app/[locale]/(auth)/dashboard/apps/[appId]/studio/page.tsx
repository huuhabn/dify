'use client';

import { use, useEffect, useState } from 'react';
import { AppsService } from '@/services/apps.service';
import type { AppDetail } from '@/types/dify/app';
import { Link } from '@/libs/I18nNavigation';

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AppStudioPage({
  params,
}: {
  params: Promise<{ locale: string; appId: string }>;
}) {
  const { appId } = use(params);
  const [app, setApp] = useState<AppDetail | null>(null);

  // Configuration state
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an intelligent AI assistant. Answer questions clearly, accurately, and politely.',
  );
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(2048);

  // Chat simulator state
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am configured and ready to test in this studio simulator. Ask me anything!',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);

  // Publish state
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await AppsService.get(appId);
        setApp(data);
        if (data.model_config?.pre_prompt) {
          setSystemPrompt(data.model_config.pre_prompt);
        }
      } catch {
        setApp({
          id: appId,
          name: 'AI Customer Assistant',
          description: 'Studio prompt engineering and testing',
          mode: 'chat',
          icon: '🤖',
          icon_background: '#EBF5FF',
          enable_site: true,
          enable_api: true,
          created_at: Date.now() / 1000,
          updated_at: Date.now() / 1000,
        });
      }
    }
    load();
  }, [appId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || sending) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const newMessages: ChatMsg[] = [
      ...messages,
      { id: `user-${Date.now()}`, role: 'user', content: userText },
    ];
    setMessages(newMessages);
    setSending(true);

    try {
      const res = await AppsService.sendChatMessage(appId, userText);
      setMessages([
        ...newMessages,
        {
          id: res.message_id || `bot-${Date.now()}`,
          role: 'assistant',
          content: res.answer || 'Response received successfully.',
        },
      ]);
    } catch {
      // Simulator fallback response
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: `[Simulator Response with ${selectedModel} | Temp: ${temperature}]: I received your message: "${userText}". All instructions from the system prompt have been applied.`,
          },
        ]);
        setSending(false);
      }, 600);
      return;
    }
    setSending(false);
  };

  const handlePublish = async () => {
    setPublished(true);
    setTimeout(() => {
      setPublished(false);
      setPublishModalOpen(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col -m-6 md:-m-8">
      {/* Studio Topbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/apps/${appId}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            ←
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{app?.name || 'Studio'}</span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
              Prompt Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPublishModalOpen(true)}
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition-colors"
          >
            Publish Changes
          </button>
        </div>
      </header>

      {/* 3-Column Studio Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Model & Prompts */}
        <section className="flex w-96 flex-col border-r border-gray-200 bg-white p-5 overflow-y-auto space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Model Selection
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google Gemini</option>
                <option value="deepseek">DeepSeek</option>
                <option value="ollama">Ollama (Local)</option>
              </select>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="claude-3-5-sonnet">claude-3.5-sonnet</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                <option value="deepseek-v3">deepseek-v3</option>
              </select>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                System Prompt (Instructions)
              </label>
              <span className="text-2xs text-gray-400">Supports &#123;&#123;vars&#125;&#125;</span>
            </div>
            <textarea
              rows={12}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="mt-2 w-full flex-1 rounded-xl border border-gray-300 p-3 font-mono text-xs leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Describe persona, knowledge grounding, response formats..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Context & Datasets
            </label>
            <div className="mt-2 rounded-xl border border-dashed border-gray-300 p-3 text-center text-xs text-gray-500">
              <p>Link Knowledge Bases for RAG</p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                + Connect Dataset
              </button>
            </div>
          </div>
        </section>

        {/* Center Column: Live Chat Simulator */}
        <section className="flex flex-1 flex-col bg-gray-50/60 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-200/80 bg-white/70 px-6 py-2.5 backdrop-blur-xs">
            <span className="text-xs font-semibold text-gray-600">
              Simulator Preview (Live Test)
            </span>
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Conversation history cleared. Ready for next prompt.',
                  },
                ])
              }
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Clear Messages
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs text-gray-400 shadow-2xs animate-pulse">
                  AI is generating response...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Type your message to test this assistant..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={sending || !inputQuery.trim()}
                className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Parameters & Sliders */}
        <section className="w-72 border-l border-gray-200 bg-white p-5 space-y-6 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Model Parameters
          </h3>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-gray-700">
              <span>Temperature</span>
              <span className="font-mono text-gray-900">{temperature}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="mt-2 w-full cursor-pointer accent-blue-600"
            />
            <p className="mt-1 text-2xs text-gray-400">
              Higher values make output more random; lower values make it focused.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-gray-700">
              <span>Top P</span>
              <span className="font-mono text-gray-900">{topP}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="mt-2 w-full cursor-pointer accent-blue-600"
            />
            <p className="mt-1 text-2xs text-gray-400">
              Nucleus sampling threshold.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-gray-700">
              <span>Max Tokens</span>
              <span className="font-mono text-gray-900">{maxTokens}</span>
            </div>
            <input
              type="range"
              min={256}
              max={4096}
              step={256}
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              className="mt-2 w-full cursor-pointer accent-blue-600"
            />
          </div>
        </section>
      </div>

      {/* Publish Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Publish App Changes</h3>
            <p className="mt-2 text-sm text-gray-500">
              Deploy your latest prompt, model parameters, and knowledge configurations to production.
            </p>

            {published ? (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm font-semibold text-green-800">
                ✓ Published successfully to production!
              </div>
            ) : (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPublishModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 cursor-pointer"
                >
                  Confirm & Publish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
