'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { generateMvpScope } from '@/app/actions/ai'
import { MvpFeature, Startup } from '@/types'
import { cn } from '@/lib/utils'

interface MvpViewProps {
    project: Startup
    initialFeatures: MvpFeature[] | null
}

export function MvpView({ project, initialFeatures }: MvpViewProps) {
    const [features, setFeatures] = useState<MvpFeature[] | null>(initialFeatures)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)
        const result = await generateMvpScope(project.id, project.idea)
        if (result) {
            setFeatures(result)
        }
        setIsGenerating(false)
    }

    // The original page had columns. I should replicate that structure.

    if (!features) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">MVP Scope</h1>
                    <p className="text-gray-600 mt-1">Define what to build now vs later</p>
                </div>

                <Card padding="lg" className="text-center">
                    <div className="py-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Define MVP Features</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Identify the core features needed for your launch and what can wait.
                        </p>
                        <Button onClick={handleGenerate} isLoading={isGenerating}>
                            {isGenerating ? 'Generating...' : 'Generate Scope'}
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    const columns = {
        must_have: features.filter(f => f.priority === 'must_have'),
        later: features.filter(f => f.priority === 'later'),
        not_now: features.filter(f => f.priority === 'not_now'),
    }

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">MVP Scope</h1>
                    <p className="text-gray-600 mt-1">Define what to build now vs later</p>
                </div>
                <Button variant="secondary" onClick={handleGenerate} isLoading={isGenerating}>
                    Regenerate
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                {(Object.entries(columns) as [string, MvpFeature[]][]).map(([columnId, items]) => (
                    <div key={columnId} className="flex flex-col bg-gray-50/50 rounded-xl border border-gray-100 h-full">
                        <div className={cn(
                            "p-3 border-b border-gray-100 rounded-t-xl font-medium flex items-center justify-between",
                            columnId === 'must_have' ? "bg-green-50 text-green-900" :
                                columnId === 'later' ? "bg-yellow-50 text-yellow-900" :
                                    "bg-gray-100 text-gray-900"
                        )}>
                            <span className="capitalize">{columnId.replace('_', ' ')}</span>
                            <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">{items.length}</span>
                        </div>

                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                            {items.map((feature) => (
                                <Card key={feature.id} padding="sm" className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-default group">
                                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-700 transition-colors">{feature.description}</p>
                                </Card>
                            ))}
                            {items.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm italic">
                                    No features
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
