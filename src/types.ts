export type ID = string

export type PlanStatus = 'todo' | 'doing' | 'done' | 'delayed' | 'cancelled'
export type Priority = 'low' | 'normal' | 'high'

export interface BaseRecord {
  id: ID
  createdAt: string
  updatedAt: string
}

export interface TodayPlan extends BaseRecord {
  title: string
  description: string
  date: string
  time?: string
  priority: Priority
  category: string
  status: PlanStatus
  sourceModule?: string
  sourceId?: ID
  order: number
}

export interface QuickMemo extends BaseRecord {
  content: string
  processed: boolean
  convertedType?: string
  convertedId?: ID
}

export type MediaStage = 'idea' | 'preparing' | 'making' | 'ready' | 'published'
export interface MediaContent extends BaseRecord {
  title: string
  type: string
  platform: string
  stage: MediaStage
  plannedPublishAt?: string
  body: string
  notes: string
  publishUrl?: string
}

export type ProjectStatus = 'not_started' | 'active' | 'paused' | 'completed'
export type WorkItemStatus = 'todo' | 'doing' | 'done' | 'blocked'
export interface DevelopmentProject extends BaseRecord {
  name: string
  description: string
  status: ProjectStatus
  progress: number
  link?: string
}
export interface DevelopmentTask extends BaseRecord {
  title: string
  description: string
  projectId: ID
  status: WorkItemStatus
  priority: Priority
  dueDate?: string
  technicalNotes: string
}
export interface DevelopmentMilestone extends BaseRecord {
  name: string
  projectId: ID
  targetDate?: string
  done: boolean
}

export type ClientStatus = 'active' | 'paused' | 'closed'
export type CaseStatus = 'todo' | 'doing' | 'follow_up' | 'done'
export interface ConsultingClient extends BaseRecord {
  name: string
  contact: string
  notes: string
  status: ClientStatus
}
export interface ConsultingCase extends BaseRecord {
  title: string
  clientId: ID
  problem: string
  status: CaseStatus
  conclusion: string
  followUpDate?: string
  income?: number
}
export interface ConsultingCommunication extends BaseRecord {
  caseId: ID
  date: string
  method: string
  content: string
  conclusion: string
  nextAction: string
}

export interface FitnessPlan extends BaseRecord {
  date: string
  type: string
  description: string
  done: boolean
}
export interface FitnessSet {
  exercise: string
  sets: number
  reps: number
  weight?: number
  duration?: number
  notes: string
}
export interface FitnessLog extends BaseRecord {
  planId?: ID
  date: string
  exercises: FitnessSet[]
}
export interface BodyMetric extends BaseRecord {
  date: string
  weight?: number
  notes: string
}

export type MealStatus = 'planned' | 'eaten' | 'skipped'
export interface DietPlan extends BaseRecord {
  date: string
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food: string
  portion: string
  status: MealStatus
  notes: string
  calories?: number
}
export interface ShoppingItem extends BaseRecord {
  name: string
  quantity: string
  purchased: boolean
  sourceId?: ID
}

export type EntertainmentStatus = 'wishlist' | 'playing' | 'completed' | 'paused'
export interface EntertainmentItem extends BaseRecord {
  name: string
  type: 'game' | 'movie' | 'series' | 'other'
  status: EntertainmentStatus
  progress?: number
  lastUsedAt?: string
  durationMinutes?: number
  rating?: number
  notes: string
}

export interface AppSettings {
  theme: 'light' | 'dark'
  weekStartsOn: 0 | 1
}

export interface AppData {
  schemaVersion: number
  metadata: { createdAt: string; updatedAt: string }
  settings: AppSettings
  todayPlans: TodayPlan[]
  quickMemos: QuickMemo[]
  mediaContents: MediaContent[]
  developmentProjects: DevelopmentProject[]
  developmentTasks: DevelopmentTask[]
  developmentMilestones: DevelopmentMilestone[]
  consultingClients: ConsultingClient[]
  consultingCases: ConsultingCase[]
  consultingCommunications: ConsultingCommunication[]
  fitnessPlans: FitnessPlan[]
  fitnessLogs: FitnessLog[]
  bodyMetrics: BodyMetric[]
  dietPlans: DietPlan[]
  shoppingItems: ShoppingItem[]
  entertainmentItems: EntertainmentItem[]
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface DashboardSummary {
  todayDone: number
  todayTotal: number
  delayedPlans: TodayPlan[]
  blockedTasks: DevelopmentTask[]
  overdueCases: ConsultingCase[]
  readyMedia: MediaContent[]
  todayFitness: FitnessPlan[]
  upcomingMeals: DietPlan[]
  playingEntertainment: EntertainmentItem[]
}
