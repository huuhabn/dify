'use client';

import { use, useEffect, useState } from 'react';
import type { ConversationSession, ConversationMessage } from '@/types/dify/log';
import { Link } from '@/libs/I18nNavigation';

export default function AppLogsPage({
  params,
}: {
  params: Promise<{ locale: string; appId: string }>;
}) {
  const { appId } = use(params);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    // Sample conversation sessions
    setSessions([
      {
        id: 'conv-1',
        status: 'completed',
        from_source: 'web_app',
        from_account_name: 'David Miller',
        name: 'Technical Inquiry about API Limits',
        summary: 'User requested rate limit clarification and enterprise quota details.',
        message_count: 4,
        created_at: Date.now() / 1000 - 1800,
        updated_at: Date.now() / 1000 - 1600,
      },
      {
        id: 'conv-2',
        status: 'completed',
        from_source: 'api',
        from_account_name: 'Sarah Connor',
        name: 'Document Analysis Run',
        summary: 'Parsed Q3 financial PDF and generated summary bullet points.',
        message_count: 2,
        created_at: Date.now() / 1000 - 7200,
        updated_at: Date.now() / 1000 - 7100,
      },
      {
        id: 'conv-3',
        status: 'completed',
        from_source: 'web_app',
        from_account_name: 'Alex Wong',
        name: 'Customer Service Return Policy',
        summary: 'Answered inquiry regarding 30-day refund window and return labels.',
        message_count: 6,
        created_at: Date.now() / 1000 - 86400,
        updated_at: Date.now() / 1000 - 85000,
      },
    ]);
  }, [appId]);

  const handleInspectSession = async (session: ConversationSession) => {
    setSelectedSession(session);
    setLoadingMessages(true);

    // Mock turn-by-turn conversation messages
    setTimeout(() => {
      setMessages([
        {
          id: 'm1',
          conversation_id: session.id,
          query: 'What are the current API rate limits for the developer plan?',
          answer: 'The developer tier supports up to 60 requests per minute (RPM) and 2,000 requests per hour (RPH). Higher limits are available upon request.',
          total_tokens: 142,
          provider_response_latency: 0.85,
          feedback: { rating: 'like' },
          created_at: session.created_at,
        },
        {
          id: 'm2',
          conversation_id: session.id,
          query: 'Can we burst above 60 RPM if we configure batch requests?',
          answer: 'Batch requests are processed through asynchronous workflow queues and do not count toward your synchronous interactive RPM ceiling.',
          total_tokens: 189,
          provider_response_latency: 1.12,
          feedback: { rating: 'like' },
          created_at: session.created_at + 120,
        },
      ]);
      setLoadingMessages(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/apps/${appId}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Monitoring & Conversation Logs
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Auditing chat sessions, latency performance, and user ratings.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Sessions</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">1,428</p>
          <span className="mt-1 inline-block text-xs font-medium text-emerald-600">↑ 12% this week</span>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Tokens</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">842.5k</p>
          <span className="mt-1 inline-block text-xs text-gray-400">Avg 480 tokens/msg</span>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Avg Latency</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">1.24s</p>
          <span className="mt-1 inline-block text-xs font-medium text-emerald-600">Fast response</span>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">User Satisfaction</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">96.8%</p>
          <span className="mt-1 inline-block text-xs font-medium text-emerald-600">👍 284 positive</span>
        </div>
      </div>

      {/* Table of Sessions */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th scope="col" className="px-6 py-3.5">Session / Summary</th>
              <th scope="col" className="px-6 py-3.5">User</th>
              <th scope="col" className="px-6 py-3.5">Source</th>
              <th scope="col" className="px-6 py-3.5">Messages</th>
              <th scope="col" className="px-6 py-3.5">Date</th>
              <th scope="col" className="relative px-6 py-3.5">
                <span className="sr-only">Inspect</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-sm">{s.summary}</p>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-700">
                  {s.from_account_name || 'Anonymous'}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {s.from_source}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  {s.message_count} msgs
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {new Date(s.created_at * 1000).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleInspectSession(s)}
                    className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                  >
                    Inspect History →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inspect Session Slide-over Drawer */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-2xs">
          <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <span className="text-2xs font-semibold uppercase text-gray-400">Session Inspection</span>
                <h3 className="font-bold text-gray-900">{selectedSession.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-gray-600 text-lg rounded-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex h-40 items-center justify-center text-xs text-gray-400">
                  Loading session messages...
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                      <span>User Question</span>
                      <span className="text-gray-400 font-mono">{m.provider_response_latency}s</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{m.query}</p>

                    <div className="mt-3 border-t border-gray-200/60 pt-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-blue-600">
                        <span>AI Answer</span>
                        {m.feedback?.rating === 'like' && (
                          <span className="text-emerald-600 font-bold">👍 Helpful</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-800 leading-relaxed">{m.answer}</p>
                    </div>

                    <div className="mt-2 text-right text-2xs text-gray-400 font-mono">
                      Tokens: {m.total_tokens}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
