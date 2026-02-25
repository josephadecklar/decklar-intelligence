-- Add logo_url column to decklar_leads_news table
ALTER TABLE decklar_leads_news ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create a trigger function to call the edge function when a new row is inserted
CREATE OR REPLACE FUNCTION notify_fetch_news_lead_logo()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Only trigger if logo_url is null (new entry without logo)
  IF NEW.logo_url IS NULL THEN
    payload := json_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW)
    );

    PERFORM net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/fetch-news-lead-logo',
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
      )::JSONB,
      body := payload::JSONB
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on decklar_leads_news
DROP TRIGGER IF EXISTS trigger_fetch_news_lead_logo ON decklar_leads_news;
CREATE TRIGGER trigger_fetch_news_lead_logo
  AFTER INSERT ON decklar_leads_news
  FOR EACH ROW
  EXECUTE FUNCTION notify_fetch_news_lead_logo();
