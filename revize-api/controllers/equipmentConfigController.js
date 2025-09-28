const db = require('../db');

// Získat všechny konfigurace pro zařízení
exports.getConfigurationsForEquipment = async (req, res) => {
  try {
    const { equipment_id } = req.params;
    
    // Ověřit, zda zařízení existuje
    const checkResult = await db.query('SELECT id FROM equipment WHERE id = $1', [equipment_id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Zařízení nenalezeno' });
    }
    
    const result = await db.query(
      `SELECT * FROM equipment_configurations 
       WHERE equipment_id = $1 
       ORDER BY created_at DESC`,
      [equipment_id]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting equipment configurations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Získat konfiguraci podle ID
exports.getConfigurationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM equipment_configurations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Konfigurace nenalezena' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error getting configuration ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Vytvořit novou konfiguraci
exports.createConfiguration = async (req, res) => {
  try {
    const { equipment_id, min_reach, max_reach, lift_height, description } = req.body;
    
    // Ověřit, zda zařízení existuje
    const checkResult = await db.query('SELECT id FROM equipment WHERE id = $1', [equipment_id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Zařízení nenalezeno' });
    }
    
    const result = await db.query(
      `INSERT INTO equipment_configurations 
         (equipment_id, min_reach, max_reach, lift_height, description) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [equipment_id, min_reach, max_reach, lift_height, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating equipment configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Aktualizovat konfiguraci
exports.updateConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const { min_reach, max_reach, lift_height, description } = req.body;
    
    const result = await db.query(
      `UPDATE equipment_configurations 
       SET min_reach = $1, max_reach = $2, lift_height = $3, description = $4 
       WHERE id = $5 
       RETURNING *`,
      [min_reach, max_reach, lift_height, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Konfigurace nenalezena' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating configuration ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Smazat konfiguraci
exports.deleteConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ověřit, zda konfigurace existuje
    const checkResult = await db.query('SELECT id FROM equipment_configurations WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Konfigurace nenalezena' });
    }
    
    await db.query('DELETE FROM equipment_configurations WHERE id = $1', [id]);
    res.status(200).json({ message: 'Konfigurace byla úspěšně smazána' });
  } catch (error) {
    console.error(`Error deleting configuration ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};