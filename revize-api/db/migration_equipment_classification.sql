-- Migration to add equipment classification fields according to NV 193/2022

-- Add equipment category and class fields to equipment table
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS equipment_class VARCHAR(100);

-- Add comments to explain the fields
COMMENT ON COLUMN equipment.category IS 'Equipment category according to § 3 NV 193/2022 Sb.';
COMMENT ON COLUMN equipment.equipment_class IS 'Equipment class according to § 4 NV 193/2022 Sb.';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_class ON equipment(equipment_class);