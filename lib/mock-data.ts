// Mock data for development - will be replaced with AI-generated content

import type { 
  IdeaEvaluation, 
  CustomerQuestion, 
  MvpFeature, 
  RoadmapPhase, 
  Task, 
  TechStackRecommendation, 
  CostEstimate 
} from '@/types'

export const mockEvaluation: IdeaEvaluation = {
  scores: {
    marketPotential: 72,
    feasibility: 65,
    competition: 45,
    uniqueness: 58,
  },
  verdict: "Promising with significant challenges",
  explanation: "Your idea addresses a real market need with reasonable demand. However, the competitive landscape is crowded with established players. Technical feasibility is moderate - you'll need specific expertise in AI/ML. Consider focusing on a niche to differentiate from competitors."
}

export const mockQuestions: CustomerQuestion[] = [
  {
    id: '1',
    category: 'Problem Discovery',
    question: 'How are you currently solving this problem?',
    flagType: 'ask',
    insight: 'Listen for workarounds and pain points - these indicate real demand',
  },
  {
    id: '2',
    category: 'Problem Discovery',
    question: 'Walk me through the last time you encountered this problem.',
    flagType: 'ask',
    insight: 'Specific stories reveal real pain; vague answers mean it\'s not a priority',
  },
  {
    id: '3',
    category: 'Current Solutions',
    question: 'What have you tried before to fix this?',
    flagType: 'ask',
    insight: 'If they haven\'t looked for solutions, the problem isn\'t painful enough',
  },
  {
    id: '4',
    category: 'Buying Behavior',
    question: 'How much are you currently spending on this problem?',
    flagType: 'ask',
    insight: 'Money spent = real problem. No spending = probably not worth solving',
  },
  {
    id: '5',
    category: 'Current Solutions',
    question: 'What do you hate about your current solution?',
    flagType: 'ask',
    insight: 'Find the gaps competitors are missing - this is your opportunity',
  },
  {
    id: '6',
    category: 'Leading Questions',
    question: 'Would you use an AI-powered solution for this?',
    flagType: 'avoid',
    insight: 'Never mention your solution - people will agree to be polite',
  },
  {
    id: '7',
    category: 'Hypothetical Questions',
    question: 'Would you pay $50/month for this?',
    flagType: 'avoid',
    insight: 'Hypothetical money is different from real money. Ask what they paid before instead.',
  },
  {
    id: '8',
    category: 'Leading Questions',
    question: 'Don\'t you think this would be useful?',
    flagType: 'avoid',
    insight: 'You\'re begging for compliments. People will lie to make you feel good.',
  },
  {
    id: '9',
    category: 'Hypothetical Questions',
    question: 'If we built X feature, would you use it?',
    flagType: 'avoid',
    insight: 'Future promises mean nothing. Ask about past behavior instead.',
  },
]

export const mockMvpFeatures: MvpFeature[] = [
  { id: '1', title: 'User Authentication', description: 'Email/password and OAuth login', priority: 'must_have' },
  { id: '2', title: 'Core Problem Solver', description: 'The main feature that solves the user\'s problem', priority: 'must_have' },
  { id: '3', title: 'Basic Dashboard', description: 'Simple overview of user data and actions', priority: 'must_have' },
  { id: '4', title: 'Data Export', description: 'Export user data as CSV/JSON', priority: 'later' },
  { id: '5', title: 'Team Collaboration', description: 'Invite team members and share access', priority: 'later' },
  { id: '6', title: 'Advanced Analytics', description: 'Detailed charts and insights', priority: 'later' },
  { id: '7', title: 'Mobile App', description: 'Native iOS/Android applications', priority: 'not_now' },
  { id: '8', title: 'API Access', description: 'Public API for integrations', priority: 'not_now' },
  { id: '9', title: 'White Labeling', description: 'Custom branding for enterprises', priority: 'not_now' },
]

