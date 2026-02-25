'use client'

import React from 'react'
import { ExternalLink, FileText, Lightbulb, Globe, Linkedin, Plus, CheckCircle2, MapPin, Newspaper, TrendingUp } from 'lucide-react'

interface DiscoveryPanelProps {
    leadData: any;
    onAddToResearch: (leadId: string) => void;
    addingId: string | null;
}

export default function DiscoveryPanel({ leadData, onAddToResearch, addingId }: DiscoveryPanelProps) {
    if (!leadData) {
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
                <p style={{ fontSize: '0.875rem' }}>Select a news signal to view details.</p>
            </div>
        )
    }

    const isAdded = leadData.added_to_research;

    // Helper for info rows
    const InfoRow = ({ icon, label, value, isLink, linkUrl }: { icon: React.ReactNode, label: string, value: string | null | undefined, isLink?: boolean, linkUrl?: string }) => {
        if (!value) return null;
        return (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ marginTop: '2px', flexShrink: 0, color: '#9ca3af' }}>{icon}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
                    {isLink ? (
                        <a href={linkUrl || value} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500, wordBreak: 'break-all' }}>
                            {value}
                        </a>
                    ) : (
                        <span style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 500, lineHeight: 1.5 }}>{value}</span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>

            {/* Panel Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: leadData.logo_url ? '#ffffff' : '#f9fafb',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: '#111827',
                        overflow: 'hidden'
                    }}>
                        {leadData.logo_url ? (
                            <img src={leadData.logo_url} alt={leadData.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                        ) : (
                            leadData.company_name?.charAt(0)
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                            {leadData.company_name}
                        </h2>
                        {leadData.signal_type && (
                            <span style={{
                                display: 'inline-block',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '2rem',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                border: '1px solid #e2e8f0',
                                whiteSpace: 'nowrap',
                                marginTop: '0.3rem'
                            }}>
                                {leadData.signal_type}
                            </span>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                            {leadData.website_link && (
                                <a href={leadData.website_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>
                                    <Globe size={11} /> Website
                                </a>
                            )}
                            {leadData.linkedin_url && (
                                <a href={leadData.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#0077b5', textDecoration: 'none', fontWeight: 500 }}>
                                    <Linkedin size={11} /> LinkedIn
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add to Research Button */}
                <button
                    onClick={() => !isAdded && onAddToResearch(leadData.id)}
                    disabled={isAdded || addingId === leadData.id}
                    style={{
                        width: '100%',
                        padding: '0.6rem',
                        backgroundColor: isAdded ? '#f0fdf4' : '#111827',
                        color: isAdded ? '#166534' : '#ffffff',
                        border: isAdded ? '1px solid #bbf7d0' : 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: isAdded ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: addingId === leadData.id ? 0.7 : 1
                    }}
                >
                    {isAdded ? (
                        <><CheckCircle2 size={16} /> Added to Research</>
                    ) : addingId === leadData.id ? (
                        'Adding...'
                    ) : (
                        <><Plus size={16} /> Add to Research</>
                    )}
                </button>
            </div>

            {/* Scrollable Content Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Decklar Benefits - Always Visible */}
                <div style={{
                    padding: '0.875rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '0.5rem',
                    border: '1px solid #dcfce7'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                        <Lightbulb size={14} color="#15803d" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                            Decklar Benefits
                        </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: leadData.decklar_benefit ? '#14532d' : '#6b7280', margin: 0, fontWeight: 600, lineHeight: 1.5, fontStyle: leadData.decklar_benefit ? 'normal' : 'italic' }}>
                        {leadData.decklar_benefit || 'No benefit data available for this lead yet.'}
                    </p>
                </div>

                {/* Sales Hook - Blue Box */}
                {leadData.sales_hook && (
                    <div style={{
                        padding: '0.875rem',
                        backgroundColor: '#eff6ff',
                        borderRadius: '0.5rem',
                        border: '1px solid #dbeafe'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                            <TrendingUp size={14} color="#1d4ed8" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                                Sales Hook
                            </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#1e3a5f', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                            {leadData.sales_hook}
                        </p>
                    </div>
                )}

                {/* News Summary */}
                {leadData.news_summary && (
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                            News Summary
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                            {leadData.news_summary}
                        </p>
                    </div>
                )}

                {/* Additional Details */}
                {(leadData.headquarters || leadData.news_category) && (
                    <div style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        padding: '1rem'
                    }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                            Additional Details
                        </div>

                        <InfoRow icon={<MapPin size={14} />} label="Headquarters" value={leadData.headquarters} />
                        <InfoRow icon={<Newspaper size={14} />} label="News Category" value={leadData.news_category} />
                    </div>
                )}

                {/* Single Read Full Article Link */}
                {leadData.news_link && (
                    <a
                        href={leadData.news_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontWeight: 600,
                            padding: '0.6rem 1rem',
                            backgroundColor: '#111827',
                            borderRadius: '0.5rem',
                            border: 'none',
                            transition: 'all 0.2s',
                            alignSelf: 'flex-start'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1f2937';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#111827';
                        }}
                    >
                        Read Full Article <ExternalLink size={12} />
                    </a>
                )}
            </div>
        </div>
    )
}
