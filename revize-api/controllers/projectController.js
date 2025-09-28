const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/revize_db'
});

// Získat všechny projekty/stavby
exports.getProjects = async (req, res) => {
  try {
    const { status, priority, search, limit = 50, offset = 0 } = req.query;
    
    // Zjednoduším dotaz pro testování
    let query = `
      SELECT p.*
      FROM projects p
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Aplikovat filtry
    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      query += ` AND p.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        p.name ILIKE $${paramIndex} OR 
        p.project_number ILIKE $${paramIndex} OR 
        p.client ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += `
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    
    // Formátovat výsledky
    const projects = result.rows.map(row => ({
      ...row,
      location: {
        address: row.address,
        gps_latitude: row.gps_latitude,
        gps_longitude: row.gps_longitude
      },
      assigned_equipment: [] // Zatím prázdné pro zjednodušení
    }));

    res.json(projects);
  } catch (error) {
    console.error('Chyba při načítání projektů:', error);
    res.status(500).json({ error: 'Došlo k chybě při načítání projektů' });
  }
};

// Získat detail projektu
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        ARRAY_AGG(
          CASE 
            WHEN pe.equipment_id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', pe.id,
                'equipment_id', pe.equipment_id,
                'equipment_type', e.equipment_type,
                'model', e.model,
                'manufacturer', e.manufacturer,
                'serial_number', e.serial_number,
                'assigned_date', pe.assigned_date,
                'planned_removal_date', pe.planned_removal_date,
                'actual_removal_date', pe.actual_removal_date,
                'operator_id', pe.operator_id,
                'notes', pe.notes
              )
            ELSE NULL
          END
        ) FILTER (WHERE pe.equipment_id IS NOT NULL) as assigned_equipment
      FROM projects p
      LEFT JOIN project_equipment pe ON p.id = pe.project_id
      LEFT JOIN equipment e ON pe.equipment_id = e.id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt nenalezen' });
    }

    const project = {
      ...result.rows[0],
      location: {
        address: result.rows[0].address,
        gps_latitude: result.rows[0].gps_latitude,
        gps_longitude: result.rows[0].gps_longitude
      },
      assigned_equipment: result.rows[0].assigned_equipment || []
    };

    res.json(project);
  } catch (error) {
    console.error(`Chyba při načítání projektu ${req.params.id}:`, error);
    res.status(500).json({ error: 'Došlo k chybě při načítání projektu' });
  }
};

// Vytvořit nový projekt
exports.createProject = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      name,
      project_number,
      client: clientName,
      priority = 'medium',
      location,
      start_date,
      planned_end_date,
      project_manager,
      site_manager,
      client_contact,
      client_phone,
      client_email,
      description,
      special_requirements
    } = req.body;

    // Generovat číslo projektu pokud není poskytnuto
    let finalProjectNumber = project_number;
    if (!finalProjectNumber) {
      const currentYear = new Date().getFullYear();
      const countQuery = 'SELECT COUNT(*) as count FROM projects WHERE project_number LIKE $1';
      const countResult = await client.query(countQuery, [`PRJ-${currentYear}-%`]);
      const nextNumber = (parseInt(countResult.rows[0].count) + 1).toString().padStart(3, '0');
      finalProjectNumber = `PRJ-${currentYear}-${nextNumber}`;
    }

    // Validace povinných polí (kromě project_number které se automaticky generuje)
    if (!name || !clientName || !start_date || !planned_end_date || !location?.address || !project_manager) {
      return res.status(400).json({ 
        error: 'Chybí povinná pole: name, client, start_date, planned_end_date, location.address, project_manager' 
      });
    }

    const insertQuery = `
      INSERT INTO projects (
        name, project_number, client, priority,
        address, gps_latitude, gps_longitude,
        start_date, planned_end_date,
        project_manager, site_manager, client_contact, client_phone,
        description, special_requirements
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *
    `;

    const values = [
      name,
      finalProjectNumber,
      clientName,
      priority,
      location.address,
      location.gps_latitude || null,
      location.gps_longitude || null,
      start_date,
      planned_end_date,
      project_manager || null,
      site_manager || null,
      client_contact || null,
      client_phone || null,
      description || null,
      special_requirements || null
    ];

    const result = await client.query(insertQuery, values);
    await client.query('COMMIT');

    const newProject = {
      ...result.rows[0],
      location: {
        address: result.rows[0].address,
        gps_latitude: result.rows[0].gps_latitude,
        gps_longitude: result.rows[0].gps_longitude
      },
      assigned_equipment: []
    };

    res.status(201).json(newProject);
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Číslo projektu již existuje' });
    } else {
      console.error('Chyba při vytváření projektu:', error);
      res.status(500).json({ error: 'Došlo k chybě při vytváření projektu' });
    }
  } finally {
    client.release();
  }
};

// Aktualizovat projekt
exports.updateProject = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      name,
      project_number,
      client: clientName,
      status,
      priority,
      location,
      start_date,
      planned_end_date,
      actual_end_date,
      project_manager,
      site_manager,
      client_contact,
      client_phone,
      description,
      special_requirements
    } = req.body;

    const updateQuery = `
      UPDATE projects SET
        name = COALESCE($2, name),
        project_number = COALESCE($3, project_number),
        client = COALESCE($4, client),
        status = COALESCE($5, status),
        priority = COALESCE($6, priority),
        address = COALESCE($7, address),
        gps_latitude = COALESCE($8, gps_latitude),
        gps_longitude = COALESCE($9, gps_longitude),
        start_date = COALESCE($10, start_date),
        planned_end_date = COALESCE($11, planned_end_date),
        actual_end_date = COALESCE($12, actual_end_date),
        project_manager = COALESCE($13, project_manager),
        site_manager = COALESCE($14, site_manager),
        client_contact = COALESCE($15, client_contact),
        client_phone = COALESCE($16, client_phone),
        description = COALESCE($17, description),
        special_requirements = COALESCE($18, special_requirements),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id, name, project_number, clientName, status, priority,
      location?.address, location?.gps_latitude, location?.gps_longitude,
      start_date, planned_end_date, actual_end_date,
      project_manager, site_manager, client_contact, client_phone,
      description, special_requirements
    ];

    const result = await client.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Projekt nenalezen' });
    }

    await client.query('COMMIT');

    const updatedProject = {
      ...result.rows[0],
      location: {
        address: result.rows[0].address,
        gps_latitude: result.rows[0].gps_latitude,
        gps_longitude: result.rows[0].gps_longitude
      }
    };

    res.json(updatedProject);
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '23505') {
      res.status(400).json({ error: 'Číslo projektu již existuje' });
    } else {
      console.error(`Chyba při aktualizaci projektu ${req.params.id}:`, error);
      res.status(500).json({ error: 'Došlo k chybě při aktualizaci projektu' });
    }
  } finally {
    client.release();
  }
};

