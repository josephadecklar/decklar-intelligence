'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ArrowLeft, Home } from 'lucide-react'

interface TopBarProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
}

export default function TopBar({ title, showBack = false, onBack }: TopBarProps) {
    const router = useRouter()

    // Split the title into parts (e.g., "Research Queue / Apple Inc.")
    const titleParts = title.split(' / ')

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    }

    return (
        <div style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.5rem',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 30
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
                    <Home
                        size={14}
                        style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                        onClick={() => router.push('/')}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    />
                    <ChevronRight size={14} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {titleParts.map((part, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <ChevronRight size={14} color="#cbd5e1" />}
                            <h1
                                onClick={index === 0 && titleParts.length > 1 ? handleBack : undefined}
                                style={{
                                    fontSize: '1.1rem',
                                    fontWeight: index === titleParts.length - 1 ? 800 : 600,
                                    color: index === titleParts.length - 1 ? '#111827' : '#94a3b8',
                                    margin: 0,
                                    letterSpacing: '-0.01em',
                                    cursor: (index === 0 && titleParts.length > 1) ? 'pointer' : 'default',
                                    transition: 'color 0.15s'
                                }}
                                onMouseEnter={(e) => {
                                    if (index === 0 && titleParts.length > 1) {
                                        e.currentTarget.style.color = '#111827'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (index === 0 && titleParts.length > 1) {
                                        e.currentTarget.style.color = '#94a3b8'
                                    }
                                }}
                            >
                                {part}
                            </h1>
                        </React.Fragment>
                    ))}
                </div>
            </div>

        </div>
    )
}
