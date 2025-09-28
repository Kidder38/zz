-- Views a funkce pro projekty a přiřazování jeřábů
-- Datum: 2024-01-25

-- View pro přehled projektů s počtem přiřazených jeřábů
CREATE OR REPLACE VIEW projects_overview AS
SELECT 
    p.*,
    COUNT(pe.equipment_id) FILTER (WHERE pe.actual_removal_date IS NULL) as active_equipment_count,
    COUNT(pe.equipment_id) as total_equipment_assignments,
    ARRAY_AGG(
        CASE 
            WHEN pe.actual_removal_date IS NULL 
            THEN jsonb_build_object(
                'equipment_id', pe.equipment_id,
                'operator_id', pe.operator_id,
                'assigned_date', pe.assigned_date,
                'planned_removal_date', pe.planned_removal_date
            )
            ELSE NULL
        END
    ) FILTER (WHERE pe.actual_removal_date IS NULL) as active_equipment
FROM projects p
LEFT JOIN project_equipment pe ON p.id = pe.project_id
GROUP BY p.id, p.name, p.project_number, p.client, p.status, p.priority,
         p.address, p.gps_latitude, p.gps_longitude, p.start_date, 
         p.planned_end_date, p.actual_end_date, p.project_manager,
         p.site_manager, p.client_contact, p.client_phone,
         p.description, p.special_requirements, p.created_at, 
         p.updated_at, p.created_by, p.updated_by;

-- View pro detail projektů s úplnými informacemi o jeřábech
CREATE OR REPLACE VIEW project_details AS
SELECT 
    p.*,
    pe.equipment_id,
    e.manufacturer,
    e.model,
    e.serial_number,
    e.equipment_type,
    pe.assigned_date,
    pe.planned_removal_date,
    pe.actual_removal_date,
    pe.operator_id,
    u.first_name || ' ' || u.last_name as operator_name,
    pe.operating_hours_start,
    pe.operating_hours_end,
    pe.notes as equipment_notes,
    pe.removal_reason
FROM projects p
LEFT JOIN project_equipment pe ON p.id = pe.project_id
LEFT JOIN equipment e ON pe.equipment_id = e.id
LEFT JOIN users u ON pe.operator_id = u.id;

-- View pro dostupné jeřáby (nejsou přiřazené k aktivním projektům)
CREATE OR REPLACE VIEW available_equipment AS
SELECT 
    e.*,
    CASE 
        WHEN pe.equipment_id IS NOT NULL THEN 'assigned'
        ELSE 'available'
    END as availability_status,
    p.name as assigned_project_name,
    p.project_number as assigned_project_number
FROM equipment e
LEFT JOIN project_equipment pe ON e.id = pe.equipment_id 
    AND pe.actual_removal_date IS NULL
LEFT JOIN projects p ON pe.project_id = p.id
WHERE pe.equipment_id IS NULL OR p.status IN ('completed', 'cancelled');

