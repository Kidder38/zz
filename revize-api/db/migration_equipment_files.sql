-- Migrační skript pro přidání podpory souborů a fotografií k zařízení

-- Vytvoření nové tabulky pro soubory k zařízení
CREATE TABLE equipment_files (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'photo', 'datasheet', 'manual'
  file_size INTEGER,
  content_type VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Přidání triggeru pro aktualizaci časového razítka
CREATE TRIGGER update_equipment_files_modtime
    BEFORE UPDATE ON equipment_files
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
-- Vytvoření indexu pro equipment_id
CREATE INDEX idx_equipment_files_equipment_id ON equipment_files(equipment_id);