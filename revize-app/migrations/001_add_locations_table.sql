-- Migrace 001: Vytvoření tabulky lokací/staveb
-- =============================================
-- Tato migrace přidává podporu pro evidenci staveb a skladů

BEGIN;

-- 1. Tabulka umístění/staveb
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(200) NOT NULL,
    location_type VARCHAR(50) NOT NULL DEFAULT 'construction_site',
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(50) DEFAULT 'CZ',
    
    -- Kontaktní údaje
    contact_person VARCHAR(200),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    
    -- Aktivní období
    active_from DATE DEFAULT CURRENT_DATE,
    active_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT location_type_check CHECK (location_type IN ('construction_site', 'warehouse', 'workshop', 'transport'))
);

-- 2. Základní lokace pro testování
INSERT INTO locations (location_name, location_type, city, contact_person) VALUES
('Hlavní sklad', 'warehouse', 'Praha', 'Jan Skladník'),
('Stavba - Wenceslas Square', 'construction_site', 'Praha', 'Petr Stavitel'),
('Stavba - Brno Central', 'construction_site', 'Brno', 'Marie Projektová'),
('Servisní dílna', 'workshop', 'Praha', 'Tomáš Mechanik');

-- 3. Index pro výkon
CREATE INDEX idx_locations_type_active ON locations(location_type, is_active);

COMMIT;

-- Informace o migraci
SELECT 'Migration 001 completed: locations table created' AS status;