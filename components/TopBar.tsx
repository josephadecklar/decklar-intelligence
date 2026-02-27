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
                    <Home size={14} style={{ cursor: 'pointer' }} onClick={() => router.push('/')} />
                    <ChevronRight size={14} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Intelligence
                    </span>
                    <ChevronRight size={14} />
                </div>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
                    {title}
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={handleBack}
                    style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ffffff',
                        color: '#4b5563',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
                >
                    <ArrowLeft size={14} /> Go Back
                </button>
            </div>
        </div>
    )
}
