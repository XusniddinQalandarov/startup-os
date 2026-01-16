'use server'

import { createClient } from '@/lib/supabase/server'
import { callOpenRouterJSON } from '@/lib/ai/openrouter'
import { searchWeb, searchCompetitors } from '@/lib/ai/tavily'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import type { 
  IdeaEvaluation, 
  CustomerQuestion, 
  MvpFeature, 
  RoadmapPhase, 
  TechStackRecommendation, 
  CostEstimate 
} from '@/types'

const ANTI_HYPE_PROMPT = `You are a brutally honest startup advisor. You do NOT hype ideas. You give conservative, realistic assessments. If something is weak, say it clearly. If competition is fierce, don't sugarcoat it. Your goal is to help founders avoid wasting time on bad ideas and focus on what matters.`

// ========== Evaluation (ideY Standard v1) ==========

interface EvaluationInput {
  idea: string
  targetUsers?: string
  businessType?: string
  geography?: string
  founderType?: string
}

const IDEY_STANDARD_V1_PROMPT = `You are ideY, an AI-powered startup evaluation system designed for accelerators, incubators, startup studios, and professional investors.

Your role is NOT to inspire founders. Your role is to provide structured, unbiased, and explainable evaluations of early-stage startup ideas using the ideY Standard v1 framework.

EVALUATION DIMENSIONS (score 1-5 each):

1. PROBLEM SEVERITY (Weight: 15%)
   Question: How real and painful is the problem?
   1 = Problem is vague, hypothetical, or cosmetic
   2 = Problem exists but low urgency or infrequent
   3 = Clear problem with moderate pain
   4 = Frequent, frustrating problem with current workarounds
   5 = Urgent "hair-on-fire" problem users actively want solved

2. TARGET CUSTOMER CLARITY (Weight: 15%)
   Question: Do we clearly know who this is for?
   1 = "Everyone" or undefined customer
   2 = Broad segment, poorly specified
   3 = Defined segment with some assumptions
   4 = Specific persona with context and use case
   5 = Narrow, well-understood customer with strong insight

3. MARKET OPPORTUNITY (Weight: 15%)
   Question: Is this worth building at all?
   1 = Very small or stagnant market
   2 = Niche market with limited upside
   3 = Medium-sized or emerging market
   4 = Large or fast-growing market
   5 = Massive or expanding market with tailwinds

4. COMPETITIVE DIFFERENTIATION (Weight: 15%)
   Question: Why this over existing alternatives?
   1 = No clear differentiation
   2 = Minor feature differences
   3 = Some unique angle, easy to copy
   4 = Clear differentiation or advantage
   5 = Strong moat: insight, tech, data, or distribution

5. EXECUTION COMPLEXITY (Weight: 15%)
   Question: How hard is this to build and ship?
   ⚠️ Lower complexity = higher score
   1 = Extremely complex, long R&D, many dependencies
   2 = High complexity, specialized skills required
   3 = Moderate complexity, feasible with effort
   4 = Straightforward build with existing tools
   5 = Simple MVP possible quickly

6. TRACTION/VALIDATION (Weight: 15%)
   Question: Is there any real-world signal?
   1 = Pure idea, no validation
   2 = Concept only, no users
   3 = Early users, pilots, or waitlist
   4 = Active users or revenue signal
   5 = Strong usage, growth, or paying customers

7. RISK PROFILE (Weight: 10%)
   Question: How risky is this overall?
   ⚠️ Lower risk = higher score
   1 = Multiple critical risks (market, legal, tech)
   2 = High risk in one major area
   3 = Moderate, manageable risks
   4 = Risks identified with mitigation
   5 = Low-risk execution path

VERDICT LOGIC:
- Total Score 80-100 → BUILD (Strong fundamentals, proceed)
- Total Score 60-79 → PIVOT (Promising, but weaknesses must be addressed)
- Total Score below 60 → KILL (High risk, rethink or abandon)

For each dimension you MUST provide:
- Score (1-5)
- 2-3 bullet explanation
- Key risk or assumption

Tone: Professional, analytical, institution-grade, neutral and precise.
Do NOT use hype, encouragement, or emotional language.`


// ========== Classification (B2C vs B2B) ==========

export async function classifyIdea(idea: string, businessType?: string): Promise<'B2C' | 'B2B' | 'B2G' | 'Mixed'> {
  const prompt = `Classify this startup idea as one of:
- B2C (end consumers)
- B2B (companies as buyers)
- B2G (governments)
- Mixed

IDEA: ${idea}
${businessType ? `BUSINESS TYPE: ${businessType}` : ''}

Base classification on buyer, sales motion, and value delivery.
Return only the label.`

  try {
    const response = await callOpenRouterJSON<{ classification: string }>(
      'You are a classifier. Return simple JSON.',
      prompt + '\nReturn JSON: {"classification": "B2B"}',
      'fast'
    )
    const label = (response as any).classification || 'Mixed'
    return ['B2C', 'B2B', 'B2G', 'Mixed'].includes(label) ? label : 'Mixed'
  } catch (error) {
    console.error('[Classification] Error:', error)
    return 'Mixed'
  }
}

