-- Rozšířené schéma pro mobilní jeřáby s mont./demont. cykly
-- ========================================================

-- 1. Rozšíření tabulky equipment o stavy a umístění
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS current_status VARCHAR(20) DEFAULT 'stored';
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS current_location_id INTEGER;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS total_operating_hours DECIMAL(10,2) DEFAULT 0;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS last_revision_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS next_revision_due DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS revision_interval_months INTEGER DEFAULT 24;

-- Kontrola stavů jeřábu
ALTER TABLE equipment ADD CONSTRAINT equipment_status_check 
CHECK (current_status IN ('stored', 'in_transport', 'mounting', 'operational', 'dismounting', 'maintenance', 'retired'));

-- 2. Tabulka umístění/staveb
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(200) NOT NULL,
    location_type VARCHAR(50) NOT NULL, -- 'construction_site', 'warehouse', 'workshop', 'transport'
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(50) DEFAULT 'CZ',
    gps_coordinates POINT,
    contact_person VARCHAR(200),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    
    -- Aktivní období
    active_from DATE,
    active_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT location_type_check CHECK (location_type IN ('construction_site', 'warehouse', 'workshop', 'transport'))
);

-- 3. Historie umístění jeřábu (klíčová pro notifikace!)
CREATE TABLE equipment_location_history (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) NOT NULL,
    location_id INTEGER REFERENCES locations(id) NOT NULL,
    
    -- Časové období na lokaci
    installed_date DATE NOT NULL,
    planned_removal_date DATE,
    actual_removal_date DATE,
    
    -- Stav jeřábu v tomto období
    status_on_arrival VARCHAR(20) NOT NULL,
    status_on_departure VARCHAR(20),
    
    -- Důležité pro notifikace - kdo je odpovědný
    responsible_person_id INTEGER REFERENCES users(id),
    site_manager_id INTEGER REFERENCES users(id),
    
    -- Montážní/demontážní údaje
    montage_completion_date DATE,
    revision_after_montage_date DATE,
    revision_before_demontage_date DATE,
    
    -- Provozní údaje pro toto umístění
    operating_hours_start DECIMAL(10,2),
    operating_hours_end DECIMAL(10,2),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ověření logiky dat
    CONSTRAINT logical_dates CHECK (
        installed_date <= COALESCE(planned_removal_date, installed_date) AND
        installed_date <= COALESCE(actual_removal_date, installed_date)
    )
);

-- 4. Rozšířená tabulka záznamů s vazbou na umístění
ALTER TABLE crane_records ADD COLUMN IF NOT EXISTS location_history_id INTEGER REFERENCES equipment_location_history(id);
ALTER TABLE crane_records ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES locations(id);

-- 5. Tabulka pro správu notifikací a upomínek
CREATE TABLE notification_rules (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id), -- NULL = pravidlo pro všechny jeřáby
    
    -- Typ upomínky
    notification_type VARCHAR(30) NOT NULL, -- 'control_due', 'revision_due', 'maintenance_due', 'certification_expiry'
    control_type VARCHAR(30),               -- Pro kontroly: 'daily', 'weekly', 'monthly', atd.
    
    -- Časování upomínek
    days_before_due INTEGER NOT NULL,       -- Kolik dní předem upozornit
    repeat_interval INTEGER,                -- Opakování v dnech (NULL = pouze jednou)
    
    -- Komu poslat notifikaci
    notify_operator BOOLEAN DEFAULT FALSE,
    notify_technician BOOLEAN DEFAULT FALSE,
    notify_site_manager BOOLEAN DEFAULT FALSE,
    notify_admin BOOLEAN DEFAULT TRUE,
    custom_recipients INTEGER[], -- Array of user IDs
    
    -- Způsob notifikace
    send_email BOOLEAN DEFAULT TRUE,
    send_sms BOOLEAN DEFAULT FALSE,
    show_in_dashboard BOOLEAN DEFAULT TRUE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT notification_type_check CHECK (
        notification_type IN ('control_due', 'revision_due', 'maintenance_due', 'certification_expiry', 'location_change')
    )
);

-- 6. Tabulka pro evidenci odeslaných notifikací
CREATE TABLE notifications_sent (
    id SERIAL PRIMARY KEY,
    rule_id INTEGER REFERENCES notification_rules(id),
    equipment_id INTEGER REFERENCES equipment(id) NOT NULL,
    record_id INTEGER REFERENCES crane_records(id),
    
    notification_type VARCHAR(30) NOT NULL,
    recipient_user_id INTEGER REFERENCES users(id),
    recipient_email VARCHAR(200),
    recipient_phone VARCHAR(50),
    
    subject VARCHAR(500),
    message TEXT,
    
    -- Stav doručení
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT notification_status_check CHECK (status IN ('pending', 'sent', 'delivered', 'failed'))
);

