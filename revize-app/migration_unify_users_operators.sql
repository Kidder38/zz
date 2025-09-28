-- Migration: Sjednocení uživatelů a obsluhy
-- Datum: 2025-08-21
-- Popis: Rozšíření users tabulky o pole z operators tabulky

BEGIN;

-- 1. Přidáme nová pole do users tabulky
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100),
ADD COLUMN last_name VARCHAR(100),
ADD COLUMN operator_card_number VARCHAR(50) UNIQUE,
ADD COLUMN certification_valid_until DATE,
ADD COLUMN phone VARCHAR(20),
ADD COLUMN email VARCHAR(255),
ADD COLUMN is_operator BOOLEAN DEFAULT FALSE;

-- 2. Vytvoříme novou roli 'operator'
-- (toto závisí na tom, jak jsou role implementované v systému)

-- 3. Migrujeme data z operators do users
-- Pro každého operátora vytvoříme uživatelský účet
INSERT INTO users (username, first_name, last_name, operator_card_number, certification_valid_until, phone, email, is_operator, role)
SELECT 
    LOWER(first_name || '.' || last_name) as username, -- username z jména
    first_name,
    last_name,
    operator_card_number,
    certification_valid_until,
    phone,
    email,
    TRUE as is_operator,
    'operator' as role
FROM operators
WHERE NOT EXISTS (
    -- Zkontrolujeme, jestli už náhodou neexistuje uživatel se stejným jménem
    SELECT 1 FROM users u WHERE u.username = LOWER(operators.first_name || '.' || operators.last_name)
);

-- 4. Vytvoříme mapovací tabulku pro zachování vztahů se zařízením
CREATE TABLE IF NOT EXISTS user_equipment_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, equipment_id)
);

-- 5. Migrujeme přiřazení zařízení
-- Nejdříve musíme najít způsob, jak jsou uložena přiřazení v operators tabulce
-- (toto bude potřeba upravit podle skutečné struktury)

-- 6. Po úspěšné migraci můžeme operators tabulku přejmenovat nebo smazat
-- POZOR: Nejdříve otestovat!
-- ALTER TABLE operators RENAME TO operators_backup;

COMMIT;

-- Pro rollback:
-- BEGIN;
-- ALTER TABLE users 
-- DROP COLUMN first_name,
-- DROP COLUMN last_name,
-- DROP COLUMN operator_card_number,
-- DROP COLUMN certification_valid_until,
-- DROP COLUMN phone,
-- DROP COLUMN email,
-- DROP COLUMN is_operator;
-- DROP TABLE user_equipment_assignments;
-- DELETE FROM users WHERE role = 'operator';
-- COMMIT;