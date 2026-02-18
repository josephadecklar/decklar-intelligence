'use client'

import React from 'react'
import { ExternalLink, FileText, TrendingUp, Target, Users, ShieldCheck, Zap, ArrowRight, UserPlus, BarChart3, AlertTriangle, Box, Laptop, Maximize, Lightbulb, Quote } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NewsPanelProps {
    companyData: any;
    onStatusUpdate?: () => void;
}

export default function NewsPanel({ companyData, onStatusUpdate }: NewsPanelProps) {
    if (!companyData) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                color: '#9ca3af'
            }}>
                <FileText size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Select a company from the feed to view discovery intelligence.</p>
            </div>
        )
    }

    const handleAddToProspects = async () => {
        const { error } = await supabase
            .from('research_metadata')
            .update({
                status: 'prospect',
                updated_at: new Date().toISOString()
            })
            .eq('research_id', companyData.id)

        if (error) {
            console.error('Error adding to prospects:', error)
            alert('Failed to add to prospects')
        } else if (onStatusUpdate) {
            onStatusUpdate()
        }
    }

    return (
        <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: companyData.logo_url ? '#ffffff' : '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: '4px',
                        flexShrink: 0,
                        fontWeight: '800',
                        fontSize: '1.25rem'
                    }}>
                        {companyData.logo_url ? (
                            <img
                                src={companyData.logo_url}
                                alt={companyData.company_name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            companyData.company_name.charAt(0)
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                                {companyData.company_name}
                            </h2>
                            <span style={{
                                backgroundColor: companyData.lead_score >= 80 ? '#dcfce7' : '#fef3c7',
                                color: companyData.lead_score >= 80 ? '#166534' : '#92400e',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                border: `1px solid ${companyData.lead_score >= 80 ? '#bbf7d0' : '#fde68a'}`,
                                whiteSpace: 'nowrap'
                            }}>
                                {companyData.lead_score}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                            {companyData.status === 'customer' ? 'Customer Intelligence' : 'Discovery Intelligence'}
                        </p>
                    </div>
                </div>

                {companyData.status === 'discovery' && (
                    <button
                        onClick={handleAddToProspects}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: '#111827',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                    >
                        <UserPlus size={18} />
                        Add to Prospects
                    </button>
                )}
            </div>

            {/* Content Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

                {/* Background & Overview - ALWAYS FIRST */}
                <div style={cardStyle('#f8fafc', '#e2e8f0')}>
                    <Header icon={<TrendingUp size={16} color="#0284c7" />} title="Business Overview" />
                    <Text content={companyData.company_overview} />
                </div>

                {/* Financials */}
                <div style={cardStyle('#f0fdf4', '#dcfce7')}>
                    <Header icon={<BarChart3 size={16} color="#16a34a" />} title="Financial Profile" />
                    <Text content={companyData.financial_profile || "Financial details currently being processed."} />
                </div>

                {/* Growth & Initiatives */}
                <div style={cardStyle('#eff6ff', '#dbeafe')}>
                    <Header icon={<Lightbulb size={16} color="#1e40af" />} title="Growth & Initiatives" />
                    <Text content={companyData.growth_initiatives || "Tracking latest strategic moves..."} />
                </div>

                {/* Operational Scale */}
                <div style={cardStyle('#fafafa', '#f3f4f6')}>
                    <Header icon={<Maximize size={16} color="#4b5563" />} title="Operational Scale" />
                    <Text content={companyData.operational_scale || "Calculating logistics footprint..."} />
                </div>

                {/* Supply Chain */}
                <div style={cardStyle('#fff7ed', '#ffedd5')}>
                    <Header icon={<Box size={16} color="#ea580c" />} title="Supply Chain Profile" />
                    <Text content={companyData.supply_chain_profile || "Mapping global supply routes..."} />
                </div>

                {/* Tech & Logistics */}
                <div style={cardStyle('#f5f3ff', '#ede9fe')}>
                    <Header icon={<Laptop size={16} color="#7c3aed" />} title="Tech & Logistical Needs" />
                    <Text content={companyData.technology_and_logistics_needs || "Analyzing technical stack..."} />
                </div>

                {/* Decision Makers */}
                <div style={cardStyle('#ffffff', '#e5e7eb')}>
                    <Header icon={<Users size={16} color="#0f172a" />} title="Decision Makers" />
                    <Text content={companyData.decision_maker_roles} />
                </div>

                {/* Risks & Pains - Duo Column */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={cardStyle('#fef2f2', '#fee2e2')}>
                        <Header icon={<AlertTriangle size={16} color="#dc2626" />} title="Risk Factors" />
                        <Text content={companyData.risk_factors} size="0.8rem" />
                    </div>
                    <div style={cardStyle('#fffbeb', '#fef3c7')}>
                        <Header icon={<Target size={16} color="#d97706" />} title="Pain Points" />
                        <Text content={companyData.visibility_pain_points} size="0.8rem" />
                    </div>
                </div>

                {/* Sales Strategy - NOW AT THE END & LIGHT STYLED */}
                <div style={cardStyle('#fdf2f8', '#fbcfe8')}>
                    <Header icon={<Quote size={16} color="#be185d" />} title="Sales Strategy & Intelligence" />
                    <Text content={companyData.summary_for_sales || "Researching tailored sales hooks and engagement strategy..."} />
                </div>

                {/* Research Links Section */}
                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        External Research Links
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {companyData.website_link && (
                            <ResearchLink href={companyData.website_link} label="Website" />
                        )}
                        {companyData.linkedin_link && (
                            <ResearchLink href={companyData.linkedin_link} label="LinkedIn" />
                        )}
                        <ResearchLink href="#" label="SEC Filings" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Sub-components for cleaner structure
const Header = ({ icon, title, isDark = false }: { icon: React.ReactNode, title: string, isDark?: boolean }) => (
    <h3 style={{ fontSize: '0.65rem', fontWeight: 800, color: isDark ? '#9ca3af' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {icon} {title}
    </h3>
)

const Text = ({ content, size = '0.85rem', isDark = false }: { content?: string, size?: string, isDark?: boolean }) => (
    <p style={{ fontSize: size, color: isDark ? '#f8fafc' : '#475569', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
        {content || "No detailed insights found for this section."}
    </p>
)

const ResearchLink = ({ href, label }: { href: string, label: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
            padding: '0.4rem 0.75rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.4rem',
            fontSize: '0.75rem',
            color: '#4b5563',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            textDecoration: 'none',
            transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#111827'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
    >
        {label} <ExternalLink size={12} />
    </a>
)

const cardStyle = (bg: string, border: string, isDark = false): React.CSSProperties => ({
    backgroundColor: bg,
    padding: '1.25rem',
    borderRadius: '1rem',
    border: isDark ? 'none' : `1px solid ${border}`,
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease'
})
