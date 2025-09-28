const db = require('../db');

// Get logbook entries for equipment
exports.getLogbookEntries = async (req, res) => {
  try {
    const { equipment_id } = req.params;
    const { limit = 50, offset = 0, entry_type } = req.query;

    let query = `
      SELECT le.*, 
             u.first_name, u.last_name, u.email,
             e.equipment_type, e.manufacturer, e.model,
             array_agg(
               json_build_object(
                 'category', dc.check_category,
                 'item', dc.check_item,
                 'result', dc.check_result,
                 'notes', dc.notes
               )
             ) FILTER (WHERE dc.id IS NOT NULL) as daily_checks,
             fr.id as fault_report_id, fr.title as fault_title, fr.severity
      FROM logbook_entries le
      LEFT JOIN users u ON le.operator_id = u.id
      LEFT JOIN equipment e ON le.equipment_id = e.id
      LEFT JOIN daily_checks dc ON le.id = dc.logbook_entry_id
      LEFT JOIN fault_reports fr ON le.id = fr.logbook_entry_id
      WHERE le.equipment_id = $1`;

    const params = [equipment_id];
    let paramIndex = 2;

    if (entry_type) {
      query += ` AND le.entry_type = $${paramIndex}`;
      params.push(entry_type);
      paramIndex++;
    }

    query += ` GROUP BY le.id, u.first_name, u.last_name, u.email, 
                       e.equipment_type, e.manufacturer, e.model, 
                       fr.id, fr.title, fr.severity
               ORDER BY le.entry_date DESC, le.entry_time DESC
               LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    params.push(limit, offset);

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting logbook entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single logbook entry by ID
exports.getLogbookEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT le.*, 
             u.first_name, u.last_name, u.email,
             e.equipment_type, e.manufacturer, e.model
       FROM logbook_entries le
       LEFT JOIN users u ON le.operator_id = u.id
       LEFT JOIN equipment e ON le.equipment_id = e.id
       WHERE le.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Logbook entry not found' });
    }

    const entry = result.rows[0];

    // Get daily checks if this is a daily_check entry
    if (entry.entry_type === 'daily_check') {
      const checksResult = await db.query(
        `SELECT * FROM daily_checks WHERE logbook_entry_id = $1 ORDER BY id`,
        [id]
      );
      entry.daily_checks = checksResult.rows;
    }

    // Get fault report if this is a fault_report entry
    if (entry.entry_type === 'fault_report') {
      const faultResult = await db.query(
        `SELECT * FROM fault_reports WHERE logbook_entry_id = $1`,
        [id]
      );
      entry.fault_report = faultResult.rows[0];
    }

    // Get operation record if this is an operation entry
    if (entry.entry_type === 'operation') {
      const operationResult = await db.query(
        `SELECT * FROM operation_records WHERE logbook_entry_id = $1`,
        [id]
      );
      entry.operation_record = operationResult.rows[0];
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error(`Error getting logbook entry ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create daily check entry
exports.createDailyCheckEntry = async (req, res) => {
  try {
    const {
      equipment_id,
      operator_id,
      entry_date,
      shift,
      operating_hours,
      weather_conditions,
      notes,
      daily_checks = []
    } = req.body;

    // Validate required fields
    if (!equipment_id || !operator_id || !daily_checks.length) {
      return res.status(400).json({ 
        error: 'Equipment ID, operator ID, and daily checks are required' 
      });
    }

    // Start transaction
    await db.query('BEGIN');

    // Create logbook entry
    const entryResult = await db.query(
      `INSERT INTO logbook_entries (
        equipment_id, operator_id, entry_date, entry_type, shift, 
        operating_hours, weather_conditions, notes
      ) VALUES ($1, $2, $3, 'daily_check', $4, $5, $6, $7) RETURNING *`,
      [equipment_id, operator_id, entry_date || new Date().toISOString().split('T')[0], 
       shift, operating_hours, weather_conditions, notes]
    );

    const logbookEntry = entryResult.rows[0];

    // Insert daily checks
    for (const check of daily_checks) {
      await db.query(
        `INSERT INTO daily_checks (
          logbook_entry_id, check_category, check_item, check_result, notes
        ) VALUES ($1, $2, $3, $4, $5)`,
        [logbookEntry.id, check.check_category, check.check_item, 
         check.check_result, check.notes]
      );
    }

    // Commit transaction
    await db.query('COMMIT');

    res.status(201).json(logbookEntry);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating daily check entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create fault report entry
exports.createFaultReportEntry = async (req, res) => {
  try {
    const {
      equipment_id,
      operator_id,
      entry_date,
      shift,
      notes,
      fault_type,
      severity,
      title,
      description,
      immediate_action,
      equipment_stopped
    } = req.body;

    // Validate required fields
    if (!equipment_id || !operator_id || !fault_type || !severity || !title || !description) {
      return res.status(400).json({ 
        error: 'Equipment ID, operator ID, fault type, severity, title, and description are required' 
      });
    }

    // Start transaction
    await db.query('BEGIN');

    // Create logbook entry
    const entryResult = await db.query(
      `INSERT INTO logbook_entries (
        equipment_id, operator_id, entry_date, entry_type, shift, notes
      ) VALUES ($1, $2, $3, 'fault_report', $4, $5) RETURNING *`,
      [equipment_id, operator_id, entry_date || new Date().toISOString().split('T')[0], 
       shift, notes]
    );

    const logbookEntry = entryResult.rows[0];

    // Insert fault report
    const faultResult = await db.query(
      `INSERT INTO fault_reports (
        logbook_entry_id, equipment_id, operator_id, fault_type, severity,
        title, description, immediate_action, equipment_stopped
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [logbookEntry.id, equipment_id, operator_id, fault_type, severity,
       title, description, immediate_action, equipment_stopped]
    );

    // Commit transaction
    await db.query('COMMIT');

    res.status(201).json({
      ...logbookEntry,
      fault_report: faultResult.rows[0]
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating fault report entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create operation entry
exports.createOperationEntry = async (req, res) => {
  try {
    const {
      equipment_id,
      operator_id,
      entry_date,
      shift,
      operating_hours,
      notes,
      start_time,
      end_time,
      load_description,
      max_load_used,
      cycles_count,
      unusual_loads,
      unusual_loads_description
    } = req.body;

    // Validate required fields
    if (!equipment_id || !operator_id || !start_time) {
      return res.status(400).json({ 
        error: 'Equipment ID, operator ID, and start time are required' 
      });
    }

    // Start transaction
    await db.query('BEGIN');

    // Create logbook entry
    const entryResult = await db.query(
      `INSERT INTO logbook_entries (
        equipment_id, operator_id, entry_date, entry_type, shift, 
        operating_hours, notes
      ) VALUES ($1, $2, $3, 'operation', $4, $5, $6) RETURNING *`,
      [equipment_id, operator_id, entry_date || new Date().toISOString().split('T')[0], 
       shift, operating_hours, notes]
    );

    const logbookEntry = entryResult.rows[0];

    // Insert operation record
    const operationResult = await db.query(
      `INSERT INTO operation_records (
        logbook_entry_id, start_time, end_time, load_description, max_load_used,
        cycles_count, unusual_loads, unusual_loads_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [logbookEntry.id, start_time, end_time, load_description, max_load_used,
       cycles_count, unusual_loads, unusual_loads_description]
    );

    // Commit transaction
    await db.query('COMMIT');

    res.status(201).json({
      ...logbookEntry,
      operation_record: operationResult.rows[0]
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating operation entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get checklist template
exports.getChecklistTemplate = async (req, res) => {
  try {
    const { category = 'daily', equipment_type } = req.query;
    
    let query = `
      SELECT ct.*, 
             array_agg(
               json_build_object(
                 'id', cti.id,
                 'item_text', cti.item_text,
                 'category', cti.category,
                 'order_index', cti.order_index,
                 'required', cti.required
               ) ORDER BY cti.order_index
             ) as items
      FROM checklist_templates ct
      LEFT JOIN checklist_template_items cti ON ct.id = cti.template_id
      WHERE ct.active = true AND ct.category = $1`;

    const params = [category];
    
    if (equipment_type) {
      query += ` AND (ct.equipment_type = $2 OR ct.equipment_type IS NULL)`;
      params.push(equipment_type);
    }

    query += ` GROUP BY ct.id ORDER BY ct.name`;

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting checklist template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Resolve fault report
exports.resolveFaultReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolved_by, resolution_notes } = req.body;

    if (!resolved_by) {
      return res.status(400).json({ error: 'Resolved by is required' });
    }

    const result = await db.query(
      `UPDATE fault_reports SET 
        resolved = true,
        resolved_date = CURRENT_TIMESTAMP,
        resolved_by = $1,
        resolution_notes = $2
       WHERE id = $1 RETURNING *`,
      [id, resolved_by, resolution_notes]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fault report not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error resolving fault report ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};