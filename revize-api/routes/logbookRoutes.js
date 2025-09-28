const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logbookController');

// GET /api/logbook/equipment/:equipment_id - Get logbook entries for equipment
router.get('/equipment/:equipment_id', logbookController.getLogbookEntries);

// GET /api/logbook/entry/:id - Get single logbook entry by ID
router.get('/entry/:id', logbookController.getLogbookEntryById);

// POST /api/logbook/daily-check - Create daily check entry
router.post('/daily-check', logbookController.createDailyCheckEntry);

// POST /api/logbook/fault-report - Create fault report entry
router.post('/fault-report', logbookController.createFaultReportEntry);

// POST /api/logbook/operation - Create operation entry
router.post('/operation', logbookController.createOperationEntry);

// GET /api/logbook/checklist-template - Get checklist template
router.get('/checklist-template', logbookController.getChecklistTemplate);

// PUT /api/logbook/fault-report/:id/resolve - Resolve fault report
router.put('/fault-report/:id/resolve', logbookController.resolveFaultReport);

module.exports = router;