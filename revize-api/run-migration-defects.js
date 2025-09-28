const fs = require('fs');
const path = require('path');
const { pool } = require('./db/index');

async function runMigration() {
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'db', 'migration_defects.sql'),
      'utf8'
    );

    // Get a client from the pool
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Run the migration SQL
      await client.query(migrationSQL);
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log('Defects migration successfully applied!');
    } catch (err) {
      // Rollback transaction in case of error
      await client.query('ROLLBACK');
      console.error('Error executing defects migration:', err);
      throw err;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (err) {
    console.error('Defects migration failed:', err);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration();