-- Migrace 004: Nová tabulka pro všechny typy záznamů (kontroly, revize, údržba)
-- ============================================================================
-- Nahrazuje a sjednocuje logbook entries a inspections

BEGIN;

-- 1. Tabulka pro všechny typy záznamů o jeřábu
CREATE TABLE IF NOT EXISTS crane_records (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) NOT NULL,
    
    -- Klasifikace záznamu
    record_category VARCHAR(20) NOT NULL, -- 'montage', 'revision', 'control', 'maintenance', 'incident'
    record_type VARCHAR(30) NOT NULL,     -- 'daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'post_montage', 'periodic_revision'
    control_period VARCHAR(20),           -- 'daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual'
    
    -- Časové údaje
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    record_time TIME DEFAULT CURRENT_TIME,
    due_date DATE,                        -- Plánované datum kontroly
    completed_date DATE,                  -- Skutečné dokončení
    
    -- Odpovědnosti podle typu
    inspector_id INTEGER REFERENCES users(id),      -- Kdo provedl
    required_qualification VARCHAR(30),             -- 'operator', 'technician', 'revision_technician'
    
    -- Obsah záznamu
    title VARCHAR(200) NOT NULL,
    description TEXT,
    findings TEXT,
    recommendations TEXT,
    corrective_actions TEXT,
    
    -- Stav a závažnost
    status VARCHAR(20) DEFAULT 'planned',   -- 'planned', 'in_progress', 'completed', 'overdue', 'failed'
    result VARCHAR(20),                     -- 'passed', 'passed_with_remarks', 'failed', 'not_applicable'
    severity VARCHAR(15),                   -- 'info', 'low', 'medium', 'high', 'critical'
    
    -- Vazby na předchozí kontroly
    parent_record_id INTEGER REFERENCES crane_records(id), -- Navazuje na předchozí kontrolu
    sequence_number INTEGER,                                -- Pořadí v sekvenci kontrol
    
    -- Umístění a kontext
    location_history_id INTEGER REFERENCES equipment_location_history(id),
    location_id INTEGER REFERENCES locations(id),
    
    -- Specifické údaje
    operating_hours DECIMAL(10,2),
    weather_conditions VARCHAR(100),
    load_test_performed BOOLEAN DEFAULT FALSE,
    load_test_weight DECIMAL(8,2),
    
    -- Strukturovaná data
    checklist_results JSONB,               -- Výsledky kontrolních seznamů
    measurements JSONB,                     -- Naměřené hodnoty
    attachments JSONB,                      -- Přílohy, fotky, dokumenty
    
    -- Následné akce
    next_control_date DATE,                 -- Kdy má být další kontrola
    next_control_type VARCHAR(30),          -- Typ následující kontroly
    maintenance_required BOOLEAN DEFAULT FALSE,
    revision_required BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    
    -- Kontrola hodnot
    CONSTRAINT valid_category CHECK (record_category IN ('montage', 'revision', 'control', 'maintenance', 'incident')),
    CONSTRAINT valid_status CHECK (status IN ('planned', 'in_progress', 'completed', 'overdue', 'failed')),
    CONSTRAINT valid_result CHECK (result IN ('passed', 'passed_with_remarks', 'failed', 'not_applicable')),
    CONSTRAINT valid_severity CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_qualification CHECK (required_qualification IN ('operator', 'technician', 'revision_technician'))
);

-- 2. Migrace stávajících dat z logbook_entries (pokud existují)
-- Poznámka: Tato část by byla přizpůsobena skutečné struktuře stávajících dat
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logbook_entries') THEN
--         INSERT INTO crane_records (
--             equipment_id, record_category, record_type, record_date, record_time,
--             inspector_id, title, description, findings, severity, status,
--             operating_hours, checklist_results, created_at
--         )
--         SELECT 
--             equipment_id, 
--             'control',
--             CASE 
--                 WHEN entry_type = 'daily_check' THEN 'daily'
--                 WHEN entry_type = 'fault_report' THEN 'incident'
--                 WHEN entry_type = 'operation' THEN 'operation'
--                 ELSE 'maintenance'
--             END,
--             entry_date,
--             entry_time,
--             operator_id,
--             COALESCE(fault_title, notes, 'Imported record'),
--             notes,
--             fault_description,
--             COALESCE(severity, 'info'),
--             'completed',
--             operating_hours,
--             daily_checks,
--             created_at
--         FROM logbook_entries;
--     END IF;
-- END $$;

-- 3. Vytvoření testovacích dat
INSERT INTO crane_records (
    equipment_id, record_category, record_type, record_date, 
    inspector_id, title, description, status, result, severity
) VALUES
-- Pro první jeřáb (ID 1)
(1, 'control', 'daily', CURRENT_DATE, 4, 'Denní kontrola', 'Rutinní kontrola před zahájením práce', 'completed', 'passed', 'info'),
(1, 'control', 'weekly', CURRENT_DATE - 2, 4, 'Týdenní kontrola', 'Rozšířená kontrola všech systémů', 'completed', 'passed', 'info'),
(1, 'control', 'monthly', CURRENT_DATE - 15, 2, 'Měsíční kontrola', 'Technická kontrola od odborného technika', 'completed', 'passed_with_remarks', 'low'),
(1, 'revision', 'post_montage', CURRENT_DATE - 180, 2, 'Revize po montáži', 'Revize dle NV 193/2022', 'completed', 'passed', 'info'),
-- Pro druhý jeřáb (pokud existuje)
(COALESCE((SELECT id FROM equipment WHERE id = 2 LIMIT 1), 1), 'control', 'daily', CURRENT_DATE - 1, 4, 'Denní kontrola', 'Kontrola ze včera', 'completed', 'passed', 'info');

-- 4. Indexy pro výkon
CREATE INDEX IF NOT EXISTS idx_crane_records_equipment_date ON crane_records(equipment_id, record_date);
CREATE INDEX IF NOT EXISTS idx_crane_records_type ON crane_records(record_category, record_type);
CREATE INDEX IF NOT EXISTS idx_crane_records_status ON crane_records(status);
CREATE INDEX IF NOT EXISTS idx_crane_records_due_date ON crane_records(due_date);
CREATE INDEX IF NOT EXISTS idx_crane_records_inspector ON crane_records(inspector_id);

COMMIT;

-- Informace o migraci
SELECT 'Migration 004 completed: crane_records table created with test data' AS status;