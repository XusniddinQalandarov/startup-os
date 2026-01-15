'use client'

import { useState } from 'react'
import { changePassword } from '@/app/actions/auth'
import { Button, Input } from '@/components/ui'

export function ChangePassword() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        const result = await changePassword(formData)

        if (result?.error) {
            setError(result.error)
        } else if (result?.success) {
            setSuccess(result.message || 'Password updated!')
            // Reset form after success
            setTimeout(() => {
                setIsOpen(false)
                setSuccess(null)
            }, 2000)
        }

        setIsLoading(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
                Change Password
            </button>
        )
    }

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                <button
                    onClick={() => {
                        setIsOpen(false)
                        setError(null)
                        setSuccess(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form action={handleSubmit} className="space-y-3">
                <Input
                    name="newPassword"
                    type="password"
                    label="New Password"
                    placeholder="••••••••"
                    required
                    className="bg-white"
                />
                <Input
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="••••••••"
                    required
                    className="bg-white"
                />

                {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                )}

                {success && (
                    <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{success}</p>
                )}

                <Button
                    type="submit"
                    size="sm"
                    isLoading={isLoading}
                    className="w-full"
                >
                    Update Password
                </Button>
            </form>
        </div>
    )
}
