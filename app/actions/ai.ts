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

// ========== Evaluation ==========

interface EvaluationInput {
  idea: string
  targetUsers?: string
  businessType?: string
  geography?: string
  founderType?: string
}

export async function evaluateIdea(startupId: string, input: EvaluationInput): Promise<IdeaEvaluation | null> {
  const supabase = await createClient()

  const prompt = `Evaluate this startup idea:

IDEA: ${input.idea}
${input.targetUsers ? `TARGET USERS: ${input.targetUsers}` : ''}
${input.businessType ? `BUSINESS TYPE: ${input.businessType}` : ''}
${input.geography ? `GEOGRAPHY: ${input.geography}` : ''}
${input.founderType ? `FOUNDER TYPE: ${input.founderType}` : ''}

Return JSON with this exact structure:
{
  "scores": {
    "marketPotential": <0-100>,
    "feasibility": <0-100>,
    "competition": <0-100>,
    "uniqueness": <0-100>
  },
  "verdict": "<one short sentence verdict>",
  "explanation": "<2-3 sentences explaining the honest assessment>"
}`

  try {
    // Use thinking model for deep evaluation
    const evaluation = await callOpenRouterJSON<IdeaEvaluation>(ANTI_HYPE_PROMPT, prompt, 'thinking')

    // Store in database
    await supabase.from('ai_outputs').insert({
      startup_id: startupId,
      output_type: 'evaluation',
      output_data: evaluation,
    })

    // Update startup status
    await supabase
      .from('startups')
      .update({ status: 'evaluated' })
      .eq('id', startupId)

    revalidatePath(`/dashboard/${startupId}`)
    return evaluation
  } catch (error) {
    console.error('Error evaluating idea:', error)
    return null
  }
}

// ========== Customer Questions ==========

export async function generateCustomerQuestions(startupId: string, idea: string, businessType?: string): Promise<CustomerQuestion[] | null> {
  const supabase = await createClient()

  // Simplified prompt for faster generation
  const prompt = `Generate 10 customer interview questions for: "${idea}"

Return 7 GOOD questions (flagType: "ask") and 3 BAD questions (flagType: "avoid").

JSON format:
[{"id":"1","category":"Discovery","question":"...","flagType":"ask","insight":"..."}]`

  try {
    // Use fast model for quick question generation
    const questions = await callOpenRouterJSON<CustomerQuestion[]>(
      'Return valid JSON array only. No explanation.',
      prompt,
      'fast'
    )

    await supabase.from('ai_outputs').upsert({
      startup_id: startupId,
      output_type: 'questions',
      output_data: questions,
    }, { onConflict: 'startup_id,output_type' })

    revalidatePath(`/dashboard/${startupId}/questions`)
    return questions
  } catch (error) {
    console.error('Error generating questions:', error)
    return null
  }
}

// ========== MVP Scope ==========

