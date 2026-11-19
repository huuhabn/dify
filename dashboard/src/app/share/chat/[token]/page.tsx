'use client';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useState } from 'react';

export default function ShareChatPage() {
  const params = useParams();
  const token = params?.token as string;
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hello! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `This is a shared preview response for query: "${userMsg}".` }
      ]);
    }, 600);
  };

  return (
    <div className='w-full max-w-3xl h-[90vh] flex flex-col p-4'>
      <Card className='flex flex-col flex-1 overflow-hidden shadow-lg border-border'>
        <CardHeader className='border-b border-border py-4 px-6'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg font-semibold'>
              🤖
            </div>
            <div>
              <CardTitle className='text-base font-semibold'>Shared AI Assistant</CardTitle>
              <CardDescription className='text-xs'>Token: {token}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col flex-1 p-6 overflow-hidden'>
          <div className='flex-1 overflow-y-auto space-y-4 pr-2'>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className='flex items-center gap-2 pt-4 border-t border-border mt-auto'>
            <Input
              placeholder='Type your message...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className='bg-card'
            />
            <Button onClick={handleSend} size='icon' className='shrink-0'>
              <Icons.send className='size-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
