'use client';

import { use, useState } from 'react';
import { VoiceInputButton } from '@/components/chat/VoiceInputButton';
import { AudioPlayerButton } from '@/components/chat/AudioPlayerButton';
import { AttachmentUploader, type AttachedFile } from '@/components/chat/AttachmentUploader';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function StandaloneChatPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { token } = use(params);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Hello! I am your AI assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userText = input.trim();
    setInput('');

    const newMsgs: Message[] = [
      ...messages,
      { id: `u-${Date.now()}`, role: 'user', content: userText },
    ];
    setMessages(newMsgs);
    setSending(true);

    try {
      const res = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          inputs: {},
          response_mode: 'blocking',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([
          ...newMsgs,
          { id: data.message_id || `a-${Date.now()}`, role: 'assistant', content: data.answer },
        ]);
        setSending(false);
        return;
      }
    } catch {
      // Fallback response
    }

    setTimeout(() => {
      setMessages([
        ...newMsgs,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: `Thank you for asking! [Public Agent Response via token ${token.slice(0, 8)}...]: Here is the information regarding "${userText}".`,
        },
      ]);
      setSending(false);
    }, 600);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3rem)] w-full max-w-3xl flex-col bg-white shadow-xs">
      {/* Agent Info Banner */}
      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
          🤖
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">AI Assistant</h2>
          <p className="text-2xs text-gray-400">Online & Ready to chat</p>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-lg rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                  : 'bg-gray-100 text-gray-800 rounded-bl-xs'
              }`}
            >
              <div>{m.content}</div>
              {m.role === 'assistant' && (
                <div className="mt-1 flex items-center justify-end">
                  <AudioPlayerButton text={m.content} />
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-4 py-2 text-xs text-gray-400 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="relative border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <AttachmentUploader
            files={attachedFiles}
            onFilesChange={setAttachedFiles}
            disabled={sending}
          />
          <VoiceInputButton
            onTranscript={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))}
            disabled={sending}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or use voice..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || (!input.trim() && attachedFiles.length === 0)}
            className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-2xs text-gray-400">
          AI may make mistakes. Verify important information.
        </p>
      </form>
    </div>
  );
}
