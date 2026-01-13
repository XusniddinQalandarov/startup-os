'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const icons = [
    // Lightbulb - Ideas
    <svg key="lightbulb" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>,
    // Rocket - Launch
    <svg key="rocket" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>,
    // Target - Goals
    <svg key="target" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>,
    // Chart - Growth
    <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18M7 16l4-4 4 4 5-6" />
    </svg>,
    // Code - Tech
    <svg key="code" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>,
    // Users - Team
    <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
    </svg>,
    // Star - Quality
    <svg key="star" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>,
    // Zap - Speed
    <svg key="zap" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>,
]

interface AnimatedItem {
    id: number
    icon: React.ReactNode
    size: number
}

export function AnimatedBackground() {
    const containerRef = useRef<HTMLDivElement>(null)
    const iconsRef = useRef<(HTMLDivElement | null)[]>([])
    const [items, setItems] = useState<AnimatedItem[]>([])

    useEffect(() => {
        // Generate items on client side only to avoid hydration mismatch
        const generatedItems = [...icons, ...icons].map((icon, i) => ({
            id: i,
            icon,
            size: 24 + Math.random() * 24 // Random size between 24 and 48
        }))
        setItems(generatedItems)
    }, [])

    useEffect(() => {
        if (!containerRef.current || items.length === 0) return

        const container = containerRef.current
        const iconElements = iconsRef.current.filter(Boolean) as HTMLDivElement[]

        // Grid configuration for 16 items (4x4)
        const cols = 4
        const rows = 4
        const cellWidth = 100 / cols
        const cellHeight = 100 / rows

        iconElements.forEach((el, index) => {
            // Determine grid cell
            const col = index % cols
            const row = Math.floor(index / cols)

            // Random position within the cell (leaving some padding so they don't touch edges of cell)
            const x = (col * cellWidth) + 10 + Math.random() * (cellWidth - 20)
            const y = (row * cellHeight) + 10 + Math.random() * (cellHeight - 20)

            // Initial set
            gsap.set(el, {
                left: `${x}%`,
                top: `${y}%`,
                xPercent: -50,
                yPercent: -50,
                opacity: 0,
                scale: 0.5,
                rotation: Math.random() * 30 - 15,
            })

            // Fade in and float
            const tl = gsap.timeline({
                repeat: -1,
                yoyo: true,
                defaults: { ease: "sine.inOut" }
            })

            // Initial appearance
            gsap.to(el, {
                opacity: 0.15 + Math.random() * 0.15, // Random opacity between 0.15 and 0.3
                scale: 1,
                duration: 1.5,
                delay: index * 0.1, // Stagger appearances slightly
                ease: "power2.out"
            })

            // Continuous floating motion
            const floatDuration = 4 + Math.random() * 4

            tl.to(el, {
                y: `+=${20 + Math.random() * 30}`, // Float down 20-50px
                x: `+=${-10 + Math.random() * 20}`, // Float sideways slightly
                rotation: `+=${-10 + Math.random() * 20}`,
                duration: floatDuration,
            })
        })

        return () => {
            // Cleanup GSAP animations
            gsap.killTweensOf(iconElements)
        }
    }, [items])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
        >
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50" />

            {/* Large animated orbs using CSS for base heavy-lifting, less JS overhead */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Floating Icons */}
            {items.map((item, index) => (
                <div
                    key={item.id}
                    ref={(el) => { iconsRef.current[index] = el }}
                    className="absolute text-indigo-900/10"
                    style={{
                        width: item.size,
                        height: item.size,
                    }}
                >
                    {item.icon}
                </div>
            ))}
        </div>
    )
}