// Přiřadit jeřáb k projektu
exports.assignEquipmentToProject = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id: projectId } = req.params;
    const {
      equipment_id,
      assigned_date,
      planned_removal_date,
      operator_id,
      operator_name,
      notes
    } = req.body;

    if (!equipment_id || !assigned_date) {
      return res.status(400).json({ 
        error: 'Chybí povinná pole: equipment_id, assigned_date' 
      });
    }

    const insertQuery = `
      INSERT INTO project_equipment (
        project_id, equipment_id, assigned_date, planned_removal_date,
        operator_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      projectId, equipment_id, assigned_date, planned_removal_date || null,
      operator_id || null, notes || null
    ];

    const result = await client.query(insertQuery, values);
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      assignment: result.rows[0],
      message: 'Jeřáb byl úspěšně přiřazen ke stavbě'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Chyba při přiřazování jeřábu k projektu ${req.params.id}:`, error);
    res.status(500).json({ error: 'Došlo k chybě při přiřazování jeřábu' });
  } finally {
    client.release();
  }
};

// Smazat projekt
exports.deleteProject = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM projects WHERE id = $1 RETURNING id';
    const result = await client.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Projekt nenalezen' });
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Projekt byl úspěšně smazán' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Chyba při mazání projektu ${req.params.id}:`, error);
    res.status(500).json({ error: 'Došlo k chybě při mazání projektu' });
  } finally {
    client.release();
  }
};