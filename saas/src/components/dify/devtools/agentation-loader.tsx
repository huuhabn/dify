'use client'

import dynamic from 'next/dynamic'
import { Env, IS_DEV } from '@/libs/Env'

const Agentation =
  IS_DEV
    ? dynamic(() => import('agentation').then((module) => module.Agentation), { ssr: false })
    : null

const IS_AGENTATION_ENABLED = Env.NEXT_PUBLIC_ENABLE_AGENTATION

export function AgentationLoader() {
  if (!Agentation || !IS_AGENTATION_ENABLED) return null

  return <Agentation />
}
