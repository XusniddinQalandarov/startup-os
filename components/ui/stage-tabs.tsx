'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
    id: string
    label: string
    icon?: React.ReactNode
}

interface StageTabsProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    children: React.ReactNode
}

export function StageTabs({ tabs, activeTab, onTabChange, children }: StageTabsProps) {
    const tabsRef = useRef<HTMLDivElement>(null)
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
    const [isLoading, setIsLoading] = useState(false)

    // Update indicator position when active tab changes
    useEffect(() => {
        if (!tabsRef.current) return

        const activeButton = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLButtonElement
        if (activeButton) {
            setIndicatorStyle({
                left: activeButton.offsetLeft,
                width: activeButton.offsetWidth
            })
        }
    }, [activeTab])

    const handleTabClick = (tabId: string) => {
        if (tabId === activeTab) return

        setIsLoading(true)
        onTabChange(tabId)

        // Reset loading state after animation
        setTimeout(() => {
            setIsLoading(false)
        }, 500)
    }

    return (
        <div className="space-y-8 relative">
            {/* Top Gradient Loading Line */}
            <div className="fixed top-0 left-0 right-0 h-1 z-50">
                <div
                    className={cn(
                        "h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out",
                        isLoading ? "w-full opacity-100" : "w-0 opacity-0"
                    )}
                />
            </div>

            {/* Tab Navigation */}
            <div className="relative">
                {/* Tab container with subtle bg */}
                <div
                    ref={tabsRef}
                    className="relative flex items-center gap-1 p-1 bg-gray-100/80 rounded-2xl w-fit"
                >
                    {/* Animated indicator */}
                    <div
                        className="absolute top-1 h-[calc(100%-8px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out"
                        style={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width
                        }}
                    />

                    {/* Tab buttons */}
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            data-tab={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={cn(
                                "relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200",
                                activeTab === tab.id
                                    ? "text-gray-900"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab.icon && (
                                <span className={cn(
                                    "transition-colors",
                                    activeTab === tab.id ? "text-indigo-600" : "text-gray-400"
                                )}>
                                    {tab.icon}
                                </span>
                            )}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {children}
            </div>
        </div>
    )
}

// Tab panel wrapper for consistent styling
interface TabPanelProps {
    children: React.ReactNode
    isActive: boolean
}

export function TabPanel({ children, isActive }: TabPanelProps) {
    if (!isActive) return null
    return <>{children}</>
}
