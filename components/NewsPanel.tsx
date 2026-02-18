'use client'

import React from 'react'
import { ExternalLink, FileText, TrendingUp, Target, Users, ShieldCheck, Zap, ArrowRight, UserPlus } from 'lucide-react'
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
        <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                            {companyData.company_name}
                        </h2>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Discovery Intelligence</p>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Score Summary */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    backgroundColor: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb'
                }}>
                    <div>
                        <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Lead Score</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: companyData.lead_score >= 80 ? '#16a34a' : '#d97706' }}>
                            {companyData.lead_score}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Priority</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>
                            {companyData.lead_recommendation}
                        </div>
                    </div>
                </div>

                <section>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <TrendingUp size={14} color="#0284c7" /> Company Overview
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
                        {companyData.company_overview}
                    </p>
                </section>

                <section>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Zap size={14} color="#d97706" /> Sales Hook
                    </h3>
                    <div style={{ backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fed7aa', fontSize: '0.875rem', color: '#9a3412', fontWeight: 500, lineHeight: 1.5 }}>
                        {companyData.summary_for_sales}
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Target size={14} color="#dc2626" /> Pain Points & Needs
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                            <strong style={{ color: '#111827' }}>Visibility Pains:</strong> {companyData.visibility_pain_points}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                            <strong style={{ color: '#111827' }}>Tech Requirements:</strong> {companyData.technology_and_logistics_needs}
                        </div>
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={14} color="#16a34a" /> Decision Makers
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
                        {companyData.decision_maker_roles}
                    </p>
                </section>

                <section>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={14} color="#7c3aed" /> Risk Factors
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
                        {companyData.risk_factors || "No significant risk factors identified."}
                    </p>
                </section>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        Research Links
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {['Website', 'LinkedIn', 'SEC Filings'].map((link) => (
                            <button key={link} style={{
                                padding: '0.4rem 0.75rem',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.4rem',
                                fontSize: '0.75rem',
                                color: '#4b5563',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                            }}>
                                {link} <ExternalLink size={12} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
