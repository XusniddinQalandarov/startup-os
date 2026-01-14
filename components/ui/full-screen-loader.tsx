'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

interface FullScreenLoaderProps {
    isLoading: boolean
    message?: string
}

export function FullScreenLoader({ isLoading, message = 'Generating analysis...' }: FullScreenLoaderProps) {
    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-[9999] h-screen w-screen bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative mb-8">
                {/* Glowing orb background */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />

                {/* Logo with pulse effect */}
                <div className="relative animate-pulse">
                    <Image src="/ideY.webp" alt="ideY Loading" width={80} height={80} className="w-20 h-20" />
                </div>

                {/* Spinning ring */}
                <div className="absolute inset-[-20px] border-4 border-indigo-100 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-[-20px] border-4 border-transparent border-t-indigo-600 rounded-full animate-[spin_1.5s_linear_infinite]" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
            <p className="text-gray-500 text-sm animate-pulse">This may take up to 30 seconds</p>
        </div>
    )
}
