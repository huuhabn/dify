import type { ChunkingMode } from '@/types/dify/datasets'

export const EffectColor = {
  indigo: 'indigo',
  blueLight: 'blue-light',
  orange: 'orange',
  purple: 'purple',
} as const

export type EffectColor = (typeof EffectColor)[keyof typeof EffectColor]

export type Option = {
  id: ChunkingMode
  icon?: React.ReactNode
  iconActiveColor?: string
  title: string
  description?: string
  effectColor?: EffectColor
  showEffectColor?: boolean
}
