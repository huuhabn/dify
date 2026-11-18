import { Suspense } from 'react'
import AccessPoint from '@/components/dify/app/access-point'
import { LoadingPlaceholder } from '@/components/dify/base/loading-placeholder'

type AppAccessPointPageProps = {
  params: Promise<{ appId: string }>
}

export default async function AppAccessPointPage({ params }: AppAccessPointPageProps) {
  const { appId } = await params

  return (
    <Suspense fallback={<LoadingPlaceholder className="h-full" />}>
      <AccessPoint appId={appId} />
    </Suspense>
  )
}