export const mockRoadmap: RoadmapPhase[] = [
  {
    id: '1',
    name: 'Phase 1: MVP',
    description: 'Build core functionality and launch to first users',
    durationWeeks: 8,
    tasks: ['User authentication', 'Core feature development', 'Basic UI', 'Landing page'],
  },
  {
    id: '2',
    name: 'Phase 2: Validation',
    description: 'Get feedback from early users and iterate',
    durationWeeks: 4,
    tasks: ['User interviews', 'Analytics setup', 'Bug fixes', 'UX improvements'],
  },
  {
    id: '3',
    name: 'Phase 3: Growth',
    description: 'Scale the product based on validated learnings',
    durationWeeks: 12,
    tasks: ['Team features', 'Integrations', 'Performance optimization', 'Marketing site'],
  },
]

export const mockTasks: Task[] = [
  { id: '1', startupId: '1', title: 'Set up project repository', description: 'Initialize Git, configure CI/CD', status: 'done', estimateHours: 2, skillTag: 'backend', position: 0, createdAt: '' },
  { id: '2', startupId: '1', title: 'Design database schema', description: 'Plan tables, relationships, and indexes', status: 'done', estimateHours: 4, skillTag: 'backend', position: 1, createdAt: '' },
  { id: '3', startupId: '1', title: 'Implement user authentication', description: 'Email/password, OAuth with Google', status: 'in_progress', estimateHours: 8, skillTag: 'backend', position: 2, createdAt: '' },
  { id: '4', startupId: '1', title: 'Build landing page', description: 'Hero section, features, pricing', status: 'in_progress', estimateHours: 6, skillTag: 'frontend', position: 3, createdAt: '' },
  { id: '5', startupId: '1', title: 'Create dashboard UI', description: 'Layout, navigation, basic components', status: 'backlog', estimateHours: 12, skillTag: 'frontend', position: 4, createdAt: '' },
  { id: '6', startupId: '1', title: 'Implement core feature', description: 'Main problem-solving functionality', status: 'backlog', estimateHours: 24, skillTag: 'backend', position: 5, createdAt: '' },
  { id: '7', startupId: '1', title: 'Add AI integration', description: 'Connect to AI API, handle responses', status: 'backlog', estimateHours: 16, skillTag: 'ai', position: 6, createdAt: '' },
  { id: '8', startupId: '1', title: 'Write initial tests', description: 'Unit tests for critical paths', status: 'blocked', estimateHours: 8, skillTag: 'backend', position: 7, createdAt: '' },
  { id: '9', startupId: '1', title: 'Define pricing strategy', description: 'Research competitors, set pricing tiers', status: 'backlog', estimateHours: 4, skillTag: 'business', position: 8, createdAt: '' },
]

export const mockTechStack: TechStackRecommendation[] = [
  { category: 'Frontend', recommendation: 'Next.js + TypeScript', reason: 'Type safety, SSR/SSG capabilities, excellent developer experience' },
  { category: 'Styling', recommendation: 'Tailwind CSS', reason: 'Rapid development, consistent design system, small bundle size' },
  { category: 'Backend', recommendation: 'Supabase', reason: 'Managed Postgres, built-in auth, real-time subscriptions, generous free tier' },
  { category: 'AI/ML', recommendation: 'OpenRouter API', reason: 'Access to multiple models, simple API, cost-effective' },
  { category: 'Hosting', recommendation: 'Vercel', reason: 'Zero-config deployments, edge functions, excellent Next.js integration' },
  { category: 'Analytics', recommendation: 'PostHog', reason: 'Open source, self-hostable, product analytics and session recording' },
  { category: 'Payments', recommendation: 'Stripe', reason: 'Developer-friendly, comprehensive API, handles compliance' },
]

export const mockCosts: CostEstimate[] = [
  { category: 'Infrastructure', item: 'Vercel Pro', monthlyCost: 20, isOptional: false },
  { category: 'Infrastructure', item: 'Supabase Pro', monthlyCost: 25, isOptional: false },
  { category: 'AI', item: 'OpenRouter API (estimated)', monthlyCost: 50, isOptional: false },
  { category: 'Tools', item: 'Domain name', monthlyCost: 1, isOptional: false },
  { category: 'Tools', item: 'PostHog Cloud', monthlyCost: 0, isOptional: true },
  { category: 'Tools', item: 'GitHub Copilot', monthlyCost: 10, isOptional: true },
  { category: 'Marketing', item: 'Email service (Resend)', monthlyCost: 0, isOptional: true },
]
