'use client'

import { useState } from 'react'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { MvpView } from '@/components/dashboard/mvp-view'
import { TechView } from '@/components/dashboard/tech-view'
import { TasksView } from '@/components/dashboard/tasks-view'
import { RoadmapView } from '@/components/dashboard/roadmap-view'
import type { MvpFeature, TechStackRecommendation, RoadmapPhase, Task, Startup } from '@/types'

interface BuildPlanStageClientProps {
    project: Startup
    features: MvpFeature[] | null
    techStack: TechStackRecommendation[] | null
    roadmap: RoadmapPhase[] | null
    tasks: Task[]
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
    },
    {
        id: 'timeline',
        label: 'Timeline',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        )
    },
    {
        id: 'tasks',
        label: 'Tasks',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        )
    }
]

// Calculate build time from roadmap
function getBuildTime(roadmap: RoadmapPhase[] | null): string {
    if (!roadmap || roadmap.length === 0) return 'Not estimated'
    const totalWeeks = roadmap.reduce((sum, phase) => sum + phase.durationWeeks, 0)
    if (totalWeeks < 1) return `${Math.round(totalWeeks * 7)} days`
    if (totalWeeks <= 2) return '1-2 weeks'
    if (totalWeeks <= 6) return `${Math.round(totalWeeks)} weeks`
    return `${Math.round(totalWeeks / 4)} months`
}

export function BuildPlanStageClient({
    project,
    features,
    techStack,
    roadmap,
    tasks
}: BuildPlanStageClientProps) {
    const [activeTab, setActiveTab] = useState('mvp')
    const buildTime = getBuildTime(roadmap)

    return (
        <div className="space-y-6">
            {/* Stage Header with Summary */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-200/50">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Build Plan</h1>
                        <p className="text-sm text-gray-500">What does it take to build an MVP?</p>
                    </div>
                </div>

                {/* Summary pill */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xl font-bold text-violet-600">
                        {buildTime}
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Build Time</p>
                        <p className="text-sm font-medium text-gray-700">{features ? `${features.filter(f => f.priority === 'must_have').length} must-have features` : 'Not scoped'}</p>
                    </div>
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

                <TabPanel isActive={activeTab === 'timeline'}>
                    <RoadmapView
                        project={project}
                        initialRoadmap={roadmap}
                    />
                </TabPanel>

                <TabPanel isActive={activeTab === 'tasks'}>
                    <TasksView
                        project={project}
                        initialTasks={tasks}
                    />
                </TabPanel>
            </StageTabs>
        </div>
    )
}
