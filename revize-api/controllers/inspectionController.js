const db = require('../db');

// Get all inspections
exports.getInspections = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, e.equipment_type, e.model, c.company_name
       FROM inspections i
       JOIN equipment e ON i.equipment_id = e.id
       JOIN customers c ON e.customer_id = c.id
       ORDER BY i.inspection_date DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting inspections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get inspection by ID
exports.getInspectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT i.*, e.equipment_type, e.model, c.company_name
       FROM inspections i
       JOIN equipment e ON i.equipment_id = e.id
       JOIN customers c ON e.customer_id = c.id
       WHERE i.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error getting inspection ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new inspection
exports.createInspection = async (req, res) => {
  try {
    const {
      equipment_id,
      inspector_name,
      inspection_date,
      inspection_type,
      findings,
      recommendations,
      next_inspection_date,
    } = req.body;

    // Validate required fields
    if (!equipment_id || !inspector_name || !inspection_date) {
      return res.status(400).json({ 
        error: 'Equipment ID, inspector name, and inspection date are required' 
      });
    }

    // Check if equipment exists
    const equipmentCheck = await db.query('SELECT id FROM equipment WHERE id = $1', [equipment_id]);
    if (equipmentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Equipment not found' });
    }

    const result = await db.query(
      `INSERT INTO inspections (
        equipment_id, inspector_name, inspection_date, inspection_type,
        findings, recommendations, next_inspection_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        equipment_id, inspector_name, inspection_date, inspection_type,
        findings, recommendations, next_inspection_date
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating inspection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update inspection
exports.updateInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      equipment_id,
      inspector_name,
      inspection_date,
      inspection_type,
      findings,
      recommendations,
      next_inspection_date,
    } = req.body;

    // Validate required fields
    if (!equipment_id || !inspector_name || !inspection_date) {
      return res.status(400).json({ 
        error: 'Equipment ID, inspector name, and inspection date are required' 
      });
    }

    // Check if equipment exists
    const equipmentCheck = await db.query('SELECT id FROM equipment WHERE id = $1', [equipment_id]);
    if (equipmentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Equipment not found' });
    }

    const result = await db.query(
      `UPDATE inspections SET 
        equipment_id = $1, 
        inspector_name = $2, 
        inspection_date = $3, 
        inspection_type = $4, 
        findings = $5, 
        recommendations = $6, 
        next_inspection_date = $7
      WHERE id = $8 RETURNING *`,
      [
        equipment_id, inspector_name, inspection_date, inspection_type,
        findings, recommendations, next_inspection_date, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating inspection ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete inspection
exports.deleteInspection = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if inspection exists
    const checkResult = await db.query('SELECT id FROM inspections WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    
    await db.query('DELETE FROM inspections WHERE id = $1', [id]);
    res.status(200).json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    console.error(`Error deleting inspection ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