export async function evaluateIdea(startupId: string, input: EvaluationInput): Promise<IdeaEvaluation | null> {
  const supabase = await createClient()

  // 1. Classify the idea type first
  const ideaType = await classifyIdea(input.idea, input.businessType)
  console.log(`[Evaluation] Classified as: ${ideaType}`)

  // 2. Select Prompt & Weights based on Type
  const isB2B = ideaType === 'B2B' || ideaType === 'B2G'
  
  const B2B_PROMPT = `You are a B2B startup evaluator used by accelerators, VCs, and startup studios.
Evaluate this idea STRICTLY as a B2B business.
Be skeptical. Assume limited attention and budget from buyers.

EVALUATION DIMENSIONS (1-5 score):
1. PROBLEM SEVERITY (Weight: 20%) - Is this a mission-critical or budgeted problem?
2. TARGET CUSTOMER CLARITY (Weight: 15%) - Is the economic buyer clearly defined? (renamed from Buyer Clarity)
3. MARKET OPPORTUNITY (Weight: 15%) - Is the market large and addressable? (renamed from ICP Precision)
4. COMPETITIVE DIFFERENTIATION (Weight: 10%) - Strong moat/switching costs? (renamed from Moat)
5. EXECUTION COMPLEXITY (Weight: 10%) - Sales complexity & delivery friction?
6. TRACTION/VALIDATION (Weight: 10%) - Expansion potential & detailed signals?
7. RISK PROFILE (Weight: 20%) - Willingness to Pay evidence? (Using Risk for WTP slot conceptually or keep standard?)

WAIT - To maintain backward compatibility with the database schema (7 fixed columns), we will MAP the B2B concepts to the existing 7 dimensions:

MAPPING (B2B Concept -> DB Column):
1. Problem Severity -> problem_severity (20%)
2. Buyer Clarity -> target_customer_clarity (15%)
3. ICP Precision -> market_opportunity (15%)  <-- REPURPOSED
4. Competitive Moat -> competitive_differentiation (10%)
5. Sales Complexity -> execution_complexity (10%)
6. Expansion Potential -> traction_validation (10%) <-- REPURPOSED
7. Willingness to Pay -> risk_profile (20%) <-- REPURPOSED (We invert the score: High WTP = High Score. Risk is usually Low Risk = High Score. Here High Score = Good WTP).

Scores must be 1-5 (where 5 is best). 
For Sales Complexity: 5 = Low Friction/Easy Sales, 1 = Impossible Sales.

Return JSON with exact structure:
{
  "version": "v1",
  "scores": {
    "problemSeverity": <1-5>,
    "targetCustomerClarity": <1-5>,
    "marketOpportunity": <1-5>,
    "competitiveDifferentiation": <1-5>,
    "executionComplexity": <1-5>,
    "tractionValidation": <1-5>,
    "riskProfile": <1-5>
  },
  "scoreDetails": {
    "problemSeverity": { "score": <1-5>, "bullets": ["..."], "keyRisk": "..." },
    ... etc for all 7 ...
  },
  "totalScore": <weighted average 0-100>,
  "verdict": "<BUILD|PIVOT|KILL>",
  "verdictRationale": "...",
  "keyStrengths": ["..."],
  "keyRisks": ["..."],
  "executiveSummary": "..."
}

Calculate totalScore as: (problemSeverity*20 + targetCustomerClarity*15 + marketOpportunity*15 + competitiveDifferentiation*10 + executionComplexity*10 + tractionValidation*10 + riskProfile*20) / 5 * 20`

  const selectedPrompt = isB2B ? B2B_PROMPT : IDEY_STANDARD_V1_PROMPT // Use standard prompt for B2C/Mixed

  const prompt = `Evaluate this startup idea using ideY Standard v1 (${ideaType} Mode).

STARTUP IDEA: ${input.idea}
${input.targetUsers ? `TARGET USERS: ${input.targetUsers}` : ''}
${input.businessType ? `BUSINESS TYPE: ${input.businessType}` : ''}
${input.geography ? `GEOGRAPHY: ${input.geography}` : ''}
${input.founderType ? `FOUNDER TYPE: ${input.founderType}` : ''}`

  try {
    console.log('[Evaluation v1] Starting...')
    const evaluation = await callOpenRouterJSON<IdeaEvaluation>(selectedPrompt, prompt, 'thinking')
    console.log('[Evaluation v1] Done')

    // Store in dedicated table
    const { error: dbError } = await supabase.from('idea_check_evaluations').upsert({
      startup_id: startupId,
      version: 'v1',
      problem_severity: evaluation.scores.problemSeverity,
      target_customer_clarity: evaluation.scores.targetCustomerClarity,
      market_opportunity: evaluation.scores.marketOpportunity,
      competitive_differentiation: evaluation.scores.competitiveDifferentiation,
      execution_complexity: evaluation.scores.executionComplexity,
      traction_validation: evaluation.scores.tractionValidation,
      risk_profile: evaluation.scores.riskProfile,
      score_details: evaluation.scoreDetails,
      total_score: evaluation.totalScore,
      verdict: evaluation.verdict,
      verdict_rationale: evaluation.verdictRationale,
      key_strengths: evaluation.keyStrengths,
      key_risks: evaluation.keyRisks,
      executive_summary: evaluation.executiveSummary,
      updated_at: new Date().toISOString()
    }, { onConflict: 'startup_id' })

    if (dbError) {
      console.error('[Evaluation v1] Database error:', dbError)
      return null
    }
    
    // Also save the idea type to startup
    await supabase.from('startups').update({ 
        status: 'evaluated',
        idea_type: ideaType
    }).eq('id', startupId)

    console.log('[Evaluation v1] Successfully saved')

    revalidatePath(`/dashboard/${startupId}`)
    return evaluation
  } catch (error) {
    console.error('[Evaluation v1] Error:', error)
    return null
  }
}

// ========== Customer Questions ==========

export async function generateCustomerQuestions(startupId: string, idea: string, businessType?: string): Promise<CustomerQuestion[] | null> {
  const supabase = await createClient()
  console.log(`[Questions] Starting generation for: "${idea}"`)

  // Ultra-strict prompt for reliable JSON
  const prompt = `Generate 10 customer interview questions for: "${idea}"

STRICT FORMATTING RULES:
1. Return ONLY a JSON Array starting with [ and ending with ].
2. Do NOT wrap the array in any object like {"questions": ...}.
3. Do NOT include markdown formatting like \`\`\`json.

Required Structure:
[
  {"id":"1","category":"Discovery","question":"...","flagType":"ask","insight":"..."},
  {"id":"2","category":"Pain","question":"...","flagType":"ask","insight":"..."},
  ...
  {"id":"10","category":"Solution","question":"...","flagType":"avoid","insight":"..."}
]

Content Requirements:
- 7 "ask" questions (Good: open-ended, about past behavior/problems)
- 3 "avoid" questions (Bad: hypothetical, pitching, future-tense, leading)
- Categories: Discovery, Pain, Current, Decision, Budget, Hypothetical, Leading, Solution`

  try {
    console.log('[Questions] Starting...')
    const response = await callOpenRouterJSON<CustomerQuestion[]>(
      'You are a JSON-only API. Return a raw JSON array. No markdown. No wrapping objects.',
      prompt,
      'fast',
      2000
    )
    console.log('[Questions] Done')
    
    // Handle both array and object responses (including "response" key wrapper)
    let questions: any[] = []
    
    if (Array.isArray(response)) {
      questions = response
    } else if ((response as any).questions) {
      questions = (response as any).questions
    } else if ((response as any).response) {
      // Handle case where AI returns { "response": [...] } or { "response": "[...]" }
      const respValue = (response as any).response
      if (Array.isArray(respValue)) {
        questions = respValue
      } else if (typeof respValue === 'string') {
        try {
          // It might be a stringified JSON array
          const parsed = JSON.parse(respValue)
          if (Array.isArray(parsed)) questions = parsed
        } catch (e) {
          console.warn('[Questions] Failed to parse stringified response key', e)
        }
      }
    }
    
    console.log(`[Questions] Extracted ${questions.length} questions`)

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('[Questions] No valid questions in response')
      return null
    }

    // Validate we have the right number and types
    const askQuestions = questions.filter((q: CustomerQuestion) => q.flagType === 'ask')
    const avoidQuestions = questions.filter((q: CustomerQuestion) => q.flagType === 'avoid')
    
    console.log(`[Questions] Breakdown: ${askQuestions.length} ask, ${avoidQuestions.length} avoid`)
    
    if (questions.length < 10) {
      console.warn(`[Questions] Only got ${questions.length} questions, expected 10`)
    }
    if (askQuestions.length !== 7) {
      console.warn(`[Questions] Got ${askQuestions.length} "ask" questions, expected 7`)
    }
    if (avoidQuestions.length !== 3) {
      console.warn(`[Questions] Got ${avoidQuestions.length} "avoid" questions, expected 3`)
    }

    console.log('[Questions] Saving to database...')
    
    // Delete existing questions for this startup
    await supabase.from('idea_check_questions').delete().eq('startup_id', startupId)
    
    // Insert new questions as individual rows (much faster to query)
    const questionRows = questions.map((q, index) => ({
      startup_id: startupId,
      category: q.category || 'General',
      question: q.question,
      flag_type: q.flagType,
      insight: q.insight || '',
      position: index
    }))

    const { error: dbError } = await supabase
      .from('idea_check_questions')
      .insert(questionRows)

    if (dbError) {
      console.error('[Questions] Database save error:', dbError)
      return null
    }

    console.log(`[Questions] Successfully saved ${questions.length} questions`)
    revalidatePath(`/dashboard/${startupId}/questions`)
    return questions
  } catch (error) {
    console.error('[Questions] Error generating questions:', error)
    return null
  }
}

