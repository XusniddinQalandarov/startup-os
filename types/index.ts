// Core type definitions for Startup OS

export type BusinessType = 'b2b' | 'b2c' | 'both'
export type FounderType = 'technical' | 'non-technical' | 'mixed'
export type TaskStatus = 'backlog' | 'in_progress' | 'blocked' | 'done'
export type SkillTag = 'frontend' | 'backend' | 'ai' | 'business'
export type StartupStatus = 'evaluating' | 'evaluated' | 'in_progress' | 'completed'

export interface Startup {
  id: string
  userId: string
  name: string
  idea: string
  targetUsers?: string
  businessType?: BusinessType
  geography?: string
  founderType?: FounderType
  status: StartupStatus
  createdAt: string
}

export interface Task {
  id: string
  startupId: string
  title: string
  description: string
  status: TaskStatus
  estimateHours: number
  skillTag: SkillTag
  position: number
  createdAt: string
}

export interface IdeaEvaluation {
  scores: {
    marketPotential: number
    feasibility: number
    competition: number
    uniqueness: number
  }
  verdict: string
  explanation: string
}

export type QuestionFlagType = 'ask' | 'avoid'

export interface CustomerQuestion {
  id: string
  category: string
  question: string
  flagType: QuestionFlagType
  insight?: string
}

export interface MvpFeature {
  id: string
  title: string
  description: string
  priority: 'must_have' | 'later' | 'not_now'
}

export interface RoadmapPhase {
  id: string
  name: string
  description: string
  durationWeeks: number
  tasks: string[]
}

export interface TechStackRecommendation {
  category: string
  recommendation: string
  reason: string
}

export interface CostEstimate {
  category: string
  item: string
  monthlyCost: number
  isOptional: boolean
  note?: string
}

// Onboarding form data
export interface OnboardingData {
  idea: string
  targetUsers?: string
  businessType?: BusinessType
  geography?: string
  founderType?: FounderType
}

// Dashboard tab type
export type DashboardTab = 
  | 'overview'
  | 'questions'
  | 'mvp'
  | 'roadmap'
  | 'tasks'
  | 'tech'
  | 'costs'
  | 'competitors'
  | 'analysis'
