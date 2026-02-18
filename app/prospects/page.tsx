import TopBar from '@/components/TopBar'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function getScoreColor(score: number): string {
    if (score >= 80) return '#16a34a'
    if (score >= 60) return '#d97706'
    return '#6b7280'
}

function getScoreDotColor(score: number): string {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#9ca3af'
}

function getRecommendationLabel(recommendation: string): string {
    const r = recommendation?.toLowerCase() || ''
    if (r.includes('high')) return 'High Priority'
    if (r.includes('medium') || r.includes('mid')) return 'Medium Priority'
    return 'Low Priority'
}

function getRecommendationStyle(recommendation: string): React.CSSProperties {
    const r = recommendation?.toLowerCase() || ''
    if (r.includes('high')) return { backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' as const }
    if (r.includes('medium') || r.includes('mid')) return { backgroundColor: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' as const }
    return { backgroundColor: '#f3f4f6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' as const }
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

export default async function ProspectsPage() {
    const { data: prospects } = await supabase
        .from('company_research')
        .select('*')
        .eq('status', 'prospect')
        .order('lead_score', { ascending: false })

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <TopBar title="Prospects" />

            <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                        Showing {prospects?.length || 0} companies · Sorted by Lead Score
                    </p>
                </div>

                {/* Table */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={thStyle}>Company</th>
                                <th style={thStyle}>Lead Score</th>
                                <th style={thStyle}>Priority</th>
                                <th style={thStyle}>Sales Hook</th>
                                <th style={thStyle}>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prospects?.map((prospect, idx) => (
                                <tr key={prospect.id}>
                                    <td style={{ ...tdStyle, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '6px',
                                            backgroundColor: prospect.logo_url ? '#ffffff' : '#f3f4f6',
                                            border: prospect.logo_url ? '1px solid #e5e7eb' : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            color: '#111827'
                                        }}>
                                            {prospect.logo_url ? (
                                                <img
                                                    src={prospect.logo_url}
                                                    alt={prospect.company_name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                                                />
                                            ) : (
                                                prospect.company_name.charAt(0)
                                            )}
                                        </div>
                                        <Link
                                            href={`/prospects/${encodeURIComponent(prospect.company_name)}`}
                                            style={{ fontWeight: 700, color: '#0284c7', textDecoration: 'none', fontSize: '0.9rem' }}
                                        >
                                            {prospect.company_name}
                                        </Link>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getScoreDotColor(prospect.lead_score), flexShrink: 0 }} />
                                            <span style={{ fontWeight: 700, color: getScoreColor(prospect.lead_score), fontSize: '1rem' }}>
                                                {prospect.lead_score}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={getRecommendationStyle(prospect.lead_recommendation)}>
                                            {getRecommendationLabel(prospect.lead_recommendation)}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, maxWidth: '400px' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {prospect.summary_for_sales}
                                        </p>
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                        {getTimeAgo(prospect.updated_at || prospect.created_at)}
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
