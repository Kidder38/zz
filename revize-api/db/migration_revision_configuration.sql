-- Migration to add configuration_id to revisions table

-- Add configuration_id field to revisions table
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS configuration_id INTEGER;

-- Add foreign key constraint to equipment_configurations table
ALTER TABLE revisions ADD CONSTRAINT revisions_configuration_id_fkey 
    FOREIGN KEY (configuration_id) REFERENCES equipment_configurations(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_revisions_configuration_id ON revisions(configuration_id);

-- Add comment to explain the field
COMMENT ON COLUMN revisions.configuration_id IS 'Reference to equipment configuration used during revision';