'use client'

import { useState } from 'react'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { RoadmapView } from '@/components/dashboard/roadmap-view'
import { CostsView } from '@/components/dashboard/costs-view'
import type { RoadmapPhase, CostEstimate, Startup } from '@/types'

interface PlanningStageClientProps {
    project: Startup
    roadmap: RoadmapPhase[] | null
    costs: CostEstimate[] | null
}

const tabs = [
    {
        id: 'roadmap',
        label: 'Roadmap',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
    }
]

export function PlanningStageClient({
    project,
    roadmap,
    costs
}: PlanningStageClientProps) {
    const [activeTab, setActiveTab] = useState('roadmap')

    return (
        <div className="space-y-6">
            {/* Stage Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
                    <p className="text-sm text-gray-500">How do I build it?</p>
                </div>
            </div>

            {/* Tabs */}
            <StageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabPanel isActive={activeTab === 'roadmap'}>
                    <RoadmapView
                        project={project}
                        initialRoadmap={roadmap}
                    />
                </TabPanel>

                <TabPanel isActive={activeTab === 'costs'}>
                    <CostsView
                        project={project}
                        initialCosts={costs}
                    />
                </TabPanel>
            </StageTabs>
        </div>
    )
}
