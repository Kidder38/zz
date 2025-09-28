const db = require('../db');

// Get all equipment
exports.getEquipment = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, c.company_name 
       FROM equipment e 
       LEFT JOIN customers c ON e.customer_id = c.id 
       ORDER BY e.equipment_type, e.model`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT e.*, c.company_name 
       FROM equipment e 
       LEFT JOIN customers c ON e.customer_id = c.id 
       WHERE e.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error getting equipment ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new equipment
exports.createEquipment = async (req, res) => {
  try {
    const {
      customer_id,
      equipment_type,
      model,
      manufacturer,
      year_of_manufacture,
      serial_number,
      inventory_number,
      max_load,
      classification,
      category,
      equipment_class,
    } = req.body;

    // Validate required fields
    if (!customer_id || !equipment_type) {
      return res.status(400).json({ error: 'Customer ID and equipment type are required' });
    }

    // Check if customer exists
    const customerCheck = await db.query('SELECT id FROM customers WHERE id = $1', [customer_id]);
    if (customerCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    const result = await db.query(
      `INSERT INTO equipment (
        customer_id, equipment_type, model, manufacturer, year_of_manufacture,
        serial_number, inventory_number, max_load, classification, category, equipment_class
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        customer_id, equipment_type, model, manufacturer, year_of_manufacture,
        serial_number, inventory_number, max_load, classification, category, equipment_class
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update equipment
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_id,
      equipment_type,
      model,
      manufacturer,
      year_of_manufacture,
      serial_number,
      inventory_number,
      max_load,
      classification,
      category,
      equipment_class,
      last_revision_date,
      next_revision_date,
    } = req.body;

    // Validate required fields
    if (!customer_id || !equipment_type) {
      return res.status(400).json({ error: 'Customer ID and equipment type are required' });
    }

    // Check if customer exists
    const customerCheck = await db.query('SELECT id FROM customers WHERE id = $1', [customer_id]);
    if (customerCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    const result = await db.query(
      `UPDATE equipment SET 
        customer_id = $1, 
        equipment_type = $2, 
        model = $3, 
        manufacturer = $4, 
        year_of_manufacture = $5, 
        serial_number = $6, 
        inventory_number = $7, 
        max_load = $8, 
        classification = $9,
        category = $10,
        equipment_class = $11,
        last_revision_date = $12,
        next_revision_date = $13
      WHERE id = $14 RETURNING *`,
      [
        customer_id, equipment_type, model, manufacturer, year_of_manufacture,
        serial_number, inventory_number, max_load, classification, category, equipment_class,
        last_revision_date, next_revision_date, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating equipment ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if equipment exists
    const checkResult = await db.query('SELECT id FROM equipment WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    await db.query('DELETE FROM equipment WHERE id = $1', [id]);
    res.status(200).json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting equipment ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get equipment's revisions
exports.getEquipmentRevisions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if equipment exists
    const equipmentResult = await db.query('SELECT id FROM equipment WHERE id = $1', [id]);
    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    const result = await db.query(
      `SELECT * FROM revisions WHERE equipment_id = $1 ORDER BY revision_date DESC`,
      [id]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error getting revisions for equipment ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get equipment's service visits
exports.getEquipmentServiceVisits = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if equipment exists
    const equipmentResult = await db.query('SELECT id FROM equipment WHERE id = $1', [id]);
    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    const result = await db.query(
      `SELECT * FROM service_visits WHERE equipment_id = $1 ORDER BY visit_date DESC`,
      [id]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error getting service visits for equipment ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get equipment's inspections
exports.getEquipmentInspections = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if equipment exists
    const equipmentResult = await db.query('SELECT id FROM equipment WHERE id = $1', [id]);
    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    const result = await db.query(
      `SELECT * FROM inspections WHERE equipment_id = $1 ORDER BY inspection_date DESC`,
      [id]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error getting inspections for equipment ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
