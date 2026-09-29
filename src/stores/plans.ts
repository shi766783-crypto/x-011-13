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

  /**
   * 复制一份计划副本：保留日期、学时、资源等全部字段，
   * 资源重新生成 id，名称追加“副本”，不继承原计划的完成状态。
   * 返回新副本，供调用方在生成后立即进入编辑。
   */
  function duplicatePlan(id: string): StudyPlan | undefined {
    const target = plans.value.find((p) => p.id === id)
    if (!target) return
    const copy: StudyPlan = {
      ...target,
      id: uid(),
      name: `${target.name} 副本`,
      resources: target.resources.map((r) => ({ ...r, id: uid() })),
      createdAt: new Date().toISOString(),
      completedAt: undefined,
    }
    plans.value.unshift(copy)
    persist()
    return copy
  }

  function toggleComplete(id: string): void {
    const target = plans.value.find((p) => p.id === id)
    if (!target) return
    target.completedAt = target.completedAt ? undefined : new Date().toISOString()
    persist()
  }

  return { plans, addPlan, updatePlan, removePlan, duplicatePlan, toggleComplete }
})
