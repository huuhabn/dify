import type { ExportSecretEnvironmentVariable } from '@/components/dify/workflow/export-secret-env-event'
import { memo, useState } from 'react'
import { isExportSecretEnvironmentEvent } from '@/components/dify/workflow/export-secret-env-event'
import { useHooksStore } from '@/components/dify/workflow/hooks-store'
import { useDSL } from '@/components/dify/workflow/hooks/use-DSL'
import { usePanelInteractions } from '@/components/dify/workflow/hooks/use-panel-interactions'
import PluginDependency from '@/components/dify/workflow/plugin-dependency'
import { useStore } from '@/components/dify/workflow/store'
import { useEventEmitterContextContext } from '@/context/event-emitter'
import { useRagPipelineSearch } from '../hooks/use-rag-pipeline-search'
import PipelineExportConfirmModal from './export-confirm-modal'
import RagPipelinePanel from './panel/index'
import PublishToast from './publish-toast'
import RagPipelineHeader from './rag-pipeline-header/index'
import UpdateDSLModal from './update-dsl-modal'

const RagPipelineChildren = () => {
  const { eventEmitter } = useEventEmitterContextContext()
  const [secretEnvList, setSecretEnvList] = useState<ExportSecretEnvironmentVariable[]>([])
  const showImportDSLModal = useStore((s) => s.showImportDSLModal)
  const setShowImportDSLModal = useStore((s) => s.setShowImportDSLModal)
  const canImportExportDSL = useHooksStore((s) => s.accessControl.canImportExportDSL)
  const { handlePaneContextmenuCancel } = usePanelInteractions()
  const { exportCheck, handleExportDSL, isExporting } = useDSL()

  // Initialize RAG pipeline search functionality
  useRagPipelineSearch()

  eventEmitter?.useSubscription((event) => {
    if (isExportSecretEnvironmentEvent(event)) setSecretEnvList(event.payload.data)
  })

  return (
    <>
      <PluginDependency />
      {canImportExportDSL && showImportDSLModal && (
        <UpdateDSLModal
          onCancel={() => setShowImportDSLModal(false)}
          onBackup={exportCheck!}
          onImport={handlePaneContextmenuCancel}
        />
      )}
      {canImportExportDSL && secretEnvList.length > 0 && (
        <PipelineExportConfirmModal
          envList={secretEnvList}
          onConfirm={handleExportDSL!}
          isExporting={isExporting}
          onClose={() => setSecretEnvList([])}
        />
      )}
      <RagPipelineHeader />
      <RagPipelinePanel />
      <PublishToast />
    </>
  )
}

export default memo(RagPipelineChildren)
