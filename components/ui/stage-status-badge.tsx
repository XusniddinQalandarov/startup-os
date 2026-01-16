'use client'

import { cn } from '@/lib/utils'

export type StageStatus = 'draft' | 'locked' | 'outdated'

interface StageStatusBadgeProps {
    status: StageStatus
    className?: string
}

const statusConfig = {
    draft: {
        label: 'Draft',
        icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        ),
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
    },
    locked: {
        label: 'Locked',
        icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
    },
    outdated: {
        label: 'Outdated',
        icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
    },
}

export function StageStatusBadge({ status, className }: StageStatusBadgeProps) {
    const config = statusConfig[status]

    return (
        <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border',
            config.bgColor,
            config.textColor,
            config.borderColor,
            className
        )}>
            {config.icon}
            {config.label}
        </span>
    )
}
