import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PlanInput, StudyPlan } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { read, write } from '@/services/storage'
import { uid } from '@/utils/id'

export const usePlansStore = defineStore('plans', () => {
  const plans = ref<StudyPlan[]>(read<StudyPlan[]>(STORAGE_KEYS.plans, []))

  function persist(): void {
    write(STORAGE_KEYS.plans, plans.value)
  }

  function addPlan(input: PlanInput): StudyPlan {
    const plan: StudyPlan = { ...input, id: uid(), createdAt: new Date().toISOString() }
    plans.value.unshift(plan)
    persist()
    return plan
  }

  function updatePlan(id: string, patch: Partial<StudyPlan>): void {
    const target = plans.value.find((p) => p.id === id)
    if (target) {
      Object.assign(target, patch)
      persist()
    }
  }

  function removePlan(id: string): void {
    plans.value = plans.value.filter((p) => p.id !== id)
    persist()
  }

  function toggleComplete(id: string): void {
    const target = plans.value.find((p) => p.id === id)
    if (!target) return
    target.completedAt = target.completedAt ? undefined : new Date().toISOString()
    persist()
  }

  /**
   * 复制计划：携带日期、学时与资源生成一份新计划。
   * 副本不继承完成状态（completedAt），学习日志通过 planId 关联，亦不复制。
   */
  function duplicatePlan(id: string): StudyPlan | undefined {
    const source = plans.value.find((p) => p.id === id)
    if (!source) return undefined
    const copy: StudyPlan = {
      ...source,
      id: uid(),
      name: `${source.name} 副本`,
      resources: source.resources.map((r) => ({ ...r, id: uid() })),
      createdAt: new Date().toISOString(),
      completedAt: undefined,
    }
    plans.value.unshift(copy)
    persist()
    return copy
  }

  return { plans, addPlan, updatePlan, removePlan, toggleComplete, duplicatePlan }
})
