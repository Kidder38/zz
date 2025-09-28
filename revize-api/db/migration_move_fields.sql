-- Migrační skript pro přesun polí z tabulky equipment do tabulky revisions

-- Přidání nových sloupců do tabulky revisions
ALTER TABLE revisions 
    ADD COLUMN min_reach NUMERIC,
    ADD COLUMN max_reach NUMERIC,
    ADD COLUMN lift_height NUMERIC,
    ADD COLUMN location VARCHAR(255);

-- Odebrání sloupců z tabulky equipment
ALTER TABLE equipment 
    DROP COLUMN min_reach,
    DROP COLUMN max_reach,
    DROP COLUMN lift_height,
    DROP COLUMN location;