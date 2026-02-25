'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, Building2, Newspaper } from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Discovery', href: '/discovery', icon: Newspaper },
    { name: 'Research', href: '/research', icon: Building2 },
    { name: 'Prospects', href: '/prospects', icon: Target },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: '260px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 40,
        }}>
            {/* Logo Section */}
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    <img
                        src="https://media.licdn.com/dms/image/v2/D4D0BAQHXr_huR6gBEg/company-logo_200_200/B4DZkztYtoIEAM-/0/1757509160635/decklar_logo?e=2147483647&v=beta&t=9rz4H-hvn7Qd--FftGyL72e-RixqxORUoLCuRKTLAQA"
                        alt="Decklar Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>DECKLAR</h1>
                    <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0, fontWeight: 500 }}>Intelligence Platform</p>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h2 style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#9ca3af',
                    marginBottom: '0.75rem',
                    paddingLeft: '0.75rem',
                    letterSpacing: '0.05em'
                }}>
                    MAIN
                </h2>
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.625rem 0.75rem',
                                borderRadius: '0.5rem',
                                textDecoration: 'none',
                                transition: 'all 0.15s',
                                backgroundColor: isActive ? '#111827' : 'transparent',
                                color: isActive ? '#ffffff' : '#4b5563',
                                fontWeight: isActive ? 600 : 500,
                            }}
                        >
                            <Icon size={18} color={isActive ? '#ffffff' : '#6b7280'} />
                            <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

        </div>
    )
}
