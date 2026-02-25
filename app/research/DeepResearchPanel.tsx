'use client'
import React from 'react'
import {
    MapPin, Users, Globe, DollarSign, TrendingUp, AlertTriangle, Zap,
    Target, Building2, ShieldCheck, Truck, Brain, BarChart2, Award,
    Newspaper, Beaker
} from 'lucide-react'

function scoreColor(score: number, invert = false) {
    const high = invert ? '#ef4444' : '#10b981'
    const mid = '#f59e0b'
    const low = invert ? '#10b981' : '#ef4444'
    if (score >= 7) return high
    if (score >= 4) return mid
    return low
}

function recommendationBadge(rec: string) {
    const map: Record<string, { bg: string; color: string }> = {
        'High Priority': { bg: '#dcfce7', color: '#166534' },
        'Medium Priority': { bg: '#fef9c3', color: '#854d0e' },
        'Low Priority': { bg: '#f1f5f9', color: '#475569' },
        'Avoid': { bg: '#fee2e2', color: '#991b1b' },
    }
    return map[rec] ?? { bg: '#f1f5f9', color: '#475569' }
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.65rem', padding: '0.9rem 1rem', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <div style={{ color: '#6366f1' }}>{icon}</div>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</h3>
            </div>
            {children}
        </div>
    )
}

function InfoPill({ label, value }: { label: string; value?: string | number | null }) {
    if (!value && value !== 0) return null
    return (
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '0.45rem', padding: '0.35rem 0.65rem' }}>
            <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827' }}>{value}</div>
        </div>
    )
}

function ValueMappingCard({ text }: { text: string }) {
    const parts = text.split('→').map(s => s.trim())
    const [capability, problem, impact] = parts
    return (
        <div style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)', border: '1px solid #e0e7ff', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', marginBottom: '0.4rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0, paddingTop: '1px', minWidth: '120px' }}>{capability}</div>
            <div style={{ fontSize: '0.72rem', color: '#374151', fontWeight: 500, lineHeight: 1.4 }}>
                {problem && <span style={{ color: '#b45309' }}>⚠ {problem}</span>}
                {problem && impact && <span style={{ color: '#9ca3af' }}> · </span>}
                {impact && <span style={{ color: '#059669' }}>✓ {impact}</span>}
            </div>
        </div>
    )
}

