'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface Tab {
    id: string
    label: string
    icon?: ReactNode
}

interface TabsProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
    return (
        <nav className={cn('flex flex-col space-y-1', className)} role="tablist">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                        'transition-colors duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        activeTab === tab.id
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                >
                    {tab.icon && (
                        <span className="w-5 h-5 flex-shrink-0">{tab.icon}</span>
                    )}
                    {tab.label}
                </button>
            ))}
        </nav>
    )
}

interface TabPanelProps {
    id: string
    activeTab: string
    children: ReactNode
    className?: string
}

export function TabPanel({ id, activeTab, children, className }: TabPanelProps) {
    if (activeTab !== id) return null

    return (
        <div
            role="tabpanel"
            id={`panel-${id}`}
            aria-labelledby={id}
            className={className}
        >
            {children}
        </div>
    )
}
