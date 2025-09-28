-- Migration to create logbook system according to ČSN EN 12480-1

-- Create operators table
CREATE TABLE operators (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    operator_card_number VARCHAR(50) UNIQUE,
    certification_valid_until DATE,
    phone VARCHAR(20),
    email VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create equipment_operators junction table (many-to-many relationship)
CREATE TABLE equipment_operators (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(equipment_id, operator_id)
);

-- Create logbook entries table
CREATE TABLE logbook_entries (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    entry_time TIME NOT NULL DEFAULT CURRENT_TIME,
    entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN ('daily_check', 'operation', 'maintenance', 'fault_report', 'incident')),
    shift VARCHAR(20),
    operating_hours NUMERIC(6,1),
    weather_conditions VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create daily_checks table (normalized checklist results)
CREATE TABLE daily_checks (
    id SERIAL PRIMARY KEY,
    logbook_entry_id INTEGER REFERENCES logbook_entries(id) ON DELETE CASCADE,
    check_category VARCHAR(50) NOT NULL, -- visual, functional, safety, documentation
    check_item VARCHAR(100) NOT NULL,
    check_result VARCHAR(20) NOT NULL CHECK (check_result IN ('ok', 'defect', 'not_applicable', 'not_checked')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fault_reports table
CREATE TABLE fault_reports (
    id SERIAL PRIMARY KEY,
    logbook_entry_id INTEGER REFERENCES logbook_entries(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    fault_type VARCHAR(50) NOT NULL CHECK (fault_type IN ('mechanical', 'electrical', 'safety', 'structural', 'operational')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    immediate_action TEXT,
    equipment_stopped BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_date TIMESTAMP,
    resolved_by VARCHAR(255),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create operation_records table (detailed operating records)
CREATE TABLE operation_records (
    id SERIAL PRIMARY KEY,
    logbook_entry_id INTEGER REFERENCES logbook_entries(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME,
    load_description VARCHAR(255),
    max_load_used NUMERIC(8,2),
    cycles_count INTEGER,
    unusual_loads BOOLEAN DEFAULT FALSE,
    unusual_loads_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create checklist templates (predefined checklists according to ČSN EN 12480-1)
CREATE TABLE checklist_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- daily, weekly, monthly, pre_operation
    equipment_type VARCHAR(50), -- can be NULL for general checklists
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create checklist template items
CREATE TABLE checklist_template_items (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES checklist_templates(id) ON DELETE CASCADE,
    item_text VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- visual, functional, safety, documentation
    order_index INTEGER NOT NULL,
    required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_logbook_entries_equipment_date ON logbook_entries(equipment_id, entry_date);
CREATE INDEX idx_logbook_entries_operator ON logbook_entries(operator_id);
CREATE INDEX idx_logbook_entries_type ON logbook_entries(entry_type);
CREATE INDEX idx_fault_reports_equipment ON fault_reports(equipment_id);
CREATE INDEX idx_fault_reports_severity ON fault_reports(severity);
CREATE INDEX idx_fault_reports_resolved ON fault_reports(resolved);
CREATE INDEX idx_daily_checks_logbook ON daily_checks(logbook_entry_id);
CREATE INDEX idx_equipment_operators_equipment ON equipment_operators(equipment_id);
CREATE INDEX idx_equipment_operators_operator ON equipment_operators(operator_id);

-- Add triggers for updating timestamps
CREATE TRIGGER update_operators_modtime
    BEFORE UPDATE ON operators
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_logbook_entries_modtime
    BEFORE UPDATE ON logbook_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_fault_reports_modtime
    BEFORE UPDATE ON fault_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Add comments for documentation
COMMENT ON TABLE operators IS 'Equipment operators with certifications';
COMMENT ON TABLE equipment_operators IS 'Assignment of operators to equipment';
COMMENT ON TABLE logbook_entries IS 'Main logbook entries according to ČSN EN 12480-1';
COMMENT ON TABLE daily_checks IS 'Daily inspection checklist results';
COMMENT ON TABLE fault_reports IS 'Fault and defect reports';
COMMENT ON TABLE operation_records IS 'Detailed operation records';
COMMENT ON TABLE checklist_templates IS 'Predefined inspection checklists';
COMMENT ON TABLE checklist_template_items IS 'Items in checklist templates';

-- Insert default daily checklist template for cranes according to ČSN EN 12480-1
INSERT INTO checklist_templates (name, category, equipment_type) VALUES 
('Denní kontrola jeřábu', 'daily', 'jerab');

-- Get the template ID for inserting items
-- Insert daily checklist items according to ČSN EN 12480-1
INSERT INTO checklist_template_items (template_id, item_text, category, order_index, required) VALUES 
(1, 'Vizuální kontrola nosné konstrukce (praskliny, deformace)', 'visual', 1, true),
(1, 'Kontrola svarů a spojů', 'visual', 2, true),
(1, 'Stav lan a řetězů', 'visual', 3, true),
(1, 'Kontrola háků a závěsných prostředků', 'visual', 4, true),
(1, 'Stav kolejnic a pojezdů', 'visual', 5, true),
(1, 'Funkce všech ovládacích prvků', 'functional', 6, true),
(1, 'Funkce brzd a pojistek', 'functional', 7, true),
(1, 'Zkouška nouzového zastavení', 'functional', 8, true),
(1, 'Funkce koncových spínačů', 'functional', 9, true),
(1, 'Funkce signalizace a výstražných zařízení', 'functional', 10, true),
(1, 'Funkce omezovače nosnosti', 'safety', 11, true),
(1, 'Dostupnost a čitelnost návodu k obsluze', 'documentation', 12, true),
(1, 'Provedení zápisů v provozním deníku', 'documentation', 13, true);