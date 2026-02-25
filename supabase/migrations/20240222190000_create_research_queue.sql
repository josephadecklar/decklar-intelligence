-- Research Queue table: tracks companies added from Discovery to Research
-- References decklar_leads_news directly

CREATE TABLE IF NOT EXISTS research_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_lead_id UUID NOT NULL REFERENCES decklar_leads_news(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    research_status TEXT NOT NULL DEFAULT 'queued',  -- 'queued', 'in_progress', 'completed'
    UNIQUE(news_lead_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_research_queue_news_lead_id ON research_queue(news_lead_id);
CREATE INDEX IF NOT EXISTS idx_research_queue_status ON research_queue(research_status);

-- Enable RLS
ALTER TABLE research_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to research_queue"
    ON research_queue
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- When a research_queue row is DELETED, reset status in leads_news_metadata back to 'discovery'
CREATE OR REPLACE FUNCTION on_research_queue_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE leads_news_metadata
    SET status = 'discovery',
        updated_at = NOW()
    WHERE lead_id = OLD.news_lead_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_research_queue_delete ON research_queue;
CREATE TRIGGER trigger_research_queue_delete
    AFTER DELETE ON research_queue
    FOR EACH ROW
    EXECUTE FUNCTION on_research_queue_delete();
