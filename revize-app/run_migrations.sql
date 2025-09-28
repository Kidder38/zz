-- Spuštění všech migrací postupně
-- ================================
-- Tento soubor spustí všechny migrace v pořadí

-- Kontrola připojení
SELECT 'Starting migrations...' AS status, NOW() AS timestamp;

-- Migrace 001: Lokace
\i migrations/001_add_locations_table.sql

-- Migrace 002: Rozšíření equipment
\i migrations/002_extend_equipment_table.sql

-- Migrace 003: Historie umístění
\i migrations/003_add_location_history.sql

-- Migrace 004: Crane records
\i migrations/004_add_crane_records_table.sql

-- Kontrola výsledků
SELECT 'All migrations completed!' AS status, NOW() AS timestamp;

-- Ověření vytvořených tabulek
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('locations', 'equipment_location_history', 'crane_records')
ORDER BY table_name;