// ========== MVP Scope ==========

export async function generateMvpScope(startupId: string, idea: string): Promise<MvpFeature[] | null> {
  const supabase = await createClient()

  const prompt = `Define MVP scope for this startup idea. You must generate EXACTLY 9-12 features.

IDEA: ${idea}

Generate features across ALL three priority levels:
- "must_have": 4-5 essential features that solve the core problem (REQUIRED for launch)
- "later": 3-4 features that add value but can wait for v2 (nice to have)
- "not_now": 2-3 features that are future dreams (v3+)

IMPORTANT: You MUST include features in ALL three categories. Do not skip any priority level.

Return JSON object with a "features" array:
{
  "features": [
    {"id": "1", "title": "Feature Name", "description": "One sentence description of what this feature does", "priority": "must_have"},
    {"id": "2", "title": "Feature Name", "description": "One sentence description", "priority": "must_have"},
    {"id": "3", "title": "Feature Name", "description": "One sentence description", "priority": "must_have"},
    {"id": "4", "title": "Feature Name", "description": "One sentence description", "priority": "must_have"},
    {"id": "5", "title": "Feature Name", "description": "One sentence description", "priority": "later"},
    {"id": "6", "title": "Feature Name", "description": "One sentence description", "priority": "later"},
    {"id": "7", "title": "Feature Name", "description": "One sentence description", "priority": "later"},
    {"id": "8", "title": "Feature Name", "description": "One sentence description", "priority": "not_now"},
    {"id": "9", "title": "Feature Name", "description": "One sentence description", "priority": "not_now"}
  ]
}

Generate at least 9 features with the distribution shown above.`

  try {
    const response = await callOpenRouterJSON<{ features: MvpFeature[] }>(ANTI_HYPE_PROMPT, prompt, 'fast')
    const features = Array.isArray(response) ? response : response.features || []

    console.log(`[MVP] Generated ${features.length} features`)

    await supabase.from('ai_outputs').upsert({
      startup_id: startupId,
      output_type: 'mvp',
      output_data: features,
    }, { onConflict: 'startup_id,output_type' })

    revalidatePath(`/dashboard/${startupId}/mvp`)
    return features
  } catch (error) {
    console.error('Error generating MVP scope:', error)
    return null
  }
}

export async function updateMvpFeatures(startupId: string, features: MvpFeature[]): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('ai_outputs').upsert({
      startup_id: startupId,
      output_type: 'mvp',
      output_data: features,
    }, { onConflict: 'startup_id,output_type' })

    if (error) {
      console.error('[MVP] Error updating features:', error)
      return false
    }

    revalidatePath(`/dashboard/${startupId}/build`)
    return true
  } catch (error) {
    console.error('[MVP] Error updating features:', error)
    return false
  }
}

// ========== Roadmap ==========

type TimelineType = 'hackathon' | 'sprint' | 'standard' | 'custom'

const timelineInstructions: Record<TimelineType, string> = {
  hackathon: `This is a HACKATHON - you have 24-48 HOURS total!
Rules:
- Phase 1: First 6-12 hours - Core functionality only
- Phase 2: Next 6-12 hours - Polish and demo-ready
- Phase 3: Final 6-12 hours - Presentation prep
Use fractional weeks (e.g., 0.1 = about 1 day)`,
  
  sprint: `This is a SPRINT - 1-2 WEEKS total!
Rules:
- Phase 1: 3-5 days - MVP with one core feature
- Phase 2: 3-5 days - Testing and iteration
- Phase 3: 2-3 days - Launch prep`,
  
  standard: `This is a STARTUP - 8-12 WEEKS total.
Rules:
- Phase 1 (MVP): 2-3 weeks max
- Phase 2 (Iterate): 2-4 weeks
- Phase 3 (Growth): 2-4 weeks
- Phase 4 (Scale): Optional, 2-3 weeks`,
  
  custom: `Follow the custom timeline provided.`,
}

export async function generateRoadmap(
  startupId: string, 
  idea: string,
  mvpFeatures?: MvpFeature[] | null,
  techStack?: TechStackRecommendation[] | null,
  timelineType: TimelineType = 'standard',
  customDays?: number
): Promise<RoadmapPhase[] | null> {
  const supabase = await createClient()

  const customInstruction = timelineType === 'custom' && customDays
    ? `You have exactly ${customDays} DAYS total. Divide into 2-4 phases proportionally.
       Use fractional weeks where needed (e.g., 0.5 = 3.5 days, 1 = 7 days).`
    : ''

  // Build context from MVP features
  const mvpContext = mvpFeatures && mvpFeatures.length > 0
    ? `\nMVP FEATURES TO BUILD:\n${mvpFeatures.map(f => `- [${f.priority}] ${f.title}: ${f.description}`).join('\n')}`
    : ''

  // Build context from tech stack
  const techContext = techStack && techStack.length > 0
    ? `\nTECH STACK CHOSEN:\n${techStack.map(t => `- ${t.category}: ${t.recommendation}`).join('\n')}`
    : ''

  const prompt = `Create a development roadmap for this startup idea:

IDEA: ${idea}
${mvpContext}
${techContext}

TIMELINE CONSTRAINT:
${timelineInstructions[timelineType]}
${customInstruction}

Based on the MVP features and tech stack above, create 2-4 phases. Start with must-have features, then add later features in subsequent phases. Be realistic about development time with the chosen tech stack.

Return JSON object with a "phases" array:
{
  "phases": [
    {
      "id": "<unique-id>",
      "name": "Phase 1: <name>",
      "description": "<what this phase accomplishes - reference specific features>",
      "durationWeeks": <number, can be fractional>,
      "tasks": ["task1", "task2", "task3", "task4"]
    }
  ]
}`

  try {
    const response = await callOpenRouterJSON<{ phases: RoadmapPhase[] }>(ANTI_HYPE_PROMPT, prompt, 'fast')
    const roadmap = Array.isArray(response) ? response : response.phases || []

    await supabase.from('ai_outputs').upsert({
      startup_id: startupId,
      output_type: 'roadmap',
      output_data: roadmap,
    }, { onConflict: 'startup_id,output_type' })

    revalidatePath(`/dashboard/${startupId}/roadmap`)
    return roadmap
  } catch (error) {
    console.error('Error generating roadmap:', error)
    return null
  }
}

// ========== Tasks ==========

interface GeneratedTask {
  title: string
  description: string
  status: 'backlog' | 'in_progress' | 'blocked' | 'done'
  estimateHours: number
  skillTag: 'frontend' | 'backend' | 'ai' | 'business' | 'design'
}

