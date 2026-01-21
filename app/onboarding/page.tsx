'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button, Input, Textarea, Card } from '@/components/ui'
import { Container } from '@/components/layout'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'
import { cn } from '@/lib/utils'
import { createProject } from '@/app/actions/projects'
import type { OnboardingData, BusinessType, FounderType } from '@/types'

const TOTAL_STEPS = 5
export const ONBOARDING_STORAGE_KEY = 'pending_onboarding_data'

interface StepProps {
    value: OnboardingData
    onChange: (updates: Partial<OnboardingData>) => void
    onNext: () => void
    onBack: () => void
    onSkip?: () => void
    isLoading?: boolean
}

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        i < currentStep ? 'bg-indigo-600' : i === currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                    )}
                />
            ))}
        </div>
    )
}

/**
 * Validate that the idea text is meaningful, not just gibberish
 */
function isValidIdea(text: string): { valid: boolean; error?: string } {
    const trimmed = text.trim()

    // Check minimum length
    if (trimmed.length < 10) {
        return { valid: false, error: 'Please enter at least 10 characters' }
    }

    // Check for too many repeated characters (like "ffffffff")
    const repeatedCharsRatio = (trimmed.match(/(.)\1{2,}/g) || []).join('').length / trimmed.length
    if (repeatedCharsRatio > 0.4) {
        return { valid: false, error: 'Please enter a meaningful startup idea, not random characters' }
    }

    // Check for minimum number of words (at least 3)
    const words = trimmed.split(/\s+/).filter(w => w.length > 0)
    if (words.length < 3) {
        return { valid: false, error: 'Please describe your idea in at least 3 words' }
    }

    // Check for minimum number of unique characters (avoid "aaa bbb ccc")
    const uniqueChars = new Set(trimmed.toLowerCase().replace(/\s/g, '')).size
    if (uniqueChars < 5) {
        return { valid: false, error: 'Please provide more details about your idea' }
    }

    // Check if it's mostly alphabetic (avoid keyboard mashing like "asdfasdf")
    const alphaRatio = (trimmed.match(/[a-zA-Z]/g) || []).length / trimmed.replace(/\s/g, '').length
    if (alphaRatio < 0.5) {
        return { valid: false, error: 'Please use proper words to describe your idea' }
    }

    return { valid: true }
}

function Step1Idea({ value, onChange, onNext }: StepProps) {
    const [validationError, setValidationError] = useState<string>('')
    const validation = isValidIdea(value.idea)

    const handleNext = () => {
        const check = isValidIdea(value.idea)
        if (!check.valid) {
            setValidationError(check.error || 'Invalid input')
            return
        }
        setValidationError('')
        onNext()
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What's your startup idea?
            </h2>
            <p className="text-gray-600 mb-6">
                Describe your idea in a few sentences. What problem does it solve?
            </p>
            <Textarea
                label="Your startup idea"
                placeholder="E.g., A platform that helps remote teams collaborate better by combining video calls with real-time document editing..."
                value={value.idea}
                onChange={(e) => {
                    onChange({ idea: e.target.value })
                    setValidationError('') // Clear error on change
                }}
                className="min-h-[160px]"
            />
            {validationError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {validationError}
                </p>
            )}
            <div className="mt-6 flex justify-end">
                <Button onClick={handleNext} disabled={!validation.valid}>
                    Continue
                </Button>
            </div>
        </div>
    )
}

function Step2TargetUsers({ value, onChange, onNext, onBack, onSkip }: StepProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Who are your target users?
            </h2>
            <p className="text-gray-600 mb-6">
                Describe your ideal customer. This helps tailor the analysis.
            </p>
            <Textarea
                label="Target users (optional)"
                placeholder="E.g., Small business owners, startup founders, marketing teams..."
                value={value.targetUsers || ''}
                onChange={(e) => onChange({ targetUsers: e.target.value })}
                className="min-h-[120px]"
            />
            <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onSkip}>Skip</Button>
                    <Button onClick={onNext}>Continue</Button>
                </div>
            </div>
        </div>
    )
}

