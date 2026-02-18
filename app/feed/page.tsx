import TopBar from '@/components/TopBar'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function getTimeAgo(date: string) {
    const now = new Date()
    const updated = new Date(date)
    const diffHours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `Today at ${updated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    return updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getRecommendationLabel(recommendation: string): string {
    const r = recommendation?.toLowerCase() || ''
    if (r.includes('high')) return 'High Priority'
    if (r.includes('medium') || r.includes('mid')) return 'Medium Priority'
    return 'Low Priority'
}

function getRecommendationStyle(recommendation: string): React.CSSProperties {
    const r = recommendation?.toLowerCase() || ''
    if (r.includes('high')) return { backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }
    if (r.includes('medium') || r.includes('mid')) return { backgroundColor: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }
    return { backgroundColor: '#f3f4f6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }
}

function getTierStyle(tier: string): React.CSSProperties {
    const t = tier?.toUpperCase() || ''
    if (t === 'ENTERPRISE') return { backgroundColor: '#1e3a8a', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }
    if (t === 'MID-MARKET') return { backgroundColor: '#2563eb', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }
    return { backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }
}

export default async function NewsFeedPage() {
    const { data: prospects } = await supabase
        .from('company_research')
        .select('company_name, lead_recommendation, summary_for_sales, updated_at, created_at')
        .order('updated_at', { ascending: false })

    const { data: customers } = await supabase
        .from('decklar_customers')
        .select('company_name, account_tier, latest_news_summary, updated_at')
        .order('updated_at', { ascending: false })

    type FeedItem = {
        company_name: string
        type: 'Prospect' | 'Customer'
        news_summary: string
        updated_at: string
        lead_recommendation?: string
        account_tier?: string
    }

    const prospectItems: FeedItem[] = prospects?.map(p => ({
        company_name: p.company_name,
        type: 'Prospect' as const,
        news_summary: p.summary_for_sales,
        updated_at: p.updated_at || p.created_at,
        lead_recommendation: p.lead_recommendation,
    })) || []

    const customerItems: FeedItem[] = customers?.map(c => ({
        company_name: c.company_name,
        type: 'Customer' as const,
        news_summary: c.latest_news_summary,
        updated_at: c.updated_at,
        account_tier: c.account_tier,
    })) || []

    const allItems = [...prospectItems, ...customerItems].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <TopBar title="News Feed" />

            <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.25rem', fontSize: '0.875rem' }}>
                        All the latest intelligence updates from your prospects and customers.
                    </p>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem' }}>Updated daily by the AI research agent.</p>
                </div>

                {/* Feed Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {allItems.map((item, index) => (
                        <div key={`${item.type}-${item.company_name}-${index}`} style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>
                                        {item.type === 'Prospect' ? '🎯' : '🏢'}
                                    </span>
                                    <div>
                                        <Link
                                            href={`/${item.type.toLowerCase()}s/${encodeURIComponent(item.company_name)}`}
                                            style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', textDecoration: 'none' }}
                                        >
                                            {item.company_name}
                                        </Link>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <span style={{
                                                backgroundColor: item.type === 'Prospect' ? '#eff6ff' : '#f0fdf4',
                                                color: item.type === 'Prospect' ? '#1d4ed8' : '#15803d',
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                            }}>
                                                {item.type}
                                            </span>
                                            {item.type === 'Prospect' && item.lead_recommendation && (
                                                <span style={getRecommendationStyle(item.lead_recommendation)}>
                                                    {getRecommendationLabel(item.lead_recommendation)}
                                                </span>
                                            )}
                                            {item.type === 'Customer' && item.account_tier && (
                                                <span style={getTierStyle(item.account_tier)}>
                                                    {item.account_tier}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{getTimeAgo(item.updated_at)}</span>
                            </div>

                            <p style={{ color: '#374151', marginBottom: '0.75rem', lineHeight: 1.6, fontSize: '0.875rem' }}>
                                {item.news_summary}
                            </p>

                            <Link
                                href={`/${item.type.toLowerCase()}s/${encodeURIComponent(item.company_name)}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#0284c7', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}
                            >
                                View Full Profile <ArrowRight size={13} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
