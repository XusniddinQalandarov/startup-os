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
  idea_type?: 'B2C' | 'B2B' | 'B2G' | 'Mixed'
  status: StartupStatus
  createdAt: string
}

export type IdeaType = 'B2C' | 'B2B' | 'B2G' | 'Mixed'

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
  version: 'v1'
  scores: {
    problemSeverity: number       // Weight: 15% - How real/painful is the problem? (1-5)
    targetCustomerClarity: number // Weight: 15% - Do we know who this is for? (1-5)
    marketOpportunity: number     // Weight: 15% - Is this worth building? (1-5)
    competitiveDifferentiation: number // Weight: 15% - Why this over alternatives? (1-5)
    executionComplexity: number   // Weight: 15% - How hard to build? (1-5, lower complexity = higher score)
    tractionValidation: number    // Weight: 15% - Any real-world signal? (1-5)
    riskProfile: number           // Weight: 10% - How risky? (1-5, lower risk = higher score)
  }
  scoreDetails: {
    [key: string]: {
      score: number
      bullets: string[]      // 2-3 explanation bullets
      keyRisk: string        // Key risk or assumption
    }
  }
  totalScore: number          // Weighted average (0-100)
  verdict: 'BUILD' | 'PIVOT' | 'KILL'
  verdictRationale: string
  keyStrengths: string[]
  keyRisks: string[]
  executiveSummary: string
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
