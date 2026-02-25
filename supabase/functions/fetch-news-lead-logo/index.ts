import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const LOGO_DEV_SECRET = Deno.env.get('LOGO_DEV_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        console.log('Received payload:', payload);

        const { record, type } = payload;

        if (type !== 'INSERT' && type !== 'UPDATE') {
            return new Response(JSON.stringify({ message: 'No action needed' }), { status: 200 });
        }

        const companyName = record.company_name;
        const leadId = record.id;

        if (!companyName) {
            return new Response(JSON.stringify({ error: 'No company name' }), { status: 400 });
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Check if metadata row already has a logo
        const { data: existingMeta } = await supabase
            .from('leads_news_metadata')
            .select('logo_url')
            .eq('lead_id', leadId)
            .single();

        if (existingMeta?.logo_url) {
            return new Response(JSON.stringify({ message: 'Logo already exists' }), { status: 200 });
        }

        // 1. Search for domain using Logo.dev Brand Search
        const searchRes = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(companyName)}`, {
            headers: {
                'Authorization': `Bearer ${LOGO_DEV_SECRET}`
            }
        });

        const searchData = await searchRes.json();
        console.log('Search results:', searchData);

        const domain = searchData[0]?.domain;

        if (!domain) {
            console.log('No domain found for:', companyName);
            return new Response(JSON.stringify({ message: 'No domain found' }), { status: 200 });
        }

        // 2. Fetch Logo Image
        const logoRes = await fetch(`https://img.logo.dev/${domain}?token=${LOGO_DEV_SECRET}`);
        if (!logoRes.ok) {
            throw new Error(`Failed to fetch logo: ${logoRes.statusText}`);
        }
        const blob = await logoRes.blob();

        // 3. Upload to Supabase Storage
        const filename = `news_${leadId}_${domain}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('company-logos')
            .upload(filename, blob, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('company-logos')
            .getPublicUrl(filename);

        console.log('Public URL:', publicUrl);

        // 5. Update leads_news_metadata table with logo
        const { error: updateError } = await supabase
            .from('leads_news_metadata')
            .update({
                logo_url: publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('lead_id', leadId);

        if (updateError) {
            throw updateError;
        }

        return new Response(JSON.stringify({ success: true, logo_url: publicUrl }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Error in Edge Function:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});
