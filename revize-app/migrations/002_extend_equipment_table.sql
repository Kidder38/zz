-- Migrace 002: Rozšíření tabulky equipment o stavy a umístění
-- ========================================================
-- Přidává sledování aktuálního stavu a umístění jeřábu

BEGIN;

-- 1. Rozšíření tabulky equipment
ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS current_status VARCHAR(20) DEFAULT 'stored',
ADD COLUMN IF NOT EXISTS current_location_id INTEGER REFERENCES locations(id),
ADD COLUMN IF NOT EXISTS total_operating_hours DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_revision_date DATE,
ADD COLUMN IF NOT EXISTS next_revision_due DATE,
ADD COLUMN IF NOT EXISTS revision_interval_months INTEGER DEFAULT 24;

-- 2. Kontrola stavů jeřábu
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'equipment_status_check'
    ) THEN
        ALTER TABLE equipment ADD CONSTRAINT equipment_status_check 
        CHECK (current_status IN ('stored', 'in_transport', 'mounting', 'operational', 'dismounting', 'maintenance', 'retired'));
    END IF;
END $$;

-- 3. Aktualizace stávajících zařízení s výchozími hodnotami
UPDATE equipment 
SET 
    current_status = 'operational',
    current_location_id = (SELECT id FROM locations WHERE location_type = 'construction_site' LIMIT 1),
    next_revision_due = CURRENT_DATE + INTERVAL '24 months'
WHERE current_status IS NULL OR current_status = 'stored';

-- 4. Index pro výkon
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(current_status);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(current_location_id);
CREATE INDEX IF NOT EXISTS idx_equipment_revision_due ON equipment(next_revision_due);

COMMIT;

-- Informace o migraci
SELECT 'Migration 002 completed: equipment table extended' AS status;