'use client';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useQuery } from '@tanstack/react-query';
import { toolsQueries } from '@/services/tools/queries';

export default function ToolsPage() {
  const { data: providers, isLoading } = useQuery(toolsQueries.providers());

  return (
    <PageContainer
      pageTitle='Tools & Integrations'
      pageDescription='Discover built-in tools and configure custom API tools for AI agents and workflows'
    >
      <div className='flex flex-col gap-6'>
        {isLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-36 rounded-xl border border-border bg-card/50 p-5 animate-pulse' />
            ))}
          </div>
        ) : !providers || providers.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card/30'>
            <div className='bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full mb-3'>
              <Icons.adjustments className='size-6' />
            </div>
            <h3 className='text-base font-semibold text-foreground'>Built-in Tool Providers</h3>
            <p className='text-xs text-muted-foreground max-w-sm mt-1'>
              Tools like Google Search, Web Scraper, DALL-E, and WolframAlpha will appear here when connected to the backend.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {providers.map((p) => (
              <Card key={p.id} className='transition-all duration-200 hover:shadow-md hover:border-primary/50'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg font-medium'>
                      {p.icon || '🔧'}
                    </div>
                    <div>
                      <CardTitle className='text-base font-semibold'>{p.label || p.name}</CardTitle>
                      <Badge variant='outline' className='text-xs font-normal mt-0.5 capitalize'>
                        {p.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-xs line-clamp-2'>
                    {p.description || 'No description provided.'}
                  </CardDescription>
                  <div className='mt-3 text-xs text-muted-foreground'>
                    {p.tools?.length || 0} actions supported
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
