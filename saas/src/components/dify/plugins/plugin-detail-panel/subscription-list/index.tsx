import type { SimpleSubscription } from './types'
import type { PluginDetail } from '@/components/dify/plugins/types'
import { withErrorBoundary } from '@/components/dify/base/error-boundary'
import { LoadingPlaceholder } from '@/components/dify/base/loading-placeholder'
import { SubscriptionListView } from './list-view'
import { SubscriptionSelectorView } from './selector-view'
import { SubscriptionListMode } from './types'
import { useSubscriptionList } from './use-subscription-list'

type SubscriptionListProps = {
  mode?: SubscriptionListMode
  selectedId?: string
  onSelect?: (v: SimpleSubscription, callback?: () => void) => void
  pluginDetail?: PluginDetail
}

export type { SimpleSubscription } from './types'

export const SubscriptionList = withErrorBoundary(
  ({
    mode = SubscriptionListMode.PANEL,
    selectedId,
    onSelect,
    pluginDetail,
  }: SubscriptionListProps) => {
    const { isLoading, refetch } = useSubscriptionList()
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <LoadingPlaceholder />
        </div>
      )
    }

    if (mode === SubscriptionListMode.SELECTOR) {
      return (
        <SubscriptionSelectorView
          selectedId={selectedId}
          onSelect={(v) => {
            onSelect?.(v, refetch)
          }}
        />
      )
    }

    return <SubscriptionListView pluginDetail={pluginDetail} />
  },
)