export async function generateTasks(
  startupId: string, 
  idea: string,
  mvpFeatures?: MvpFeature[] | null,
  roadmap?: RoadmapPhase[] | null
): Promise<GeneratedTask[] | null> {
  const supabase = await createClient()

  // Build context from MVP features
  const mvpContext = mvpFeatures && mvpFeatures.length > 0
    ? `\nMVP FEATURES TO BUILD:\n${mvpFeatures.filter(f => f.priority === 'must_have').map(f => `- ${f.title}: ${f.description}`).join('\n')}`
    : ''

  // Build context from roadmap phases
  const roadmapContext = roadmap && roadmap.length > 0
    ? `\nROADMAP PHASES:\n${roadmap.map(p => `- ${p.name} (${p.durationWeeks} weeks): ${p.description}`).join('\n')}`
    : ''

  const prompt = `Generate development tasks for this startup MVP. Create a comprehensive task list with 15-20 tasks.

IDEA: ${idea}
${mvpContext}
${roadmapContext}

Based on the MVP features and roadmap above, create 15-20 concrete, actionable development tasks covering:
- Setup & Infrastructure (2-3 tasks)
- Backend/API development (4-5 tasks)
- Frontend/UI development (4-5 tasks)
- Integration & Testing (2-3 tasks)
- Launch preparation (2-3 tasks)

Include a mix of task sizes (small: 2-4h, medium: 4-8h, large: 8-16h).

Return JSON object with a "tasks" array:
{
  "tasks": [
    {"title": "Task title", "description": "What needs to be done", "status": "backlog", "estimateHours": 4, "skillTag": "frontend"},
    {"title": "Task title", "description": "What needs to be done", "status": "backlog", "estimateHours": 8, "skillTag": "backend"},
    ...
  ]
}

Generate exactly 15-18 tasks. Use skill tags: "frontend", "backend", "ai", "business", "design".`

  try {
    const response = await callOpenRouterJSON<{ tasks: GeneratedTask[] }>(ANTI_HYPE_PROMPT, prompt, 'fast')
    const tasks = Array.isArray(response) ? response : response.tasks || []

    await supabase.from('ai_outputs').upsert({
      startup_id: startupId,
      output_type: 'tasks',
      output_data: tasks,
    }, { onConflict: 'startup_id,output_type' })

    // Delete existing tasks and insert new ones
    await supabase.from('tasks').delete().eq('startup_id', startupId)
    
    const taskRows = tasks.map((task, index) => ({
      startup_id: startupId,
      title: task.title,
      description: task.description,
      status: task.status,
      estimate_hours: task.estimateHours,
      skill_tag: task.skillTag,
      position: index,
    }))

    await supabase.from('tasks').insert(taskRows)

    revalidatePath(`/dashboard/${startupId}/tasks`)
    return tasks
  } catch (error) {
    console.error('Error generating tasks:', error)
    return null
  }
}

// ========== Tech Stack ==========

export async function generateTechStack(
  startupId: string, 
  idea: string, 
  founderType?: string,
  mvpFeatures?: MvpFeature[] | null
): Promise<TechStackRecommendation[] | null> {
  const supabase = await createClient()

  // Build context from MVP features if available
  const mvpContext = mvpFeatures && mvpFeatures.length > 0
    ? `\nMVP FEATURES TO BUILD:\n${mvpFeatures.filter(f => f.priority === 'must_have').map(f => `- ${f.title}: ${f.description}`).join('\n')}`
    : ''

  const prompt = `Recommend a complete tech stack for this startup. You MUST provide exactly 7 recommendations, one for each category.

IDEA: ${idea}
${founderType ? `FOUNDER TYPE: ${founderType}` : ''}
${mvpContext}

Recommend practical, proven technologies. Prefer simplicity over cutting-edge.

You MUST provide exactly 7 recommendations, one for each category:
1. Frontend - UI framework
2. Backend - Server/API framework
3. Database - Data storage
4. Hosting - Where to deploy
5. AI/ML - AI capabilities (or "N/A" if not needed, but give alternative)
6. Payments - Payment processing
7. Analytics - User tracking

Return JSON object with a "recommendations" array:
{
  "recommendations": [
    {"category": "Frontend", "recommendation": "Next.js 14 + TypeScript", "reason": "Full-stack React with SSR, great DX"},
    {"category": "Backend", "recommendation": "Next.js API Routes + Supabase", "reason": "Serverless, scales automatically"},
    {"category": "Database", "recommendation": "Supabase (PostgreSQL)", "reason": "Free tier, real-time, auth included"},
    {"category": "Hosting", "recommendation": "Vercel", "reason": "Zero-config deployment, free tier"},
    {"category": "AI/ML", "recommendation": "OpenAI API via OpenRouter", "reason": "Access to multiple models, simple API"},
    {"category": "Payments", "recommendation": "Stripe", "reason": "Developer-friendly, handles compliance"},
    {"category": "Analytics", "recommendation": "PostHog", "reason": "Free tier, session recordings"}
  ]
}

Provide specific technology names with versions where relevant. Include 7 recommendations covering all categories.`

  try {
    const response = await callOpenRouterJSON<{ recommendations: TechStackRecommendation[] }>(ANTI_HYPE_PROMPT, prompt, 'fast')
    const techStack = Array.isArray(response) ? response : response.recommendations || []

    console.log(`[Tech Stack] Generated ${techStack.length} recommendations`)

    await supabase.from('ai_outputs').upsert({
      startup_id: startupId,
      output_type: 'tech_stack',
      output_data: techStack,
    }, { onConflict: 'startup_id,output_type' })

    revalidatePath(`/dashboard/${startupId}/tech`)
    return techStack
  } catch (error) {
    console.error('Error generating tech stack:', error)
    return null
  }
}

// ========== Costs ==========

export async function generateCosts(
  startupId: string, 
  idea: string,
  gtmStrategy?: any
): Promise<CostEstimate[] | null> {
  const supabase = await createClient()

  const gtmContext = gtmStrategy?.channels
    ? `\nGTM CHANNELS: ${gtmStrategy.channels.join(', ')}`
    : ''

  const prompt = `Estimate REALISTIC monthly costs for running this early-stage startup:

IDEA: ${idea}
${gtmContext}

Be very realistic and practical for a bootstrapped/early-stage startup:
- Prioritize FREE TIERS wherever possible (Vercel free, Supabase free, etc.)
- Only include paid services that are absolutely necessary
- Use actual 2024 pricing (not inflated estimates)
- Separate essential costs from nice-to-have costs
- For AI costs, estimate based on actual API pricing (e.g., OpenAI $0.002/1K tokens)
- Marketing budget should be minimal for MVP stage ($0-50/month)

Most early startups should run on $50-200/month total. Don't inflate costs.

Return JSON object with a "costs" array:
{
  "costs": [
    {
      "category": "Infrastructure" | "Tools" | "AI" | "Marketing" | "Other",
      "item": "<specific service name with tier, e.g., 'Vercel Pro' or 'Supabase Free'>",
      "monthlyCost": <realistic number in USD>,
      "isOptional": true/false,
      "note": "<brief justification or free tier info>"
    }
  ]
}`

  try {
    const response = await callOpenRouterJSON<{ costs: CostEstimate[] }>(ANTI_HYPE_PROMPT, prompt, 'fast')
    const costs = Array.isArray(response) ? response : response.costs || []

    await supabase.from('ai_outputs').upsert({
      startup_id: startupId,
      output_type: 'costs',
      output_data: costs,
    }, { onConflict: 'startup_id,output_type' })

    revalidatePath(`/dashboard/${startupId}/costs`)
    return costs
  } catch (error) {
    console.error('Error generating costs:', error)
    return null
  }
}

