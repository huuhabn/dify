import { VarType } from '@/components/dify/workflow/types'
import { PipelineInputVarType } from '@/types/dify/pipeline'

export const inputVarTypeToVarType = (type: PipelineInputVarType): VarType => {
  return (
    (
      {
        [PipelineInputVarType.number]: VarType.number,
        [PipelineInputVarType.singleFile]: VarType.file,
        [PipelineInputVarType.multiFiles]: VarType.arrayFile,
        [PipelineInputVarType.checkbox]: VarType.boolean,
      } as any
    )[type] || VarType.string
  )
}
