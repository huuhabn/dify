import agentV2Default from '@/components/dify/workflow/nodes/agent-v2/default'
import agentDefault from '@/components/dify/workflow/nodes/agent/default'
import assignerDefault from '@/components/dify/workflow/nodes/assigner/default'
import codeDefault from '@/components/dify/workflow/nodes/code/default'
import documentExtractorDefault from '@/components/dify/workflow/nodes/document-extractor/default'
import httpRequestDefault from '@/components/dify/workflow/nodes/http/default'
import humanInputV2Default from '@/components/dify/workflow/nodes/human-input-v2/default'
import humanInputDefault from '@/components/dify/workflow/nodes/human-input/default'
import ifElseDefault from '@/components/dify/workflow/nodes/if-else/default'
import iterationStartDefault from '@/components/dify/workflow/nodes/iteration-start/default'
import iterationDefault from '@/components/dify/workflow/nodes/iteration/default'
import knowledgeRetrievalV2Default from '@/components/dify/workflow/nodes/knowledge-retrieval-v2/default'
import knowledgeRetrievalDefault from '@/components/dify/workflow/nodes/knowledge-retrieval/default'
import listOperatorDefault from '@/components/dify/workflow/nodes/list-operator/default'
import llmDefault from '@/components/dify/workflow/nodes/llm/default'
import loopEndDefault from '@/components/dify/workflow/nodes/loop-end/default'
import loopStartDefault from '@/components/dify/workflow/nodes/loop-start/default'
import loopDefault from '@/components/dify/workflow/nodes/loop/default'
import parameterExtractorDefault from '@/components/dify/workflow/nodes/parameter-extractor/default'
import questionClassifierDefault from '@/components/dify/workflow/nodes/question-classifier/default'
import templateTransformDefault from '@/components/dify/workflow/nodes/template-transform/default'
import toolDefault from '@/components/dify/workflow/nodes/tool/default'
import variableAggregatorDefault from '@/components/dify/workflow/nodes/variable-assigner/default'

export const WORKFLOW_COMMON_NODES = [
  llmDefault,
  knowledgeRetrievalDefault,
  knowledgeRetrievalV2Default,
  agentDefault,
  agentV2Default,
  questionClassifierDefault,
  ifElseDefault,
  iterationDefault,
  iterationStartDefault,
  loopDefault,
  loopStartDefault,
  loopEndDefault,
  codeDefault,
  templateTransformDefault,
  variableAggregatorDefault,
  documentExtractorDefault,
  assignerDefault,
  parameterExtractorDefault,
  httpRequestDefault,
  listOperatorDefault,
  toolDefault,
  humanInputDefault,
  humanInputV2Default,
]
