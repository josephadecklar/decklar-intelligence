import { NextRequest, NextResponse } from 'next/server';
import { updateLeadOutreach } from '@/app/actions/supabase';

/**
 * Handles incoming outreach data from external sources like Flowise AI.
 * Supported method: PATCH (or POST)
 */
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        // Structure expected from Flowise:
        // { 
        //   "prospect_id": "...", 
        //   "linkedin_url": "...", 
        //   "outreach_data": { ... } 
        // }
        // or
        // { 
        //   "prospect_id": "...", 
        //   "linkedin_url": "...", 
        //   "outreach_data": "{\"email\": ...}"
        // }

        const { prospect_id, linkedin_url, outreach_data } = body;

        if (!prospect_id || !linkedin_url) {
            return NextResponse.json(
                { error: 'Missing required fields: prospect_id and linkedin_url' },
                { status: 400 }
            );
        }

        // updateLeadOutreach already contains robust JSON parsing logic
        await updateLeadOutreach(prospect_id, linkedin_url, outreach_data);

        return NextResponse.json({
            success: true,
            message: 'Outreach data updated successfully'
        });
    } catch (err: any) {
        console.error('API Outreach Update Error:', err);
        return NextResponse.json(
            { error: 'Internal Server Error', detail: err.message },
            { status: 500 }
        );
    }
}

// Fallback for POST in case PATCH is not supported by the client
export async function POST(req: NextRequest) {
    return PATCH(req);
}
