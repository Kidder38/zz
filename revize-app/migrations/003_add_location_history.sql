-- Migrace 003: Historie umístění jeřábů
-- ====================================
-- Sledování pohybů jeřábů mezi stavbami/sklady

BEGIN;

-- 1. Tabulka historie umístění jeřábu
CREATE TABLE IF NOT EXISTS equipment_location_history (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) NOT NULL,
    location_id INTEGER REFERENCES locations(id) NOT NULL,
    
    -- Časové období na lokaci
    installed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    planned_removal_date DATE,
    actual_removal_date DATE,
    
    -- Stav jeřábu v tomto období
    status_on_arrival VARCHAR(20) NOT NULL DEFAULT 'operational',
    status_on_departure VARCHAR(20),
    
    -- Odpovědné osoby
    responsible_person_id INTEGER REFERENCES users(id),
    site_manager_id INTEGER REFERENCES users(id),
    
    -- Montážní/demontážní údaje
    montage_completion_date DATE,
    revision_after_montage_date DATE,
    revision_before_demontage_date DATE,
    
    -- Provozní údaje pro toto umístění
    operating_hours_start DECIMAL(10,2) DEFAULT 0,
    operating_hours_end DECIMAL(10,2),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ověření logiky dat
    CONSTRAINT logical_dates_check CHECK (
        installed_date <= COALESCE(planned_removal_date, installed_date) AND
        installed_date <= COALESCE(actual_removal_date, installed_date)
    ),
    
    CONSTRAINT status_arrival_check CHECK (
        status_on_arrival IN ('stored', 'in_transport', 'mounting', 'operational', 'dismounting', 'maintenance', 'retired')
    ),
    
    CONSTRAINT status_departure_check CHECK (
        status_on_departure IS NULL OR 
        status_on_departure IN ('stored', 'in_transport', 'mounting', 'operational', 'dismounting', 'maintenance', 'retired')
    )
);

-- 2. Vytvoření počátečních záznamů pro stávající zařízení
INSERT INTO equipment_location_history (
    equipment_id, 
    location_id, 
    installed_date, 
    status_on_arrival,
    montage_completion_date,
    revision_after_montage_date,
    operating_hours_start
)
SELECT 
    e.id,
    COALESCE(e.current_location_id, (SELECT id FROM locations WHERE location_type = 'construction_site' LIMIT 1)),
    CURRENT_DATE - INTERVAL '6 months', -- Předpokládáme, že jsou zde 6 měsíců
    'operational',
    CURRENT_DATE - INTERVAL '6 months',
    CURRENT_DATE - INTERVAL '6 months' + INTERVAL '1 day',
    0
FROM equipment e
WHERE NOT EXISTS (
    SELECT 1 FROM equipment_location_history elh 
    WHERE elh.equipment_id = e.id
);

-- 3. Indexy pro výkon
CREATE INDEX IF NOT EXISTS idx_equipment_location_history_equipment ON equipment_location_history(equipment_id, installed_date);
CREATE INDEX IF NOT EXISTS idx_equipment_location_history_active ON equipment_location_history(equipment_id) WHERE actual_removal_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_equipment_location_history_location ON equipment_location_history(location_id, installed_date);

COMMIT;

-- Informace o migraci
SELECT 'Migration 003 completed: equipment location history created' AS status;