// ========== Get Stored AI Output ==========


export const getAiOutput = cache(async function getAiOutput(startupId: string, outputType: string): Promise<unknown | null> {
  const supabase = await createClient()

  // Handle retrieval from dedicated tables (FAST - no JSONB parsing)
  
  if (outputType === 'evaluation') {
    const { data } = await supabase
      .from('idea_check_evaluations')
      .select('*')
      .eq('startup_id', startupId)
      .maybeSingle()
    
    if (data) {
      // Check if it's v1 format (has version field or new columns) AND uses 1-5 scale
      const isV1 = (data.version === 'v1' || data.total_score !== null) && (data.problem_severity <= 5)
      
      if (isV1) {
        return {
          version: 'v1',
          scores: {
            problemSeverity: data.problem_severity ?? 3,
            targetCustomerClarity: data.target_customer_clarity ?? 3,
            marketOpportunity: data.market_opportunity ?? 3,
            competitiveDifferentiation: data.competitive_differentiation ?? 3,
            executionComplexity: data.execution_complexity ?? 3,
            tractionValidation: data.traction_validation ?? 1,
            riskProfile: data.risk_profile ?? 3,
          },
          scoreDetails: data.score_details ?? {},
          totalScore: data.total_score ?? 60,
          verdict: data.verdict ?? 'PIVOT',
          verdictRationale: data.verdict_rationale ?? data.explanation ?? '',
          keyStrengths: data.key_strengths ?? [],
          keyRisks: data.key_risks ?? [],
          executiveSummary: data.executive_summary ?? ''
        } as IdeaEvaluation
      }
      
      // Legacy format - convert to v1 structure
      const legacyTotal = ((data.problem_severity ?? 50) + (data.market_opportunity ?? 50) + 
                          (data.feasibility ?? 50) + (data.differentiation ?? 50)) / 4
      return {
        version: 'v1',
        scores: {
          problemSeverity: Math.round((data.problem_severity ?? 50) / 20),
          targetCustomerClarity: 3,
          marketOpportunity: Math.round((data.market_opportunity ?? 50) / 20),
          competitiveDifferentiation: Math.round((data.differentiation ?? 50) / 20),
          executionComplexity: Math.round((data.feasibility ?? 50) / 20),
          tractionValidation: 1,
          riskProfile: 3,
        },
        scoreDetails: {},
        totalScore: Math.round(legacyTotal),
        verdict: legacyTotal >= 70 ? 'BUILD' : legacyTotal >= 50 ? 'PIVOT' : 'KILL',
        verdictRationale: data.explanation ?? data.verdict ?? '',
        keyStrengths: [],
        keyRisks: [],
        executiveSummary: data.explanation ?? ''
      } as IdeaEvaluation
    }
  }

  if (outputType === 'questions') {
    const { data } = await supabase
      .from('idea_check_questions')
      .select('*')
      .eq('startup_id', startupId)
      .order('position', { ascending: true })
    
    if (data && data.length > 0) {
      return data.map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        flagType: q.flag_type,
        insight: q.insight
      }))
    }
  }

  if (outputType === 'competitors') {
    const { data } = await supabase
      .from('competitor_analyses')
      .select('*')
      .eq('startup_id', startupId)
      .maybeSingle()
    
    if (data) {
      return {
        competitors: data.competitors || [],
        marketOverview: data.market_overview || '',
        opportunities: data.opportunities || [],
        threats: data.threats || [],
        sources: data.sources || []
      }
    }
  }

  if (outputType === 'differentiation') {
    const { data } = await supabase
      .from('market_reality_analysis')
      .select('*')
      .eq('startup_id', startupId)
      .maybeSingle()
    
    if (data) {
      return {
        valueProposition: data.value_proposition || '',
        unfairAdvantage: data.unfair_advantage || '',
        positioningStatement: data.positioning_statement || '',
        marketDifficulty: data.market_difficulty || 'unknown',
        marketDifficultyReason: data.market_difficulty_reason || ''
      }
    }
  }

  if (outputType === 'analysis') {
    const { data } = await supabase
      .from('project_analyses')
      .select('*')
      .eq('startup_id', startupId)
      .maybeSingle()
      
    if (data) {
      return {
        problemStatement: data.problem_statement,
        targetAudience: data.target_audience,
        valueProposition: data.value_proposition,
        tam: data.tam,
        sam: data.sam,
        som: data.som,
        businessModel: data.business_model,
        keyMetrics: data.key_metrics,
        unfairAdvantage: data.unfair_advantage,
        channels: data.channels
      }
    }
  }

  // Fallback to legacy single-table storage for other types
  const { data, error } = await supabase
    .from('ai_outputs')
    .select('output_data')
    .eq('startup_id', startupId)
    .eq('output_type', outputType)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data.output_data
})

// ========== Competitor Analysis ==========

interface CompetitorAnalysis {
  competitors: {
    name: string
    website?: string
    description: string
    strengths: string[]
    weaknesses: string[]
    pricing?: string
    marketShare?: string
  }[]
  marketOverview: string
  opportunities: string[]
  threats: string[]
  sources: { title: string; url: string }[]
}

export async function analyzeCompetitors(
  startupId: string, 
  idea: string,
  targetUsers?: string
): Promise<CompetitorAnalysis | null> {
  const supabase = await createClient()

  console.log(`[Competitors] Starting analysis for: "${idea}"`)
  
  // Check if we already have recent analysis to avoid duplicate API calls
  const { data: existing } = await supabase
    .from('competitor_analyses')
    .select('created_at')
    .eq('startup_id', startupId)
    .maybeSingle()
  
  if (existing) {
    const createdAt = new Date(existing.created_at)
    const now = new Date()
    const minutesAgo = (now.getTime() - createdAt.getTime()) / 1000 / 60
    
    if (minutesAgo < 5) {
      console.log('[Competitors] Recent analysis exists (< 5 min), fetching cached data...')
      const cached = await getAiOutput(startupId, 'competitors')
      if (cached) return cached as CompetitorAnalysis
    }
  }
  
  // First, do a real web search to gather data
  let searchData: { results: { title: string; url: string; snippet: string }[]; context: string }
  
  try {
    searchData = await searchCompetitors(idea, targetUsers)
    console.log(`[Competitors] Search returned ${searchData.results.length} results`)
  } catch (searchError) {
    console.error('[Competitors] Search failed:', searchError)
    searchData = { results: [], context: '' }
  }
  
  // Build prompt - works even without search results
  const hasSearchResults = searchData.results.length > 0
  
  // Simplified prompt for faster, more reliable responses
  const prompt = `Analyze competitors for: "${idea}"
${targetUsers ? `Target: ${targetUsers}` : ''}
${hasSearchResults ? `\nSearch data:\n${searchData.context.substring(0, 1500)}` : ''}

Return JSON with EXACTLY 3 competitors:
{
  "competitors": [
    {"name":"Company","website":"https://...","description":"One sentence","strengths":["str1","str2"],"weaknesses":["weak1","weak2"],"pricing":"Model","marketShare":"Position"}
  ],
  "marketOverview": "Two sentences max",
  "opportunities": ["opp1","opp2","opp3"],
  "threats": ["threat1","threat2","threat3"]
}`

  try {
    console.log('[Competitors] Calling AI for analysis...')
    
    const analysis = await callOpenRouterJSON<CompetitorAnalysis>(
      'Market analyst. Return ONLY valid JSON. Be concise.',
      prompt,
      'fast',
      2500 // Reduced - 3 competitors need less tokens
    )

    console.log('[Competitors] AI response received')

    // Ensure all fields have proper defaults
    if (!analysis.sources) {
      analysis.sources = []
    }
    if (!analysis.competitors) {
      analysis.competitors = []
    }
    if (!analysis.opportunities) {
      analysis.opportunities = []
    }
    if (!analysis.threats) {
      analysis.threats = []
    }
    if (!analysis.marketOverview) {
      analysis.marketOverview = ''
    }

    // Add sources from Tavily if available
    if (searchData.results.length > 0) {
      analysis.sources = searchData.results.map(r => ({ title: r.title, url: r.url }))
    }

    console.log(`[Competitors] Analysis complete. Found ${analysis.competitors?.length || 0} competitors`)

    // Save to dedicated table (exclude sources if column doesn't exist)
    console.log('[Competitors] Saving to database...')
    
    const { error: saveError } = await supabase.from('competitor_analyses').upsert({
      startup_id: startupId,
      market_overview: analysis.marketOverview,
      competitors: analysis.competitors,
      opportunities: analysis.opportunities,
      threats: analysis.threats,
      // sources: analysis.sources, // Commented out - add sources column to DB first
    }, { onConflict: 'startup_id' })
    
    if (saveError) {
      console.error('[Competitors] Save error:', JSON.stringify(saveError))
      throw new Error(`Failed to save to database: ${saveError.message}`)
    }
    
    console.log('[Competitors] Successfully saved to database')

    revalidatePath(`/dashboard/${startupId}/competitors`)
    return analysis
  } catch (error) {
    console.error('[Competitors] Error analyzing:', error)
    throw error // Re-throw to let the caller handle it
  }
}

