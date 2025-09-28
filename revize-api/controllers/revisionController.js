const db = require('../db');
// Původní generátory - ponecháno jako záloha
// const { generateRevisionPdf } = require('../utils/pdfGenerator');
// const { generateRevisionPdf } = require('../utils/pdfMakeGenerator');
// const { generateRevisionPdf } = require('../utils/pdfGeneratorWithEncoding');
// const { generateRevisionPdf } = require('../utils/pdfGenerator3');
// const { generateRevisionPdf } = require('../utils/pdfGeneratorCP1250');
// const { generateRevisionPdf } = require('../utils/pdfGeneratorMinimal');
// const { generateRevisionPdf } = require('../utils/pdfGeneratorUTF8');
// const { generateRevisionPdf } = require('../utils/pdfGeneratorHTML');
// const { generateRevisionPdf } = require('../utils/pdfGeneratorPDFLib');
// const { generateRevisionPdf } = require('../utils/pdfMakeGeneratorWithVFS');
// const { generateRevisionPdf } = require('../utils/pdfGeneratorASCII');
// const { generateRevisionPdf } = require('../utils/pdfGeneratorEnhanced');

// Nový čistý PDF generátor bez duplicit
const { generateRevisionPdf } = require('../utils/pdfGeneratorClean');

// Get all revisions
exports.getRevisions = async (req, res) => {
  try {
    const { equipment_id } = req.query;
    
    let query = `
      SELECT r.*, e.equipment_type, e.model, e.category, e.equipment_class, c.company_name
      FROM revisions r
      JOIN equipment e ON r.equipment_id = e.id
      JOIN customers c ON e.customer_id = c.id
    `;
    
    let queryParams = [];
    
    if (equipment_id) {
      query += ` WHERE r.equipment_id = $1`;
      queryParams.push(equipment_id);
    }
    
    query += ` ORDER BY r.revision_date DESC`;
    
    const result = await db.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error getting revisions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get revision by ID
exports.getRevisionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT r.*, e.equipment_type, e.model, e.category, e.equipment_class, c.company_name
       FROM revisions r
       JOIN equipment e ON r.equipment_id = e.id
       JOIN customers c ON e.customer_id = c.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Revision not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error getting revision ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new revision
exports.createRevision = async (req, res) => {
  try {
    const {
      equipment_id,
      configuration_id,
      category,
      equipment_class,
      equipment_type,
      model,
      technician_name,
      certification_number,
      revision_date,
      start_date,
      test_start_date,
      test_end_date,
      report_date,
      handover_date,
      evaluation,
      next_revision_date,
      next_inspection_date,
      documentation_check,
      equipment_check,
      functional_test,
      load_test,
      conclusion,
      location,
      revision_number,
      measuring_instruments,
      technical_assessment,
      defects,
      dangers,
      previous_controls_ok,
      technical_trend,
      procedure_type
    } = req.body;

    // Validate required fields
    if (!equipment_id || !technician_name || !revision_date || !evaluation || !location) {
      return res.status(400).json({ 
        error: 'Equipment ID, technician name, revision date, location, and evaluation are required' 
      });
    }

    // Check if equipment exists
    const equipmentCheck = await db.query('SELECT id FROM equipment WHERE id = $1', [equipment_id]);
    if (equipmentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Equipment not found' });
    }

    // Převod objektů na správný JSONB formát pro PostgreSQL
    const docCheckJSON = documentation_check ? JSON.stringify(documentation_check) : null;
    const equipCheckJSON = equipment_check ? JSON.stringify(equipment_check) : null;
    const funcTestJSON = functional_test ? JSON.stringify(functional_test) : null;
    const loadTestJSON = load_test ? JSON.stringify(load_test) : null;
    const measuringInstrumentsJSON = measuring_instruments ? JSON.stringify(measuring_instruments) : null;
    const technicalAssessmentJSON = technical_assessment ? JSON.stringify(technical_assessment) : null;
    const defectsJSON = defects ? JSON.stringify(defects) : null;
    const dangersJSON = dangers ? JSON.stringify(dangers) : null;
    
    console.log('Ukládám revizi s daty:', { 
      docCheck: docCheckJSON,
      equipCheck: equipCheckJSON,
      funcTest: funcTestJSON,
      loadTest: loadTestJSON,
      measuringInstruments: measuringInstrumentsJSON,
      technicalAssessment: technicalAssessmentJSON,
      defects: defectsJSON,
      dangers: dangersJSON
    });

    const result = await db.query(
      `INSERT INTO revisions (
        equipment_id, configuration_id, category, equipment_class, equipment_type, model,
        technician_name, certification_number, revision_date, start_date,
        test_start_date, test_end_date, report_date, handover_date,
        evaluation, next_revision_date, next_inspection_date, documentation_check,
        equipment_check, functional_test, load_test, conclusion, location, revision_number,
        measuring_instruments, technical_assessment, defects, dangers, previous_controls_ok, technical_trend, procedure_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31) RETURNING *`,
      [
        equipment_id, configuration_id, category, equipment_class, equipment_type, model,
        technician_name, certification_number, revision_date, start_date,
        test_start_date, test_end_date, report_date, handover_date,
        evaluation, next_revision_date, next_inspection_date, docCheckJSON,
        equipCheckJSON, funcTestJSON, loadTestJSON, conclusion, location, revision_number,
        measuringInstrumentsJSON, technicalAssessmentJSON, defectsJSON, dangersJSON, previous_controls_ok, technical_trend, procedure_type
      ]
    );

    // Update equipment with last and next revision dates
    await db.query(
      `UPDATE equipment SET 
        last_revision_date = $1, 
        next_revision_date = $2
      WHERE id = $3`,
      [revision_date, next_revision_date, equipment_id]
    );
    
    // Vrátíme vytvořenou revizi
    const newRevision = result.rows[0];

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating revision:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update revision
exports.updateRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      equipment_id,
      configuration_id,
      technician_name,
      certification_number,
      revision_date,
      start_date,
      test_start_date,
      test_end_date,
      report_date,
      handover_date,
      evaluation,
      next_revision_date,
      next_inspection_date,
      documentation_check,
      equipment_check,
      functional_test,
      load_test,
      conclusion,
      location,
      revision_number,
      measuring_instruments,
      technical_assessment,
      defects,
      dangers,
      previous_controls_ok,
      technical_trend,
      procedure_type
    } = req.body;

    // Validate required fields
    if (!equipment_id || !technician_name || !revision_date || !evaluation || !location) {
      return res.status(400).json({ 
        error: 'Equipment ID, technician name, revision date, location, and evaluation are required' 
      });
    }

    // Check if equipment exists
    const equipmentCheck = await db.query('SELECT id FROM equipment WHERE id = $1', [equipment_id]);
    if (equipmentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Equipment not found' });
    }
    
    // Převod objektů na správný JSONB formát pro PostgreSQL
    const docCheckJSON = documentation_check ? JSON.stringify(documentation_check) : null;
    const equipCheckJSON = equipment_check ? JSON.stringify(equipment_check) : null;
    const funcTestJSON = functional_test ? JSON.stringify(functional_test) : null;
    const loadTestJSON = load_test ? JSON.stringify(load_test) : null;
    const measuringInstrumentsJSON = measuring_instruments ? JSON.stringify(measuring_instruments) : null;
    const technicalAssessmentJSON = technical_assessment ? JSON.stringify(technical_assessment) : null;
    const defectsJSON = defects ? JSON.stringify(defects) : null;
    const dangersJSON = dangers ? JSON.stringify(dangers) : null;
    
    console.log('Aktualizuji revizi s daty:', { 
      docCheck: docCheckJSON,
      equipCheck: equipCheckJSON,
      funcTest: funcTestJSON,
      loadTest: loadTestJSON,
      measuringInstruments: measuringInstrumentsJSON,
      technicalAssessment: technicalAssessmentJSON,
      defects: defectsJSON,
      dangers: dangersJSON
    });

    const result = await db.query(
      `UPDATE revisions SET 
        equipment_id = $1, 
        configuration_id = $2, 
        category = $3,
        equipment_class = $4,
        equipment_type = $5,
        model = $6,
        technician_name = $7, 
        certification_number = $8, 
        revision_date = $9, 
        start_date = $10,
        test_start_date = $11,
        test_end_date = $12,
        report_date = $13,
        handover_date = $14,
        evaluation = $15, 
        next_revision_date = $16, 
        next_inspection_date = $17, 
        documentation_check = $18, 
        equipment_check = $19, 
        functional_test = $20, 
        load_test = $21, 
        conclusion = $22,
        location = $23,
        revision_number = $24,
        measuring_instruments = $25,
        technical_assessment = $26,
        defects = $27,
        dangers = $28,
        previous_controls_ok = $29,
        technical_trend = $30,
        procedure_type = $31
      WHERE id = $32 RETURNING *`,
      [
        equipment_id, configuration_id, category, equipment_class, equipment_type, model,
        technician_name, certification_number, revision_date, start_date,
        test_start_date, test_end_date, report_date, handover_date,
        evaluation, next_revision_date, next_inspection_date, docCheckJSON,
        equipCheckJSON, funcTestJSON, loadTestJSON, conclusion, location, revision_number,
        measuringInstrumentsJSON, technicalAssessmentJSON, defectsJSON, dangersJSON, previous_controls_ok, technical_trend, procedure_type, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    // Update equipment with last and next revision dates if this is the most recent revision
    const latestRevision = await db.query(
      `SELECT id FROM revisions 
       WHERE equipment_id = $1 
       ORDER BY revision_date DESC 
       LIMIT 1`,
      [equipment_id]
    );

    if (latestRevision.rows.length > 0 && latestRevision.rows[0].id === parseInt(id)) {
      await db.query(
        `UPDATE equipment SET 
          last_revision_date = $1, 
          next_revision_date = $2
        WHERE id = $3`,
        [revision_date, next_revision_date, equipment_id]
      );
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating revision ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete revision
exports.deleteRevision = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if revision exists and get equipment_id
    const revisionCheck = await db.query(
      'SELECT id, equipment_id, revision_date FROM revisions WHERE id = $1', 
      [id]
    );
    
    if (revisionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Revision not found' });
    }
    
    const equipmentId = revisionCheck.rows[0].equipment_id;
    
    // Delete the revision
    await db.query('DELETE FROM revisions WHERE id = $1', [id]);
    
    // Update equipment with the most recent revision dates
    const latestRevision = await db.query(
      `SELECT id, revision_date, next_revision_date FROM revisions 
       WHERE equipment_id = $1 
       ORDER BY revision_date DESC 
       LIMIT 1`,
      [equipmentId]
    );
    
    if (latestRevision.rows.length > 0) {
      await db.query(
        `UPDATE equipment SET 
          last_revision_date = $1, 
          next_revision_date = $2
        WHERE id = $3`,
        [
          latestRevision.rows[0].revision_date, 
          latestRevision.rows[0].next_revision_date, 
          equipmentId
        ]
      );
    } else {
      // No revisions left, clear the dates
      await db.query(
        `UPDATE equipment SET 
          last_revision_date = NULL, 
          next_revision_date = NULL
        WHERE id = $1`,
        [equipmentId]
      );
    }
    
    res.status(200).json({ message: 'Revision deleted successfully' });
  } catch (error) {
    console.error(`Error deleting revision ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generate PDF revision report
exports.generateRevisionPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get revision data with equipment, customer, and configuration information
    const revisionData = await db.query(
      `SELECT r.*, e.*, c.*, 
              ec.min_reach as config_min_reach, 
              ec.max_reach as config_max_reach, 
              ec.lift_height as config_lift_height, 
              ec.description as config_description,
              r.category as revision_category,
              r.equipment_class as revision_equipment_class,
              r.equipment_type as revision_equipment_type,
              r.model as revision_model
       FROM revisions r
       JOIN equipment e ON r.equipment_id = e.id
       JOIN customers c ON e.customer_id = c.id
       LEFT JOIN equipment_configurations ec ON r.configuration_id = ec.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (revisionData.rows.length === 0) {
      return res.status(404).json({ error: 'Revision not found' });
    }
    
    const revision = revisionData.rows[0];
    
    // Set the response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="revision-report-${id}.pdf"`
    );
    
    try {
      // Příprava dat o zařízení
      const equipmentData = {
        equipment_type: revision.revision_equipment_type || revision.equipment_type || '',
        model: revision.revision_model || revision.model || '',
        manufacturer: revision.manufacturer || '',
        serial_number: revision.serial_number || '',
        year_of_manufacture: revision.year_of_manufacture || '',
        inventory_number: revision.inventory_number || '',
        min_reach: revision.config_min_reach || '',
        max_reach: revision.config_max_reach || '',
        lift_height: revision.config_lift_height || '',
        max_load: revision.max_load || '',
        location: revision.location || '',
        category: revision.revision_category || revision.category || '',
        equipment_class: revision.revision_equipment_class || revision.equipment_class || '',
      };
      
      // Příprava dat o konfiguraci
      const configurationData = {
        id: revision.configuration_id || null,
        description: revision.config_description || '',
        min_reach: revision.config_min_reach || '',
        max_reach: revision.config_max_reach || '',
        lift_height: revision.config_lift_height || ''
      };
      
      // Příprava dat o zákazníkovi
      const customerData = {
        company_name: revision.company_name || '',
        street: revision.street || '',
        city: revision.city || '',
        postal_code: revision.postal_code || '',
        contact_person: revision.contact_person || '',
        ico: revision.ico || '',
        dic: revision.dic || '',
      };
      
      // Generate the PDF and stream it to the response
      await generateRevisionPdf(
        revision,
        equipmentData,
        customerData,
        configurationData,
        res
      );
    } catch (pdfError) {
      console.error(`Error in PDF generation:`, pdfError);
      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Error generating PDF' });
      }
    }
    
  } catch (error) {
    console.error(`Error generating PDF for revision ${req.params.id}:`, error);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};