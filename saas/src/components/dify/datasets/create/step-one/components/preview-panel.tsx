'use client'

import type { NotionPage } from '@/types/dify/common'
import type { CrawlResultItem } from '@/types/dify/datasets'
import { useTranslation } from 'react-i18next'
import { PlanUpgradeModal } from '@/components/dify/billing/plan-upgrade-modal'
import FilePreview from '../../file-preview/index'
import NotionPagePreview from '../../notion-page-preview/index'
import WebsitePreview from '../../website/preview'

type PreviewPanelProps = {
  currentFile: File | undefined
  currentNotionPage: NotionPage | undefined
  currentWebsite: CrawlResultItem | undefined
  notionCredentialId: string
  isShowPlanUpgradeModal: boolean
  hideFilePreview: () => void
  hideNotionPagePreview: () => void
  hideWebsitePreview: () => void
  hidePlanUpgradeModal: () => void
}

/**
 * Right panel component for displaying file, notion page, or website previews.
 */
function PreviewPanel({
  currentFile,
  currentNotionPage,
  currentWebsite,
  notionCredentialId,
  isShowPlanUpgradeModal,
  hideFilePreview,
  hideNotionPagePreview,
  hideWebsitePreview,
  hidePlanUpgradeModal,
}: PreviewPanelProps) {
  const { t } = useTranslation(['billing'])

  return (
    <div className="w-full min-w-0 xl:h-full xl:w-1/2 xl:overflow-y-auto">
      {currentFile && <FilePreview file={currentFile} hidePreview={hideFilePreview} />}
      {currentNotionPage && (
        <NotionPagePreview
          currentPage={currentNotionPage}
          hidePreview={hideNotionPagePreview}
          notionCredentialId={notionCredentialId}
        />
      )}
      {currentWebsite && (
        <WebsitePreview payload={currentWebsite} hidePreview={hideWebsitePreview} />
      )}
      {isShowPlanUpgradeModal && (
        <PlanUpgradeModal
          show
          onClose={hidePlanUpgradeModal}
          title={t(($) => $['upgrade.uploadMultiplePages.title'], { ns: 'billing' })!}
          description={t(($) => $['upgrade.uploadMultiplePages.description'], { ns: 'billing' })!}
        />
      )}
    </div>
  )
}

export default PreviewPanel
