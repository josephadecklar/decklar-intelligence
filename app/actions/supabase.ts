'use server'

import { supabaseAdmin } from '@/lib/supabase'

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

export async function getResearchQueue() {
    try {
        const { data, error } = await supabaseAdmin
            .from('research_queue')
            .select('*, decklar_leads_news(*)')
            .order('added_at', { ascending: false })

        if (error) throw new Error(error.message)

        const groupedMap: Record<string, any> = {}

        data.forEach((item: any) => {
            const name = item.company_name
            if (!groupedMap[name]) {
                groupedMap[name] = {
                    ...item,
                    all_news_ids: [item.decklar_leads_news?.id].filter(Boolean),
                    composite_status: item.research_status
                }
            } else {
                if (item.decklar_leads_news?.id) {
                    groupedMap[name].all_news_ids.push(item.decklar_leads_news.id)
                }
                if (item.research_status === 'completed') {
                    groupedMap[name].composite_status = 'completed'
                }
                if (new Date(item.added_at) > new Date(groupedMap[name].added_at)) {
                    groupedMap[name].added_at = item.added_at
                }
            }
        })

        const leadIds = Object.values(groupedMap)
            .map((item: any) => item.decklar_leads_news?.id)
            .filter(Boolean)

        let logoMap: Record<string, string> = {}
        if (leadIds.length > 0) {
            const { data: metaRows } = await supabaseAdmin
                .from('leads_news_metadata')
                .select('lead_id, logo_url')
                .in('lead_id', leadIds)
            if (metaRows) {
                metaRows.forEach((row: any) => {
                    if (row.lead_id && row.logo_url) logoMap[row.lead_id] = row.logo_url
                })
            }
        }

        return Object.values(groupedMap).map((item: any) => ({
            ...item,
            research_status: item.composite_status,
            lead_data: item.decklar_leads_news,
            logo_url: item.decklar_leads_news?.id
                ? logoMap[item.decklar_leads_news.id] || null
                : null
        }))
    } catch (err: any) {
        console.error('getResearchQueue error:', err)
        throw new Error(err.message)
    }
}

export async function getDeepResearchData(companyName: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('company_deep_research')
            .select('*')
            .ilike('company_name', `%${companyName}%`)
            .limit(1)

        if (error) throw new Error(error.message)
        return data?.[0] || null
    } catch (err: any) {
        console.error('getDeepResearchData error:', err)
        throw new Error(err.message)
    }
}

export async function getCompanyNews(companyName: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('decklar_leads_news')
            .select('*')
            .eq('company_name', companyName)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data || []
    } catch (err: any) {
        console.error('getCompanyNews error:', err)
        throw new Error(err.message)
    }
}

export async function checkProspectStatusAction(companyName: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('decklar_prospects')
            .select('id')
            .eq('company_name', companyName)
            .maybeSingle()

        if (error) throw new Error(error.message)
        return !!data
    } catch (err: any) {
        console.error('checkProspectStatus error:', err)
        throw new Error(err.message)
    }
}

export async function updateResearchStatus(id: string, status: string) {
    try {
        const { error } = await supabaseAdmin
            .from('research_queue')
            .update({ research_status: status })
            .eq('id', id)
        if (error) throw new Error(error.message)
        return true
    } catch (err: any) {
        console.error('updateResearchStatus error:', err)
        throw new Error(err.message)
    }
}

export async function removeFromResearch(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('research_queue')
            .delete()
            .eq('id', id)
        if (error) throw new Error(error.message)
        return true
    } catch (err: any) {
        console.error('removeFromResearch error:', err)
        throw new Error(err.message)
    }
}

export async function addToProspectsAction(companyName: string, logoUrl: string | null) {
    try {
        const { error } = await supabaseAdmin
            .from('decklar_prospects')
            .insert([{
                company_name: companyName,
                logo_url: logoUrl,
                metadata: {
                    source: 'research_page',
                    added_at: new Date().toISOString()
                }
            }])
        if (error) throw new Error(error.message)
        return true
    } catch (err: any) {
        console.error('addToProspects error:', err)
        throw new Error(err.message)
    }
}

