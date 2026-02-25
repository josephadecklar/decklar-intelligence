-- Add added_to_research column to decklar_leads_news table
ALTER TABLE decklar_leads_news ADD COLUMN IF NOT EXISTS added_to_research BOOLEAN DEFAULT FALSE;
