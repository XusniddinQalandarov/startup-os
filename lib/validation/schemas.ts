import { z } from 'zod'

// Idea Evaluation Schema
export const IdeaEvaluationSchema = z.object({
  scores: z.object({
    marketPotential: z.number().min(0).max(100),
    feasibility: z.number().min(0).max(100),
    competition: z.number().min(0).max(100),
    uniqueness: z.number().min(0).max(100),
  }),
  verdict: z.string(),
  explanation: z.string(),
})

// Customer Question Schema
export const CustomerQuestionSchema = z.object({
  id: z.string(),
  category: z.string(),
  question: z.string(),
  isGreenFlag: z.boolean().optional(),
  isRedFlag: z.boolean().optional(),
  isBadQuestion: z.boolean().optional(),
})

export const CustomerQuestionsArraySchema = z.array(CustomerQuestionSchema)

// MVP Feature Schema
export const MvpFeatureSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['must_have', 'later', 'not_now']),
})

export const MvpFeaturesArraySchema = z.array(MvpFeatureSchema)

// Roadmap Schema
export const RoadmapPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  durationWeeks: z.number().min(1),
  tasks: z.array(z.string()),
})

export const RoadmapArraySchema = z.array(RoadmapPhaseSchema)

// Task Schema
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['backlog', 'in_progress', 'blocked', 'done']),
  estimateHours: z.number().min(0),
  skillTag: z.enum(['frontend', 'backend', 'ai', 'business']),
})

export const TasksArraySchema = z.array(TaskSchema)

// Tech Stack Schema
export const TechStackRecommendationSchema = z.object({
  category: z.string(),
  recommendation: z.string(),
  reason: z.string(),
})

export const TechStackArraySchema = z.array(TechStackRecommendationSchema)

// Cost Estimate Schema
export const CostEstimateSchema = z.object({
  category: z.string(),
  item: z.string(),
  monthlyCost: z.number().min(0),
  isOptional: z.boolean(),
})

export const CostsArraySchema = z.array(CostEstimateSchema)

// Onboarding Data Schema
export const OnboardingDataSchema = z.object({
  idea: z.string().min(10, 'Please describe your idea in at least 10 characters'),
  targetUsers: z.string().optional(),
  businessType: z.enum(['b2b', 'b2c', 'both']).optional(),
  geography: z.string().optional(),
  founderType: z.enum(['technical', 'non-technical', 'mixed']).optional(),
})
