-- Migrační skript pro přidání pole čísla revize

-- Přidání sloupce pro číslo revize do tabulky revisions
ALTER TABLE revisions ADD COLUMN revision_number VARCHAR(255);

-- Aktualizace existujících revizí s unikátními čísly
-- Každé revizi přiřadíme RE + 6-místný index
UPDATE revisions
SET revision_number = 'RE' || LPAD(id::text, 6, '0')
WHERE revision_number IS NULL;