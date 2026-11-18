import type { SearchResult } from '@/components/dify/goto-anything/actions/types'

type SearchRagPipelineNodes = (query: string) => SearchResult[]

let searchRagPipelineNodes: SearchRagPipelineNodes | undefined

export function registerRagPipelineNodeSearch(search: SearchRagPipelineNodes) {
  searchRagPipelineNodes = search

  return () => {
    if (searchRagPipelineNodes === search) searchRagPipelineNodes = undefined
  }
}

export function findRagPipelineNodes(query: string) {
  return searchRagPipelineNodes?.(query) ?? []
}
