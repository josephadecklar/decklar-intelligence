import React from 'react'

interface LeadCardProps {
    companyName: string;
    industry: string;
    score: number;
    isSelected: boolean;
    logoUrl?: string;
    onClick: () => void;
}

export default function LeadCard({ companyName, industry, score, isSelected, logoUrl, onClick }: LeadCardProps) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: '1.25rem',
                backgroundColor: isSelected ? '#f9fafb' : '#ffffff',
                border: '1px solid',
                borderColor: isSelected ? '#111827' : '#e5e7eb',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: logoUrl ? '#ffffff' : '#f3f4f6',
                    border: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#111827'
                }}>
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={companyName}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.style.backgroundColor = '#f3f4f6';
                                    parent.innerText = companyName.charAt(0);
                                }
                            }}
                        />
                    ) : (
                        companyName.charAt(0)
                    )}
                </div>
                <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', margin: 0 }}>{companyName}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{industry}</p>
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#6b7280',
                    lineHeight: 1
                }}>
                    {score}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', fontWeight: 600 }}>SCORE</div>
            </div>
        </div>
    )
}
