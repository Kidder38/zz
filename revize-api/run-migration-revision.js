const { pool } = require('./db/index');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let client;
  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'db', 'migration_revision_number.sql'),
      'utf8'
    );
    
    // Get a client from the pool
    client = await pool.connect();
    
    console.log('Starting migration...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Execute migration
    await client.query(migrationSQL);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Error executing migration:', error);
    
    // Rollback in case of error
    if (client) {
      await client.query('ROLLBACK');
    }
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    
    // End the pool
    await pool.end();
  }
}

// Run the migration
runMigration();