-- 7. View pro aktuální stav všech jeřábů s upomínkami
CREATE OR REPLACE VIEW equipment_status_with_alerts AS
SELECT 
    e.id,
    e.equipment_type,
    e.manufacturer,
    e.model,
    e.serial_number,
    e.current_status,
    
    -- Aktuální umístění
    l.location_name,
    l.location_type,
    elh.installed_date as current_location_since,
    elh.planned_removal_date,
    
    -- Odpovědné osoby
    u_resp.first_name || ' ' || u_resp.last_name as responsible_person,
    u_site.first_name || ' ' || u_site.last_name as site_manager,
    
    -- Kontroly a revize
    e.last_revision_date,
    e.next_revision_due,
    
    -- Výpočet upomínek
    CASE 
        WHEN e.next_revision_due <= CURRENT_DATE THEN 'REVISION_OVERDUE'
        WHEN e.next_revision_due <= CURRENT_DATE + INTERVAL '30 days' THEN 'REVISION_DUE_SOON'
        ELSE 'REVISION_OK'
    END as revision_alert_level,
    
    -- Denní kontroly (poslední záznam)
    (SELECT MAX(record_date) FROM crane_records cr 
     WHERE cr.equipment_id = e.id AND cr.record_type = 'daily') as last_daily_control,
     
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM crane_records cr 
                        WHERE cr.equipment_id = e.id 
                        AND cr.record_type = 'daily' 
                        AND cr.record_date >= CURRENT_DATE) 
        AND e.current_status = 'operational'
        THEN 'DAILY_CONTROL_MISSING'
        ELSE 'DAILY_CONTROL_OK'
    END as daily_control_alert
    
FROM equipment e
LEFT JOIN equipment_location_history elh ON (
    e.id = elh.equipment_id 
    AND elh.actual_removal_date IS NULL
    AND elh.installed_date = (
        SELECT MAX(elh2.installed_date) 
        FROM equipment_location_history elh2 
        WHERE elh2.equipment_id = e.id
    )
)
LEFT JOIN locations l ON elh.location_id = l.id
LEFT JOIN users u_resp ON elh.responsible_person_id = u_resp.id
LEFT JOIN users u_site ON elh.site_manager_id = u_site.id;

-- 8. Funkce pro automatické generování notifikací
CREATE OR REPLACE FUNCTION generate_daily_notifications()
RETURNS INTEGER AS $$
DECLARE
    notification_count INTEGER := 0;
    equipment_record RECORD;
    rule_record RECORD;
BEGIN
    -- Procházíme všechny jeřáby s alerty
    FOR equipment_record IN 
        SELECT * FROM equipment_status_with_alerts 
        WHERE revision_alert_level IN ('REVISION_OVERDUE', 'REVISION_DUE_SOON')
           OR daily_control_alert = 'DAILY_CONTROL_MISSING'
    LOOP
        -- Hledáme odpovídající pravidla pro notifikace
        FOR rule_record IN
            SELECT * FROM notification_rules nr
            WHERE nr.is_active = TRUE
            AND (nr.equipment_id IS NULL OR nr.equipment_id = equipment_record.id)
            AND (
                (nr.notification_type = 'revision_due' AND equipment_record.revision_alert_level != 'REVISION_OK') OR
                (nr.notification_type = 'control_due' AND equipment_record.daily_control_alert = 'DAILY_CONTROL_MISSING')
            )
        LOOP
            -- Kontrola, zda už nebyla notifikace poslána dnes
            IF NOT EXISTS (
                SELECT 1 FROM notifications_sent ns
                WHERE ns.rule_id = rule_record.id
                AND ns.equipment_id = equipment_record.id
                AND ns.created_at::date = CURRENT_DATE
            ) THEN
                -- Vložení nové notifikace
                INSERT INTO notifications_sent (
                    rule_id, equipment_id, notification_type,
                    subject, message, status
                ) VALUES (
                    rule_record.id,
                    equipment_record.id,
                    rule_record.notification_type,
                    'Upomínka: ' || equipment_record.equipment_type || ' ' || equipment_record.model,
                    'Jeřáb vyžaduje pozornost. Umístění: ' || COALESCE(equipment_record.location_name, 'Neznámé'),
                    'pending'
                );
                
                notification_count := notification_count + 1;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN notification_count;
END;
$$ LANGUAGE plpgsql;

-- Indexy pro výkon
CREATE INDEX idx_equipment_location_history_equipment ON equipment_location_history(equipment_id, installed_date);
CREATE INDEX idx_equipment_location_history_active ON equipment_location_history(equipment_id) WHERE actual_removal_date IS NULL;
CREATE INDEX idx_notifications_sent_date ON notifications_sent(created_at);
CREATE INDEX idx_notifications_sent_status ON notifications_sent(status) WHERE status = 'pending';