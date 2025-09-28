-- Migration to add new fields for revision reports according to NV 193/2022 Sb.

-- Add new fields to revisions table
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS revision_number VARCHAR(100);
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS measuring_instruments JSONB;
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS technical_assessment JSONB;
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS defects JSONB;
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS dangers JSONB;
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS previous_controls_ok BOOLEAN DEFAULT TRUE;
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS technical_trend TEXT;
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS procedure_type VARCHAR(50) DEFAULT 'ZKOUŠKA';

-- Add comment to explain the new fields
COMMENT ON COLUMN revisions.location IS 'Location where revision was performed';
COMMENT ON COLUMN revisions.revision_number IS 'Revision protocol number';
COMMENT ON COLUMN revisions.measuring_instruments IS 'JSON array of measuring instruments used';
COMMENT ON COLUMN revisions.technical_assessment IS 'JSON object with technical assessment details';
COMMENT ON COLUMN revisions.defects IS 'JSON array of defects found';
COMMENT ON COLUMN revisions.dangers IS 'JSON array of dangers identified';
COMMENT ON COLUMN revisions.previous_controls_ok IS 'Whether previous controls were satisfactory';
COMMENT ON COLUMN revisions.technical_trend IS 'Technical trend assessment';
COMMENT ON COLUMN revisions.procedure_type IS 'Type of procedure according to § 8 NV 193/2022 Sb.';