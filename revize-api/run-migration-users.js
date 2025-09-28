require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a new pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Read and execute the migration SQL file
    const migrationFile = path.join(__dirname, 'db', 'migration_users.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');
    
    console.log('Running users migration...');
    await client.query(migrationSQL);
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Users migration completed successfully!');
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Release client back to the pool
    client.release();
    // Close pool
    pool.end();
  }
}

// Run the migration function
runMigration().catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});