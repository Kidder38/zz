-- Aktualizace admin hesla
-- Poznámka: Toto je pouze pro testovací účely!

BEGIN;

-- Pro testovací účely použijeme známý bcrypt hash pro heslo "admin"
-- Hash pro heslo "admin": $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
UPDATE users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'admin';

-- Ověřme aktualizaci
SELECT username, first_name, last_name, role, is_active 
FROM users 
WHERE username = 'admin';

COMMIT;