export async function getProspects() {
    try {
        const { data, error } = await supabaseAdmin
            .from('decklar_prospects')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data || []
    } catch (err: any) {
        console.error('getProspects error:', err)
        throw new Error(err.message)
    }
}
export async function searchCompanies(q: string) {
    try {
        // Search in prospects via metadata join
        const { data: metadata, error: pError } = await supabaseAdmin
            .from('research_metadata')
            .select('logo_url, research_id, company_research!inner(id, company_name, lead_score, location)')
            .ilike('company_research.company_name', `%${q}%`)

        // Search in customers (decklar_customers)
        const { data: customers, error: cError } = await supabaseAdmin
            .from('decklar_customers')
            .select('id, company_name, industry, score:health_score, logo_url')
            .ilike('company_name', `%${q}%`)

        if (pError) console.error('Prospect search error:', pError)
        if (cError) console.error('Customer search error:', cError)

        const formattedProspects = (metadata || []).map((m: any) => {
            const research: any = Array.isArray(m.company_research) ? m.company_research[0] : m.company_research;
            return {
                id: m.research_id,
                company_name: research?.company_name,
                score: research?.lead_score,
                logo_url: m.logo_url,
                type: 'Prospect',
                location: research?.location,
                industry: 'Pharma / Logistics'
            };
        })

        const formattedCustomers = (customers || []).map((c: any) => ({
            ...c,
            type: 'Customer',
            location: 'USA'
        }))

        return [...formattedProspects, ...formattedCustomers]
    } catch (err: any) {
        console.error('searchCompanies error:', err)
        throw new Error(err.message)
    }
}

export async function updateProspectMetadata(id: string, metadata: any) {
    try {
        const { data: existing } = await supabaseAdmin
            .from('decklar_prospects')
            .select('metadata')
            .eq('id', id)
            .single()

        const newMetadata = {
            ...(existing?.metadata || {}),
            ...metadata,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabaseAdmin
            .from('decklar_prospects')
            .update({ metadata: newMetadata })
            .eq('id', id)

        if (error) throw new Error(error.message)
        return true
    } catch (err: any) {
        console.error('updateProspectMetadata error:', err)
        throw new Error(err.message)
    }
}

export async function triggerFlowiseAction(companyName: string, type: string, chatflowId?: string, customUrl?: string) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_FLOWISE_API_KEY

        let flowiseUrl = customUrl
        if (!flowiseUrl && chatflowId) {
            flowiseUrl = `https://flowise-production-decklar.up.railway.app/api/v1/prediction/${chatflowId}`
        }

        if (!flowiseUrl) throw new Error('No Chatflow ID or Custom URL provided')

        const response = await fetch(flowiseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                question: companyName,
                overrideConfig: {
                    company_name: companyName
                }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Flowise error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        let result = Array.isArray(data) ? data : (data.text || data)

        // If it's a string, try to parse it as JSON
        if (typeof result === 'string') {
            try {
                // Remove potential markdown blocks
                const cleanStr = result.replace(/```(json)?\n?|\n?```/g, '').trim();
                return JSON.parse(cleanStr);
            } catch (e) {
                // If parsing fails, just return the string as-is
                console.warn('triggerFlowiseAction: Result is string but not valid JSON:', e);
                return result;
            }
        }

        return result
    } catch (err: any) {
        console.error('triggerFlowiseAction error:', err)
        throw new Error(err.message)
    }
}

export async function updateProspectLeads(id: string, leads: any[]) {
    try {
        // We first try the dedicated column, then fallback to metadata if that fails
        const { error } = await supabaseAdmin
            .from('decklar_prospects')
            .update({ leads_data: leads })
            .eq('id', id)

        if (error) {
            console.warn('Dedicated leads_data column failed, falling back to metadata:', error.message)
            return await updateProspectMetadata(id, { leads_data: leads })
        }

        return true
    } catch (err: any) {
        console.error('updateProspectLeads error:', err)
        throw new Error(err.message)
    }
}


