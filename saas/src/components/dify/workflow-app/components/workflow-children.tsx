import type {
  BlockDefaultValue,
  TriggerDefaultValue,
} from '@/components/dify/workflow/block-selector/types'
import type { ExportSecretEnvironmentVariable } from '@/components/dify/workflow/export-secret-env-event'
import { useAtomValue } from 'jotai'
import dynamic from 'next/dynamic'
import { memo, useCallback, useState } from 'react'
import { useStoreApi } from 'reactflow'
import { START_INITIAL_POSITION } from '@/components/dify/workflow/constants'
import {
  isChatflowAtom,
  workflowAppIdentityAtom,
} from '@/components/dify/workflow/editor-resource/state'
import { isExportSecretEnvironmentEvent } from '@/components/dify/workflow/export-secret-env-event'
import { useHooksStore } from '@/components/dify/workflow/hooks-store'
import { useAutoGenerateWebhookUrl } from '@/components/dify/workflow/hooks/use-auto-generate-webhook-url'
import { useDSL } from '@/components/dify/workflow/hooks/use-DSL'
import { useNodesSyncDraft } from '@/components/dify/workflow/hooks/use-nodes-sync-draft'
import { usePanelInteractions } from '@/components/dify/workflow/hooks/use-panel-interactions'
import { useWorkflowNodeCatalog } from '@/components/dify/workflow/node-catalog'
import PluginDependency from '@/components/dify/workflow/plugin-dependency'
import { useStore } from '@/components/dify/workflow/store'
import { BlockEnum } from '@/components/dify/workflow/types'
import { generateNewNode } from '@/components/dify/workflow/utils'
import { useEventEmitterContextContext } from '@/context/event-emitter'
import { useAutoOnboarding } from '../hooks/use-auto-onboarding'
import WorkflowHeader from './workflow-header/index'
import WorkflowPanel from './workflow-panel'

const Features = dynamic(() => import('@/components/dify/workflow/features'), {
  ssr: false,
})
const UpdateDSLModal = dynamic(() => import('@/components/dify/workflow/update-dsl-modal'), {
  ssr: false,
})
const AppExportConfirmModal = dynamic(() => import('@/components/dify/app/export-confirm-modal'), {
  ssr: false,
})
const WorkflowOnboardingModal = dynamic(() => import('./workflow-onboarding-modal/index'), {
  ssr: false,
})

const getTriggerPluginNodeData = (
  triggerConfig: TriggerDefaultValue,
  fallbackTitle?: string,
  fallbackDesc?: string,
) => {
  return {
    plugin_id: triggerConfig.plugin_id,
    provider_id: triggerConfig.provider_name,
    provider_type: triggerConfig.provider_type,
    provider_name: triggerConfig.provider_name,
    event_name: triggerConfig.event_name,
    event_label: triggerConfig.event_label,
    event_description: triggerConfig.event_description,
    title: triggerConfig.event_label || triggerConfig.title || fallbackTitle,
    desc: triggerConfig.event_description || fallbackDesc,
    output_schema: { ...triggerConfig.output_schema },
    parameters_schema: triggerConfig.paramSchemas ? [...triggerConfig.paramSchemas] : [],
    config: { ...triggerConfig.params },
    subscription_id: triggerConfig.subscription_id,
    plugin_unique_identifier: triggerConfig.plugin_unique_identifier,
    is_team_authorization: triggerConfig.is_team_authorization,
    meta: triggerConfig.meta ? { ...triggerConfig.meta } : undefined,
  }
}