function Step3BusinessType({ value, onChange, onNext, onBack }: StepProps) {
    const options: { value: BusinessType; label: string; description: string }[] = [
        { value: 'b2b', label: 'B2B', description: 'Selling to businesses' },
        { value: 'b2c', label: 'B2C', description: 'Selling to consumers' },
        { value: 'both', label: 'Both', description: 'Selling to both' },
    ]

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Is this B2B or B2C?
            </h2>
            <p className="text-gray-600 mb-6">
                This affects how we generate customer questions and pricing analysis.
            </p>
            <div className="grid gap-3">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onChange({ businessType: option.value })}
                        className={cn(
                            'p-4 rounded-lg border text-left transition-colors',
                            value.businessType === option.value
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                        )}
                    >
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                    </button>
                ))}
            </div>
            <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={!value.businessType}>Continue</Button>
            </div>
        </div>
    )
}

function Step4Geography({ value, onChange, onNext, onBack, onSkip }: StepProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Target geography
            </h2>
            <p className="text-gray-600 mb-6">
                Where do you plan to launch and expand?
            </p>
            <Input
                label="Geography (optional)"
                placeholder="E.g., United States, Europe, Global..."
                value={value.geography || ''}
                onChange={(e) => onChange({ geography: e.target.value })}
            />
            <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onSkip}>Skip</Button>
                    <Button onClick={onNext}>Continue</Button>
                </div>
            </div>
        </div>
    )
}

function Step5FounderType({ value, onChange, onNext, onBack, isLoading }: StepProps) {
    const options: { value: FounderType; label: string; description: string }[] = [
        { value: 'technical', label: 'Technical', description: 'Can build the product yourself' },
        { value: 'non-technical', label: 'Non-Technical', description: 'Will need to hire developers' },
        { value: 'mixed', label: 'Mixed Team', description: 'Have both technical and non-technical co-founders' },
    ]

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What type of founder are you?
            </h2>
            <p className="text-gray-600 mb-6">
                This helps us tailor the tech stack and cost recommendations.
            </p>
            <div className="grid gap-3">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onChange({ founderType: option.value })}
                        className={cn(
                            'p-4 rounded-lg border text-left transition-colors',
                            value.founderType === option.value
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                        )}
                    >
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                    </button>
                ))}
            </div>
            <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={!value.founderType} isLoading={isLoading}>
                    {isLoading ? 'Creating project...' : 'Create Project'}
                </Button>
            </div>
        </div>
    )
}

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<OnboardingData>({
        idea: '',
        targetUsers: '',
        businessType: undefined,
        geography: '',
        founderType: undefined,
    })

    const handleChange = (updates: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...updates }))
    }

    const handleNext = () => {
        if (step < TOTAL_STEPS - 1) {
            setStep(step + 1)
        } else {
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1)
        }
    }

    const handleSkip = () => {
        setStep(step + 1)
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        setError(null)

        const result = await createProject(data)

        if ('error' in result) {
            // If not authenticated, save data and redirect to login
            if (result.error === 'Not authenticated') {
                // Save onboarding data to localStorage
                localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data))
                // Redirect to login with return URL to complete onboarding
                router.push('/login?next=/onboarding/complete')
                return
            }
            setError(result.error)
            setIsLoading(false)
            return
        }

        // Navigate immediately - pass query param to trigger generation on dashboard
        router.push(`/dashboard/${result.id}?start_analysis=true`)
    }

    const stepProps: StepProps = {
        value: data,
        onChange: handleChange,
        onNext: handleNext,
        onBack: handleBack,
        onSkip: handleSkip,
        isLoading,
    }

    const steps = [
        <Step1Idea key="step1" {...stepProps} />,
        <Step2TargetUsers key="step2" {...stepProps} />,
        <Step3BusinessType key="step3" {...stepProps} />,
        <Step4Geography key="step4" {...stepProps} />,
        <Step5FounderType key="step5" {...stepProps} />,
    ]

    return (
        <div className="min-h-screen flex flex-col relative">
            <AnimatedBackground />
            {/* Floating Pill Header */}
            <header className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-3xl">
                <div className="bg-white/80 backdrop-blur-xl rounded-full shadow-lg shadow-gray-200/50 border border-white/50 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/idey.webp" alt="ideY Logo" width={32} height={24} className="w-auto h-6" />
                        <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ideY
                        </span>
                    </Link>
                    <Link
                        href="/profile"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        My Projects
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center py-12 relative z-10">
                <Container maxWidth="sm">
                    <Card padding="lg" className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-100/50">
                        <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
                                {error}
                            </div>
                        )}

                        {steps[step]}
                    </Card>
                </Container>
            </main>
        </div>
    )
}
