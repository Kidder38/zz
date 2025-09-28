-- Migrační skript pro přidání podpory souborů k servisním výjezdům

-- Vytvoření nové tabulky pro soubory k servisním výjezdům
CREATE TABLE service_files (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES service_visits(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER,
  content_type VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Přidání triggeru pro aktualizaci časového razítka
CREATE TRIGGER update_service_files_modtime
    BEFORE UPDATE ON service_files
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
-- Vytvoření indexu pro service_id
CREATE INDEX idx_service_files_service_id ON service_files(service_id);

-- Vytvoření adresáře pro ukládání souborů servisních výjezdů (vykonáno manuálně)
-- V middleware/fileUpload.js bude přidán adresář ./uploads/services