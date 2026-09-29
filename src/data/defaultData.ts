import type { AppData } from '../types'

export const nowIso = () => new Date().toISOString()

export function createEmptyData(): AppData {
  const now = nowIso()
  return {
    schemaVersion: 1,
    metadata: { createdAt: now, updatedAt: now },
    settings: { theme: 'light', weekStartsOn: 1 },
    todayPlans: [],
    quickMemos: [],
    mediaContents: [],
    developmentProjects: [],
    developmentTasks: [],
    developmentMilestones: [],
    consultingClients: [],
    consultingCases: [],
    consultingCommunications: [],
    fitnessPlans: [],
    fitnessLogs: [],
    bodyMetrics: [],
    dietPlans: [],
    shoppingItems: [],
    entertainmentItems: [],
  }
}

export function stampData(data: AppData): AppData {
  return { ...data, metadata: { ...data.metadata, updatedAt: nowIso() } }
}
