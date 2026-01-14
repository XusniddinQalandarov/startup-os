import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    textClassName?: string
    href?: string
}

export function Logo({ className, textClassName, href = '/' }: LogoProps) {
    return (
        <Link href={href} className={cn("flex items-center gap-2", className)}>
            <Image src="/ideY.webp" alt="ideY Logo" width={48} height={36} className="w-auto h-9" />
            <span className={cn(
                "font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent",
                textClassName
            )}>
                ideY
            </span>
        </Link>
    )
}
