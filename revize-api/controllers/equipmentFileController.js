const db = require('../db/index');
const fs = require('fs').promises;
const path = require('path');

// Get all files for an equipment
exports.getEquipmentFiles = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    // Check if equipment exists
    const equipmentCheck = await db.query('SELECT id FROM equipment WHERE id = $1', [equipmentId]);
    if (equipmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Zařízení nenalezeno' });
    }
    
    const result = await db.query(
      `SELECT * FROM equipment_files 
       WHERE equipment_id = $1 
       ORDER BY file_type, created_at DESC`,
      [equipmentId]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error getting files for equipment ${req.params.equipmentId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Get files by type for an equipment
exports.getEquipmentFilesByType = async (req, res) => {
  try {
    const { equipmentId, fileType } = req.params;
    
    // Validate file type
    const validFileTypes = ['photo', 'datasheet', 'manual'];
    if (!validFileTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Neplatný typ souboru' });
    }
    
    // Check if equipment exists
    const equipmentCheck = await db.query('SELECT id FROM equipment WHERE id = $1', [equipmentId]);
    if (equipmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Zařízení nenalezeno' });
    }
    
    const result = await db.query(
      `SELECT * FROM equipment_files 
       WHERE equipment_id = $1 AND file_type = $2
       ORDER BY created_at DESC`,
      [equipmentId, fileType]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error getting ${req.params.fileType} files for equipment ${req.params.equipmentId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Upload a file for an equipment
exports.uploadEquipmentFile = async (req, res) => {
  try {
    // The file is uploaded via multer middleware in the route
    if (!req.file) {
      return res.status(400).json({ error: 'Nebyl nahrán žádný soubor' });
    }
    
    const { equipmentId } = req.params;
    const { file_type, description } = req.body;
    
    // Validate file type
    const validFileTypes = ['photo', 'datasheet', 'manual'];
    if (!validFileTypes.includes(file_type)) {
      // Remove the uploaded file if file type is invalid
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Neplatný typ souboru' });
    }
    
    // Check if equipment exists
    const equipmentCheck = await db.query('SELECT id FROM equipment WHERE id = $1', [equipmentId]);
    if (equipmentCheck.rows.length === 0) {
      // Remove the uploaded file if equipment doesn't exist
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Zařízení nenalezeno' });
    }
    
    // Save file details to database
    const result = await db.query(
      `INSERT INTO equipment_files (
        equipment_id, file_name, file_path, file_type, 
        file_size, content_type, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        equipmentId,
        req.file.originalname,
        req.file.path,
        file_type,
        req.file.size,
        req.file.mimetype,
        description
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // If error occurs after file upload, try to remove the file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing file after upload error:', unlinkError);
      }
    }
    
    console.error(`Error uploading file for equipment ${req.params.equipmentId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Delete a file
exports.deleteEquipmentFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Get file details to delete the physical file
    const fileResult = await db.query('SELECT * FROM equipment_files WHERE id = $1', [fileId]);
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Soubor nenalezen' });
    }
    
    const fileData = fileResult.rows[0];
    
    // Delete file record from database
    await db.query('DELETE FROM equipment_files WHERE id = $1', [fileId]);
    
    // Delete the physical file
    try {
      await fs.unlink(fileData.file_path);
    } catch (unlinkError) {
      console.error('Error deleting physical file:', unlinkError);
      // Continue even if physical file deletion fails
    }
    
    res.status(200).json({ message: 'Soubor byl úspěšně smazán' });
  } catch (error) {
    console.error(`Error deleting file ${req.params.fileId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Get a specific file
exports.getEquipmentFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const result = await db.query('SELECT * FROM equipment_files WHERE id = $1', [fileId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Soubor nenalezen' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error getting file ${req.params.fileId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Download a file
exports.downloadEquipmentFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const result = await db.query('SELECT * FROM equipment_files WHERE id = $1', [fileId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Soubor nenalezen' });
    }
    
    const fileData = result.rows[0];
    
    // Check if file exists
    try {
      await fs.access(fileData.file_path);
    } catch (error) {
      return res.status(404).json({ error: 'Fyzický soubor nenalezen' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', fileData.content_type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileData.file_name)}"`);
    
    // Send the file
    res.sendFile(path.resolve(fileData.file_path));
  } catch (error) {
    console.error(`Error downloading file ${req.params.fileId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};

// Update file info
exports.updateEquipmentFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { description, file_type } = req.body;
    
    // Validate file type if provided
    if (file_type) {
      const validFileTypes = ['photo', 'datasheet', 'manual'];
      if (!validFileTypes.includes(file_type)) {
        return res.status(400).json({ error: 'Neplatný typ souboru' });
      }
    }
    
    // Check if file exists
    const fileCheck = await db.query('SELECT id FROM equipment_files WHERE id = $1', [fileId]);
    if (fileCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Soubor nenalezen' });
    }
    
    // Update file info
    const result = await db.query(
      `UPDATE equipment_files SET 
        description = COALESCE($1, description),
        file_type = COALESCE($2, file_type)
      WHERE id = $3 RETURNING *`,
      [description, file_type, fileId]
    );
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating file info ${req.params.fileId}:`, error);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
};