import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
    value: number
    max?: number
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'success' | 'warning' | 'danger'
}

const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
}

const variantStyles = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
}

function getVariantFromValue(value: number): 'danger' | 'warning' | 'default' | 'success' {
    if (value < 30) return 'danger'
    if (value < 50) return 'warning'
    if (value < 70) return 'default'
    return 'success'
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value, max = 100, showLabel = false, size = 'md', variant, ...props }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
        const computedVariant = variant || getVariantFromValue(percentage)

        return (
            <div className={cn('w-full', className)} ref={ref} {...props}>
                {showLabel && (
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
                    </div>
                )}
                <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', sizeStyles[size])}>
                    <div
                        className={cn('h-full rounded-full transition-all duration-300 ease-out', variantStyles[computedVariant])}
                        style={{ width: `${percentage}%` }}
                        role="progressbar"
                        aria-valuenow={value}
                        aria-valuemin={0}
                        aria-valuemax={max}
                    />
                </div>
            </div>
        )
    }
)

Progress.displayName = 'Progress'