export async function updateProspectOutreach(id: string, leadUrl: string, outreach: any) {
    try {
        const { data: existing } = await supabaseAdmin
            .from('decklar_prospects')
            .select('outreach_data')
            .eq('id', id)
            .single()

        const newOutreachData = {
            ...(existing?.outreach_data || {}),
            [leadUrl]: outreach,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabaseAdmin
            .from('decklar_prospects')
            .update({ outreach_data: newOutreachData })
            .eq('id', id)

        if (error) throw new Error(error.message)
        return true
    } catch (err: any) {
        console.error('updateProspectOutreach error:', err)
        throw new Error(err.message)
    }
}

export async function getProspectLeads(prospectId: string) {
    try {
        // 1. Try to get leads from the dedicated table
        const { data, error } = await supabaseAdmin
            .from('decklar_prospect_leads')
            .select('*')
            .eq('prospect_id', prospectId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        // 2. If empty, check if there's legacy data to sync
        if (data && data.length === 0) {
            const { data: prospect } = await supabaseAdmin
                .from('decklar_prospects')
                .select('leads_data')
                .eq('id', prospectId)
                .single();

            if (prospect?.leads_data && Array.isArray(prospect.leads_data) && prospect.leads_data.length > 0) {
                console.log('Syncing legacy leads for prospect:', prospectId);
                await syncProspectLeads(prospectId, prospect.leads_data);

                // Re-fetch now that they are synced
                const { data: syncedData } = await supabaseAdmin
                    .from('decklar_prospect_leads')
                    .select('*')
                    .eq('prospect_id', prospectId);
                return syncedData || [];
            }
        }

        return data || [];
    } catch (err: any) {
        console.error('getProspectLeads error:', err);
        throw new Error(err.message);
    }
}

export async function syncProspectLeads(prospectId: string, leads: any[]) {
    try {
        // First update the legacy column
        await updateProspectLeads(prospectId, leads);

        // Fetch existing outreach data for migration
        const { data: prospect } = await supabaseAdmin
            .from('decklar_prospects')
            .select('outreach_data')
            .eq('id', prospectId)
            .single();

        // Then ensure each lead exists in the new table
        const leadInserts = leads.map(lead => {
            const url = lead.link || lead.linkedin_url;
            return {
                prospect_id: prospectId,
                name: lead.name || 'Unknown',
                title: lead.title || lead.current_title || lead.occupation || lead.role || '',
                linkedin_url: url,
                snippet: lead.snippet || '',
                location: lead.location || '',
                // Carry over existing outreach if it exists in the company object
                outreach_data: prospect?.outreach_data?.[url] || null
            };
        }).filter(l => l.linkedin_url);

        if (leadInserts.length === 0) return true;

        const { error } = await supabaseAdmin
            .from('decklar_prospect_leads')
            .upsert(leadInserts, { onConflict: 'prospect_id, linkedin_url' });

        if (error) throw new Error(error.message);
        return true;
    } catch (err: any) {
        console.error('syncProspectLeads error:', err);
        throw new Error(err.message);
    }
}

export async function updateLeadOutreach(prospectId: string, linkedinUrl: string, outreach: any) {
    try {
        // Update the specific row in the new table
        const { error } = await supabaseAdmin
            .from('decklar_prospect_leads')
            .update({ outreach_data: outreach, updated_at: new Date().toISOString() })
            .match({ prospect_id: prospectId, linkedin_url: linkedinUrl });

        if (error) throw new Error(error.message);

        // Also update the legacy company-level column for compatibility
        await updateProspectOutreach(prospectId, linkedinUrl, outreach);

        return true;
    } catch (err: any) {
        console.error('updateLeadOutreach error:', err);
        throw new Error(err.message);
    }
}
