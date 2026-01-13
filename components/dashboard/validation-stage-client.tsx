'use client'

import { useState } from 'react'
import { StageTabs, TabPanel } from '@/components/ui/stage-tabs'
import { OverviewView } from '@/components/dashboard/overview-view'
import { QuestionsView } from '@/components/dashboard/questions-view'
import { CompetitorsView } from '@/components/dashboard/competitors-view'
import type { IdeaEvaluation, CustomerQuestion, Startup } from '@/types'

interface ValidationStageClientProps {
    project: Startup
    evaluation: IdeaEvaluation | null
    questions: CustomerQuestion[] | null
    competitorAnalysis: any
}

const tabs = [
    {
        id: 'evaluation',
        label: 'Idea Score',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        id: 'competitors',
        label: 'Competition',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        )
    }
]

export function ValidationStageClient({
    project,
    evaluation,
    questions,
    competitorAnalysis
}: ValidationStageClientProps) {
    const [activeTab, setActiveTab] = useState('evaluation')

    return (
        <div className="space-y-6">
            {/* Stage Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Validation</h1>
                    <p className="text-sm text-gray-500">Is this idea viable?</p>
                </div>
            </div>

            {/* Tabs */}
            <StageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabPanel isActive={activeTab === 'evaluation'}>
                    <OverviewView
                        project={project}
                        initialEvaluation={evaluation}
                    />
                </TabPanel>

                <TabPanel isActive={activeTab === 'questions'}>
                    <QuestionsView
                        project={project}
                        initialQuestions={questions}
                    />
                </TabPanel>

                <TabPanel isActive={activeTab === 'competitors'}>
                    <CompetitorsView
                        project={project}
                        initialAnalysis={competitorAnalysis}
                    />
                </TabPanel>
            </StageTabs>
        </div>
    )
}
