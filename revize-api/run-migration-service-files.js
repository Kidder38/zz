const db = require('./db');
const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, 'db', 'migration_service_files.sql');

async function runMigration() {
  console.log('Spouštím migraci pro podporu souborů k servisním výjezdům...');
  try {
    // Načíst SQL skript
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Spustit transakci
    await db.query('BEGIN');
    
    // Provést migraci
    await db.query(sql);
    
    // Vytvořit adresář pro soubory servisních výjezdů
    const serviceUploadsDir = path.join(__dirname, 'uploads', 'services');
    if (!fs.existsSync(serviceUploadsDir)) {
      fs.mkdirSync(serviceUploadsDir, { recursive: true });
      console.log(`Vytvořen adresář: ${serviceUploadsDir}`);
    }
    
    // Potvrdit transakci
    await db.query('COMMIT');
    
    console.log('Migrace pro podporu souborů k servisním výjezdům byla úspěšně dokončena.');
  } catch (error) {
    // Vrátit změny v případě chyby
    await db.query('ROLLBACK');
    console.error('Chyba při provádění migrace:', error);
    process.exit(1);
  } finally {
    // Ukončit připojení k databázi
    process.exit(0);
  }
}

runMigration();