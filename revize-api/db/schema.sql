-- Create database
-- CREATE DATABASE revize_db;

-- Connect to database
-- \c revize_db

-- Create tables
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  street VARCHAR(255),
  city VARCHAR(255),
  postal_code VARCHAR(20),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  equipment_type VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  manufacturer VARCHAR(100),
  year_of_manufacture INTEGER,
  serial_number VARCHAR(100),
  inventory_number VARCHAR(100),
  min_reach NUMERIC,
  max_reach NUMERIC,
  max_load NUMERIC,
  lift_height NUMERIC,
  location VARCHAR(255),
  classification VARCHAR(100),
  last_revision_date DATE,
  next_revision_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE revisions (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
  technician_name VARCHAR(255) NOT NULL,
  certification_number VARCHAR(100),
  revision_date DATE NOT NULL,
  start_date DATE,
  evaluation VARCHAR(100) NOT NULL,
  next_revision_date DATE,
  next_inspection_date DATE,
  documentation_check JSONB,
  equipment_check JSONB,
  functional_test JSONB,
  load_test JSONB,
  conclusion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_visits (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
  technician_name VARCHAR(255) NOT NULL,
  visit_date DATE NOT NULL,
  hours_worked NUMERIC,
  description TEXT,
  parts_used TEXT,
  cost NUMERIC,
  invoiced BOOLEAN DEFAULT FALSE,
  invoice_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inspections (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
  inspector_name VARCHAR(255) NOT NULL,
  inspection_date DATE NOT NULL,
  inspection_type VARCHAR(100),
  findings TEXT,
  recommendations TEXT,
  next_inspection_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_equipment_customer_id ON equipment(customer_id);
CREATE INDEX idx_revisions_equipment_id ON revisions(equipment_id);
CREATE INDEX idx_service_visits_equipment_id ON service_visits(equipment_id);
CREATE INDEX idx_inspections_equipment_id ON inspections(equipment_id);
CREATE INDEX idx_equipment_next_revision_date ON equipment(next_revision_date);

-- Create or replace function to update timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_customers_modtime
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_equipment_modtime
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_revisions_modtime
    BEFORE UPDATE ON revisions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_service_visits_modtime
    BEFORE UPDATE ON service_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_inspections_modtime
    BEFORE UPDATE ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
