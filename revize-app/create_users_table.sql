-- Vytvoření tabulky users pro autentizaci a sjednocení s operators
BEGIN;

-- Vytvoříme tabulku users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    is_active BOOLEAN DEFAULT TRUE,
    is_operator BOOLEAN DEFAULT FALSE,
    operator_card_number VARCHAR(50) UNIQUE,
    certification_valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Přidáme trigger pro update timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_column();

-- Vytvoříme výchozího admin uživatele
INSERT INTO users (username, password_hash, first_name, last_name, role, is_active)
VALUES ('admin', '$2b$10$dummy.hash.for.testing', 'Administrator', 'System', 'admin', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Vytvoříme tabulku pro přiřazení operátorů k zařízení
CREATE TABLE IF NOT EXISTS user_equipment_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, equipment_id)
);

COMMIT;