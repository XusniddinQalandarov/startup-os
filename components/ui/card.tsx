import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, padding = 'md', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-white rounded-lg border border-gray-200',
                    'shadow-sm',
                    paddingStyles[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('mb-4', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, as: Tag = 'h3', children, ...props }, ref) => {
        return (
            <Tag
                ref={ref}
                className={cn('text-lg font-semibold text-gray-900', className)}
                {...props}
            >
                {children}
            </Tag>
        )
    }
)

CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> { }

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn('text-sm text-gray-500 mt-1', className)}
                {...props}
            >
                {children}
            </p>
        )
    }
)

CardDescription.displayName = 'CardDescription'
