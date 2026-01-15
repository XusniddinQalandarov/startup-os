'use client'

import { useState, useEffect } from 'react'

interface FullScreenLoaderProps {
    isLoading: boolean
    message?: string
}

export function FullScreenLoader({ isLoading, message = 'Generating analysis...' }: FullScreenLoaderProps) {
    const [progress, setProgress] = useState(0)

    // Simulate progress - starts fast, then slows down as it gets closer to 100%
    useEffect(() => {
        if (!isLoading) {
            setProgress(0)
            return
        }

        setProgress(5) // Start immediately at 5%

        const interval = setInterval(() => {
            setProgress(prev => {
                // Slow down as we approach 90% (never reach 100% until actually done)
                if (prev >= 90) return prev + 0.1
                if (prev >= 70) return prev + 0.5
                if (prev >= 50) return prev + 1
                if (prev >= 30) return prev + 2
                return prev + 3
            })
        }, 300)

        return () => clearInterval(interval)
    }, [isLoading])

    // Jump to 100% briefly before closing
    useEffect(() => {
        if (!isLoading && progress > 0) {
            setProgress(100)
            const timeout = setTimeout(() => setProgress(0), 300)
            return () => clearTimeout(timeout)
        }
    }, [isLoading])

    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-[9999] h-screen w-screen overflow-hidden bg-black">
            {/* Fullscreen video background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/loading.mp4" type="video/mp4" />
            </video>

            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Bottom center content - text and progress bar */}
            <div className="absolute bottom-0 left-0 right-0 z-[10000] pb-12 px-6">
                <div className="max-w-md mx-auto text-center">
                    {/* Message */}
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 drop-shadow-lg">{message}</h3>

                    {/* Progress bar container */}
                    <div className="w-full">
                        <div className="h-2 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm text-white/70">
                            <span className="font-medium">{Math.round(Math.min(progress, 100))}%</span>
                            <span>~30 seconds</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
