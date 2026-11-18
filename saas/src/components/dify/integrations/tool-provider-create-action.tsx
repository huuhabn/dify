'use client'

import type { ToolCategory } from '@/components/dify/integrations/routes'
import type { ToolWithProvider } from '@/components/dify/workflow/types'
import { NewMCPButton } from '@/components/dify/tools/mcp/create-card'
import { NewCustomToolButton } from '@/components/dify/tools/provider/custom-create-card'

type ToolProviderCreateActionProps = {
  activeTab: ToolCategory
  hasCategoryCollections: boolean
  isCollectionListLoading: boolean
  onCustomToolCreated: () => void
  onMCPProviderCreated: (providerId: string) => void
}

const ToolProviderCreateAction = ({
  activeTab,
  hasCategoryCollections,
  isCollectionListLoading,
  onCustomToolCreated,
  onMCPProviderCreated,
}: ToolProviderCreateActionProps) => {
  if (activeTab === 'mcp')
    return (
      <NewMCPButton
        handleCreate={(provider: ToolWithProvider) => onMCPProviderCreated(provider.id)}
      />
    )

  if (activeTab === 'api' && !isCollectionListLoading && hasCategoryCollections)
    return <NewCustomToolButton onRefreshData={onCustomToolCreated} />

  return null
}

export default ToolProviderCreateAction
