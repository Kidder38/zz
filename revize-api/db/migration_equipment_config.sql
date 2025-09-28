-- Migrační skript pro přidání konfiguračních hodnot zařízení a přesun umístění do revizí

-- Vytvoření nové tabulky pro konfigurační hodnoty zařízení
CREATE TABLE equipment_configurations (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    min_reach NUMERIC,
    max_reach NUMERIC,
    lift_height NUMERIC,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Přidání triggeru pro aktualizaci časového razítka
CREATE TRIGGER update_equipment_configurations_modtime
    BEFORE UPDATE ON equipment_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
-- Vytvoření indexu pro equipment_id
CREATE INDEX idx_equipment_configurations_equipment_id ON equipment_configurations(equipment_id);

-- Přesun umístění do revizí
ALTER TABLE revisions ADD COLUMN location VARCHAR(255);

-- Přesun existujících dat o umístění do revizí (pro každou revizi použijeme umístění ze zařízení)
UPDATE revisions r
SET location = e.location
FROM equipment e
WHERE r.equipment_id = e.id AND e.location IS NOT NULL;

-- Přesun dat o vyložení a výšce zdvihu do nové tabulky
INSERT INTO equipment_configurations (equipment_id, min_reach, max_reach, lift_height, description)
SELECT 
    id AS equipment_id,
    min_reach,
    max_reach,
    lift_height,
    'Převedeno z původních dat' AS description
FROM equipment
WHERE min_reach IS NOT NULL OR max_reach IS NOT NULL OR lift_height IS NOT NULL;

-- Odstranění původních sloupců z tabulky equipment
ALTER TABLE equipment 
    DROP COLUMN location,
    DROP COLUMN min_reach,
    DROP COLUMN max_reach,
    DROP COLUMN lift_height;