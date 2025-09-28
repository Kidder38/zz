-- Migrace 006: Vytvoření tabulek pro stavby/projekty
-- Datum: 2024-01-25
-- Popis: Implementace nové logiky staveb a přiřazování jeřábů

-- Vytvoření tabulky pro stavby/projekty
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    
    -- Základní informace
    name VARCHAR(255) NOT NULL,
    project_number VARCHAR(100) UNIQUE,
    client VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Lokace stavby
    address TEXT NOT NULL,
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    
    -- Harmonogram
    start_date DATE NOT NULL,
    planned_end_date DATE,
    actual_end_date DATE,
    
    -- Kontaktní údaje
    project_manager VARCHAR(255) NOT NULL,
    site_manager VARCHAR(255),
    client_contact VARCHAR(255),
    client_phone VARCHAR(50),
    
    -- Popis a požadavky
    description TEXT,
    special_requirements TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Vytvoření tabulky pro přiřazení jeřábů ke stavbám
CREATE TABLE IF NOT EXISTS project_equipment (
    id SERIAL PRIMARY KEY,
    
    -- Vazby
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    
    -- Časové údaje
    assigned_date DATE NOT NULL,
    planned_removal_date DATE,
    actual_removal_date DATE,
    
    -- Přiřazený operátor
    operator_id INTEGER REFERENCES users(id),
    
    -- Provozní údaje
    operating_hours_start DECIMAL(10, 2),
    operating_hours_end DECIMAL(10, 2),
    
    -- Poznámky a důvody
    notes TEXT,
    removal_reason VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    
    -- Zajištění jedinečnosti - jeden jeřáb může být současně přiřazen pouze k jednomu aktivnímu projektu
    UNIQUE(equipment_id, project_id) DEFERRABLE INITIALLY DEFERRED
);

-- Vytvoření indexů pro optimalizaci
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_project_equipment_project ON project_equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_project_equipment_equipment ON project_equipment(equipment_id);
CREATE INDEX IF NOT EXISTS idx_project_equipment_dates ON project_equipment(assigned_date, actual_removal_date);
CREATE INDEX IF NOT EXISTS idx_project_equipment_operator ON project_equipment(operator_id);

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();

CREATE TRIGGER trigger_project_equipment_updated_at
    BEFORE UPDATE ON project_equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();

-- Constraint pro zajištění logických dat
ALTER TABLE project_equipment 
ADD CONSTRAINT check_removal_date 
CHECK (actual_removal_date IS NULL OR actual_removal_date >= assigned_date);

ALTER TABLE projects 
ADD CONSTRAINT check_project_dates 
CHECK (actual_end_date IS NULL OR actual_end_date >= start_date);

-- Komentáře pro dokumentaci
COMMENT ON TABLE projects IS 'Tabulka pro stavby/projekty - hlavní entita pro přiřazování jeřábů';
COMMENT ON TABLE project_equipment IS 'Přiřazení jeřábů ke stavbám s časovou historií';

COMMENT ON COLUMN projects.status IS 'Stav projektu: planned, active, on_hold, completed, cancelled';
COMMENT ON COLUMN projects.priority IS 'Priorita projektu: low, medium, high, urgent';
COMMENT ON COLUMN project_equipment.actual_removal_date IS 'NULL = jeřáb je stále přiřazen, datum = byl odebrán';
COMMENT ON COLUMN project_equipment.removal_reason IS 'Důvod odebrání jeřábu ze stavby';

-- Vložení ukázkových dat
INSERT INTO projects (
    name, project_number, client, status, priority,
    address, gps_latitude, gps_longitude,
    start_date, planned_end_date,
    project_manager, site_manager, client_contact, client_phone,
    description, special_requirements,
    created_by
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
    'Práce pouze v pracovní dny 7:00-17:00',
    1
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
    'Ochrana památkových objektů',
    1
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
    'Minimalizace hluku pro okolní obyvatele',
    1
) ON CONFLICT DO NOTHING;

-- Přiřazení jeřábů ke stavbám (na základě stávajících mock dat)
INSERT INTO project_equipment (
    project_id, equipment_id, assigned_date, planned_removal_date,
    operator_id, operating_hours_start, notes, created_by
) VALUES 
(
    1, 1, '2024-01-15', '2024-06-30',
    (SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1),
    1156.0,
    'Montáž proběhla bez komplikací, revize úspěšná',
    1
),
(
    2, 2, '2024-03-01', '2024-08-15',
    (SELECT id FROM users WHERE email = 'marie.projektova@example.com' LIMIT 1),
    856.2,
    'Speciální požadavky na ochranu památek',
    1
) ON CONFLICT DO NOTHING;