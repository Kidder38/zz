const db = require('../db/index');
const fs = require('fs').promises;
const path = require('path');

// Získat všechny soubory pro servisní výjezd
exports.getServiceFiles = async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    // Kontrola, zda servisní výjezd existuje
    const serviceCheck = await db.query('SELECT id FROM service_visits WHERE id = $1', [serviceId]);
    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Servisní výjezd nenalezen' });
    }
    
    const result = await db.query(
      `SELECT * FROM service_files 
       WHERE service_id = $1 
       ORDER BY created_at DESC`,
      [serviceId]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error getting files for service visit ${req.params.serviceId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Nahrát soubor k servisnímu výjezdu
exports.uploadServiceFile = async (req, res) => {
  try {
    // Soubor je nahrán přes multer middleware v route
    if (!req.file) {
      return res.status(400).json({ error: 'Nebyl nahrán žádný soubor' });
    }
    
    const { serviceId } = req.params;
    const { description } = req.body;
    
    // Kontrola, zda servisní výjezd existuje
    const serviceCheck = await db.query('SELECT id FROM service_visits WHERE id = $1', [serviceId]);
    if (serviceCheck.rows.length === 0) {
      // Smazat nahraný soubor, pokud servisní výjezd neexistuje
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Servisní výjezd nenalezen' });
    }
    
    // Uložit detaily souboru do databáze
    const result = await db.query(
      `INSERT INTO service_files (
        service_id, file_name, file_path, 
        file_size, content_type, description
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        serviceId,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype,
        description
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Pokud nastane chyba po nahrání souboru, pokusíme se soubor smazat
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing file after upload error:', unlinkError);
      }
    }
    
    console.error(`Error uploading file for service visit ${req.params.serviceId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Smazat soubor servisního výjezdu
exports.deleteServiceFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Získat detaily souboru pro smazání fyzického souboru
    const fileResult = await db.query('SELECT * FROM service_files WHERE id = $1', [fileId]);
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Soubor nenalezen' });
    }
    
    const fileData = fileResult.rows[0];
    
    // Smazat záznam souboru z databáze
    await db.query('DELETE FROM service_files WHERE id = $1', [fileId]);
    
    // Smazat fyzický soubor
    try {
      await fs.unlink(fileData.file_path);
    } catch (unlinkError) {
      console.error('Error deleting physical file:', unlinkError);
      // Pokračovat i když se nepodaří smazat fyzický soubor
    }
    
    res.status(200).json({ message: 'Soubor byl úspěšně smazán' });
  } catch (error) {
    console.error(`Error deleting file ${req.params.fileId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Stáhnout soubor servisního výjezdu
exports.downloadServiceFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const result = await db.query('SELECT * FROM service_files WHERE id = $1', [fileId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Soubor nenalezen' });
    }
    
    const fileData = result.rows[0];
    
    // Kontrola, zda soubor existuje fyzicky
    try {
      await fs.access(fileData.file_path);
    } catch (error) {
      return res.status(404).json({ error: 'Fyzický soubor nenalezen' });
    }
    
    // Nastavit odpovídající hlavičky
    res.setHeader('Content-Type', fileData.content_type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileData.file_name)}"`);
    
    // Odeslat soubor
    res.sendFile(path.resolve(fileData.file_path));
  } catch (error) {
    console.error(`Error downloading file ${req.params.fileId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Aktualizovat informace o souboru
exports.updateServiceFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { description } = req.body;
    
    // Kontrola, zda soubor existuje
    const fileCheck = await db.query('SELECT id FROM service_files WHERE id = $1', [fileId]);
    if (fileCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Soubor nenalezen' });
    }
    
    // Aktualizovat informace o souboru
    const result = await db.query(
      `UPDATE service_files SET 
        description = COALESCE($1, description)
      WHERE id = $2 RETURNING *`,
      [description, fileId]
    );
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating file info ${req.params.fileId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};