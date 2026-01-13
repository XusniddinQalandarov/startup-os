'use client'

import { useState, useCallback } from 'react'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { EditableContentCard } from '@/components/ui/editable-content-card'
import { CompetitorsView } from '@/components/dashboard/competitors-view'
import type { Startup } from '@/types'

interface MarketRealityStageClientProps {
    project: Startup
    competitorAnalysis: any
    analysisData: any // From project analysis
}

const tabs = [
    {
        id: 'competitors',
        label: 'Competitors',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        )
    },
    {
        id: 'differentiation',
        label: 'Differentiation',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    }
]

// Calculate market difficulty from competitor analysis and differentiation content
function calculateMarketDifficulty(analysis: any, differentiationContent: string): { level: string; message: string; color: string } {
    if (!analysis?.competitors) return { level: 'Unknown', message: 'Run competitor analysis', color: 'text-gray-500' }

    const count = analysis.competitors.length
    const hasStrongDiff = differentiationContent && differentiationContent.length > 150

    if (count >= 5) {
        if (hasStrongDiff) return { level: 'High', message: 'Crowded but differentiated', color: 'text-amber-600' }
        return { level: 'High', message: 'Crowded, need differentiation', color: 'text-red-500' }
    }
    if (count >= 3) {
        if (hasStrongDiff) return { level: 'Moderate', message: 'Clear positioning identified', color: 'text-emerald-600' }
        return { level: 'Moderate', message: 'Established players exist', color: 'text-amber-600' }
    }
    return { level: 'Low', message: 'Emerging market opportunity', color: 'text-emerald-600' }
}

export function MarketRealityStageClient({
    project,
    competitorAnalysis,
    analysisData
}: MarketRealityStageClientProps) {
    const [activeTab, setActiveTab] = useState('competitors')
    const [isSaving, setIsSaving] = useState(false)

    // Local state for editable content
    const [unfairAdvantage, setUnfairAdvantage] = useState(analysisData?.unfairAdvantage?.content || '')
    const [valueProposition, setValueProposition] = useState(analysisData?.valueProposition?.content || '')

    // Calculate difficulty based on current content
    const marketDifficulty = calculateMarketDifficulty(competitorAnalysis, unfairAdvantage)

    const handleSaveUnfairAdvantage = useCallback(async (newContent: string) => {
        setIsSaving(true)
        setUnfairAdvantage(newContent)
        // TODO: Save to backend when API is ready
        setTimeout(() => setIsSaving(false), 500)
    }, [])

    const handleSaveValueProposition = useCallback(async (newContent: string) => {
        setIsSaving(true)
        setValueProposition(newContent)
        // TODO: Save to backend when API is ready
        setTimeout(() => setIsSaving(false), 500)
    }, [])

    return (
        <div className="space-y-6">
            {/* Stage Header with Summary */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Market Reality</h1>
                        <p className="text-sm text-gray-500">Who else exists and how hard is this market?</p>
                    </div>
                </div>

                {/* Summary pill - recalculates on edit */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className={`text-xl font-bold transition-colors ${marketDifficulty.color}`}>
                        {marketDifficulty.level}
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Market Difficulty</p>
                        <p className="text-sm font-medium text-gray-700">{marketDifficulty.message}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <StageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabPanel isActive={activeTab === 'competitors'}>
                    <CompetitorsView
                        project={project}
                        initialAnalysis={competitorAnalysis}
                    />
                </TabPanel>

                <TabPanel isActive={activeTab === 'differentiation'}>
                    <div className="space-y-6">
                        {(unfairAdvantage || valueProposition || analysisData) ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
                                <EditableContentCard
                                    title="Unfair Advantage"
                                    content={unfairAdvantage || 'Click edit to describe what makes you hard to copy...'}
                                    onSave={handleSaveUnfairAdvantage}
                                    isLoading={isSaving}
                                />

                                <div className="pt-6 border-t border-gray-100">
                                    <EditableContentCard
                                        title="Value Proposition"
                                        content={valueProposition || 'Click edit to describe your unique value...'}
                                        onSave={handleSaveValueProposition}
                                        isLoading={isSaving}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">Generate analysis in the Decision stage to see differentiation details.</p>
                            </div>
                        )}
                    </div>
                </TabPanel>
            </StageTabs>
        </div>
    )
}
