import type { Node } from '@/components/dify/workflow/types'
import { BlockEnum } from '@/components/dify/workflow/types'
import { appendSnippetInputFieldVars } from '../snippet-input-field-vars'

const createNode = (id = 'node-1'): Node => ({
  id,
  type: 'custom',
  position: { x: 0, y: 0 },
  data: {
    type: BlockEnum.LLM,
    title: 'Node',
    desc: '',
  },
})

describe('appendSnippetInputFieldVars', () => {
  it('should treat missing snippet input fields as empty on snippet canvases', () => {
    const availableNodes = [createNode()]

    expect(
      appendSnippetInputFieldVars({
        availableNodes,
        isSnippetFlow: true,
        fields: undefined,
        title: 'Snippet',
      }),
    ).toEqual({
      availableNodes,
      availableVars: [],
    })
  })
})