// ========== Differentiation Analysis (Market Reality) ==========

interface DifferentiationAnalysis {
  valueProposition: string
  unfairAdvantage: string
  positioningStatement: string
  marketDifficulty: 'low' | 'moderate' | 'high'
  marketDifficultyReason: string
}

export async function generateDifferentiationAnalysis(
  startupId: string,
  idea: string,
  competitors?: CompetitorAnalysis | null,
  targetUsers?: string
): Promise<DifferentiationAnalysis | null> {
  const supabase = await createClient()

  console.log(`[Differentiation] Starting analysis for: "${idea}"`)

  const competitorContext = competitors?.competitors?.length 
    ? `\nKNOWN COMPETITORS:\n${competitors.competitors.map(c => `- ${c.name}: ${c.description}`).join('\n')}\n\nCOMPETITOR WEAKNESSES TO EXPLOIT:\n${competitors.competitors.flatMap(c => c.weaknesses || []).join(', ')}`
    : ''

  const prompt = `Analyze how this startup can differentiate in the market.

IDEA: ${idea}
${targetUsers ? `TARGET USERS: ${targetUsers}` : ''}
${competitorContext}

Generate a comprehensive differentiation strategy:

1. **Value Proposition**: A clear, compelling statement of the unique value this product offers. Use the format: "For [target customer] who [customer need], [product name] provides [key benefit] unlike [competitors] because [reason to believe]."

2. **Unfair Advantage**: What would make this startup hard to copy? Consider: unique technology, network effects, data moats, brand, team expertise, regulatory advantages, or exclusive partnerships.

3. **Positioning Statement**: How should this startup position itself in the market? (e.g., "The affordable alternative to X", "The premium option for Y", "The only solution that Z")

4. **Market Difficulty**: Assess how hard it will be to enter this market based on competition, barriers, and existing solutions.

Return JSON:
{
  "valueProposition": "<2-3 sentence value proposition>",
  "unfairAdvantage": "<detailed paragraph about potential moats and defensibility>",
  "positioningStatement": "<single sentence positioning>",
  "marketDifficulty": "low" | "moderate" | "high",
  "marketDifficultyReason": "<1-2 sentences explaining the difficulty level>"
}`

  try {
    const response = await callOpenRouterJSON<DifferentiationAnalysis>(ANTI_HYPE_PROMPT, prompt, 'fast')

    // Save to dedicated table
    const { error: saveError } = await supabase.from('market_reality_analysis').upsert({
      startup_id: startupId,
      value_proposition: response.valueProposition,
      unfair_advantage: response.unfairAdvantage,
      positioning_statement: response.positioningStatement,
      market_difficulty: response.marketDifficulty,
      market_difficulty_reason: response.marketDifficultyReason,
      updated_at: new Date().toISOString()
    }, { onConflict: 'startup_id' })

    if (saveError) {
      console.error('[Differentiation] Save error:', saveError)
    }

    console.log('[Differentiation] Analysis complete')
    revalidatePath(`/dashboard/${startupId}/market`)
    return response
  } catch (error) {
    console.error('[Differentiation] Error:', error)
    return null
  }
}

// ========== Project Analysis ==========

interface AnalysisSection {
  id: string
  title: string
  content: string
}

interface ProjectAnalysisData {
  problemStatement: AnalysisSection
  targetAudience: AnalysisSection
  valueProposition: AnalysisSection
  tam: AnalysisSection
  sam: AnalysisSection
  som: AnalysisSection
  businessModel: AnalysisSection
  keyMetrics: AnalysisSection
  unfairAdvantage: AnalysisSection
  channels: AnalysisSection
}

export async function generateProjectAnalysis(
  startupId: string,
  idea: string,
  targetUsers?: string,
  businessType?: string
): Promise<ProjectAnalysisData | null> {
  const supabase = await createClient()

  // Search the web for market data, competitors, and trends
  console.log('[Analysis] Searching web for market intelligence...')
  const searchQueries = [
    `global ${idea} market size revenue 2026 statistics`,
    `${idea} total addressable market TAM SAM analysis`,
    `${idea} industry market research report 2026`,
    `${businessType || 'SaaS'} ${idea} market opportunity revenue forecast`,
    `${targetUsers || ''} ${idea} market potential customers worldwide`,
    `${idea} competitive landscape market leaders revenue`,
  ]

  const searchResults = await Promise.all(
    searchQueries.map(query => searchWeb(query, 3))
  )

  const webContext = searchResults
    .flat()
    .filter(r => r.snippet)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}`)
    .join('\n\n')

  const hasWebData = webContext.length > 0
  console.log(`[Analysis] Found ${searchResults.flat().length} web results`)

  const prompt = `Create a comprehensive startup analysis for this idea:

IDEA: ${idea}
${targetUsers ? `TARGET USERS: ${targetUsers}` : ''}
${businessType ? `BUSINESS TYPE: ${businessType}` : ''}

${hasWebData ? `MARKET RESEARCH DATA (use this to inform your analysis):\n${webContext}\n\n` : ''}Generate analysis for each section. Be specific and actionable, not generic. Use the web research data above to provide accurate market sizing and competitive insights.

FORMATTING RULES:
- Use clear paragraphs separated by line breaks (\n)
- For lists, use numbered format: "1) Item text" on separate lines
- Bold important terms using **text**
- Include specific numbers and calculations
- Keep each section focused and well-structured