const WorkflowChildren = () => {
  const appId = useAtomValue(workflowAppIdentityAtom).appId
  const isChatflow = useAtomValue(isChatflowAtom)
  const { eventEmitter } = useEventEmitterContextContext()
  const [secretEnvList, setSecretEnvList] = useState<ExportSecretEnvironmentVariable[]>([])
  const showFeaturesPanel = useStore((s) => s.showFeaturesPanel)
  const showImportDSLModal = useStore((s) => s.showImportDSLModal)
  const setShowImportDSLModal = useStore((s) => s.setShowImportDSLModal)
  const showOnboarding = useStore((s) => s.showOnboarding)
  const canImportExportDSL = useHooksStore((s) => s.accessControl.canImportExportDSL)
  const canEdit = useHooksStore((s) => s.accessControl.canEdit)
  const setShowOnboarding = useStore((s) => s.setShowOnboarding)
  const setHasSelectedStartNode = useStore((s) => s.setHasSelectedStartNode)
  const setShouldAutoOpenStartNodeSelector = useStore((s) => s.setShouldAutoOpenStartNodeSelector)
  const reactFlowStore = useStoreApi()
  const availableNodesMetaData = useWorkflowNodeCatalog()
  const { handleSyncWorkflowDraft } = useNodesSyncDraft()
  const { handleOnboardingClose } = useAutoOnboarding()
  const { handlePaneContextmenuCancel } = usePanelInteractions()
  const { exportCheck, handleExportDSL, isExporting } = useDSL()

  eventEmitter?.useSubscription((event) => {
    if (isExportSecretEnvironmentEvent(event)) setSecretEnvList(event.payload.data)
  })

  const autoGenerateWebhookUrl = useAutoGenerateWebhookUrl()

  const handleCloseOnboarding = useCallback(() => {
    handleOnboardingClose()
  }, [handleOnboardingClose])

  const handleSelectStartNode = useCallback(
    (nodeType: BlockEnum, toolConfig?: BlockDefaultValue) => {
      if (!canEdit) return

      const nodeDefault = availableNodesMetaData.nodesMap?.[nodeType]
      if (!nodeDefault?.defaultValue) return

      const baseNodeData = { ...nodeDefault.defaultValue }

      const mergedNodeData = (() => {
        if (nodeType !== BlockEnum.TriggerPlugin || !toolConfig) {
          return {
            ...baseNodeData,
            ...toolConfig,
          }
        }

        const triggerNodeData = getTriggerPluginNodeData(
          toolConfig as TriggerDefaultValue,
          baseNodeData.title,
          baseNodeData.desc,
        )

        return {
          ...baseNodeData,
          ...triggerNodeData,
          config: {
            ...(baseNodeData as { config?: Record<string, any> }).config,
            ...triggerNodeData.config,
          },
        }
      })()

      const { newNode } = generateNewNode({
        data: {
          ...mergedNodeData,
        } as any,
        position: START_INITIAL_POSITION,
      })

      const { setNodes, setEdges } = reactFlowStore.getState()
      setNodes([newNode])
      setEdges([])

      setShowOnboarding?.(false)
      setHasSelectedStartNode?.(true)
      setShouldAutoOpenStartNodeSelector?.(true)

      handleSyncWorkflowDraft(true, false, {
        onSuccess: () => {
          autoGenerateWebhookUrl(newNode.id)
        },
        onError: () => {
          console.error('Failed to save node to draft')
        },
      })
    },
    [
      availableNodesMetaData,
      autoGenerateWebhookUrl,
      canEdit,
      handleSyncWorkflowDraft,
      reactFlowStore,
      setHasSelectedStartNode,
      setShouldAutoOpenStartNodeSelector,
      setShowOnboarding,
    ],
  )

  return (
    <>
      <PluginDependency />
      {showFeaturesPanel && <Features />}
      {canEdit && showOnboarding && (
        <WorkflowOnboardingModal
          isShow={showOnboarding}
          onClose={handleCloseOnboarding}
          onSelectStartNode={handleSelectStartNode}
        />
      )}
      {appId && canImportExportDSL && showImportDSLModal && (
        <UpdateDSLModal
          appId={appId}
          appMode={isChatflow ? 'advanced-chat' : 'workflow'}
          open
          onOpenChange={(open) => setShowImportDSLModal(open)}
          onBackup={exportCheck!}
          onImport={handlePaneContextmenuCancel}
        />
      )}
      {canImportExportDSL && secretEnvList.length > 0 && (
        <AppExportConfirmModal
          envList={secretEnvList}
          onConfirm={handleExportDSL!}
          isExporting={isExporting}
          onClose={() => setSecretEnvList([])}
        />
      )}
      <WorkflowHeader />
      <WorkflowPanel />
    </>
  )
}

export default memo(WorkflowChildren)
