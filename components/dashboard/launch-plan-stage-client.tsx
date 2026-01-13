'use client'

import { useState, useCallback } from 'react'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { EditableContentCard } from '@/components/ui/editable-content-card'
import { CostsView } from '@/components/dashboard/costs-view'
import type { CostEstimate, Startup } from '@/types'

interface LaunchPlanStageClientProps {
    project: Startup
    costs: CostEstimate[] | null
    analysisData: any
}

const tabs = [
    {
        id: 'gtm',
        label: 'Go-to-Market',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
        )
    },
    {
        id: 'costs',
        label: 'Costs',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        id: 'metrics',
        label: 'Success Metrics',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    }
]

// Calculate launch readiness based on content
function calculateLaunchReadiness(gtmContent: string, metricsContent: string, costs: CostEstimate[] | null): { status: string; color: string } {
    const hasGtm = gtmContent && gtmContent.length > 100
    const hasMetrics = metricsContent && metricsContent.length > 50
    const hasCosts = costs && costs.length > 0

    const score = (hasGtm ? 1 : 0) + (hasMetrics ? 1 : 0) + (hasCosts ? 1 : 0)

    if (score === 3) return { status: 'Launch ready', color: 'text-emerald-600' }
    if (score >= 2) return { status: 'Almost ready', color: 'text-amber-600' }
    if (score >= 1) return { status: 'In progress', color: 'text-blue-600' }
    return { status: 'Not started', color: 'text-gray-500' }
}

export function LaunchPlanStageClient({
    project,
    costs,
    analysisData
}: LaunchPlanStageClientProps) {
    const [activeTab, setActiveTab] = useState('gtm')
    const [isSaving, setIsSaving] = useState(false)

    // Local state for editable content
    const [channelsContent, setChannelsContent] = useState(analysisData?.channels?.content || '')
    const [metricsContent, setMetricsContent] = useState(analysisData?.keyMetrics?.content || '')

    // Monthly costs summary
    const totalMonthlyCost = costs?.reduce((sum, c) => sum + c.monthlyCost, 0) || 0

    // Calculate readiness
    const launchReadiness = calculateLaunchReadiness(channelsContent, metricsContent, costs)

    const handleSaveChannels = useCallback(async (newContent: string) => {
        setIsSaving(true)
        setChannelsContent(newContent)
        // TODO: Save to backend when API is ready
        setTimeout(() => setIsSaving(false), 500)
    }, [])

    const handleSaveMetrics = useCallback(async (newContent: string) => {
        setIsSaving(true)
        setMetricsContent(newContent)
        // TODO: Save to backend when API is ready
        setTimeout(() => setIsSaving(false), 500)
    }, [])

    return (
        <div className="space-y-6">
            {/* Stage Header with Summary */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-200/50">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Launch Plan</h1>
                        <p className="text-sm text-gray-500">How do I get my first users?</p>
                    </div>
                </div>

                {/* Summary pill */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Est. Burn</p>
                        <p className="text-xl font-bold text-pink-600">${totalMonthlyCost}/mo</p>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Status</p>
                        <p className={`text-sm font-semibold ${launchReadiness.color}`}>{launchReadiness.status}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <StageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabPanel isActive={activeTab === 'gtm'}>
                    <div className="space-y-6">
                        {(channelsContent || analysisData?.channels) ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <EditableContentCard
                                    title="Distribution Channels"
                                    content={channelsContent || 'Click edit to define your go-to-market channels...'}
                                    onSave={handleSaveChannels}
                                    isLoading={isSaving}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">Generate analysis in the Decision stage to see go-to-market strategy.</p>
                            </div>
                        )}
                    </div>
                </TabPanel>

                <TabPanel isActive={activeTab === 'costs'}>
                    <CostsView
                        project={project}
                        initialCosts={costs}
                    />
                </TabPanel>

                <TabPanel isActive={activeTab === 'metrics'}>
                    <div className="space-y-6">
                        {(metricsContent || analysisData?.keyMetrics) ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <EditableContentCard
                                    title="Key Metrics"
                                    content={metricsContent || 'Click edit to define your success metrics...'}
                                    onSave={handleSaveMetrics}
                                    isLoading={isSaving}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">Generate analysis in the Decision stage to see success metrics.</p>
                            </div>
                        )}
                    </div>
                </TabPanel>
            </StageTabs>
        </div>
    )
}
