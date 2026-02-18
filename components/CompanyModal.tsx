'use client'

import React from 'react'
import { X, Building2, TrendingUp, Users, Target, ShieldCheck, Zap } from 'lucide-react'

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function CompanyModal({ isOpen, onClose, data }: CompanyModalProps) {
    if (!isOpen || !data) return null;

    const logoUrl = data.logo_url;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Modal Content */}
            <div style={{
                position: 'relative',
                backgroundColor: '#ffffff',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                borderRadius: '1.25rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'modalEnter 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.8rem 2.5rem',
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: logoUrl ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            padding: '6px',
                            fontWeight: '800',
                            fontSize: '1.5rem',
                            color: '#ffffff'
                        }}>
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt={data.company_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                            parent.innerText = data.company_name.charAt(0);
                                        }
                                    }}
                                />
                            ) : (
                                data.company_name.charAt(0)
                            )}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{data.company_name}</h2>
                            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '2px 0 0 0', fontWeight: 500 }}>Strategic Intelligence Report</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '2rem',
                    backgroundColor: '#f9fafb'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <section>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <TrendingUp size={18} color="#0284c7" /> COMPANY OVERVIEW
                                </h3>
                                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.6 }}>
                                    {data.company_overview || "No overview available."}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Target size={18} color="#dc2626" /> PAIN POINTS & NEEDS
                                </h3>
                                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.6 }}>
                                    <strong>Operational Gaps:</strong> {data.visibility_pain_points || "N/A"}<br /><br />
                                    <strong>Tech Requirements:</strong> {data.technology_and_logistics_needs || "N/A"}
                                </div>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <section>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Users size={18} color="#16a34a" /> DECISION MAKERS
                                </h3>
                                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.6 }}>
                                    {data.decision_maker_roles || "N/A"}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Zap size={18} color="#d97706" /> SALES STRATEGY
                                </h3>
                                <div style={{ backgroundColor: '#fff7ed', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #fed7aa', fontSize: '0.875rem', color: '#9a3412', lineHeight: 1.6, fontWeight: 500 }}>
                                    {data.summary_for_sales}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem 2rem',
                    backgroundColor: '#ffffff',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.625rem 1.25rem',
                            backgroundColor: '#f3f4f6',
                            color: '#4b5563',
                            borderRadius: '0.5rem',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        Close
                    </button>
                    <button
                        style={{
                            padding: '0.625rem 1.25rem',
                            backgroundColor: '#111827',
                            color: '#ffffff',
                            borderRadius: '0.5rem',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes modalEnter {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