export async function generateMvpScope(startupId: string, idea: string): Promise<MvpFeature[] | null> {
  const supabase = await createClient()

  const prompt = `Define MVP scope for this startup:

IDEA: ${idea}

Suggest 8-12 features categorized by priority. Be conservative - most things should be "later" or "not_now".

Return JSON array:
[
  {
    "id": "<unique-id>",
    "title": "<feature name>",
    "description": "<1 sentence description>",
    "priority": "must_have" | "later" | "not_now"
  }
]

Only 3-4 items should be "must_have". Be ruthless about scope.`

  try {
    const features = await callOpenRouterJSON<MvpFeature[]>(ANTI_HYPE_PROMPT, prompt, 'fast')

    await supabase.from('ai_outputs').insert({
      startup_id: startupId,
      output_type: 'mvp',
      output_data: features,
    })

    revalidatePath(`/dashboard/${startupId}/mvp`)
    return features
  } catch (error) {
    console.error('Error generating MVP scope:', error)
    return null
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
  timelineType: TimelineType = 'standard',
  customDays?: number
): Promise<RoadmapPhase[] | null> {
  const supabase = await createClient()

  const customInstruction = timelineType === 'custom' && customDays
    ? `You have exactly ${customDays} DAYS total. Divide into 2-4 phases proportionally.
       Use fractional weeks where needed (e.g., 0.5 = 3.5 days, 1 = 7 days).`
    : ''

  const prompt = `Create a roadmap for this startup idea:

IDEA: ${idea}

TIMELINE CONSTRAINT:
${timelineInstructions[timelineType]}
${customInstruction}

Create 2-4 phases that fit within the constraint. Be realistic but aggressive.

Return JSON array:
[
  {
    "id": "<unique-id>",
    "name": "Phase 1: <name>",
    "description": "<what this phase accomplishes - be specific>",
    "durationWeeks": <number, can be fractional like 0.5 for 3-4 days>,
    "tasks": ["task1", "task2", "task3", "task4"]
  }
]`

  try {
    const roadmap = await callOpenRouterJSON<RoadmapPhase[]>(ANTI_HYPE_PROMPT, prompt, 'fast')

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
  skillTag: 'frontend' | 'backend' | 'ai' | 'business'
}

export async function generateTasks(startupId: string, idea: string): Promise<GeneratedTask[] | null> {
  const supabase = await createClient()

  const prompt = `Generate development tasks for this startup MVP:

IDEA: ${idea}

Create 8-12 concrete, actionable tasks. Include time estimates and skill tags.

Return JSON array:
[
  {
    "title": "<task title>",
    "description": "<brief description>",
    "status": "backlog",
    "estimateHours": <number>,
    "skillTag": "frontend" | "backend" | "ai" | "business"
  }
]`

  try {
    const tasks = await callOpenRouterJSON<GeneratedTask[]>(ANTI_HYPE_PROMPT, prompt, 'fast')

    await supabase.from('ai_outputs').insert({
      startup_id: startupId,
      output_type: 'tasks',
      output_data: tasks,
    })

    // Also create tasks in the tasks table
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

export async function generateTechStack(startupId: string, idea: string, founderType?: string): Promise<TechStackRecommendation[] | null> {
  const supabase = await createClient()

  const prompt = `Recommend a tech stack for this startup:

IDEA: ${idea}
${founderType ? `FOUNDER TYPE: ${founderType}` : ''}

Recommend practical, proven technologies. Prefer simplicity over cutting-edge.

Return JSON array:
[
  {
    "category": "Frontend" | "Backend" | "Database" | "Hosting" | "AI/ML" | "Payments" | "Analytics",
    "recommendation": "<specific tool/framework>",
    "reason": "<1 sentence why>"
  }
]`

  try {
    const techStack = await callOpenRouterJSON<TechStackRecommendation[]>(ANTI_HYPE_PROMPT, prompt, 'fast')

    await supabase.from('ai_outputs').insert({
      startup_id: startupId,
      output_type: 'tech_stack',
      output_data: techStack,
    })

    revalidatePath(`/dashboard/${startupId}/tech`)
    return techStack
  } catch (error) {
    console.error('Error generating tech stack:', error)
    return null
  }
}

// ========== Costs ==========

export async function generateCosts(startupId: string, idea: string): Promise<CostEstimate[] | null> {
  const supabase = await createClient()

  const prompt = `Estimate REALISTIC monthly costs for running this early-stage startup:

IDEA: ${idea}

Be very realistic and practical for a bootstrapped/early-stage startup:
- Prioritize FREE TIERS wherever possible (Vercel free, Supabase free, etc.)
- Only include paid services that are absolutely necessary
- Use actual 2024 pricing (not inflated estimates)
- Separate essential costs from nice-to-have costs
- For AI costs, estimate based on actual API pricing (e.g., OpenAI $0.002/1K tokens)
- Marketing budget should be minimal for MVP stage ($0-50/month)

Most early startups should run on $50-200/month total. Don't inflate costs.

Return JSON array:
[
  {
    "category": "Infrastructure" | "Tools" | "AI" | "Marketing" | "Other",
    "item": "<specific service name with tier, e.g., 'Vercel Pro' or 'Supabase Free'>",
    "monthlyCost": <realistic number in USD>,
    "isOptional": true/false,
    "note": "<brief justification or free tier info>"
  }
]`

  try {
    const costs = await callOpenRouterJSON<CostEstimate[]>(ANTI_HYPE_PROMPT, prompt, 'fast')

    await supabase.from('ai_outputs').insert({
      startup_id: startupId,
      output_type: 'costs',
      output_data: costs,
    })

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

  // Handle retrieval from dedicated tables
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
  
  const prompt = `Analyze competitors for this startup idea${hasSearchResults ? ' based on the web search results below' : ''}.

IDEA: ${idea}
${targetUsers ? `TARGET USERS: ${targetUsers}` : ''}

${hasSearchResults ? `WEB SEARCH RESULTS:\n${searchData.context}` : 'No web search results available. Use your general knowledge about this market.'}

Identify 3-5 competitors in this space. For each competitor provide:
1. Company name ${hasSearchResults ? '(extract from search results)' : '(well-known companies)'}
2. Website URL if available
3. Brief description of what they do
4. 2-3 key strengths
5. 2-3 key weaknesses
6. Pricing information if known
7. Market position

Also provide:
- Market overview (2-3 sentences about the competitive landscape)
- 3-4 opportunities for differentiation
- 3-4 threats to be aware of

CRITICAL: Return ONLY a valid JSON object matching this exact structure (no markdown, no code blocks, just pure JSON):

{
  "competitors": [
    {
      "name": "Company Name",
      "website": "https://example.com",
      "description": "What they do in one sentence",
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "pricing": "Pricing model or Unknown",
      "marketShare": "Market position (e.g., Market leader, Growing startup)"
    }
  ],
  "marketOverview": "2-3 sentences about the competitive landscape",
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "threats": ["Threat 1", "Threat 2", "Threat 3"]
}`

  try {
    console.log('[Competitors] Calling AI for analysis...')
    
    const analysis = await callOpenRouterJSON<CompetitorAnalysis>(
      'You are a market research analyst. Return ONLY valid JSON with no additional text, markdown, or code blocks. Analyze the market and provide competitor insights.',
      prompt,
      'fast'
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

