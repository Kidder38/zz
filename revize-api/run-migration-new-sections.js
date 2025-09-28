const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'revize_db',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
};

async function runMigration() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'db', 'migration_new_revision_sections.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration for new revision sections...');
    await client.query(migrationSQL);
    
    console.log('Migration completed successfully!');
    console.log('New fields added to revisions table:');
    console.log('- location: VARCHAR(255)');
    console.log('- revision_number: VARCHAR(100)');
    console.log('- measuring_instruments: JSONB');
    console.log('- technical_assessment: JSONB');
    console.log('- defects: JSONB');
    console.log('- dangers: JSONB');
    console.log('- previous_controls_ok: BOOLEAN');
    console.log('- technical_trend: TEXT');
    
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };