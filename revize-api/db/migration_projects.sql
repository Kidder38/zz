-- Migration pro správu staveb/projektů
-- Datum vytvoření: 2025-01-10

-- Tabulka pro stavby/projekty
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    project_number VARCHAR(100) UNIQUE NOT NULL,
    client VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled', 'on_hold')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Lokace stavby
    location_address TEXT NOT NULL,
    location_gps_latitude DECIMAL(10, 8),
    location_gps_longitude DECIMAL(11, 8),
    
    -- Časový plán
    start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_end_date DATE,
    
    -- Kontaktní údaje
    project_manager VARCHAR(255),
    site_manager VARCHAR(255),
    client_contact VARCHAR(255),
    client_phone VARCHAR(50),
    client_email VARCHAR(255),
    
    -- Popis a poznámky
    description TEXT,
    special_requirements TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabulka pro přiřazení jeřábů ke stavbám
CREATE TABLE IF NOT EXISTS project_equipment (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    
    -- Časové údaje přiřazení
    assigned_date DATE NOT NULL,
    planned_removal_date DATE,
    actual_removal_date DATE,
    
    -- Stav přiřazení
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'cancelled')),
    
    -- Přiřazený operátor
    operator_id INTEGER REFERENCES users(id),
    operator_name VARCHAR(255), -- Pro případ, kdy operátor není v systému
    
    -- Poznámky
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unikátní kombinace - jedno zařízení může být současně jen na jedné aktivní stavbě
    UNIQUE(equipment_id, project_id)
);

-- Indexy pro lepší výkon
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client);
CREATE INDEX idx_projects_dates ON projects(start_date, planned_end_date);
CREATE INDEX idx_project_equipment_project ON project_equipment(project_id);
CREATE INDEX idx_project_equipment_equipment ON project_equipment(equipment_id);
CREATE INDEX idx_project_equipment_status ON project_equipment(status);

-- Trigger pro aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_equipment_updated_at 
    BEFORE UPDATE ON project_equipment 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Vložit testovací data
INSERT INTO projects (
    name, project_number, client, status, priority,
    location_address, location_gps_latitude, location_gps_longitude,
    start_date, planned_end_date,
    project_manager, site_manager, client_contact, client_phone,
    description, special_requirements
) VALUES 
(
    'Wenceslas Square Development',
    'WSD-2024-001',
    'Praha Development s.r.o.',
    'active',
    'high',
    'Václavské náměstí, Praha 1',
    50.0813,
    14.4306,
    '2024-01-15',
    '2024-06-30',
    'Ing. Pavel Stavitel',
    'Petr Stavební',
    'Jan Investor',
    '+420 602 111 222',
    'Výstavba nového obchodního centra v centru Prahy',
    'Práce pouze v pracovní dny 7:00-17:00'
),
(
    'Brno Central Plaza',
    'BCP-2024-002',
    'Moravská stavební a.s.',
    'active',
    'medium',
    'Moravské náměstí, Brno',
    49.1951,
    16.6068,
    '2024-03-01',
    '2024-08-15',
    'Ing. Marie Projektová',
    'Pavel Brněnský',
    'Karel Moravec',
    '+420 605 333 444',
    'Rekonstrukce historického centra města',
    'Ochrana památkových objektů'
),
(
    'Residential Complex Vinohrady',
    'RCV-2024-003',
    'Vinohrady Invest s.r.o.',
    'planned',
    'low',
    'Vinohradská 150, Praha 2',
    50.0755,
    14.4378,
    '2024-07-01',
    '2024-12-31',
    'Ing. Tomáš Planner',
    NULL,
    'Anna Vinohradská',
    '+420 608 555 666',
    'Výstavba rezidenčního komplexu s 120 byty',
    'Minimalizace hluku pro okolní obyvatele'
);

-- Přiřadit jeřáby ke stavbám (pokud existují)
-- Toto je volitelné - závisí na tom, jaká zařízení máte v databázi
INSERT INTO project_equipment (
    project_id, equipment_id, assigned_date, planned_removal_date, status, operator_name, notes
) 
SELECT 1, e.id, '2024-01-15', '2024-06-30', 'active', 'Jan Novák', 'Jeřáb úspěšně nasazen na stavbu'
FROM equipment e 
WHERE e.equipment_type = 'Věžový jeřáb' 
LIMIT 1;

INSERT INTO project_equipment (
    project_id, equipment_id, assigned_date, planned_removal_date, status, operator_name, notes
) 
SELECT 2, e.id, '2024-03-01', '2024-08-15', 'active', 'Marie Projektová', 'Jeřáb pro centrum města'
FROM equipment e 
WHERE e.equipment_type = 'Věžový jeřáb' 
AND e.id NOT IN (SELECT equipment_id FROM project_equipment WHERE status = 'active')
LIMIT 1;

COMMIT;