Return JSON:
{
  "problemStatement": {
    "id": "problemStatement",
    "title": "Problem Statement",
    "content": "Clear, specific problem this solves.\n\nWho has this problem and how painful it is. Include market context."
  },
  "targetAudience": {
    "id": "targetAudience", 
    "title": "Target Audience",
    "content": "Specific description of ideal customer.\n\n**Demographics:** Age, income, location\n**Psychographics:** Values, interests, behaviors\n**Pain Points:** What problems they face daily"
  },
  "valueProposition": {
    "id": "valueProposition",
    "title": "Value Proposition",
    "content": "What unique value do you provide?\n\nWhy would someone choose you over alternatives? Be specific about the core benefit."
  },
  "tam": {
    "id": "tam",
    "title": "TAM (Total Market)",
    "content": "**Bottom-Up Calculation:**\n\n1) Total potential customers in market: [number]\n2) Annual price per customer: $[amount]\n3) TAM = [number] customers × $[price] = $[total]\n\nAvoid generic global market stats. Be specific to this exact niche."
  },
  "sam": {
    "id": "sam",
    "title": "SAM (Serviceable Market)",
    "content": "**Serviceable Addressable Market:**\n\nThe segment you can realistically serve based on:\n\n1) Geographic constraints: [regions]\n2) Technical/operational capacity: [details]\n3) SAM Calculation: $[amount]\n\nShow your work."
  },
  "som": {
    "id": "som",
    "title": "SOM (Obtainable Market)",
    "content": "**Year 1-2 Realistic Target:**\n\n1) Target customers: [number] customers\n2) Expected price: $[amount]\n3) Revenue target: $[total]\n4) Market share: [percentage]%\n\nBased on realistic marketing budget and sales capacity."
  },
  "businessModel": {
    "id": "businessModel",
    "title": "Business Model",
    "content": "**Revenue Streams:**\n\n1) Primary: [description and pricing]\n2) Secondary: [description and pricing]\n\n**Unit Economics:**\n- Price per customer: $[amount]\n- Cost per customer: $[amount]\n- Gross margin: [percentage]%"
  },
  "keyMetrics": {
    "id": "keyMetrics",
    "title": "Key Metrics",
    "content": "**Core KPIs:**\n\n1) Customer Acquisition Cost (CAC): Target $[amount]\n2) Lifetime Value (LTV): Target $[amount]\n3) Churn Rate: <[percentage]% monthly\n4) Conversion Rate: [percentage]%\n5) [Additional relevant metric]\n\nTrack via [specific tools/methods]."
  },
  "unfairAdvantage": {
    "id": "unfairAdvantage",
    "title": "Unfair Advantage",
    "content": "**What's Hard to Copy:**\n\n[Specific advantage - network effects, proprietary data, unique expertise, exclusive partnerships, etc.]\n\n**Why It Matters:**\n\n[Explanation of competitive moat and sustainability]"
  },
  "channels": {
    "id": "channels",
    "title": "Distribution Channels",
    "content": "**Customer Acquisition Channels:**\n\n1) [Channel name]: [Strategy and estimated CAC]\n2) [Channel name]: [Strategy and estimated CAC]\n3) [Channel name]: [Strategy and estimated CAC]\n\nFocus on 1-2 channels initially for better results."
  }
}`

  try {
    // Use thinking model for comprehensive analysis
    console.log('[Analysis] Generating project analysis...')
    const analysis = await callOpenRouterJSON<ProjectAnalysisData>(ANTI_HYPE_PROMPT, prompt, 'thinking')
    console.log('[Analysis] Generated successfully')

    // Save to dedicated table (better structure)
    const { error: dbError } = await supabase.from('project_analyses').upsert({
      startup_id: startupId,
      problem_statement: analysis.problemStatement,
      target_audience: analysis.targetAudience,
      value_proposition: analysis.valueProposition,
      tam: analysis.tam,
      sam: analysis.sam,
      som: analysis.som,
      business_model: analysis.businessModel,
      key_metrics: analysis.keyMetrics,
      unfair_advantage: analysis.unfairAdvantage,
      channels: analysis.channels
    }, { onConflict: 'startup_id' })

    if (dbError) {
      console.warn('[Analysis] DB save warning (check if migration ran):', dbError.message)
      
      if (dbError.code === '42P01') { // undefined_table
         const { error: legacyError } = await supabase.from('ai_outputs').upsert({
            startup_id: startupId,
            output_type: 'analysis',
            output_data: analysis,
         }, { onConflict: 'startup_id,output_type' })
         if (legacyError) console.log('Legacy save failed too')
      }
    } else {
      console.log('[Analysis] Saved to database')
    }

    revalidatePath(`/dashboard/${startupId}/analysis`)
    return analysis
  } catch (error) {
    console.error('[Analysis] Error generating:', error)
    return null
  }
}


// ========== Launch Plan: GTM Strategy ==========

interface GTMStrategy {
  channels: string[]
  targetSegment: string
  launchStrategy: string
  first100Users: string
  partnerships: string[]
}

export async function generateGTMStrategy(
  startupId: string,
  idea: string,
  targetUsers?: string
): Promise<GTMStrategy | null> {
  const supabase = await createClient()

  const prompt = `Create a go-to-market strategy for this startup:

IDEA: ${idea}
${targetUsers ? `TARGET USERS: ${targetUsers}` : ''}

Generate a practical GTM strategy for a lean startup.

Return JSON:
{
  "channels": ["Channel 1: specific tactic", "Channel 2: specific tactic", "Channel 3: specific tactic"],
  "targetSegment": "Specific initial segment to focus on first",
  "launchStrategy": "How to launch: soft launch, beta, ProductHunt, etc.",
  "first100Users": "Specific tactics to acquire the first 100 users manually",
  "partnerships": ["Potential partner 1", "Potential partner 2"]
}`

  try {
    const gtm = await callOpenRouterJSON<GTMStrategy>(ANTI_HYPE_PROMPT, prompt, 'fast')
    
    await supabase.from('launch_plan_gtm').upsert({
      startup_id: startupId,
      channels: gtm.channels.join('\n'),
      target_segment: gtm.targetSegment,
      launch_strategy: gtm.launchStrategy,
      first_100_users: gtm.first100Users,
      partnerships: gtm.partnerships.join('\n')
    }, { onConflict: 'startup_id' })

    revalidatePath(`/dashboard/${startupId}/launch`)
    return gtm
  } catch (error) {
    console.error('[GTM] Error generating:', error)
    return null
  }
}

// ========== Launch Plan: Success Metrics ==========

interface SuccessMetric {
  metricName: string
  targetValue: string
  timeframe: string
  metricType: 'growth' | 'revenue' | 'engagement' | 'retention' | 'other'
  isNorthStar: boolean
}

export async function generateSuccessMetrics(
  startupId: string,
  idea: string,
  targetUsers?: string,
  gtmStrategy?: GTMStrategy | null,
  costs?: CostEstimate[] | null
): Promise<SuccessMetric[] | null> {
  const supabase = await createClient()

  const gtmContext = gtmStrategy 
    ? `\nGTM STRATEGY:\n- Channels: ${gtmStrategy.channels.join(', ')}\n- Target: ${gtmStrategy.targetSegment}`
    : ''

  const costContext = costs && costs.length > 0
    ? `\nMONTHLY COSTS: $${costs.reduce((sum, c) => sum + c.monthlyCost, 0)}`
    : ''

  const prompt = `Define success metrics for this startup launch:

