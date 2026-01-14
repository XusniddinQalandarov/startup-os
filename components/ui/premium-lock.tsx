'use client'

import { Button } from '@/components/ui'
import Link from 'next/link'

interface PremiumLockProps {
    children: React.ReactNode
    isLocked: boolean
}

export function PremiumLock({ children, isLocked }: PremiumLockProps) {
    if (!isLocked) return <>{children}</>

    return (
        <div className="relative">
            {/* Blurred content (non-interactive) */}
            <div className="filter blur-md opacity-50 pointer-events-none select-none h-[600px] overflow-hidden">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-10 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200/50">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h3>
                    <p className="text-gray-500 mb-8">
                        Unlock advanced market analysis, build planning, and personalized AI strategies with our Premium plan.
                    </p>

                    <Link href="/#pricing" className="block w-full">
                        <Button size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-200/40 border-0">
                            Upgrade to Unlock
                            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                    </Link>

                    <p className="text-xs text-gray-400 mt-4">
                        30-day money-back guarantee
                    </p>
                </div>
            </div>
        </div>
    )
}
