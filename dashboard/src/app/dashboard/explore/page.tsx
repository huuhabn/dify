'use client';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ExplorePage() {
  const templates = [
    {
      title: 'Customer Service Bot',
      description: 'Conversational assistant equipped with company knowledge base and FAQ search.',
      mode: 'Chatbot',
      icon: '💬'
    },
    {
      title: 'SQL Analyst Agent',
      description: 'Connects to relational databases, generates SQL queries, and produces charts.',
      mode: 'Agent',
      icon: '📊'
    },
    {
      title: 'Document Summarizer',
      description: 'Upload lengthy documents and receive multi-format executive summaries.',
      mode: 'Workflow',
      icon: '📑'
    },
    {
      title: 'Code Reviewer Assistant',
      description: 'Analyzes pull requests, flags vulnerabilities, and suggests clean refactoring.',
      mode: 'Agent',
      icon: '🔍'
    }
  ];

  return (
    <PageContainer
      pageTitle='Explore App Templates'
      pageDescription='Quickly bootstrap your AI applications with production-tested blueprints'
    >
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {templates.map((tpl, idx) => (
          <Card key={idx} className='transition-all duration-200 hover:shadow-md hover:border-primary/50'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg text-lg'>
                  {tpl.icon}
                </div>
                <div>
                  <CardTitle className='text-base font-semibold'>{tpl.title}</CardTitle>
                  <span className='text-xs text-muted-foreground'>{tpl.mode}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-xs min-h-[2.5rem]'>
                {tpl.description}
              </CardDescription>
              <div className='mt-4 flex justify-end border-t border-border pt-3'>
                <Button size='sm' render={<Link href='/dashboard/apps' />}>
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
