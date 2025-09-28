-- Migrační skript pro přidání IČ, DIČ a podporu více kontaktních osob

-- Přidání IČ a DIČ sloupců do tabulky customers
ALTER TABLE customers 
    ADD COLUMN ico VARCHAR(8),
    ADD COLUMN dic VARCHAR(12);

-- Vytvoření nové tabulky pro kontaktní osoby
CREATE TABLE contact_persons (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Přidání indexu pro rychlejší vyhledávání podle customer_id
CREATE INDEX idx_contact_persons_customer_id ON contact_persons(customer_id);

-- Vytvoření triggeru pro aktualizaci časového razítka
CREATE TRIGGER update_contact_persons_modtime
    BEFORE UPDATE ON contact_persons
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Migrace stávajících dat z kontaktních osob
INSERT INTO contact_persons (customer_id, name, email, phone)
SELECT id, contact_person, email, phone
FROM customers
WHERE contact_person IS NOT NULL AND contact_person != '';

-- Poznámka: Staré sloupce contact_person, email a phone zatím ponecháváme
-- v tabulce customers pro zpětnou kompatibilitu. Můžeme je odstranit později
-- až budou všechny části aplikace používat novou strukturu.