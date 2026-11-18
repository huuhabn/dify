'use client'

import IntegrationsPage from '@/components/dify/integrations'
import { getIntegrationRouteTargetBySlug } from '@/components/dify/integrations/routes'
import { usePathname } from '@/next/navigation'

export function IntegrationsRoutePage() {
  const pathname = usePathname()
  const target = getIntegrationRouteTargetBySlug(pathname.split('/').filter(Boolean).slice(1))

  if (target.type !== 'section') return null

  return <IntegrationsPage section={target.section} syncDocumentTitle />
}
