'use client'

import { useEffect, useRef } from 'react'
import { Container } from '@/components/layout'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const capabilities = [
    {
        title: 'Market Analysis',
        description: 'Deep-dive into market size, trends, growth potential, and competitive landscape with real-time data.',
        gradient: 'from-blue-500 to-indigo-600',
        stats: [
            { label: 'Data Points', value: '10K+' },
            { label: 'Accuracy', value: '94%' }
        ],
        gridClass: 'md:col-span-2', // Wide
        size: 'wide'
    },
    {
        title: 'Customer Personas',
        description: 'AI-generated target audience profiles with demographics, pain points, and behaviors.',
        gradient: 'from-purple-500 to-pink-600',
        stats: [
            { label: 'Segments', value: '5+' },
            { label: 'Depth', value: 'Deep' }
        ],
        gridClass: 'md:col-span-1',
        size: 'normal'
    },
    {
        title: 'Risk Assessment',
        description: 'Identify potential roadblocks, market risks, and execution challenges before they derail your startup.',
        gradient: 'from-orange-500 to-red-600',
        stats: [
            { label: 'Risk Factors', value: '20+' },
            { label: 'Coverage', value: '360°' }
        ],
        gridClass: 'md:col-span-1',
        size: 'normal'
    },
    {
        title: 'MVP Scoping',
        description: 'Get a prioritized feature list focused on validating your core value proposition with actionable next steps.',
        gradient: 'from-green-500 to-emerald-600',
        stats: [
            { label: 'Features', value: 'Core' },
            { label: 'Timeline', value: 'Weeks' }
        ],
        gridClass: 'md:col-span-2', // Wide
        size: 'wide'
    }
]

export function AITechnology() {
    const sectionRef = useRef<HTMLElement>(null)
    const cardsRef = useRef<HTMLDivElement[]>([])
    const visualRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title animation
            gsap.from('.ai-title', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out'
            })

            // Cards stagger animation
            cardsRef.current.forEach((card, index) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    x: index % 2 === 0 ? -50 : 50,
                    opacity: 0,
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: 'power3.out'
                })
            })

            // Visual element parallax
            if (visualRef.current) {
                gsap.to(visualRef.current, {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    },
                    y: -100,
                    ease: 'none'
                })
            }

            // Floating animation for orbs
            gsap.to('.floating-orb', {
                y: -20,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 0.5
            })
        }, sectionRef)

        // Refresh ScrollTrigger after component mount
        ScrollTrigger.refresh()

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden bg-gray-900">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div ref={visualRef} className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl floating-orb" />
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl floating-orb" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/5 to-transparent rounded-full" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <Container className="relative z-10">
                <div className="text-center mb-16 ai-title">
                    <span className="inline-block px-4 py-1.5 text-sm font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
                        Powered by AI
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                        Next-generation
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> AI analysis</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Our proprietary AI models analyze your idea across multiple dimensions,
                        providing insights that typically require weeks of manual research.
                    </p>
                </div>

                {/* Bento Grid with varied sizes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {capabilities.map((cap, index) => (
                        <div
                            key={cap.title}
                            ref={el => { if (el) cardsRef.current[index] = el }}
                            className={`${cap.gridClass} group relative`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10"
                                style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />

                            <div className={`h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500 ${cap.size === 'wide' ? 'flex flex-col md:flex-row md:items-start md:gap-8' : ''
                                }`}>
                                <div className={`flex items-start justify-between mb-4 ${cap.size === 'wide' ? 'md:mb-0 md:flex-shrink-0' : ''}`}>
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.gradient} flex items-center justify-center shadow-lg`}>
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-semibold text-white">
                                            {cap.title}
                                        </h3>
                                        <div className="flex gap-4 ml-4">
                                            {cap.stats.map(stat => (
                                                <div key={stat.label} className="text-right">
                                                    <p className="text-lg font-bold text-white">{stat.value}</p>
                                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {cap.description}
                                    </p>

                                    {/* Hover indicator */}
                                    <div className="mt-4 flex items-center gap-2 text-indigo-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Learn more</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom visual element */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-gray-900" />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-gray-900" />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-gray-900" />
                        </div>
                        <span className="text-gray-400 text-sm">
                            Processing <span className="text-white font-medium">1,000+</span> ideas daily
                        </span>
                    </div>
                </div>
            </Container>
        </section>
    )
}
