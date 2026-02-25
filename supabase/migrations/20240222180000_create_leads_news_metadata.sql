-- Create leads_news_metadata table that references decklar_leads_news
-- This mirrors research_metadata (which references company_research)
-- but is specifically for managing news-sourced leads

CREATE TABLE IF NOT EXISTS leads_news_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES decklar_leads_news(id) ON DELETE CASCADE,
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'discovery',  -- 'discovery', 'research', 'prospect'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lead_id)
);

-- Create index for fast lookups by lead_id
CREATE INDEX IF NOT EXISTS idx_leads_news_metadata_lead_id ON leads_news_metadata(lead_id);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_leads_news_metadata_status ON leads_news_metadata(status);

-- Enable RLS
ALTER TABLE leads_news_metadata ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can tighten this later)
CREATE POLICY "Allow all access to leads_news_metadata"
    ON leads_news_metadata
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Auto-create a metadata row whenever a new decklar_leads_news row is inserted
CREATE OR REPLACE FUNCTION auto_create_leads_news_metadata()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO leads_news_metadata (lead_id, status)
    VALUES (NEW.id, 'discovery')
    ON CONFLICT (lead_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_leads_news_metadata ON decklar_leads_news;
CREATE TRIGGER trigger_auto_create_leads_news_metadata
    AFTER INSERT ON decklar_leads_news
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_leads_news_metadata();
