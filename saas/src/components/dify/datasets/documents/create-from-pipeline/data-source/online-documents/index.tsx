import type { DataSourceNodeType } from '@/components/dify/workflow/nodes/data-source/types'
import type { DataSourceNotionPageMap, DataSourceNotionWorkspace } from '@/types/dify/common'
import type { DataSourceNodeCompletedResponse, DataSourceNodeErrorResponse } from '@/types/pipeline'
import { useQuery } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { LoadingPlaceholder } from '@/components/dify/base/loading-placeholder'
import SearchInput from '@/components/dify/base/notion-page-selector/search-input'
import {
  settingsQueryParamName,
  settingsQueryParser,
} from '@/components/dify/header/account-setting/query-params'
import { toast } from '@/components/providers/notifications'
import { useDatasetDetailContextWithSelector } from '@/context/dataset-detail'
import { useDocLink } from '@/context/i18n'
import { DatasourceType } from '@/types/dify/pipeline'
import { ssePost } from '@/service/base'
import { consoleQuery } from '@/service/console'
import Header from '../base/header'
import { useDataSourceStore, useDataSourceStoreWithSelector } from '../store/index'
import PageSelector from './page-selector/index'
import Title from './title'

type OnlineDocumentsProps = {
  nodeId: string
  nodeData: DataSourceNodeType
  onCredentialChange: (credentialId: string) => void
  isInPipeline?: boolean
  supportBatchUpload?: boolean
}

const OnlineDocuments = ({
  nodeId,
  nodeData,
  isInPipeline = false,
  supportBatchUpload = true,
  onCredentialChange,
}: OnlineDocumentsProps) => {
  const docLink = useDocLink()
  const pipelineId = useDatasetDetailContextWithSelector((s) => s.dataset?.pipeline_id)
  const [, setSettingsDestination] = useQueryState(settingsQueryParamName, settingsQueryParser)
  const { documentsData, searchValue, selectedPagesId, currentCredentialId } =
    useDataSourceStoreWithSelector(
      useShallow((state) => ({
        documentsData: state.documentsData,
        searchValue: state.searchValue,
        selectedPagesId: state.selectedPagesId,
        currentCredentialId: state.currentCredentialId,
      })),
    )

  const { data: dataSourceAuth } = useQuery(
    consoleQuery.auth.plugin.datasource.byProviderId.get.queryOptions({
      input: { params: { provider_id: `${nodeData.plugin_id}/${nodeData.provider_name}` } },
    }),
  )

  const dataSourceStore = useDataSourceStore()

  const PagesMapAndSelectedPagesId: DataSourceNotionPageMap = useMemo(() => {
    const pagesMap = (documentsData || []).reduce(
      (prev: DataSourceNotionPageMap, next: DataSourceNotionWorkspace) => {
        next.pages.forEach((page) => {
          prev[page.page_id] = {
            ...page,
            workspace_id: next.workspace_id,
          }
        })

        return prev
      },
      {},
    )
    return pagesMap
  }, [documentsData])

  const datasourceNodeRunURL = !isInPipeline
    ? `/rag/pipelines/${pipelineId}/workflows/published/datasource/nodes/${nodeId}/run`
    : `/rag/pipelines/${pipelineId}/workflows/draft/datasource/nodes/${nodeId}/run`

  const getOnlineDocuments = useCallback(async () => {
    const { currentCredentialId } = dataSourceStore.getState()
    // Convert datasource_parameters to inputs format for the API
    const inputs = Object.entries(nodeData.datasource_parameters || {}).reduce(
      (acc, [key, value]) => {
        acc[key] =
          typeof value === 'object' && value !== null && 'value' in value ? value.value : value
        return acc
      },
      {} as Record<string, any>,
    )

    ssePost(
      datasourceNodeRunURL,
      {
        body: {
          inputs,
          credential_id: currentCredentialId,
          datasource_type: DatasourceType.onlineDocument,
        },
      },
      {
        onDataSourceNodeCompleted: (documentsData: DataSourceNodeCompletedResponse) => {
          const { setDocumentsData } = dataSourceStore.getState()
          setDocumentsData(documentsData.data as DataSourceNotionWorkspace[])
        },
        onDataSourceNodeError: (error: DataSourceNodeErrorResponse) => {
          toast.error(error.error)
        },
      },
    )
  }, [dataSourceStore, datasourceNodeRunURL, nodeData.datasource_parameters])

  useEffect(() => {
    if (!currentCredentialId) return
    getOnlineDocuments()
  }, [currentCredentialId, getOnlineDocuments])

  const handleSearchValueChange = useCallback(
    (value: string) => {
      const { setSearchValue } = dataSourceStore.getState()
      setSearchValue(value)
    },
    [dataSourceStore],
  )

  const handleSelectPages = useCallback(
    (newSelectedPagesId: Set<string>) => {
      const { setSelectedPagesId, setOnlineDocuments } = dataSourceStore.getState()
      const selectedPages = Array.from(newSelectedPagesId).map(
        (pageId) => PagesMapAndSelectedPagesId[pageId]!,
      )
      setSelectedPagesId(new Set(Array.from(newSelectedPagesId)))
      setOnlineDocuments(selectedPages)
    },
    [dataSourceStore, PagesMapAndSelectedPagesId],
  )

  const handlePreviewPage = useCallback(
    (previewPageId: string) => {
      const { setCurrentDocument } = dataSourceStore.getState()
      setCurrentDocument(PagesMapAndSelectedPagesId[previewPageId])
    },
    [PagesMapAndSelectedPagesId, dataSourceStore],
  )

  const handleSetting = useCallback(() => {
    setSettingsDestination('data-source')
  }, [setSettingsDestination])

  return (
    <div className="flex flex-col gap-y-2">
      <Header
        docTitle="Docs"
        docLink={docLink('/use-dify/knowledge/knowledge-pipeline/authorize-data-source')}
        onClickConfiguration={handleSetting}
        pluginName={nodeData.datasource_label}
        currentCredentialId={currentCredentialId}
        onCredentialChange={onCredentialChange}
        credentials={dataSourceAuth?.result || []}
      />
      <div className="rounded-xl border border-components-panel-border bg-background-default-subtle">
        <div className="flex items-center gap-x-2 rounded-t-xl border-b border-b-divider-regular bg-components-panel-bg p-1 pl-3">
          <div className="flex grow items-center">
            <Title name={nodeData.datasource_label} />
          </div>
          <SearchInput value={searchValue} onChange={handleSearchValueChange} />
        </div>
        <div className="overflow-hidden rounded-b-xl">
          {documentsData?.length ? (
            <PageSelector
              key={`${currentCredentialId}:${supportBatchUpload ? 'multiple' : 'single'}`}
              checkedIds={selectedPagesId}
              disabledValue={new Set()}
              searchValue={searchValue}
              list={documentsData[0]!.pages || []}
              pagesMap={PagesMapAndSelectedPagesId}
              onSelect={handleSelectPages}
              canPreview={!isInPipeline}
              onPreview={handlePreviewPage}
              isMultipleChoice={supportBatchUpload}
            />
          ) : (
            <div className="flex h-74 items-center justify-center">
              <LoadingPlaceholder className="h-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnlineDocuments
