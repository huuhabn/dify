import type { DataSourceNodeType } from '@/components/dify/workflow/nodes/data-source/types'
import type { Node } from '@/components/dify/workflow/types'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BlockEnum } from '@/components/dify/workflow/types'
import { useDatasourceOptions } from '../use-datasource-options'

describe('useDatasourceOptions', () => {
  const createNode = (id: string, title: string, type: string): Node<DataSourceNodeType> =>
    ({
      id,
      position: { x: 0, y: 0 },
      data: {
        type,
        title,
        provider_type: 'local_file',
      },
    }) as unknown as Node<DataSourceNodeType>

  it('should return options for datasource nodes', () => {
    const nodes = [
      createNode('n1', 'File Upload', BlockEnum.DataSource),
      createNode('n2', 'Web Crawl', BlockEnum.DataSource),
      createNode('n3', 'LLM Node', 'llm'),
    ]
    const { result } = renderHook(() => useDatasourceOptions(nodes))
    expect(result.current).toHaveLength(2)
    expect(result.current[0]).toEqual({
      label: 'File Upload',
      value: 'n1',
      data: expect.objectContaining({ title: 'File Upload' }),
    })
    expect(result.current[1]).toEqual({
      label: 'Web Crawl',
      value: 'n2',
      data: expect.objectContaining({ title: 'Web Crawl' }),
    })
  })
})
