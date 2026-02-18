import TopBar from '@/components/TopBar'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function getScoreColor(score: number): string {
    if (score >= 80) return '#16a34a'
    if (score >= 60) return '#d97706'
    return '#6b7280'
}

function getHealthBarColor(score: number): string {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#9ca3af'
}

function getTierStyle(tier: string): React.CSSProperties {
    const t = tier?.toUpperCase() || ''
    if (t === 'ENTERPRISE') return { backgroundColor: '#1e3a8a', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' as const }
    if (t === 'MID-MARKET') return { backgroundColor: '#2563eb', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' as const }
    return { backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' as const }
}

function getTimeAgo(date: string) {
    const now = new Date()
    const updated = new Date(date)
    const diffHours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

const thStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #f3f4f6',
}

export default async function CustomersPage() {
    const { data: customers } = await supabase
        .from('decklar_customers')
        .select('*')
        .order('updated_at', { ascending: false })

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <TopBar title="Customers" />

            <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                        Showing {customers?.length || 0} companies · Sorted by Last Updated
                    </p>
                </div>

                {/* Table */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={thStyle}>Company</th>
                                <th style={thStyle}>Tier</th>
                                <th style={thStyle}>Industry</th>
                                <th style={thStyle}>Health Score</th>
                                <th style={thStyle}>Latest Intelligence</th>
                                <th style={thStyle}>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers?.map((customer, idx) => (
                                <tr key={customer.id}>
                                    <td style={{ ...tdStyle, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '6px',
                                            backgroundColor: customer.logo_url ? '#ffffff' : '#f3f4f6',
                                            border: customer.logo_url ? '1px solid #e5e7eb' : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            color: '#111827'
                                        }}>
                                            {customer.logo_url ? (
                                                <img
                                                    src={customer.logo_url}
                                                    alt={customer.company_name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                                                />
                                            ) : (
                                                customer.company_name.charAt(0)
                                            )}
                                        </div>
                                        <Link
                                            href={`/customers/${encodeURIComponent(customer.company_name)}`}
                                            style={{ fontWeight: 700, color: '#0284c7', textDecoration: 'none', fontSize: '0.9rem' }}
                                        >
                                            {customer.company_name}
                                        </Link>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={getTierStyle(customer.account_tier)}>
                                            {customer.account_tier}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: '0.85rem', color: '#6b7280' }}>
                                        {customer.industry}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '80px', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${customer.health_score}%`, backgroundColor: getHealthBarColor(customer.health_score), borderRadius: '9999px' }} />
                                            </div>
                                            <span style={{ fontWeight: 700, color: getScoreColor(customer.health_score), fontSize: '0.9rem' }}>
                                                {customer.health_score}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, maxWidth: '350px' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {customer.latest_news_summary}
                                        </p>
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                        {getTimeAgo(customer.updated_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
