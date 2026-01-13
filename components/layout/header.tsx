import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface HeaderProps {
    startupName?: string
    status?: string
    className?: string
    children?: ReactNode
}

const statusStyles: Record<string, string> = {
    evaluating: 'bg-amber-100 text-amber-800',
    evaluated: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
}

export function Header({ startupName, status, className, children }: HeaderProps) {
    return (
        <header
            className={cn(
                'sticky top-0 z-40 bg-white border-b border-gray-200',
                'h-16 flex items-center justify-between px-6',
                className
            )}
        >
            <div className="flex items-center gap-4">
                {startupName && (
                    <>
                        <h1 className="text-lg font-semibold text-gray-900">{startupName}</h1>
                        {status && (
                            <span
                                className={cn(
                                    'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                                    statusStyles[status] || 'bg-gray-100 text-gray-800'
                                )}
                            >
                                {status.replace('_', ' ')}
                            </span>
                        )}
                    </>
                )}
            </div>
            {children && <div className="flex items-center gap-4">{children}</div>}
        </header>
    )
}
