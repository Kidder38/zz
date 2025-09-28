-- Migration: Přenos dat z operators do users
BEGIN;

-- Migrujeme existující operátory jako uživatele s rolí 'operator'
INSERT INTO users (username, password_hash, first_name, last_name, operator_card_number, certification_valid_until, phone, email, is_operator, role, is_active)
SELECT 
    -- Vytvoříme username z jména a příjmení
    LOWER(REPLACE(first_name || '.' || last_name, ' ', '')) as username,
    '$2b$10$dummy.hash.for.testing' as password_hash, -- Dummy hash, operátoři si budou muset nastavit heslo
    first_name,
    last_name,
    operator_card_number,
    certification_valid_until,
    phone,
    email,
    TRUE as is_operator,
    'operator' as role,
    active as is_active
FROM operators
WHERE NOT EXISTS (
    -- Zkontrolujeme, jestli už náhodou neexistuje uživatel se stejným username
    SELECT 1 FROM users u WHERE u.username = LOWER(REPLACE(operators.first_name || '.' || operators.last_name, ' ', ''))
);

-- Přeneseme přiřazení operátorů k zařízení
INSERT INTO user_equipment_assignments (user_id, equipment_id, assigned_date)
SELECT 
    u.id as user_id,
    eo.equipment_id,
    eo.assigned_date
FROM equipment_operators eo
JOIN operators o ON eo.operator_id = o.id
JOIN users u ON u.username = LOWER(REPLACE(o.first_name || '.' || o.last_name, ' ', ''))
WHERE NOT EXISTS (
    SELECT 1 FROM user_equipment_assignments uea 
    WHERE uea.user_id = u.id AND uea.equipment_id = eo.equipment_id
);

-- Zobrazíme výsledek migrace
SELECT 
    'Migrace dokončena. Vytvořeno uživatelů:' as message, 
    COUNT(*) as count 
FROM users WHERE is_operator = TRUE;

SELECT 
    'Přeneseno přiřazení k zařízení:' as message, 
    COUNT(*) as count 
FROM user_equipment_assignments;

-- Po úspěšné migraci můžeme (později) přejmenovat operators tabulku
-- ALTER TABLE operators RENAME TO operators_backup;
-- ALTER TABLE equipment_operators RENAME TO equipment_operators_backup;

COMMIT;