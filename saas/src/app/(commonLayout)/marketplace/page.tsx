import { MARKETPLACE_CONTAINER_ID } from '@/components/dify/plugins/marketplace/constants'
import { EmbeddedMarketplace } from '@/components/dify/plugins/marketplace/embedded'
import MarketplaceInstallPermissionProvider from '@/components/dify/plugins/marketplace/marketplace-install-permission-provider'

// Sync route: async pages under this client shell Flight-double-resolve.
const MarketplacePage = () => {
  return (
    <div
      id={MARKETPLACE_CONTAINER_ID}
      className="flex h-full min-h-0 flex-col overflow-y-auto bg-background-default"
    >
      <MarketplaceInstallPermissionProvider>
        <EmbeddedMarketplace showInstallButton variant="home" />
      </MarketplaceInstallPermissionProvider>
    </div>
  )
}

export default MarketplacePage
