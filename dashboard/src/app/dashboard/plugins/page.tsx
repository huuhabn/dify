'use client';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useQuery } from '@tanstack/react-query';
import { toolsQueries } from '@/services/tools/queries';

export default function PluginsPage() {
  const { data: plugins, isLoading } = useQuery(toolsQueries.plugins());

  return (
    <PageContainer
      pageTitle='Plugins Marketplace'
      pageDescription='Extend your Dify instance with community and certified agent plugins'
    >
      <div className='flex flex-col gap-6'>
        {isLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-40 rounded-xl border border-border bg-card/50 p-5 animate-pulse' />
            ))}
          </div>
        ) : !plugins || plugins.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card/30'>
            <div className='bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full mb-3'>
              <Icons.code className='size-6' />
            </div>
            <h3 className='text-base font-semibold text-foreground'>Plugin Marketplace</h3>
            <p className='text-xs text-muted-foreground max-w-sm mt-1'>
              Explore extensions, custom nodes, and community integrations for your workspace.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {plugins.map((plugin) => (
              <Card key={plugin.id} className='transition-all duration-200 hover:shadow-md hover:border-primary/50'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg font-medium'>
                        {plugin.icon || '🧩'}
                      </div>
                      <div>
                        <CardTitle className='text-base font-semibold'>{plugin.name}</CardTitle>
                        <p className='text-xs text-muted-foreground'>by {plugin.author}</p>
                      </div>
                    </div>
                    {plugin.verified && (
                      <Badge variant='outline' className='border-primary/30 text-primary text-xs'>
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-xs line-clamp-2'>
                    {plugin.description}
                  </CardDescription>
                  <div className='mt-4 flex items-center justify-between border-t border-border pt-3 text-xs'>
                    <span className='text-muted-foreground'>v{plugin.version}</span>
                    <Button variant='outline' size='sm'>
                      Install
                    </Button>
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
