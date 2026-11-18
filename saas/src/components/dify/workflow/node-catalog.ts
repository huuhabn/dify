import type { AvailableNodesMetaData } from '@/components/dify/workflow/hooks-store/store'
import type { DocPathWithoutLang } from '@/types/doc-paths'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from 'reactflow'
import { useShallow } from 'zustand/react/shallow'
import { WORKFLOW_COMMON_NODES } from '@/components/dify/workflow/constants/node'
import { isChatflowAtom } from '@/components/dify/workflow/editor-resource/state'
import AnswerDefault from '@/components/dify/workflow/nodes/answer/default'
import EndDefault from '@/components/dify/workflow/nodes/end/default'
import { getHumanInputCreationPolicy } from '@/components/dify/workflow/nodes/human-input-v2/migration/policy'
import StartPlaceholderDefault from '@/components/dify/workflow/nodes/start-placeholder/default'
import StartDefault from '@/components/dify/workflow/nodes/start/default'
import TriggerPluginDefault from '@/components/dify/workflow/nodes/trigger-plugin/default'
import TriggerScheduleDefault from '@/components/dify/workflow/nodes/trigger-schedule/default'
import TriggerWebhookDefault from '@/components/dify/workflow/nodes/trigger-webhook/default'
import { BlockEnum } from '@/components/dify/workflow/types'
import { getNodePersistedType } from '@/components/dify/workflow/utils/node'
import { ENABLE_HITL_IM } from '@/config'
import { useDocLink } from '@/context/i18n'
import { isAgentV2Enabled, isAgentV2InChatflowEnabled } from '@/features/agent-v2/feature-flag'
import { consoleQuery } from '@/service/console'
import { isProductlessDocPathWithAnchor } from '@/types/doc-paths'

const getNodeHelpLinkPath = (helpLinkUri?: string): DocPathWithoutLang | undefined => {
  if (!helpLinkUri) return undefined

  const helpLinkPath = `/use-dify/nodes/${helpLinkUri}`
  return isProductlessDocPathWithAnchor(helpLinkPath) ? helpLinkPath : undefined
}

export const useWorkflowNodeCatalog = () => {
  const { t } = useTranslation(['workflow'])
  const isChatflow = useAtomValue(isChatflowAtom)
  const docLink = useDocLink()
  const agentV2Enabled = isAgentV2Enabled()
  // Chatflow (advanced-chat) keeps Agent v2 hidden by default; opt in via
  // NEXT_PUBLIC_ENABLE_AGENT_V2_IN_CHATFLOW. Pure workflows are unaffected.
  const shouldUseAgentV2 = agentV2Enabled && (!isChatflow || isAgentV2InChatflowEnabled())
  const { data: knowledgeFsEnabled = false } = useQuery(
    consoleQuery.features.get.queryOptions({
      select: (features) => features.enable_knowledge_fs,
    }),
  )
  const humanInputData = useStore(
    useShallow((state) =>
      ENABLE_HITL_IM
        ? state
            .getNodes()
            .filter((node) => node.data.type === BlockEnum.HumanInput)
            .map((node) => node.data)
        : [],
    ),
  )
  const canContinueLegacyHumanInput = useMemo(
    () =>
      ENABLE_HITL_IM &&
      getHumanInputCreationPolicy(
        humanInputData.map((data) => ({ data })),
        true,
      ).canAddLegacyHumanInput,
    [humanInputData],
  )
  const useLegacyHumanInput = !ENABLE_HITL_IM || canContinueLegacyHumanInput

  const startNodeMetaData = useMemo(
    () => ({
      ...StartDefault,
      metaData: {
        ...StartDefault.metaData,
        isUndeletable: isChatflow, // start node is undeletable in chat mode, @use-nodes-interactions: handleNodeDelete function
      },
    }),
    [isChatflow],
  )

  const mergedNodesMetaData = useMemo(() => {
    const commonNodes = WORKFLOW_COMMON_NODES.filter(
      (node) => knowledgeFsEnabled || node.metaData.type !== BlockEnum.KnowledgeRetrievalV2,
    )

    return [
      ...commonNodes,
      startNodeMetaData,
      ...(isChatflow
        ? [AnswerDefault]
        : [
            StartPlaceholderDefault,
            EndDefault,
            TriggerWebhookDefault,
            TriggerScheduleDefault,
            TriggerPluginDefault,
          ]),
    ]
  }, [isChatflow, knowledgeFsEnabled, startNodeMetaData])

  const nodesMetaData = useMemo(
    () =>
      mergedNodesMetaData.map((node) => {
        const { metaData } = node
        const titleKey =
          metaData.type === BlockEnum.HumanInputV2 ? BlockEnum.HumanInput : metaData.type
        const title = t(($) => $[`blocks.${titleKey}`], { ns: 'workflow' })
        const description = t(($) => $[`blocksAbout.${titleKey}`], { ns: 'workflow' })
        const helpLinkPath = getNodeHelpLinkPath(metaData.helpLinkUri)
        return {
          ...node,
          metaData: {
            ...metaData,
            title,
            description,
            helpLinkUri: helpLinkPath ? docLink(helpLinkPath) : undefined,
          },
          defaultValue: {
            ...node.defaultValue,
            type: getNodePersistedType(metaData.type),
            title,
          },
        }
      }),
    [mergedNodesMetaData, t, docLink],
  )

  const availableNodesMetaData = useMemo(
    () =>
      nodesMetaData.filter(
        (node) =>
          node.metaData.type !==
            (useLegacyHumanInput ? BlockEnum.HumanInputV2 : BlockEnum.HumanInput) &&
          (shouldUseAgentV2
            ? node.metaData.type !== BlockEnum.Agent
            : node.metaData.type !== BlockEnum.AgentV2),
      ),
    [nodesMetaData, shouldUseAgentV2, useLegacyHumanInput],
  )

  const nodesMetaDataMap = useMemo(
    () =>
      nodesMetaData.reduce(
        (acc, node) => {
          acc![node.metaData.type] = node
          return acc
        },
        {} as unknown as AvailableNodesMetaData['nodesMap'],
      ),
    [nodesMetaData],
  )

  return useMemo(
    () => ({
      nodes: availableNodesMetaData,
      nodesMap: {
        ...nodesMetaDataMap,
        [BlockEnum.VariableAssigner]: nodesMetaDataMap?.[BlockEnum.VariableAggregator],
      },
    }),
    [availableNodesMetaData, nodesMetaDataMap],
  )
}
