const db = require('../db');

// Get all service visits
exports.getServiceVisits = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT sv.*, e.equipment_type, e.model, c.company_name
       FROM service_visits sv
       JOIN equipment e ON sv.equipment_id = e.id
       JOIN customers c ON e.customer_id = c.id
       ORDER BY sv.visit_date DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting service visits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get service visit by ID
exports.getServiceVisitById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT sv.*, e.equipment_type, e.model, c.company_name
       FROM service_visits sv
       JOIN equipment e ON sv.equipment_id = e.id
       JOIN customers c ON e.customer_id = c.id
       WHERE sv.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service visit not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error getting service visit ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new service visit
exports.createServiceVisit = async (req, res) => {
  try {
    const {
      equipment_id,
      technician_name,
      visit_date,
      hours_worked,
      description,
      parts_used,
      cost,
      invoiced,
      invoice_number,
      notes,
    } = req.body;

    // Validate required fields
    if (!equipment_id || !technician_name || !visit_date) {
      return res.status(400).json({ 
        error: 'Equipment ID, technician name, and visit date are required' 
      });
    }

    // Check if equipment exists
    const equipmentCheck = await db.query('SELECT id FROM equipment WHERE id = $1', [equipment_id]);
    if (equipmentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Equipment not found' });
    }

    const result = await db.query(
      `INSERT INTO service_visits (
        equipment_id, technician_name, visit_date, hours_worked, description,
        parts_used, cost, invoiced, invoice_number, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        equipment_id, technician_name, visit_date, hours_worked, description,
        parts_used, cost, invoiced, invoice_number, notes
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating service visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update service visit
exports.updateServiceVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      equipment_id,
      technician_name,
      visit_date,
      hours_worked,
      description,
      parts_used,
      cost,
      invoiced,
      invoice_number,
      notes,
    } = req.body;

    // Validate required fields
    if (!equipment_id || !technician_name || !visit_date) {
      return res.status(400).json({ 
        error: 'Equipment ID, technician name, and visit date are required' 
      });
    }

    // Check if equipment exists
    const equipmentCheck = await db.query('SELECT id FROM equipment WHERE id = $1', [equipment_id]);
    if (equipmentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Equipment not found' });
    }

    const result = await db.query(
      `UPDATE service_visits SET 
        equipment_id = $1, 
        technician_name = $2, 
        visit_date = $3, 
        hours_worked = $4, 
        description = $5, 
        parts_used = $6, 
        cost = $7, 
        invoiced = $8, 
        invoice_number = $9, 
        notes = $10
      WHERE id = $11 RETURNING *`,
      [
        equipment_id, technician_name, visit_date, hours_worked, description,
        parts_used, cost, invoiced, invoice_number, notes, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service visit not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating service visit ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete service visit
exports.deleteServiceVisit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if service visit exists
    const checkResult = await db.query('SELECT id FROM service_visits WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service visit not found' });
    }
    
    await db.query('DELETE FROM service_visits WHERE id = $1', [id]);
    res.status(200).json({ message: 'Service visit deleted successfully' });
  } catch (error) {
    console.error(`Error deleting service visit ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
