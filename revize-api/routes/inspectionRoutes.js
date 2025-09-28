const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');

// GET /api/inspections - Get all inspections
router.get('/', inspectionController.getInspections);

// GET /api/inspections/:id - Get inspection by ID
router.get('/:id', inspectionController.getInspectionById);

// POST /api/inspections - Create new inspection
router.post('/', inspectionController.createInspection);

// PUT /api/inspections/:id - Update inspection
router.put('/:id', inspectionController.updateInspection);

// DELETE /api/inspections/:id - Delete inspection
router.delete('/:id', inspectionController.deleteInspection);

module.exports = router;
