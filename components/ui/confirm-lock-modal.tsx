'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui'
import { useState } from 'react'

interface ConfirmLockModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    stageName: string
}

export function ConfirmLockModal({ isOpen, onClose, onConfirm, stageName }: ConfirmLockModalProps) {
    const [isLocking, setIsLocking] = useState(false)

    const handleConfirm = async () => {
        setIsLocking(true)
        try {
            await onConfirm()
        } finally {
            setIsLocking(false)
            onClose()
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Confirm & Lock ${stageName}`}>
            <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm text-amber-900">
                        <p className="font-medium mb-1">Are you sure you want to lock this stage?</p>
                        <p className="text-amber-800/80">
                            Locking this stage confirms its data as the foundation for the next stage.
                            If you unlock it later to make changes, all downstream stages will be marked as <strong>outdated</strong>.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={onClose} disabled={isLocking}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLocking}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isLocking ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Locking...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Confirm & Lock
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