IDEA: ${idea}
${targetUsers ? `TARGET USERS: ${targetUsers}` : ''}
${gtmContext}
${costContext}

Create 5-7 measurable success metrics. Include at least one North Star metric.

Return JSON:
{
  "metrics": [
    {"metricName": "Weekly Active Users", "targetValue": "100", "timeframe": "30 days", "metricType": "growth", "isNorthStar": true},
    {"metricName": "Conversion Rate", "targetValue": "5%", "timeframe": "60 days", "metricType": "engagement", "isNorthStar": false}
  ]
}`

  try {
    const response = await callOpenRouterJSON<{ metrics: SuccessMetric[] }>(ANTI_HYPE_PROMPT, prompt, 'fast')
    const metrics = Array.isArray(response) ? response : response.metrics || []

    // Delete old and insert new
    await supabase.from('launch_plan_metrics').delete().eq('startup_id', startupId)
    
    const rows = metrics.map((m, i) => ({
      startup_id: startupId,
      metric_name: m.metricName,
      target_value: m.targetValue,
      timeframe: m.timeframe,
      metric_type: m.metricType,
      is_north_star: m.isNorthStar,
      position: i
    }))

    await supabase.from('launch_plan_metrics').insert(rows)
    revalidatePath(`/dashboard/${startupId}/launch`)
    return metrics
  } catch (error) {
    console.error('[Metrics] Error generating:', error)
    return null
  }
}

// ========== Decision: SWOT Analysis ==========

interface SWOTAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export async function generateSWOTAnalysis(
  startupId: string,
  idea: string,
  targetUsers?: string,
  evaluation?: any
): Promise<SWOTAnalysis | null> {
  const supabase = await createClient()

  const evalContext = evaluation?.scores
    ? `\nEVALUATION SCORES:\n- Problem Severity: ${evaluation.scores.problemSeverity}/100\n- Market Opportunity: ${evaluation.scores.marketOpportunity}/100\n- Feasibility: ${evaluation.scores.feasibility}/100\n- Differentiation: ${evaluation.scores.differentiation}/100`
    : ''

  const prompt = `Create a SWOT analysis for this startup idea:

IDEA: ${idea}
${targetUsers ? `TARGET USERS: ${targetUsers}` : ''}
${evalContext}

Be honest and critical. Identify real strengths and real weaknesses.

Return JSON:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "threats": ["Threat 1", "Threat 2", "Threat 3"]
}`

  try {
    const swot = await callOpenRouterJSON<SWOTAnalysis>(ANTI_HYPE_PROMPT, prompt, 'fast')

    await supabase.from('decision_swot').upsert({
      startup_id: startupId,
      strengths: swot.strengths,
      weaknesses: swot.weaknesses,
      opportunities: swot.opportunities,
      threats: swot.threats
    }, { onConflict: 'startup_id' })

    revalidatePath(`/dashboard/${startupId}/decision`)
    return swot
  } catch (error) {
    console.error('[SWOT] Error generating:', error)
    return null
  }
}

// ========== Decision: Risk Analysis ==========

interface Risk {
  riskCategory: 'market' | 'technical' | 'financial' | 'team' | 'competition' | 'regulatory' | 'other'
  riskTitle: string
  riskDescription: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  mitigationStrategy: string
}

export async function generateRiskAnalysis(
  startupId: string,
  idea: string,
  evaluation?: any,
  swot?: SWOTAnalysis | null
): Promise<Risk[] | null> {
  const supabase = await createClient()

  const swotContext = swot
    ? `\nWEAKNESSES: ${swot.weaknesses.join(', ')}\nTHREATS: ${swot.threats.join(', ')}`
    : ''

  const prompt = `Identify the key risks for this startup idea:

IDEA: ${idea}
${swotContext}

Identify 5-8 specific risks with mitigation strategies.

Return JSON:
{
  "risks": [
    {
      "riskCategory": "market",
      "riskTitle": "Risk title",
      "riskDescription": "Detailed description of the risk",
      "severity": "high",
      "mitigationStrategy": "How to mitigate this risk"
    }
  ]
}`

  try {
    const response = await callOpenRouterJSON<{ risks: Risk[] }>(ANTI_HYPE_PROMPT, prompt, 'fast')
    const risks = Array.isArray(response) ? response : response.risks || []

    // Delete old and insert new
    await supabase.from('decision_risks').delete().eq('startup_id', startupId)
    
    const rows = risks.map((r, i) => ({
      startup_id: startupId,
      risk_category: r.riskCategory,
      risk_title: r.riskTitle,
      risk_description: r.riskDescription,
      severity: r.severity,
      mitigation_strategy: r.mitigationStrategy,
      position: i
    }))

    await supabase.from('decision_risks').insert(rows)
    revalidatePath(`/dashboard/${startupId}/decision`)
    return risks
  } catch (error) {
    console.error('[Risks] Error generating:', error)
    return null
  }
}

// ========== Decision: Final Verdict ==========

interface VerdictData {
  verdict: 'build' | 'pivot' | 'kill'
  confidenceScore: number
  explanation: string
  nextSteps: string[]
}

export async function generateVerdict(
  startupId: string,
  idea: string,
  evaluation?: any,
  swot?: SWOTAnalysis | null,
  risks?: Risk[] | null
): Promise<VerdictData | null> {
  const supabase = await createClient()

  const evalContext = evaluation?.scores
    ? `\nEVALUATION:\n- Problem: ${evaluation.scores.problemSeverity}/100\n- Market: ${evaluation.scores.marketOpportunity}/100\n- Feasibility: ${evaluation.scores.feasibility}/100\n- Differentiation: ${evaluation.scores.differentiation}/100`
    : ''

  const swotContext = swot
    ? `\nSWOT:\n- Strengths: ${swot.strengths.length}\n- Weaknesses: ${swot.weaknesses.length}\n- Opportunities: ${swot.opportunities.length}\n- Threats: ${swot.threats.length}`
    : ''

  const riskContext = risks
    ? `\nRISKS: ${risks.filter(r => r.severity === 'critical' || r.severity === 'high').length} critical/high risks`
    : ''

  const prompt = `Make a final BUILD/PIVOT/KILL decision for this startup idea:

IDEA: ${idea}
${evalContext}
${swotContext}
${riskContext}

Based on all the analysis above, make a final recommendation.

Return JSON:
{
  "verdict": "build" | "pivot" | "kill",
  "confidenceScore": <0-100>,
  "explanation": "Clear explanation of why this verdict was chosen",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`

  try {
    const verdict = await callOpenRouterJSON<VerdictData>(ANTI_HYPE_PROMPT, prompt, 'thinking')

    await supabase.from('decision_summary').upsert({
      startup_id: startupId,
      verdict: verdict.verdict,
      confidence_score: verdict.confidenceScore,
      verdict_explanation: verdict.explanation,
      recommended_next_steps: verdict.nextSteps.join('\n')
    }, { onConflict: 'startup_id' })

    revalidatePath(`/dashboard/${startupId}/decision`)
    return verdict
  } catch (error) {
    console.error('[Verdict] Error generating:', error)
    return null
  }
}
