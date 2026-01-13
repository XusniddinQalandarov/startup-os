'use client'

import { useState, useCallback } from 'react'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { EditableContentCard } from '@/components/ui/editable-content-card'
import { OverviewView } from '@/components/dashboard/overview-view'
import { QuestionsView } from '@/components/dashboard/questions-view'
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
function calculateIdeaHealth(evaluation: IdeaEvaluation | null, problemContent: string, icpContent: string): { score: number; message: string } {
    if (!evaluation) return { score: 0, message: 'Not evaluated yet' }

    const { marketPotential, feasibility, uniqueness, competition } = evaluation.scores
    let score = Math.round((marketPotential + feasibility + uniqueness + (100 - competition)) / 4)

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
    const [activeTab, setActiveTab] = useState('problem')
    const [isSaving, setIsSaving] = useState(false)

    // Local state for editable content
    const [problemContent, setProblemContent] = useState(problemData?.problemStatement?.content || '')
    const [icpContent, setIcpContent] = useState(problemData?.targetAudience?.content || '')

    // Calculate health based on current content
    const ideaHealth = calculateIdeaHealth(evaluation, problemContent, icpContent)

    const handleSaveProblem = useCallback(async (newContent: string) => {
        setIsSaving(true)
        setProblemContent(newContent)
        // TODO: Save to backend when API is ready
        // await updateAnalysisSection(project.id, 'problemStatement', newContent)
        setTimeout(() => setIsSaving(false), 500) // Simulate save
    }, [])

    const handleSaveIcp = useCallback(async (newContent: string) => {
        setIsSaving(true)
        setIcpContent(newContent)
        // TODO: Save to backend when API is ready
        // await updateAnalysisSection(project.id, 'targetAudience', newContent)
        setTimeout(() => setIsSaving(false), 500)
    }, [])

    return (
        <div className="space-y-6">
            {/* Stage Header with Summary */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200/50">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Idea Check</h1>
                        <p className="text-sm text-gray-500">Is this a real problem worth solving?</p>
                    </div>
                </div>

                {/* Summary pill - now recalculates on edit */}
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

            {/* Tabs */}
            <StageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabPanel isActive={activeTab === 'problem'}>
                    {/* Problem & ICP Content - Now Editable */}
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
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">Generate analysis in the Decision stage to see problem details here.</p>
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
