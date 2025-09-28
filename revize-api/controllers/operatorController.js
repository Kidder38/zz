const db = require('../db');

// Get all operators from users table
exports.getOperators = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         u.id,
         u.first_name,
         u.last_name,
         u.email,
         u.phone,
         u.operator_card_number,
         u.certification_valid_until,
         u.is_active as active,
         u.created_at,
         u.updated_at,
         array_agg(
           json_build_object(
             'equipment_id', eo.equipment_id,
             'equipment_type', e.equipment_type,
             'manufacturer', e.manufacturer,
             'model', e.model,
             'assigned_date', eo.assigned_date
           )
         ) FILTER (WHERE eo.active = true) as assigned_equipment
       FROM users u
       LEFT JOIN equipment_operators eo ON u.id = eo.operator_id AND eo.active = true
       LEFT JOIN equipment e ON eo.equipment_id = e.id
       WHERE u.is_operator = true AND u.is_active = true
       GROUP BY u.id
       ORDER BY u.last_name, u.first_name`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting operators:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get operator by ID from users table
exports.getOperatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT 
         u.id,
         u.first_name,
         u.last_name,
         u.email,
         u.phone,
         u.operator_card_number,
         u.certification_valid_until,
         u.is_active as active,
         u.created_at,
         u.updated_at,
         array_agg(
           json_build_object(
             'equipment_id', eo.equipment_id,
             'equipment_type', e.equipment_type,
             'manufacturer', e.manufacturer,
             'model', e.model,
             'assigned_date', eo.assigned_date
           )
         ) FILTER (WHERE eo.active = true) as assigned_equipment
       FROM users u
       LEFT JOIN equipment_operators eo ON u.id = eo.operator_id AND eo.active = true
       LEFT JOIN equipment e ON eo.equipment_id = e.id
       WHERE u.id = $1 AND u.is_operator = true AND u.is_active = true
       GROUP BY u.id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operator not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error getting operator ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new operator
exports.createOperator = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      operator_card_number,
      certification_valid_until,
      phone,
      email,
      equipment_ids = []
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Check if operator card number already exists (if provided)
    if (operator_card_number) {
      const existingOperator = await db.query(
        'SELECT id FROM operators WHERE operator_card_number = $1',
        [operator_card_number]
      );
      if (existingOperator.rows.length > 0) {
        return res.status(400).json({ error: 'Operator card number already exists' });
      }
    }

    // Start transaction
    await db.query('BEGIN');

    // Create operator
    const operatorResult = await db.query(
      `INSERT INTO operators (
        first_name, last_name, operator_card_number, 
        certification_valid_until, phone, email
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, operator_card_number, certification_valid_until, phone, email]
    );

    const newOperator = operatorResult.rows[0];

    // Assign to equipment if provided
    if (equipment_ids.length > 0) {
      for (const equipmentId of equipment_ids) {
        await db.query(
          `INSERT INTO equipment_operators (equipment_id, operator_id) 
           VALUES ($1, $2)`,
          [equipmentId, newOperator.id]
        );
      }
    }

    // Commit transaction
    await db.query('COMMIT');

    res.status(201).json(newOperator);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating operator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update operator
exports.updateOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      operator_card_number,
      certification_valid_until,
      phone,
      email,
      equipment_ids = []
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Check if operator card number already exists (if provided and changed)
    if (operator_card_number) {
      const existingOperator = await db.query(
        'SELECT id FROM operators WHERE operator_card_number = $1 AND id != $2',
        [operator_card_number, id]
      );
      if (existingOperator.rows.length > 0) {
        return res.status(400).json({ error: 'Operator card number already exists' });
      }
    }

    // Start transaction
    await db.query('BEGIN');

    // Update operator
    const result = await db.query(
      `UPDATE operators SET 
        first_name = $1, 
        last_name = $2, 
        operator_card_number = $3, 
        certification_valid_until = $4, 
        phone = $5, 
        email = $6
       WHERE id = $7 AND active = true RETURNING *`,
      [first_name, last_name, operator_card_number, certification_valid_until, phone, email, id]
    );

    if (result.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Operator not found' });
    }

    // Update equipment assignments
    // First deactivate all current assignments
    await db.query(
      'UPDATE equipment_operators SET active = false WHERE operator_id = $1',
      [id]
    );

    // Then add new assignments
    if (equipment_ids.length > 0) {
      for (const equipmentId of equipment_ids) {
        await db.query(
          `INSERT INTO equipment_operators (equipment_id, operator_id) 
           VALUES ($1, $2)
           ON CONFLICT (equipment_id, operator_id) 
           DO UPDATE SET active = true, assigned_date = CURRENT_DATE`,
          [equipmentId, id]
        );
      }
    }

    // Commit transaction
    await db.query('COMMIT');

    res.status(200).json(result.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(`Error updating operator ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete (deactivate) operator
exports.deleteOperator = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'UPDATE operators SET active = false WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operator not found' });
    }
    
    // Also deactivate equipment assignments
    await db.query(
      'UPDATE equipment_operators SET active = false WHERE operator_id = $1',
      [id]
    );
    
    res.status(200).json({ message: 'Operator deactivated successfully' });
  } catch (error) {
    console.error(`Error deleting operator ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get operators for specific equipment
exports.getOperatorsForEquipment = async (req, res) => {
  try {
    const { equipment_id } = req.params;
    
    const result = await db.query(
      `SELECT o.*, eo.assigned_date
       FROM operators o
       JOIN equipment_operators eo ON o.id = eo.operator_id
       WHERE eo.equipment_id = $1 AND eo.active = true AND o.active = true
       ORDER BY o.last_name, o.first_name`,
      [equipment_id]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error getting operators for equipment ${req.params.equipment_id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};