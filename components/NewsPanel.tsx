import React from 'react'
import { ExternalLink, FileText } from 'lucide-react'

interface NewsPanelProps {
    companyName: string | null;
    newsSummary: string | null;
    logoUrl?: string | null;
}

export default function NewsPanel({ companyName, newsSummary, logoUrl }: NewsPanelProps) {
    if (!companyName) {
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
                <p style={{ fontSize: '0.875rem' }}>Select a lead to view associated news and intelligence links.</p>
            </div>
        )
    }

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: logoUrl ? '#ffffff' : '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '2px',
                    flexShrink: 0,
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    color: '#111827'
                }}>
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={companyName}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Intelligence Hub
                </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <section>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        LATEST NEWS SUMMARY
                    </h3>
                    <div style={{
                        backgroundColor: '#f9fafb',
                        padding: '1.25rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #e5e7eb',
                        fontSize: '0.875rem',
                        color: '#4b5563',
                        lineHeight: 1.6
                    }}>
                        {newsSummary || "No detailed news summary available for this lead yet."}
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        RESEARCH LINKS
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { name: 'Company Website', url: '#' },
                            { name: 'Latest SEC Filings', url: '#' },
                            { name: 'LinkedIn Company Page', url: '#' },
                            { name: 'Recent Press Releases', url: '#' }
                        ].map((link, idx) => (
                            <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    textDecoration: 'none',
                                    color: '#111827',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    transition: 'background-color 0.15s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                                {link.name}
                                <ExternalLink size={14} color="#9ca3af" />
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