-- Funkce pro přiřazení jeřábu k projektu
CREATE OR REPLACE FUNCTION assign_equipment_to_project(
    p_project_id INTEGER,
    p_equipment_id INTEGER,
    p_assigned_date DATE,
    p_planned_removal_date DATE DEFAULT NULL,
    p_operator_id INTEGER DEFAULT NULL,
    p_operating_hours_start DECIMAL DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_created_by INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    assignment_id INTEGER;
    existing_assignment_id INTEGER;
BEGIN
    -- Kontrola, zda jeřáb není už přiřazen k jinému aktivnímu projektu
    SELECT pe.id INTO existing_assignment_id
    FROM project_equipment pe
    JOIN projects pr ON pe.project_id = pr.id
    WHERE pe.equipment_id = p_equipment_id 
      AND pe.actual_removal_date IS NULL
      AND pr.status IN ('planned', 'active', 'on_hold')
      AND pe.project_id != p_project_id;
    
    IF existing_assignment_id IS NOT NULL THEN
        RAISE EXCEPTION 'Jeřáb ID % je již přiřazen k jinému aktivnímu projektu', p_equipment_id;
    END IF;
    
    -- Vložení nového přiřazení
    INSERT INTO project_equipment (
        project_id, equipment_id, assigned_date, planned_removal_date,
        operator_id, operating_hours_start, notes, created_by
    ) VALUES (
        p_project_id, p_equipment_id, p_assigned_date, p_planned_removal_date,
        p_operator_id, p_operating_hours_start, p_notes, p_created_by
    ) RETURNING id INTO assignment_id;
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql;

-- Funkce pro odebrání jeřábu z projektu
CREATE OR REPLACE FUNCTION remove_equipment_from_project(
    p_project_id INTEGER,
    p_equipment_id INTEGER,
    p_removal_date DATE DEFAULT CURRENT_DATE,
    p_removal_reason VARCHAR DEFAULT NULL,
    p_operating_hours_end DECIMAL DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE project_equipment 
    SET 
        actual_removal_date = p_removal_date,
        removal_reason = p_removal_reason,
        operating_hours_end = p_operating_hours_end,
        updated_at = CURRENT_TIMESTAMP
    WHERE project_id = p_project_id 
      AND equipment_id = p_equipment_id 
      AND actual_removal_date IS NULL;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- Funkce pro získání historie jeřábu napříč projekty
CREATE OR REPLACE FUNCTION get_equipment_project_history(p_equipment_id INTEGER)
RETURNS TABLE (
    project_id INTEGER,
    project_name VARCHAR,
    project_number VARCHAR,
    assigned_date DATE,
    planned_removal_date DATE,
    actual_removal_date DATE,
    operating_hours_start DECIMAL,
    operating_hours_end DECIMAL,
    operator_name TEXT,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.project_number,
        pe.assigned_date,
        pe.planned_removal_date,
        pe.actual_removal_date,
        pe.operating_hours_start,
        pe.operating_hours_end,
        u.first_name || ' ' || u.last_name,
        pe.notes
    FROM project_equipment pe
    JOIN projects p ON pe.project_id = p.id
    LEFT JOIN users u ON pe.operator_id = u.id
    WHERE pe.equipment_id = p_equipment_id
    ORDER BY pe.assigned_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Funkce pro statistiky projektu
CREATE OR REPLACE FUNCTION get_project_statistics(p_project_id INTEGER)
RETURNS TABLE (
    total_equipment INTEGER,
    active_equipment INTEGER,
    completed_assignments INTEGER,
    total_operating_hours DECIMAL,
    average_assignment_duration INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_equipment,
        COUNT(*) FILTER (WHERE actual_removal_date IS NULL)::INTEGER as active_equipment,
        COUNT(*) FILTER (WHERE actual_removal_date IS NOT NULL)::INTEGER as completed_assignments,
        COALESCE(SUM(operating_hours_end - operating_hours_start), 0) as total_operating_hours,
        AVG(actual_removal_date - assigned_date) FILTER (WHERE actual_removal_date IS NOT NULL) as average_assignment_duration
    FROM project_equipment
    WHERE project_id = p_project_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pro kontrolu překrývajících se přiřazení
CREATE OR REPLACE FUNCTION check_equipment_assignment_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- Kontrola při INSERT nebo UPDATE
    IF EXISTS (
        SELECT 1 FROM project_equipment pe
        JOIN projects p ON pe.project_id = p.id
        WHERE pe.equipment_id = NEW.equipment_id
          AND pe.actual_removal_date IS NULL
          AND p.status IN ('planned', 'active', 'on_hold')
          AND pe.id != COALESCE(NEW.id, -1)
    ) THEN
        RAISE EXCEPTION 'Jeřáb ID % je již přiřazen k jinému aktivnímu projektu', NEW.equipment_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_equipment_assignment
    BEFORE INSERT OR UPDATE ON project_equipment
    FOR EACH ROW
    EXECUTE FUNCTION check_equipment_assignment_overlap();

-- Komentáře pro dokumentaci
COMMENT ON VIEW projects_overview IS 'Přehled všech projektů s počtem přiřazených jeřábů';
COMMENT ON VIEW project_details IS 'Detailní informace o projektech včetně přiřazených jeřábů a operátorů';
COMMENT ON VIEW available_equipment IS 'Seznam dostupných jeřábů, které nejsou přiřazené k aktivním projektům';

COMMENT ON FUNCTION assign_equipment_to_project IS 'Bezpečné přiřazení jeřábu k projektu s kontrolou konfliktů';
COMMENT ON FUNCTION remove_equipment_from_project IS 'Odebrání jeřábu z projektu s aktualizací metadata';
COMMENT ON FUNCTION get_equipment_project_history IS 'Historie přiřazení jeřábu napříč všemi projekty';
COMMENT ON FUNCTION get_project_statistics IS 'Statistiky projektu - počty, hodiny, průměrné doby';