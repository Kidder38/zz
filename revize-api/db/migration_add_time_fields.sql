-- Migration: Add time fields for § 9 písm. e) - Časové údaje
-- Author: Claude
-- Date: 2025-01-09

-- Přidat pole pro časové údaje do tabulky revisions
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS test_start_date DATE; -- Datum zahájení zkoušky
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS test_end_date DATE; -- Datum ukončení zkoušky  
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS report_date DATE; -- Datum vypracování revizní zprávy
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS handover_date DATE; -- Datum předání revizní zprávy

-- Komentáře k novým sloupcům
COMMENT ON COLUMN revisions.test_start_date IS 'Date when testing/inspection started (§ 9 písm. e)';
COMMENT ON COLUMN revisions.test_end_date IS 'Date when testing/inspection ended (§ 9 písm. e)';
COMMENT ON COLUMN revisions.report_date IS 'Date when revision report was prepared (§ 9 písm. e)';
COMMENT ON COLUMN revisions.handover_date IS 'Date when revision report was handed over (§ 9 písm. e)';

-- Aktualizovat existující záznamy - nastavit výchozí hodnoty na revision_date
UPDATE revisions 
SET 
  test_start_date = revision_date,
  test_end_date = revision_date,
  report_date = revision_date,
  handover_date = revision_date
WHERE test_start_date IS NULL OR test_end_date IS NULL OR report_date IS NULL OR handover_date IS NULL;