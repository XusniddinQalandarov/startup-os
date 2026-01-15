'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'
import { createProject } from '@/app/actions/projects'
import { ONBOARDING_STORAGE_KEY } from '../page'
import type { OnboardingData } from '@/types'

export default function OnboardingCompletePage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const completeOnboarding = async () => {
            // Get stored onboarding data
            const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)

            if (!stored) {
                // No pending data, redirect to onboarding start
                router.push('/onboarding')
                return
            }

            try {
                const data: OnboardingData = JSON.parse(stored)

                // Create the project
                const result = await createProject(data)

                if ('error' in result) {
                    // If still not authenticated, go to login again
                    if (result.error === 'Not authenticated') {
                        router.push('/login?next=/onboarding/complete')
                        return
                    }
                    setError(result.error)
                    return
                }

                // Success! Clear stored data
                localStorage.removeItem(ONBOARDING_STORAGE_KEY)

                // Navigate to dashboard with analysis trigger
                router.push(`/dashboard/${result.id}?start_analysis=true`)
            } catch (e) {
                setError('Failed to process onboarding data')
                localStorage.removeItem(ONBOARDING_STORAGE_KEY)
            }
        }

        completeOnboarding()
    }, [router])

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center relative">
                <AnimatedBackground />
                <div className="relative z-10 text-center p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <FullScreenLoader
                isLoading={true}
                message="Creating your project and analyzing your idea..."
            />
        </div>
    )
}
