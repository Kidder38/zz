-- Kompletní schéma pro řízení životního cyklu jeřábu podle NV 193/2022
-- =================================================================

-- Rozšířená tabulka pro všechny typy kontrol a revizí
CREATE TABLE crane_records (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) NOT NULL,
    
    -- Klasifikace záznamu
    record_category VARCHAR(20) NOT NULL, -- 'montage', 'revision', 'control', 'maintenance', 'incident'
    record_type VARCHAR(30) NOT NULL,     -- 'daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'post_montage', 'periodic_revision'
    control_period VARCHAR(20),           -- 'daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual'
    
    -- Časové údaje
    record_date DATE NOT NULL,
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
    
    -- Indexy pro výkon
    CONSTRAINT valid_category CHECK (record_category IN ('montage', 'revision', 'control', 'maintenance', 'incident')),
    CONSTRAINT valid_status CHECK (status IN ('planned', 'in_progress', 'completed', 'overdue', 'failed')),
    CONSTRAINT valid_result CHECK (result IN ('passed', 'passed_with_remarks', 'failed', 'not_applicable'))
);

-- Tabulka pro definici periodicity kontrol podle typu jeřábu
CREATE TABLE control_schedule_templates (
    id SERIAL PRIMARY KEY,
    equipment_type VARCHAR(50) NOT NULL,
    control_type VARCHAR(30) NOT NULL,
    period_days INTEGER NOT NULL,           -- Periodicita ve dnech
    required_qualification VARCHAR(30),     -- Požadovaná kvalifikace
    is_mandatory BOOLEAN DEFAULT TRUE,
    checklist_template JSONB,              -- Šablona kontrolního seznamu
    description TEXT,
    
    UNIQUE(equipment_type, control_type)
);

-- Tabulka pro automatické generování plánu kontrol
CREATE TABLE control_schedule (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id),
    control_type VARCHAR(30) NOT NULL,
    scheduled_date DATE NOT NULL,
    assigned_to INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'scheduled',  -- 'scheduled', 'completed', 'overdue', 'cancelled'
    record_id INTEGER REFERENCES crane_records(id), -- Po dokončení se propojí
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(equipment_id, control_type, scheduled_date)
);

-- Indexy pro výkon
CREATE INDEX idx_crane_records_equipment_date ON crane_records(equipment_id, record_date);
CREATE INDEX idx_crane_records_type ON crane_records(record_category, record_type);
CREATE INDEX idx_crane_records_status ON crane_records(status);
CREATE INDEX idx_crane_records_due_date ON crane_records(due_date);
CREATE INDEX idx_control_schedule_equipment ON control_schedule(equipment_id, scheduled_date);

-- Funkce pro automatické generování následující kontroly
CREATE OR REPLACE FUNCTION generate_next_control()
RETURNS TRIGGER AS $$
BEGIN
    -- Pokud je kontrola dokončena úspěšně, naplánuj následující
    IF NEW.status = 'completed' AND NEW.result IN ('passed', 'passed_with_remarks') THEN
        INSERT INTO control_schedule (equipment_id, control_type, scheduled_date)
        SELECT 
            NEW.equipment_id,
            NEW.record_type,
            NEW.record_date + INTERVAL '1 day' * cst.period_days
        FROM control_schedule_templates cst
        WHERE cst.control_type = NEW.record_type
        ON CONFLICT (equipment_id, control_type, scheduled_date) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pro automatické generování kontrol
CREATE TRIGGER trigger_generate_next_control
    AFTER UPDATE ON crane_records
    FOR EACH ROW
    EXECUTE FUNCTION generate_next_control();