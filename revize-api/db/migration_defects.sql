-- Migrační skript pro vytvoření tabulky defects (závady)

-- Vytvoření tabulky pro evidenci závad
CREATE TABLE defects (
  id SERIAL PRIMARY KEY,
  revision_id INTEGER REFERENCES revisions(id) ON DELETE CASCADE,
  section VARCHAR(50) NOT NULL, -- Sekce, ve které se závada nachází (documentation_check, equipment_check, ...)
  item_key VARCHAR(100) NOT NULL, -- Klíč položky, u které byla závada zjištěna
  item_name VARCHAR(255), -- Název položky v čitelné podobě
  description TEXT NOT NULL, -- Popis závady
  severity VARCHAR(50), -- Závažnost závady (low, medium, high)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vytvoření indexu pro rychlejší vyhledávání
CREATE INDEX idx_defects_revision_id ON defects(revision_id);

-- Vytvoření triggeru pro aktualizaci času změny
CREATE TRIGGER update_defects_modtime
  BEFORE UPDATE ON defects
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();