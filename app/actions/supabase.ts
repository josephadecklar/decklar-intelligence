'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!)

export async function getDashboardData() {
    try {
        const [ecRes, dlnRes, cdrRes, pRes] = await Promise.all([
            supabaseAdmin.from('existing_customers').select('id, company_name, logo_url, created_at').order('company_name'),
            supabaseAdmin.from('decklar_leads_news').select('id, company_name, industry, headquarters, news_headline, news_og_image, signal_type, leads_news_metadata(logo_url, status)').order('company_name'),
            supabaseAdmin.from('company_deep_research').select('id, company_name, location, lead_score, lead_recommendation, outreach_angle, summary_for_sales, logo_url, created_at').order('lead_score', { ascending: false }),
            supabaseAdmin.from('decklar_prospects').select('id, company_name, logo_url, created_at').order('created_at', { ascending: false }),
        ])

        return {
            customers: ecRes.data || [],
            discoveries: dlnRes.data || [],
            researched: cdrRes.data || [],
            prospects: pRes.data || [],
            errors: {
                customers: ecRes.error?.message,
                discoveries: dlnRes.error?.message,
                researched: cdrRes.error?.message,
                prospects: pRes.error?.message
            }
        }
    } catch (err: any) {
        console.error('getDashboardData error:', err)
        throw new Error(err.message)
    }
}

export async function getDiscoveryLeads(filter: string) {
    try {
        const now = new Date()
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)

        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        sevenDaysAgo.setHours(0, 0, 0, 0)

        let query = supabaseAdmin
            .from('decklar_leads_news')
            .select('*, leads_news_metadata(logo_url, status)')
            .order('created_at', { ascending: false })

        if (filter === 'Today') {
            query = query.gte('created_at', todayStart.toISOString())
        } else if (filter === 'Last 7 Days') {
            query = query
                .gte('created_at', sevenDaysAgo.toISOString())
                .lt('created_at', todayStart.toISOString())
        } else if (filter === 'All Time') {
            query = query.lt('created_at', sevenDaysAgo.toISOString())
        }

        const { data, error } = await query

        if (error) throw new Error(error.message)

        return (data || []).map((lead: any) => {
            const meta = Array.isArray(lead.leads_news_metadata)
                ? lead.leads_news_metadata[0]
                : lead.leads_news_metadata
            return {
                ...lead,
                logo_url: meta?.logo_url || lead.logo_url || null,
                lead_status: meta?.status || 'discovery',
                added_to_research: meta?.status === 'research' || meta?.status === 'prospect' || lead.added_to_research
            }
        })
    } catch (err: any) {
        console.error('getDiscoveryLeads error:', err)
        throw new Error(err.message)
    }
}
