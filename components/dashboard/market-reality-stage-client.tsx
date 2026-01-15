'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { EditableContentCard } from '@/components/ui/editable-content-card'
import { PremiumLock } from '@/components/ui/premium-lock'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'
import { Button } from '@/components/ui'
import { CompetitorsView } from '@/components/dashboard/competitors-view'
import { generateMarketReality } from '@/app/actions/market-reality'
import type { Startup } from '@/types'

interface DifferentiationData {
    valueProposition: string
    unfairAdvantage: string
    positioningStatement: string
    marketDifficulty: 'low' | 'moderate' | 'high' | 'unknown'
    marketDifficultyReason: string
}

interface MarketRealityStageClientProps {
    project: Startup
    competitorAnalysis: any
    differentiationData: DifferentiationData | null
    isPremium?: boolean // Lock if not premium
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

// Get market difficulty color and message
function getMarketDifficultyDisplay(difficulty: DifferentiationData | null, competitorCount: number): { level: string; message: string; color: string } {
    if (!difficulty || difficulty.marketDifficulty === 'unknown') {
        if (competitorCount === 0) return { level: 'Unknown', message: 'Run competitor analysis', color: 'text-gray-500' }
        if (competitorCount >= 5) return { level: 'High', message: 'Crowded market', color: 'text-red-500' }
        if (competitorCount >= 3) return { level: 'Moderate', message: 'Established players exist', color: 'text-amber-600' }
        return { level: 'Low', message: 'Emerging market', color: 'text-emerald-600' }
    }

    const colors = { low: 'text-emerald-600', moderate: 'text-amber-600', high: 'text-red-500' }
    return {
        level: difficulty.marketDifficulty.charAt(0).toUpperCase() + difficulty.marketDifficulty.slice(1),
        message: difficulty.marketDifficultyReason || '',
        color: colors[difficulty.marketDifficulty] || 'text-gray-500'
    }
}

export function MarketRealityStageClient({
    project,
    competitorAnalysis,
    differentiationData,
    isPremium = false // Default to locked
}: MarketRealityStageClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('competitors')
    const [isSaving, setIsSaving] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    // Local state for editable content (initialize from AI data or empty)
    const [unfairAdvantage, setUnfairAdvantage] = useState(differentiationData?.unfairAdvantage || '')
    const [valueProposition, setValueProposition] = useState(differentiationData?.valueProposition || '')

    // Calculate difficulty based on AI data or competitor count
    const competitorCount = competitorAnalysis?.competitors?.length || 0
    const marketDifficulty = getMarketDifficultyDisplay(differentiationData, competitorCount)
    const hasData = !!competitorAnalysis || !!differentiationData

    const handleGenerateAll = async () => {
        setIsGenerating(true)
        try {
            await generateMarketReality(project.id, project.idea, project.targetUsers, project.businessType)
            // Hard reload to guarantee fresh data is displayed
            window.location.reload()
        } catch (error) {
            console.error('Generation failed', error)
            setIsGenerating(false)
        }
    }

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
        <PremiumLock isLocked={!isPremium}>
            <div className="space-y-6">
                <FullScreenLoader isLoading={isGenerating} message="Analyzing market landscape and competitors..." />

                {/* Stage Header with Summary */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Market Reality</h1>
                            <p className="text-xs sm:text-sm text-gray-500">Who else exists and how hard is this market?</p>
                        </div>
                    </div>

                    {/* Actions & Summary */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
                        {!hasData && (
                            <Button
                                onClick={handleGenerateAll}
                                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-200/50 border-0"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Generate Analysis
                            </Button>
                        )}

                        <div className="flex items-start gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm max-w-md">
                            <div className={`text-xl font-bold transition-colors flex-shrink-0 ${marketDifficulty.color}`}>
                                {marketDifficulty.level}
                            </div>
                            <div className="text-right min-w-0">
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Market Difficulty</p>
                                <p className="text-sm font-medium text-gray-700 leading-snug">{marketDifficulty.message}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <StageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                    <TabPanel isActive={activeTab === 'competitors'}>
                        {hasData ? (
                            <CompetitorsView
                                project={project}
                                initialAnalysis={competitorAnalysis}
                            />
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyze the Competition</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    Identify top competitors, analyze their strengths/weaknesses, and find your unique differentiation.
                                </p>
                                <Button
                                    size="lg"
                                    onClick={handleGenerateAll}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-xl shadow-blue-200/50 border-0 transform hover:scale-105 transition-all"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Analyze Market
                                </Button>
                            </div>
                        )}
                    </TabPanel>

                    <TabPanel isActive={activeTab === 'differentiation'}>
                        <div className="space-y-6">
                            {(unfairAdvantage || valueProposition || hasData) ? (
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
                                    <p className="text-gray-500 mb-4">Generate analysis to see differentiation strategy.</p>
                                    <Button variant="secondary" onClick={handleGenerateAll}>Generate Analysis</Button>
                                </div>
                            )}
                        </div>
                    </TabPanel>
                </StageTabs>
            </div>
        </PremiumLock>
    )
}
