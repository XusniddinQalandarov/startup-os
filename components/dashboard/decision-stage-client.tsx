'use client'

import { useState } from 'react'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { AnalysisView } from '@/components/dashboard/analysis-view'
import { Button } from '@/components/ui'
import type { Startup } from '@/types'

interface DecisionStageClientProps {
    project: Startup
    analysisData: any
    evaluation: any
}

const tabs = [
    {
        id: 'analysis',
        label: 'Full Analysis',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
    {
        id: 'risks',
        label: 'Risks',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        )
    },
    {
        id: 'verdict',
        label: 'Verdict',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        )
    }
]

// Calculate verdict from evaluation scores
function getVerdict(evaluation: any): { verdict: string; color: string; description: string } {
    if (!evaluation) return { verdict: 'Unknown', color: 'text-gray-500', description: 'Run evaluation first' }

    const { marketPotential, feasibility, uniqueness, competition } = evaluation.scores
    const avgScore = (marketPotential + feasibility + uniqueness + (100 - competition)) / 4

    if (avgScore >= 65 && feasibility >= 60) {
        return { verdict: 'Build', color: 'text-emerald-600', description: 'Strong fundamentals, proceed to build' }
    }
    if (avgScore >= 45) {
        return { verdict: 'Pivot', color: 'text-amber-600', description: 'Some potential, but needs refinement' }
    }
    return { verdict: 'Kill', color: 'text-red-500', description: 'Too many red flags, consider alternatives' }
}

export function DecisionStageClient({
    project,
    analysisData,
    evaluation
}: DecisionStageClientProps) {
    const [activeTab, setActiveTab] = useState('analysis')
    const verdict = getVerdict(evaluation)

    return (
        <div className="space-y-6">
            {/* Stage Header with Summary */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200/50">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Decision</h1>
                        <p className="text-sm text-gray-500">Should I build, pivot, or kill this idea?</p>
                    </div>
                </div>

                {/* Verdict pill */}
                {evaluation && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className={`text-2xl font-bold ${verdict.color}`}>
                            {verdict.verdict}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Verdict</p>
                            <p className="text-sm font-medium text-gray-700">{verdict.description}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <StageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabPanel isActive={activeTab === 'analysis'}>
                    <AnalysisView
                        project={project}
                        initialAnalysis={analysisData}
                    />
                </TabPanel>

                <TabPanel isActive={activeTab === 'risks'}>
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>

                            {evaluation ? (
                                <div className="space-y-4">
                                    {/* Market Risk */}
                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${evaluation.scores.marketPotential >= 60 ? 'bg-emerald-100 text-emerald-600' :
                                                evaluation.scores.marketPotential >= 40 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Market Risk</h4>
                                            <p className="text-sm text-gray-600">
                                                {evaluation.scores.marketPotential >= 60 ? 'Large addressable market with clear demand signals.' :
                                                    evaluation.scores.marketPotential >= 40 ? 'Market exists but size or growth unclear.' :
                                                        'Small or uncertain market, limited opportunity.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Execution Risk */}
                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${evaluation.scores.feasibility >= 60 ? 'bg-emerald-100 text-emerald-600' :
                                                evaluation.scores.feasibility >= 40 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Execution Risk</h4>
                                            <p className="text-sm text-gray-600">
                                                {evaluation.scores.feasibility >= 60 ? 'Technically achievable with standard resources.' :
                                                    evaluation.scores.feasibility >= 40 ? 'Some technical challenges to overcome.' :
                                                        'Complex execution, may require specialized skills.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Competition Risk */}
                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${evaluation.scores.competition <= 40 ? 'bg-emerald-100 text-emerald-600' :
                                                evaluation.scores.competition <= 60 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Competition Risk</h4>
                                            <p className="text-sm text-gray-600">
                                                {evaluation.scores.competition <= 40 ? 'Limited competition, clear opportunity.' :
                                                    evaluation.scores.competition <= 60 ? 'Some established players, need differentiation.' :
                                                        'Highly competitive market, strong moat required.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Run evaluation in Idea Check to see risk assessment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabPanel>

                <TabPanel isActive={activeTab === 'verdict'}>
                    <div className="space-y-6">
                        {evaluation ? (
                            <div className={`bg-gradient-to-br ${verdict.verdict === 'Build' ? 'from-emerald-50 to-teal-50 border-emerald-200' :
                                    verdict.verdict === 'Pivot' ? 'from-amber-50 to-yellow-50 border-amber-200' :
                                        'from-red-50 to-rose-50 border-red-200'
                                } rounded-2xl border p-8 text-center`}>
                                <div className={`text-6xl font-bold mb-4 ${verdict.color}`}>
                                    {verdict.verdict}
                                </div>
                                <p className="text-xl text-gray-700 mb-6">{verdict.description}</p>
                                <p className="text-gray-600">{evaluation.explanation}</p>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 mb-4">Complete the Idea Check to get your verdict.</p>
                                <Button variant="secondary" onClick={() => window.location.href = `/dashboard/${project.id}`}>
                                    Go to Idea Check
                                </Button>
                            </div>
                        )}
                    </div>
                </TabPanel>
            </StageTabs>
        </div>
    )
}
