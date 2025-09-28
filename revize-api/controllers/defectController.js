const db = require('../db');

// Získat všechny závady
exports.getDefects = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.*, r.revision_number, r.revision_date, e.equipment_type, e.model, c.company_name
       FROM defects d
       JOIN revisions r ON d.revision_id = r.id
       JOIN equipment e ON r.equipment_id = e.id
       JOIN customers c ON e.customer_id = c.id
       ORDER BY d.created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting defects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Získat závady podle ID revize
exports.getDefectsByRevisionId = async (req, res) => {
  try {
    const { revisionId } = req.params;
    const result = await db.query(
      `SELECT * FROM defects WHERE revision_id = $1 ORDER BY created_at DESC`,
      [revisionId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error getting defects for revision ${req.params.revisionId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Vytvoření nové závady
exports.createDefect = async (req, res) => {
  try {
    const {
      revision_id,
      section,
      item_key,
      item_name,
      description,
      severity
    } = req.body;

    // Validace povinných polí
    if (!revision_id || !section || !item_key || !description) {
      return res.status(400).json({ 
        error: 'Revision ID, section, item key, and description are required' 
      });
    }

    // Ověření, že revize existuje
    const revisionCheck = await db.query('SELECT id FROM revisions WHERE id = $1', [revision_id]);
    if (revisionCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Revision not found' });
    }

    const result = await db.query(
      `INSERT INTO defects (
        revision_id, section, item_key, item_name, description, severity
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        revision_id, section, item_key, item_name, description, severity
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating defect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Aktualizace závady
exports.updateDefect = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      severity
    } = req.body;

    // Pouze popis a závažnost mohou být aktualizovány
    const result = await db.query(
      `UPDATE defects
       SET description = $1, severity = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [description, severity, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Defect not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating defect ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Smazání závady
exports.deleteDefect = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM defects WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Defect not found' });
    }
    
    res.status(200).json({ message: 'Defect deleted successfully' });
  } catch (error) {
    console.error(`Error deleting defect ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};