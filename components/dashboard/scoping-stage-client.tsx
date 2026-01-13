'use client'

import { useState } from 'react'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { MvpView } from '@/components/dashboard/mvp-view'
import { TechView } from '@/components/dashboard/tech-view'
import type { MvpFeature, TechStackRecommendation, Startup } from '@/types'

interface ScopingStageClientProps {
    project: Startup
    features: MvpFeature[] | null
    techStack: TechStackRecommendation[] | null
}

const tabs = [
    {
        id: 'mvp',
        label: 'MVP Scope',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        )
    },
    {
        id: 'tech',
        label: 'Tech Stack',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        )
    }
]

export function ScopingStageClient({
    project,
    features,
    techStack
}: ScopingStageClientProps) {
    const [activeTab, setActiveTab] = useState('mvp')

    return (
        <div className="space-y-6">
            {/* Stage Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Scoping</h1>
                    <p className="text-sm text-gray-500">What should I build?</p>
                </div>
            </div>

            {/* Tabs */}
            <StageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabPanel isActive={activeTab === 'mvp'}>
                    <MvpView
                        project={project}
                        initialFeatures={features}
                    />
                </TabPanel>

                <TabPanel isActive={activeTab === 'tech'}>
                    <TechView
                        project={project}
                        initialStack={techStack}
                    />
                </TabPanel>
            </StageTabs>
        </div>
    )
}