export default function DeepResearchPanel({ data, loading }: { data: any; loading: boolean; companyName: string }) {
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>Loading intelligence profile…</span>
        </div>
    )
    if (!data) return null

    const rec = recommendationBadge(data.lead_recommendation)
    const ov = data.company_overview || {}
    const prod = data.products || {}
    const cust = data.customers || {}
    const scn = data.supply_chain_network || {}
    const trans = data.transportation || {}
    const tech = data.technology_stack || {}
    const news = data.news_and_triggers || {}
    const ceo = data.ceo_vision || {}
    const opps = data.decklar_opportunities || {}
    const blic = data.buying_likelihood_indicators || {}
    const rf = data.risk_flags || {}
    const mp = data.meeting_prep || {}

    const marginColor = (m: string) => m === 'High' ? '#059669' : m === 'Medium' ? '#d97706' : '#dc2626'
    const oppStyle = (l: string) => l === 'High'
        ? { bg: '#fef9c380', border: '#f59e0b', text: '#92400e' }
        : l === 'Medium'
            ? { bg: '#ede9fe55', border: '#8b5cf6', text: '#5b21b6' }
            : { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' }
    const triggerColor: Record<string, string> = {
        'Cargo Theft': '#dc2626', 'Product Recall': '#dc2626',
        'M&A': '#7c3aed', 'Supply Chain Transformation': '#0891b2',
        'Geographic Expansion': '#059669', 'Working Capital Pressure': '#d97706',
    }

    return (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

            {/* ─── Hero Header ─── */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '0.65rem', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative' }}>
                    <div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.15rem 0', letterSpacing: '-0.02em' }}>{data.company_name}</h2>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '0.15rem' }}>{ov.industry}{ov.sub_industry ? ` · ${ov.sub_industry}` : ''}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>
                            <MapPin size={10} />{data.location}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.8rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <div style={{ fontSize: '0.52rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lead Score</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.1, color: '#a5f3fc' }}>{data.lead_score}</div>
                            <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>/ 100</div>
                        </div>
                        <div style={{ padding: '0.3rem 0.7rem', backgroundColor: rec.bg, color: rec.color, borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800 }}>{data.lead_recommendation}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.65rem' }}>
                    {[
                        { label: 'Revenue', value: ov.revenue_usd_millions >= 1000 ? `$${(ov.revenue_usd_millions / 1000).toFixed(0)}B` : ov.revenue_usd_millions ? `$${ov.revenue_usd_millions}M` : null },
                        { label: 'EBITDA', value: ov.ebitda_usd_millions ? `$${ov.ebitda_usd_millions}M` : null },
                        { label: 'Gross Margin', value: ov.gross_margin_percent ? `${ov.gross_margin_percent}%` : null },
                        { label: 'Employees', value: ov.employee_count?.toLocaleString() },
                        { label: 'Countries', value: ov.number_of_countries ? `${ov.number_of_countries}+` : null },
                        { label: 'Category', value: ov.decklar_customer_category },
                    ].filter(s => s.value).map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.4rem', padding: '0.25rem 0.55rem', fontSize: '0.68rem', fontWeight: 700, color: '#ffffff' }}>
                            <span style={{ opacity: 0.6, fontWeight: 500, fontSize: '0.62rem' }}>{s.label}</span>
                            <span>{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Outreach Angle ─── */}
            <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #6ee7b7', borderRadius: '0.65rem', padding: '0.7rem 1rem', marginBottom: '0.65rem', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={12} color="#ffffff" />
                </div>
                <div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Outreach Angle — Lead with This</div>
                    <p style={{ fontSize: '0.8rem', color: '#064e3b', fontWeight: 600, margin: 0, lineHeight: 1.55 }}>{data.outreach_angle}</p>
                </div>
            </div>

            {/* ─── Company Overview ─── */}
            <Section icon={<Building2 size={14} />} title="Company Overview">
                <p style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.6, margin: '0 0 0.65rem 0', fontWeight: 500 }}>{ov.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem' }}>
                    <InfoPill label="Business Model" value={ov.business_model} />
                    <InfoPill label="Sells To" value={ov.whom_they_sell_to} />
                    <InfoPill label="YoY Growth (Y1)" value={ov.revenue_growth_year1_percent != null ? `${ov.revenue_growth_year1_percent > 0 ? '+' : ''}${ov.revenue_growth_year1_percent}%` : null} />
                    <InfoPill label="YoY Growth (Y2)" value={ov.revenue_growth_year2_percent != null ? `${ov.revenue_growth_year2_percent > 0 ? '+' : ''}${ov.revenue_growth_year2_percent}%` : null} />
                </div>
                {ov.competitors?.length > 0 && (
                    <>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Competitor Landscape</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {ov.competitors.map((c: any, i: number) => (
                                <div key={i} style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.55rem 0.7rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827' }}>{c.competitor_name}</span>
                                        <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '999px', backgroundColor: c.supply_chain_sophistication === 'Advanced' ? '#d1fae5' : c.supply_chain_sophistication === 'Moderate' ? '#fef3c7' : '#f1f5f9', color: c.supply_chain_sophistication === 'Advanced' ? '#059669' : c.supply_chain_sophistication === 'Moderate' ? '#d97706' : '#6b7280' }}>{c.supply_chain_sophistication} SC</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.68rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                                        {c.revenue_usd_millions && <span>Rev: <b style={{ color: '#374151' }}>${(c.revenue_usd_millions / 1000).toFixed(0)}B</b></span>}
                                        {c.gross_margin_percent && <span>GM: <b style={{ color: '#374151' }}>{c.gross_margin_percent}%</b></span>}
                                        {c.revenue_growth_percent != null && <span>Growth: <b style={{ color: c.revenue_growth_percent >= 0 ? '#059669' : '#dc2626' }}>{c.revenue_growth_percent >= 0 ? '+' : ''}{c.revenue_growth_percent}%</b></span>}
                                    </div>
                                    <p style={{ fontSize: '0.72rem', color: '#4b5563', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{c.decklar_positioning}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Section>

            {/* ─── Products ─── */}
            <Section icon={<Beaker size={14} />} title="Products & Revenue Lines">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    {(prod.product_lines || []).map((pl: any, i: number) => (
                        <div key={i} style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.55rem 0.7rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                                <span style={{ fontSize: '0.73rem', fontWeight: 800, color: '#111827', flex: 1 }}>{pl.product_line_name}</span>
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: marginColor(pl.gross_margin_level), marginLeft: '0.3rem' }}>{pl.gross_margin_level}</span>
                            </div>
                            <div style={{ fontSize: '0.67rem', color: '#6b7280', marginBottom: '0.3rem' }}>{pl.estimated_revenue_share_percent}% rev · {pl.key_geographies}</div>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                {pl.is_temperature_sensitive && <span style={{ fontSize: '0.6rem', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '0.1rem 0.35rem', borderRadius: '999px', fontWeight: 700 }}>🌡 Cold Chain</span>}
                                {pl.is_high_value && <span style={{ fontSize: '0.6rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.1rem 0.35rem', borderRadius: '999px', fontWeight: 700 }}>💎 High Value</span>}
                                {pl.is_high_theft_risk && <span style={{ fontSize: '0.6rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.1rem 0.35rem', borderRadius: '999px', fontWeight: 700 }}>⚠ Theft Risk</span>}
                            </div>
                        </div>
                    ))}
                </div>
                {prod.highest_risk_lines && <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.45rem', padding: '0.45rem 0.65rem', marginBottom: '0.35rem' }}><span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>Highest Risk: </span><span style={{ fontSize: '0.72rem', color: '#7c2d12' }}>{prod.highest_risk_lines}</span></div>}
                {prod.lowest_margin_lines && <div style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '0.45rem', padding: '0.45rem 0.65rem' }}><span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>Lowest Margin: </span><span style={{ fontSize: '0.72rem', color: '#374151' }}>{prod.lowest_margin_lines}</span></div>}
            </Section>

            {/* ─── Customers ─── */}
            <Section icon={<Users size={14} />} title="Customers">
                <p style={{ fontSize: '0.77rem', color: '#374151', lineHeight: 1.55, margin: '0 0 0.6rem 0' }}>{cust.customer_segments}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    {(cust.top_3_customers || []).map((c: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '0.45rem', padding: '0.4rem 0.65rem' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#111827' }}>{c.customer_name}</div>
                                <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>{c.how_product_is_used}</div>
                            </div>
                            {c.estimated_revenue_share_percent && <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6366f1' }}>~{c.estimated_revenue_share_percent}%</div>}
                        </div>
                    ))}
                </div>
                {cust.customer_concentration_risk && <div style={{ backgroundColor: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.45rem', padding: '0.45rem 0.65rem' }}><span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>Concentration Risk: </span><span style={{ fontSize: '0.72rem', color: '#78350f' }}>{cust.customer_concentration_risk}</span></div>}
            </Section>

            {/* ─── Supply Chain ─── */}
            <Section icon={<Truck size={14} />} title="Supply Chain Network">
                <p style={{ fontSize: '0.77rem', color: '#374151', lineHeight: 1.55, margin: '0 0 0.5rem 0' }}>{scn.manufacturing}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
                    <InfoPill label="Total DCs/WHs" value={scn.total_dc_count} />
                    <InfoPill label="Cross-Border Volume" value={scn.estimated_cross_border_shipment_volume} />
                    <InfoPill label="High-Value Cargo" value={scn.estimated_high_value_cargo_percent ? `${scn.estimated_high_value_cargo_percent}%` : null} />
                    <InfoPill label="Cold Chain %" value={scn.estimated_cold_chain_shipment_percent ? `${scn.estimated_cold_chain_shipment_percent}%` : null} />
                </div>
                {scn.warehouses_and_dcs?.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                    {['Location', 'Type', 'Product Lines', 'Ownership'].map(h => (
                                        <th key={h} style={{ padding: '0.35rem 0.5rem', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: '0.6rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {scn.warehouses_and_dcs.map((dc: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#111827' }}>{dc.location}</td>
                                        <td style={{ padding: '0.35rem 0.5rem', color: '#374151' }}>{dc.type}</td>
                                        <td style={{ padding: '0.35rem 0.5rem', color: '#6b7280' }}>{dc.assigned_product_lines}</td>
                                        <td style={{ padding: '0.35rem 0.5rem' }}>
                                            <span style={{ backgroundColor: dc.owned_or_leased === 'Owned' ? '#dcfce7' : dc.owned_or_leased === 'Leased' ? '#dbeafe' : '#f3f4f6', color: dc.owned_or_leased === 'Owned' ? '#166534' : dc.owned_or_leased === 'Leased' ? '#1e40af' : '#374151', padding: '0.1rem 0.4rem', borderRadius: '999px', fontSize: '0.62rem', fontWeight: 700 }}>{dc.owned_or_leased}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {scn.cold_chain_risk_exposure && <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.45rem', padding: '0.45rem 0.65rem', marginBottom: '0.35rem' }}><span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>🌡 Cold Chain Risk: </span><span style={{ fontSize: '0.72rem', color: '#1e3a8a' }}>{scn.cold_chain_risk_exposure}</span></div>}
                {scn.high_value_theft_risk_exposure && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.45rem', padding: '0.45rem 0.65rem' }}><span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>⚠ Theft Risk: </span><span style={{ fontSize: '0.72rem', color: '#7f1d1d' }}>{scn.high_value_theft_risk_exposure}</span></div>}
            </Section>

            {/* ─── Transportation ─── */}
            <Section icon={<Globe size={14} />} title="Transportation & Logistics">
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.55rem' }}>
                    {(trans.transport_modes || []).map((m: string) => (
                        <span key={m} style={{ backgroundColor: '#ede9fe', color: '#5b21b6', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700 }}>{m}</span>
                    ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.55rem' }}>
                    <InfoPill label="Est. Logistics Cost" value={trans.logistics_cost_usd_millions ? `$${trans.logistics_cost_usd_millions}M/yr` : null} />
                    <InfoPill label="% of Revenue" value={trans.logistics_cost_as_percent_of_revenue ? `${trans.logistics_cost_as_percent_of_revenue}%` : null} />
                    <InfoPill label="Industry Avg %" value={trans.industry_average_logistics_cost_percent ? `${trans.industry_average_logistics_cost_percent}%` : null} />
                </div>
                {trans.key_carriers && <p style={{ fontSize: '0.72rem', color: '#374151', margin: '0 0 0.3rem 0' }}><b>Carriers:</b> {trans.key_carriers}</p>}
                {trans.freight_forwarders && <p style={{ fontSize: '0.72rem', color: '#374151', margin: '0 0 0.35rem 0' }}><b>Forwarders:</b> {trans.freight_forwarders}</p>}
                {trans.multimodal_complexity && <p style={{ fontSize: '0.72rem', color: '#374151', margin: '0 0 0.35rem 0' }}><b>Multimodal Complexity:</b> {trans.multimodal_complexity}</p>}
                {trans.logistics_cost_assessment && <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.45rem', padding: '0.45rem 0.65rem' }}><span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>Cost Assessment: </span><span style={{ fontSize: '0.72rem', color: '#7c2d12' }}>{trans.logistics_cost_assessment}</span></div>}
            </Section>

            {/* ─── Technology Stack ─── */}
            <Section icon={<Brain size={14} />} title="Technology Stack">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
                    {[{ label: 'ERP', value: tech.erp_systems }, { label: 'WMS', value: tech.wms_systems }, { label: 'TMS', value: tech.tms_systems }].filter(t => t.value).map(t => (
                        <div key={t.label} style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.45rem', padding: '0.35rem 0.65rem' }}>
                            <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>{t.label}</div>
                            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#14532d' }}>{t.value}</div>
                        </div>
                    ))}
                </div>
                {tech.tech_readiness_score != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(tech.tech_readiness_score / 10) * 100}%`, backgroundColor: scoreColor(tech.tech_readiness_score), borderRadius: '99px', transition: 'width 1s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: scoreColor(tech.tech_readiness_score), whiteSpace: 'nowrap' }}>Tech Readiness: {tech.tech_readiness_score}/10</span>
                    </div>
                )}
                {tech.existing_visibility_platforms && <p style={{ fontSize: '0.72rem', color: '#374151', margin: '0 0 0.3rem 0' }}><b>Existing Platforms:</b> {tech.existing_visibility_platforms}</p>}
                {tech.visibility_platform_gaps && <div style={{ backgroundColor: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.45rem', padding: '0.45rem 0.65rem', marginBottom: '0.35rem' }}><span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>Visibility Gaps: </span><span style={{ fontSize: '0.72rem', color: '#78350f' }}>{tech.visibility_platform_gaps}</span></div>}
                {tech.tech_investment_signals && <p style={{ fontSize: '0.72rem', color: '#374151', margin: 0 }}><b>Investment Signals:</b> {tech.tech_investment_signals}</p>}
            </Section>

            {/* ─── News & Triggers ─── */}
            <Section icon={<Newspaper size={14} />} title="News & Buying Triggers">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.5rem' }}>
                    {(news.recent_news_items || []).map((n: any, i: number) => {
                        const tc = triggerColor[n.trigger_type] || '#6366f1'
                        return (
                            <div key={i} style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.55rem 0.7rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                    <span style={{ fontSize: '0.73rem', fontWeight: 800, color: '#111827', flex: 1 }}>{n.headline}</span>
                                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: tc, backgroundColor: `${tc}18`, border: `1px solid ${tc}40`, padding: '0.1rem 0.4rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>{n.trigger_type}</span>
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '0.2rem' }}>{n.date}</div>
                                <p style={{ fontSize: '0.71rem', color: '#4b5563', margin: '0 0 0.25rem 0', lineHeight: 1.5 }}>{n.summary}</p>
                                {n.decklar_opportunity && <div style={{ fontSize: '0.69rem', color: '#059669', fontWeight: 600, fontStyle: 'italic' }}>→ {n.decklar_opportunity}</div>}
                            </div>
                        )
                    })}
                </div>
                {news.ma_last_2_years && <p style={{ fontSize: '0.72rem', color: '#374151', margin: '0 0 0.3rem 0' }}><b>M&A:</b> {news.ma_last_2_years}</p>}
                {news.working_capital_pressure && <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.45rem', padding: '0.45rem 0.65rem' }}><span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>Working Capital Pressure: </span><span style={{ fontSize: '0.72rem', color: '#7c2d12' }}>{news.working_capital_pressure}</span></div>}
            </Section>

            {/* ─── CEO Vision ─── */}
            <Section icon={<Target size={14} />} title="CEO Vision & Stated Priorities">
                {[
                    { label: 'Stated Priorities', value: ceo.stated_priorities_next_3_years },
                    { label: 'Identified Challenges', value: ceo.identified_challenges },
                    { label: 'Supply Chain Mentions', value: ceo.supply_chain_mentions },
                    { label: 'KPIs from Earnings', value: ceo.kpis_mentioned_in_earnings },
                ].filter(c => c.value).map(c => (
                    <div key={c.label} style={{ marginBottom: '0.45rem' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.12rem' }}>{c.label}</div>
                        <p style={{ fontSize: '0.73rem', color: '#374151', lineHeight: 1.55, margin: 0 }}>{c.value}</p>
                    </div>
                ))}
            </Section>

            {/* ─── Decklar Opportunities ─── */}
            <Section icon={<Zap size={14} />} title="Decklar Opportunities">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    {(opps.opportunity_areas || []).map((o: any, i: number) => {
                        const oc = oppStyle(o.opportunity_level)
                        return (
                            <div key={i} style={{ backgroundColor: oc.bg, border: `1px solid ${oc.border}`, borderRadius: '0.5rem', padding: '0.55rem 0.7rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.73rem', fontWeight: 800, color: '#111827', flex: 1 }}>{o.opportunity}</span>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: oc.text, backgroundColor: `${oc.border}25`, padding: '0.1rem 0.4rem', borderRadius: '999px', marginLeft: '0.4rem' }}>{o.opportunity_level}</span>
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#6b7280', marginBottom: '0.2rem' }}><b>Capability:</b> {o.decklar_capability}</div>
                                <div style={{ fontSize: '0.69rem', color: '#059669', fontWeight: 600 }}>Impact: {o.expected_business_impact}</div>
                            </div>
                        )
                    })}
                </div>
                {opps.value_mapping && (
                    <>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Value Mapping</div>
                        {opps.value_mapping.split('|').map((m: string, i: number) => <ValueMappingCard key={i} text={m.trim()} />)}
                    </>
                )}
            </Section>

            {/* ─── Buying Likelihood ─── */}
            <Section icon={<BarChart2 size={14} />} title="Buying Likelihood Indicators">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
                    {[
                        { label: 'Hiring for SC Tech', val: blic.hiring_for_supply_chain_tech_roles },
                        { label: 'DX Hiring', val: blic.hiring_for_digital_transformation },
                        { label: 'Posted RFP', val: blic.posted_rfp_for_visibility },
                        { label: 'Modernization in Earnings', val: blic.mentioned_modernization_in_earnings },
                        { label: 'Recent SC Incident', val: blic.recent_supply_chain_incident },
                        { label: 'Active DX Program', val: blic.active_digital_transformation_program },
                    ].map(b => (
                        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', backgroundColor: b.val ? '#dcfce7' : '#f1f5f9', border: `1px solid ${b.val ? '#86efac' : '#e5e7eb'}`, borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, color: b.val ? '#166534' : '#6b7280' }}>
                            <span>{b.val ? '✓' : '—'}</span><span>{b.label}</span>
                        </div>
                    ))}
                </div>
                {blic.buying_readiness_score != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(blic.buying_readiness_score / 10) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '99px' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#6366f1', whiteSpace: 'nowrap' }}>Readiness: {blic.buying_readiness_score}/10</span>
                    </div>
                )}
                {blic.buying_readiness_reasoning && <p style={{ fontSize: '0.72rem', color: '#374151', lineHeight: 1.55, margin: 0 }}>{blic.buying_readiness_reasoning}</p>}
            </Section>

            {/* ─── Risk Flags ─── */}
            <Section icon={<ShieldCheck size={14} />} title="Risk Flags">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    {[
                        { label: 'Gross Margin < 20%', val: rf.gross_margin_below_20_percent },
                        { label: 'Logistics Cost Above Avg', val: rf.logistics_cost_above_industry_average },
                        { label: 'Revenue Declining 2+ Yrs', val: rf.revenue_declining_2_plus_years },
                        { label: 'CEO Restructuring', val: rf.ceo_announced_restructuring },
                        { label: 'Public SC Incident', val: rf.public_supply_chain_incident },
                        { label: 'Theft or Recall', val: rf.public_theft_or_recall },
                    ].map(f => (
                        <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', backgroundColor: f.val ? '#fef2f2' : '#f1f5f9', border: `1px solid ${f.val ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, color: f.val ? '#b91c1c' : '#9ca3af' }}>
                            <span>{f.val ? '🚩' : '○'}</span><span>{f.label}</span>
                        </div>
                    ))}
                </div>
                {rf.risk_flag_summary && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.45rem', padding: '0.45rem 0.65rem' }}><span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>{rf.active_flags_count || 0} Active Flag{rf.active_flags_count !== 1 ? 's' : ''}: </span><span style={{ fontSize: '0.72rem', color: '#7f1d1d' }}>{rf.risk_flag_summary}</span></div>}
            </Section>

            {/* ─── Visibility Pain Points + Growth ─── */}
            <Section icon={<AlertTriangle size={14} />} title="Visibility Pain Points & Growth">
                {data.visibility_pain_points && <p style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.6, margin: '0 0 0.6rem 0' }}>{data.visibility_pain_points}</p>}
                {data.growth_and_initiatives && (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.45rem', padding: '0.5rem 0.7rem' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Growth & Initiatives</div>
                        <p style={{ fontSize: '0.72rem', color: '#14532d', margin: 0, lineHeight: 1.55 }}>{data.growth_and_initiatives}</p>
                    </div>
                )}
            </Section>

            {/* ─── Decision Makers ─── */}
            <Section icon={<Target size={14} />} title="Decision Makers to Target">
                <p style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>{data.decision_maker_roles}</p>
            </Section>

            {/* ─── Meeting Prep ─── */}
            <Section icon={<Award size={14} />} title="Meeting Preparation">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {[{ title: 'Opening Questions', items: mp.opening_questions }, { title: 'Needs Assessment', items: mp.needs_assessment_questions }].map(group => (
                        <div key={group.title}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{group.title}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                {(group.items || []).map((q: any, i: number) => (
                                    <div key={i} style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '0.45rem', padding: '0.4rem 0.55rem' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111827', marginBottom: '0.15rem' }}>"{q.question}"</div>
                                        <div style={{ fontSize: '0.63rem', color: '#6b7280', fontStyle: 'italic' }}>{q.purpose}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {mp.objection_handling && <div style={{ backgroundColor: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.45rem', padding: '0.5rem 0.7rem', marginBottom: '0.4rem' }}><div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Objection Handling</div><p style={{ fontSize: '0.72rem', color: '#78350f', margin: 0, lineHeight: 1.55 }}>{mp.objection_handling}</p></div>}
                {mp.recommended_decklar_capabilities_to_demo && <div style={{ backgroundColor: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '0.45rem', padding: '0.5rem 0.7rem' }}><div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#5b21b6', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Recommended Demo Sequence</div><p style={{ fontSize: '0.72rem', color: '#4c1d95', margin: 0, lineHeight: 1.55 }}>{mp.recommended_decklar_capabilities_to_demo}</p></div>}
            </Section>

            {/* ─── Sales Briefing ─── */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '0.65rem', padding: '1rem 1.1rem', marginBottom: '0.65rem', color: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Award size={14} color="#a5b4fc" />
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sales Rep Briefing</div>
                </div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.65, margin: 0, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{data.summary_for_sales}</p>
            </div>

        </div>
    )
}
