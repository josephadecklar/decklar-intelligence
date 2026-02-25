'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { getDashboardData } from '@/app/actions/supabase'
import {
  Building2, Search, TrendingUp, Zap,
  ArrowRight, ChevronUp, ChevronDown, Users,
  Newspaper, CheckCircle2, Star, Target
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExistingCustomer {
  id: string
  company_name: string
  logo_url: string | null
  created_at: string
}

interface DiscoveryCompany {
  id: string
  company_name: string
  industry: string | null
  headquarters: string | null
  news_headline: string | null
  news_og_image: string | null
  signal_type: string | null
  logo_url: string | null
  status: string | null
}

interface ResearchedCompany {
  id: string
  company_name: string
  location: string | null
  lead_score: number | null
  lead_recommendation: string | null
  outreach_angle: string | null
  summary_for_sales: string | null
  logo_url: string | null
  created_at: string
}

interface Prospect {
  id: string
  company_name: string
  logo_url: string | null
  created_at: string
}

type TabKey = 'customers' | 'discovery' | 'researched' | 'prospects'

// ─── Recommendation Badge ──────────────────────────────────────────────────────
function RecoBadge({ value }: { value: string | null }) {
  if (!value) return null
  const map: Record<string, { color: string; bg: string; border: string }> = {
    'High Priority': { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    'Medium Priority': { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    'Low Priority': { color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe' },
    'Avoid': { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  }
  const s = map[value] || { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' }
  return (
    <span style={{
      padding: '0.2rem 0.55rem', borderRadius: '2rem',
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap'
    }}>{value}</span>
  )
}

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#7c3aed' : score >= 50 ? '#d97706' : '#6b7280'
  return (
    <div title={`Lead Score: ${score}`} style={{
      width: '40px', height: '40px', borderRadius: '50%',
      background: `conic-gradient(${color} ${score * 3.6}deg, #f3f4f6 0deg)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: '0.58rem', fontWeight: 900, color: '#111827' }}>{score}</span>
      </div>
    </div>
  )
}

// ─── Avatar Initial ────────────────────────────────────────────────────────────
function CompanyAvatar({ name, logoUrl, color = '#7c3aed' }: { name: string; logoUrl?: string | null; color?: string }) {
  if (logoUrl) {
    return (
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden',
        border: '1px solid #e5e7eb', flexShrink: 0, backgroundColor: 'white'
      }}>
        <img src={logoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
      </div>
    )
  }
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}22, ${color}55)`,
      border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 900, color }}>{(name || '?').charAt(0).toUpperCase()}</span>
    </div>
  )
}

// ─── Sort Hook ─────────────────────────────────────────────────────────────────
function SortBtn({ field, active, dir, onClick }: { field: string; active: boolean; dir: 'asc' | 'desc'; onClick: () => void }) {
  return (
    <span onClick={onClick} style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', gap: '1px', marginLeft: '4px', opacity: active ? 1 : 0.3 }}>
      <ChevronUp size={8} color={active && dir === 'asc' ? '#111827' : '#9ca3af'} />
      <ChevronDown size={8} color={active && dir === 'desc' ? '#111827' : '#9ca3af'} />
    </span>
  )
}

// ─── Search Input ──────────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
      <Search size={13} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', paddingLeft: '2rem', paddingRight: '0.75rem',
          paddingTop: '0.5rem', paddingBottom: '0.5rem',
          fontSize: '0.8rem', borderRadius: '0.5rem',
          border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
          color: '#111827', fontWeight: 500, outline: 'none', boxSizing: 'border-box'
        }}
      />
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
      <Building2 size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
      <p style={{ fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>{message}</p>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('discovery')

  // Data states
  const [customers, setCustomers] = useState<ExistingCustomer[]>([])
  const [discoveries, setDiscoveries] = useState<DiscoveryCompany[]>([])
  const [researched, setResearched] = useState<ResearchedCompany[]>([])
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)

  // Search states per tab
  const [custSearch, setCustSearch] = useState('')
  const [discSearch, setDiscSearch] = useState('')
  const [resSearch, setResSearch] = useState('')
  const [prospSearch, setProspSearch] = useState('')

  // Sort state
  const [sortField, setSortField] = useState('company_name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true)
    try {
      const data = await getDashboardData()

      setCustomers(data.customers)

      const filteredDiscoveries = data.discoveries
        .map((row: any) => {
          const meta = Array.isArray(row.leads_news_metadata) ? row.leads_news_metadata[0] : row.leads_news_metadata
          return { ...row, logo_url: meta?.logo_url || null, status: meta?.status || null }
        })
        .filter((row: any) => row.status === 'discovery')
      setDiscoveries(filteredDiscoveries)

      setResearched(data.researched)
      setProspects(data.prospects)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ── Sort helper ────────────────────────────────────────────────────────────
  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sortRows = <T extends Record<string, any>>(rows: T[], field: string): T[] =>
    [...rows].sort((a, b) => {
      const av = a[field] ?? ''
      const bv = b[field] ?? ''
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })

  // ── Filtered + sorted lists ────────────────────────────────────────────────
  const filteredCustomers = useMemo(() => sortRows(
    customers.filter(c => !custSearch || c.company_name.toLowerCase().includes(custSearch.toLowerCase())),
    'company_name'
  ), [customers, custSearch, sortField, sortDir])

  const filteredDiscoveries = useMemo(() => sortRows(
    discoveries.filter(c => !discSearch || c.company_name.toLowerCase().includes(discSearch.toLowerCase())),
    sortField
  ), [discoveries, discSearch, sortField, sortDir])

  const filteredResearched = useMemo(() => sortRows(
    researched.filter(c => !resSearch || c.company_name.toLowerCase().includes(resSearch.toLowerCase())),
    sortField
  ), [researched, resSearch, sortField, sortDir])

  const filteredProspects = useMemo(() => sortRows(
    prospects.filter(c => !prospSearch || c.company_name.toLowerCase().includes(prospSearch.toLowerCase())),
    sortField
  ), [prospects, prospSearch, sortField, sortDir])

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const kpiCards = [
    {
      key: 'discovery' as TabKey,
      label: 'Discovery',
      count: discoveries.length,
      icon: <Newspaper size={18} color="#059669" />,
      color: '#059669', bg: '#f0fdf4', border: '#bbf7d0'
    },
    {
      key: 'researched' as TabKey,
      label: 'Researched',
      count: researched.length,
      icon: <Zap size={18} color="#7c3aed" />,
      color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe'
    },
    {
      key: 'prospects' as TabKey,
      label: 'Prospects',
      count: prospects.length,
      icon: <Target size={18} color="#3b82f6" />,
      color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe'
    },
    {
      key: 'customers' as TabKey,
      label: 'Existing Customers',
      count: customers.length,
      icon: <Users size={18} color="#0369a1" />,
      color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe'
    },
  ]

  // ── Table header cell style ────────────────────────────────────────────────
  const thStyle: React.CSSProperties = {
    fontSize: '0.63rem', fontWeight: 800, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    userSelect: 'none', display: 'flex', alignItems: 'center'
  }

  const rowBaseStyle = (i: number): React.CSSProperties => ({
    display: 'grid', padding: '0.75rem 1.25rem', alignItems: 'center',
    borderBottom: '1px solid #f9fafb',
    backgroundColor: i % 2 === 0 ? 'white' : '#fafafa',
    transition: 'background 0.12s', cursor: 'default'
  })

  // ── Loader ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TopBar title="Dashboard" />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #f3f4f6', borderTop: '3px solid #7c3aed', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500 }}>Loading data...</p>
            </div>
          </div>
        </main>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar title="Dashboard" />

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>

          {/* ── Page Header ── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>Dashboard</h1>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '3px', fontWeight: 500 }}>
              Track your customers, discover new leads, and view deep research results.
            </p>
          </div>

          {/* ── KPI Cards (clickable tabs) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {kpiCards.map(card => (
              <div
                key={card.key}
                onClick={() => setActiveTab(card.key)}
                style={{
                  backgroundColor: activeTab === card.key ? card.color : 'white',
                  borderRadius: '0.875rem',
                  padding: '1.25rem 1.4rem',
                  border: `1.5px solid ${activeTab === card.key ? card.color : '#e5e7eb'}`,
                  boxShadow: activeTab === card.key ? `0 4px 20px ${card.color}33` : '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 800,
                    color: activeTab === card.key ? 'rgba(255,255,255,0.8)' : '#9ca3af',
                    textTransform: 'uppercase', letterSpacing: '0.06em'
                  }}>{card.label}</span>
                  <div style={{
                    padding: '0.4rem', borderRadius: '0.5rem',
                    backgroundColor: activeTab === card.key ? 'rgba(255,255,255,0.2)' : card.bg,
                  }}>
                    {React.cloneElement(card.icon as React.ReactElement<any>, {
                      color: activeTab === card.key ? 'white' : card.color
                    })}
                  </div>
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, lineHeight: 1, color: activeTab === card.key ? 'white' : card.color }}>
                  {card.count}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: activeTab === card.key ? 'rgba(255,255,255,0.65)' : '#9ca3af', marginTop: '0.3rem' }}>
                  {card.key === 'customers' && `companies tracked`}
                  {card.key === 'discovery' && `signals found`}
                  {card.key === 'researched' && `profiles complete`}
                  {card.key === 'prospects' && `active leads`}
                </div>
              </div>
            ))}
          </div>

          {/* ── Content Panel ── */}
          <div style={{
            backgroundColor: 'white', borderRadius: '0.875rem',
            border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>

            {/* ── Tab Header ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6',
              backgroundColor: '#fafafa', gap: '1rem', flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {kpiCards.map(card => (
                  <button
                    key={card.key}
                    onClick={() => setActiveTab(card.key)}
                    style={{
                      padding: '0.4rem 0.85rem', borderRadius: '0.4rem', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.75rem', border: 'none',
                      backgroundColor: activeTab === card.key ? '#111827' : 'transparent',
                      color: activeTab === card.key ? 'white' : '#6b7280',
                      transition: 'all 0.15s'
                    }}
                  >
                    {card.label}
                    <span style={{
                      marginLeft: '0.4rem', padding: '0.1rem 0.4rem', borderRadius: '2rem',
                      backgroundColor: activeTab === card.key ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                      fontSize: '0.65rem', fontWeight: 800,
                      color: activeTab === card.key ? 'white' : '#6b7280'
                    }}>{card.count}</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              {activeTab === 'customers' && <SearchInput value={custSearch} onChange={setCustSearch} placeholder="Search customers..." />}
              {activeTab === 'discovery' && <SearchInput value={discSearch} onChange={setDiscSearch} placeholder="Search discoveries..." />}
              {activeTab === 'researched' && <SearchInput value={resSearch} onChange={setResSearch} placeholder="Search researched companies..." />}
              {activeTab === 'prospects' && <SearchInput value={prospSearch} onChange={setProspSearch} placeholder="Search prospects..." />}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                TAB 2 — DISCOVERY
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'discovery' && (
              <>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 140px', padding: '0.6rem 1.25rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                  {[
                    { label: 'Company', field: 'company_name' },
                    { label: 'Industry', field: 'industry' },
                    { label: 'Signal', field: 'signal_type' },
                    { label: 'Action', field: null },
                  ].map(col => (
                    <div key={col.label} style={thStyle}>
                      {col.label}
                      {col.field && <SortBtn field={col.field} active={sortField === col.field} dir={sortDir} onClick={() => toggleSort(col.field!)} />}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                <div style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
                  {filteredDiscoveries.length === 0 ? (
                    <EmptyState message="No discovery signals with 'discovery' status found." />
                  ) : filteredDiscoveries.map((c, i) => (
                    <div
                      key={c.id}
                      style={{ ...rowBaseStyle(i), gridTemplateColumns: '1.6fr 1fr 1fr 140px' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#fafafa')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <CompanyAvatar name={c.company_name} logoUrl={c.logo_url} color="#059669" />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{c.company_name}</div>
                          {c.headquarters && (
                            <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 500 }}>{c.headquarters}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#374151', fontWeight: 500 }}>
                        {c.industry || <span style={{ color: '#d1d5db' }}>—</span>}
                      </div>
                      <div>
                        {c.signal_type ? (
                          <span style={{
                            padding: '0.2rem 0.55rem', borderRadius: '2rem',
                            backgroundColor: '#f0fdf4', color: '#059669',
                            border: '1px solid #bbf7d0',
                            fontSize: '0.65rem', fontWeight: 700
                          }}>{c.signal_type}</span>
                        ) : <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>—</span>}
                      </div>
                      <Link
                        href="/research"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.3rem 0.7rem', borderRadius: '0.4rem',
                          fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none',
                          backgroundColor: '#f0fdf4', color: '#059669',
                          border: '1px solid #bbf7d0', transition: 'all 0.15s'
                        }}
                      >
                        Research <ArrowRight size={11} />
                      </Link>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>
                    Showing {filteredDiscoveries.length} of {discoveries.length} discovery signals
                  </span>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 3 — RESEARCHED
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'researched' && (
              <>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.9fr 90px 130px 140px', padding: '0.6rem 1.25rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                  {[
                    { label: 'Company', field: 'company_name' },
                    { label: 'Recommendation', field: 'lead_recommendation' },
                    { label: 'Score', field: 'lead_score' },
                    { label: 'Location', field: 'location' },
                    { label: 'Action', field: null },
                  ].map(col => (
                    <div key={col.label} style={thStyle}>
                      {col.label}
                      {col.field && <SortBtn field={col.field} active={sortField === col.field} dir={sortDir} onClick={() => toggleSort(col.field!)} />}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                <div style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
                  {filteredResearched.length === 0 ? (
                    <EmptyState message="No researched companies yet. Start a research run to populate this." />
                  ) : filteredResearched.map((c, i) => (
                    <div
                      key={c.id}
                      style={{ ...rowBaseStyle(i), gridTemplateColumns: '1.5fr 0.9fr 90px 130px 140px' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f3ff')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#fafafa')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <CompanyAvatar name={c.company_name} logoUrl={c.logo_url} color="#7c3aed" />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{c.company_name}</div>
                          {c.outreach_angle && (
                            <div style={{
                              fontSize: '0.68rem', color: '#6b7280', fontWeight: 500,
                              maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>{c.outreach_angle}</div>
                          )}
                        </div>
                      </div>
                      <div><RecoBadge value={c.lead_recommendation} /></div>
                      <div>
                        {c.lead_score !== null
                          ? <ScoreRing score={Number(c.lead_score)} />
                          : <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>—</span>
                        }
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#374151', fontWeight: 500 }}>
                        {c.location || <span style={{ color: '#d1d5db' }}>—</span>}
                      </div>
                      <Link
                        href={`/research?company=${encodeURIComponent(c.company_name)}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.35rem 0.8rem', borderRadius: '0.4rem',
                          fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none',
                          backgroundColor: '#7c3aed', color: 'white',
                          border: 'none', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(124,58,237,0.3)'
                        }}
                      >
                        View Profile <ArrowRight size={11} />
                      </Link>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>
                    Showing {filteredResearched.length} of {researched.length} researched companies
                  </span>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 4 — PROSPECTS
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'prospects' && (
              <>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 140px', padding: '0.6rem 1.25rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                  {[
                    { label: 'Company', field: 'company_name' },
                    { label: 'Added Date', field: 'created_at' },
                    { label: 'Action', field: null },
                  ].map(col => (
                    <div key={col.label} style={thStyle}>
                      {col.label}
                      {col.field && <SortBtn field={col.field} active={sortField === col.field} dir={sortDir} onClick={() => toggleSort(col.field!)} />}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                <div style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
                  {filteredProspects.length === 0 ? (
                    <EmptyState message="No prospects added yet." />
                  ) : filteredProspects.map((c, i) => (
                    <div
                      key={c.id}
                      style={{ ...rowBaseStyle(i), gridTemplateColumns: '1.5fr 1fr 140px' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#fafafa')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <CompanyAvatar name={c.company_name} logoUrl={c.logo_url} color="#3b82f6" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{c.company_name}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                        {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                      <Link
                        href={`/prospects?company=${encodeURIComponent(c.company_name)}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.3rem 0.7rem', borderRadius: '0.4rem',
                          fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none',
                          backgroundColor: '#eff6ff', color: '#3b82f6',
                          border: '1px solid #bfdbfe', transition: 'all 0.15s'
                        }}
                      >
                        Details <ArrowRight size={11} />
                      </Link>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>
                    Showing {filteredProspects.length} of {prospects.length} active prospects
                  </span>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 4 — EXISTING CUSTOMERS
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'customers' && (
              <>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', padding: '0.6rem 1.25rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                  <div style={thStyle} onClick={() => toggleSort('company_name')}>
                    Company Name <SortBtn field="company_name" active={sortField === 'company_name'} dir={sortDir} onClick={() => toggleSort('company_name')} />
                  </div>
                  <div style={thStyle}>Action</div>
                </div>

                {/* Rows */}
                <div style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
                  {filteredCustomers.length === 0
                    ? <EmptyState message="No customers match your search." />
                    : filteredCustomers.map((c, i) => (
                      <div
                        key={c.id}
                        style={{ ...rowBaseStyle(i), gridTemplateColumns: '1fr 160px' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'white' : '#fafafa')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <CompanyAvatar name={c.company_name} logoUrl={c.logo_url} color="#0369a1" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{c.company_name}</span>
                        </div>
                        <Link
                          href="/research"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.3rem 0.7rem', borderRadius: '0.4rem',
                            fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none',
                            backgroundColor: '#eff6ff', color: '#0369a1',
                            border: '1px solid #bfdbfe', transition: 'all 0.15s'
                          }}
                        >
                          Research <ArrowRight size={11} />
                        </Link>
                      </div>
                    ))
                  }
                </div>

                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>
                    Showing {filteredCustomers.length} of {customers.length} existing customers
                  </span>
                </div>
              </>
            )}
          </div>

          <div style={{ height: '2rem' }} />
        </div>
      </main>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input:focus { outline: 2px solid #7c3aed !important; }
      `}</style>
    </div>
  )
}
