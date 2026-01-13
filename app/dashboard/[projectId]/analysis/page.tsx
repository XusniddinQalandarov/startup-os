import { AnalysisView } from '@/components/dashboard/analysis-view'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// REVIEW STAGE: Project Analysis
export default async function ReviewStagePage({ params }: PageProps) {
    const { projectId } = await params

    const [project, analysis] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'analysis')
    ])

    if (!project) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Stage Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Review</h1>
                    <p className="text-sm text-gray-500">How am I doing?</p>
                </div>
            </div>

            {/* Analysis */}
            <AnalysisView
                project={project}
                initialAnalysis={analysis as any}
            />
        </div>
    )
}
