'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { EditableContentCard } from '@/components/ui/editable-content-card'
import { OverviewView } from '@/components/dashboard/overview-view'
import { QuestionsView } from '@/components/dashboard/questions-view'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'
import { Button } from '@/components/ui'
import { generateEvaluationAction, generateQuestionsAction, generateAnalysisAction } from '@/app/actions/idea-check'
import type { IdeaEvaluation, CustomerQuestion, Startup } from '@/types'

interface IdeaCheckStageClientProps {
    project: Startup
    evaluation: IdeaEvaluation | null
    questions: CustomerQuestion[] | null
    problemData: any // From analysis
}

const tabs = [
    {
        id: 'problem',
        label: 'Problem & ICP',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    {
        id: 'questions',
        label: 'Customer Questions',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        id: 'score',
        label: 'Pain Score',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    }
]

// Calculate idea health score from evaluation and content
// Pain Score = average of all dimensions (all are positive: higher = better)
// Backward compatible with old field names
function calculateIdeaHealth(evaluation: IdeaEvaluation | null, problemContent: string, icpContent: string): { score: number; message: string } {
    if (!evaluation) return { score: 0, message: 'Not evaluated yet' }

    const scores = evaluation.scores as Record<string, number>

    // Support both new and old field names for backward compatibility
    const problemSeverity = scores.problemSeverity ?? scores.marketPotential ?? 50
    const marketOpportunity = scores.marketOpportunity ?? scores.marketPotential ?? 50
    const feasibility = scores.feasibility ?? 50
    const differentiation = scores.differentiation ?? scores.uniqueness ?? 50
    // If old 'competition' exists, invert it (high competition = low opportunity)
    const competitionAdjustment = scores.competition ? (100 - scores.competition) : 0

    // Calculate base score
    let score: number
    if (scores.problemSeverity !== undefined) {
        // New format - simple average
        score = Math.round((problemSeverity + marketOpportunity + feasibility + differentiation) / 4)
    } else {
        // Old format - invert competition
        score = Math.round((scores.marketPotential + feasibility + scores.uniqueness + competitionAdjustment) / 4)
    }

    // Boost score if content is detailed (more than 200 chars)
    if (problemContent && problemContent.length > 200) score = Math.min(100, score + 3)
    if (icpContent && icpContent.length > 200) score = Math.min(100, score + 2)

    if (score >= 70) return { score, message: 'Strong problem-solution fit' }
    if (score >= 50) return { score, message: 'Problem exists, validation needed' }
    return { score, message: 'Weak problem signal' }
}


export function IdeaCheckStageClient({
    project,
    evaluation,
    questions,
    problemData
}: IdeaCheckStageClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('problem')
    const [isSaving, setIsSaving] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    // Local state for editable content
    const [problemContent, setProblemContent] = useState(problemData?.problemStatement?.content || '')
    const [icpContent, setIcpContent] = useState(problemData?.targetAudience?.content || '')

    // Calculate health based on current content
    const ideaHealth = calculateIdeaHealth(evaluation, problemContent, icpContent)

    // Check if we have valid data for all sections
    const hasData = !!evaluation && (Array.isArray(questions) && questions.length > 0) && !!problemData

    // Check for auto-start query param
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            if (params.get('start_analysis') === 'true') {
                // Remove param from URL without refresh
                const newUrl = window.location.pathname
                window.history.replaceState({}, '', newUrl)

                // Trigger generation
                handleGenerateAll()
            }
        }
    }, [])

    const handleGenerateAll = async () => {
        setIsGenerating(true)

        // Safety timeout - just in case everything hangs
        const safetyTimeout = setTimeout(() => {
            setIsGenerating(false)
            window.location.reload()
        }, 60000) // Increased to 60s to allow all actions to complete

        try {
            // Wait for ALL actions to complete before hiding loader
            console.log('[Client] Starting all AI generation actions...')

            await Promise.all([
                generateEvaluationAction(project.id, project.idea, project.targetUsers, project.businessType)
                    .then(() => console.log('[Client] Evaluation done')),
                generateQuestionsAction(project.id, project.idea, project.businessType)
                    .then(() => console.log('[Client] Questions done')),
                generateAnalysisAction(project.id, project.idea, project.targetUsers, project.businessType)
                    .then(() => console.log('[Client] Analysis done'))
            ])

            clearTimeout(safetyTimeout)

            // Hard reload to guarantee fresh data is displayed
            window.location.reload()

        } catch (error) {
            console.error('Generation failed', error)
            clearTimeout(safetyTimeout)
            setIsGenerating(false)
        }
        // Note: No finally block needed - page reloads on success
    }

    const handleSaveProblem = useCallback(async (newContent: string) => {
        setIsSaving(true)
        setProblemContent(newContent)
        // TODO: Save to backend when API is ready
        setTimeout(() => setIsSaving(false), 500)
    }, [])

    const handleSaveIcp = useCallback(async (newContent: string) => {
        setIsSaving(true)
        setIcpContent(newContent)
        // TODO: Save to backend when API is ready
        setTimeout(() => setIsSaving(false), 500)
    }, [])

    return (
        <div className="space-y-6">
            <FullScreenLoader isLoading={isGenerating} message="Analyzing idea, generating questions, and calculating score..." />

            {/* Stage Header with Summary */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    {/* ... icon & title ... */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200/50">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Idea Check</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Is this a real problem worth solving?</p>
                    </div>
                </div>

                {/* Actions & Summary */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    {/* Generate / Regenerate Button */}
                    <Button
                        onClick={handleGenerateAll}
                        disabled={isGenerating}
                        variant={hasData ? "secondary" : undefined}
                        className={!hasData ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-200/50 border-0" : ""}
                    >
                        {!hasData && (
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        )}
                        {hasData ? (isGenerating ? 'Regenerating...' : 'Regenerate Analysis') : (isGenerating ? 'Analyzing...' : 'Generate Analysis')}
                    </Button>

                    {evaluation && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className={`text-2xl font-bold transition-colors ${ideaHealth.score >= 70 ? 'text-emerald-600' :
                                ideaHealth.score >= 50 ? 'text-amber-600' : 'text-red-500'
                                }`}>
                                {ideaHealth.score}%
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Idea Health</p>
                                <p className="text-sm font-medium text-gray-700">{ideaHealth.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <StageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabPanel isActive={activeTab === 'problem'}>
                    {/* Problem & ICP Content - Editable */}
                    <div className="space-y-6">
                        {(problemContent || icpContent || problemData) ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
                                <EditableContentCard
                                    title="Problem Statement"
                                    content={problemContent || 'Click edit to describe the problem you\'re solving...'}
                                    onSave={handleSaveProblem}
                                    isLoading={isSaving}
                                />

                                <div className="pt-6 border-t border-gray-100">
                                    <EditableContentCard
                                        title="Target Customer (ICP)"
                                        content={icpContent || 'Click edit to describe your ideal customer profile...'}
                                        onSave={handleSaveIcp}
                                        isLoading={isSaving}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Idea's Health</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    Get an instant analysis of your problem statement, ideal customer profile, and critical validation questions.
                                </p>
                                <Button
                                    size="lg"
                                    onClick={handleGenerateAll}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl shadow-amber-200/50 border-0 transform hover:scale-105 transition-all"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Analyze My Idea
                                </Button>
                            </div>
                        )}
                    </div>
                </TabPanel>

                <TabPanel isActive={activeTab === 'questions'}>
                    <QuestionsView
                        project={project}
                        initialQuestions={questions}
                    />
                </TabPanel>

                <TabPanel isActive={activeTab === 'score'}>
                    <OverviewView
                        project={project}
                        initialEvaluation={evaluation}
                    />
                </TabPanel>
            </StageTabs>
        </div>
    )
}
