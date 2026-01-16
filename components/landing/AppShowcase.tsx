'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Container } from '@/components/layout'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const screenshots = [
    {
        title: 'Idea Check',
        description: 'Get honest AI feedback on your startup idea',
        image: '/app-features/idea-check.png'
    },
    {
        title: 'Market Reality',
        description: 'Understand your competition and market landscape',
        image: '/app-features/market-reality.png'
    },
    {
        title: 'MVP Scope',
        description: 'Define your minimum viable product features',
        image: '/app-features/mvp-scope.png'
    },
    {
        title: 'Build Plan',
        description: 'Get task boards and timelines to execute',
        image: '/app-features/build-plan.png'
    },
    {
        title: 'Launch Costs',
        description: 'Plan your budget for go-to-market',
        image: '/app-features/launch-plan-costs.png'
    },
    {
        title: 'Final Decision',
        description: 'Get a clear verdict: Build, Pivot, or Kill',
        image: '/app-features/decision.png'
    }
]

export function AppShowcase() {
    const sectionRef = useRef<HTMLElement>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.showcase-title', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            })

            gsap.from('.showcase-image', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 60%',
                    toggleActions: 'play none none reverse'
                },
                y: 80,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            })
        }, sectionRef)

        ScrollTrigger.refresh()
        return () => ctx.revert()
    }, [])

    // Auto-rotate screenshots
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % screenshots.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section ref={sectionRef} className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white">
            <Container>
                <div className="text-center mb-12 sm:mb-16 showcase-title">
                    <span className="inline-block px-4 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
                        See It In Action
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Your idea,
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"> analyzed in depth</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                        From validation to execution, every step of your startup journey mapped out with AI precision.
                    </p>
                </div>

                {/* Screenshot Carousel */}
                <div className="showcase-image">
                    {/* Main Screenshot Display */}
                    <div className="relative max-w-5xl mx-auto mb-8">
                        <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl shadow-indigo-200/50">
                            <div className="bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden">
                                {/* Browser chrome */}
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border-b border-gray-700">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="flex-1 mx-4">
                                        <div className="bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 text-center max-w-xs mx-auto">
                                            idey.studio/dashboard
                                        </div>
                                    </div>
                                </div>
                                {/* Screenshot */}
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    {screenshots.map((screenshot, index) => (
                                        <div
                                            key={screenshot.title}
                                            className={`absolute inset-0 transition-all duration-700 ${index === activeIndex
                                                ? 'opacity-100 scale-100'
                                                : 'opacity-0 scale-105'
                                                }`}
                                        >
                                            <Image
                                                src={screenshot.image}
                                                alt={screenshot.title}
                                                fill
                                                className="object-fit object-top"
                                                sizes="(max-width: 1024px) 100vw, 1024px"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Current feature label */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                                {screenshots[activeIndex].title}
                                <span className="text-gray-400 ml-2">—</span>
                                <span className="text-gray-500 ml-2">{screenshots[activeIndex].description}</span>
                            </p>
                        </div>
                    </div>

                    {/* Thumbnail Navigation */}
                    <div
                        ref={scrollContainerRef}
                        className="flex justify-center gap-2 sm:gap-3 mt-8 overflow-x-auto pb-2 px-4 scrollbar-hide"
                    >
                        {screenshots.map((screenshot, index) => (
                            <button
                                key={screenshot.title}
                                onClick={() => setActiveIndex(index)}
                                className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${index === activeIndex
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {screenshot.title}
                            </button>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}
