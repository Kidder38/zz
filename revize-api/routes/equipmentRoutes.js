const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');

// GET /api/equipment - Get all equipment
router.get('/', equipmentController.getEquipment);

// GET /api/equipment/:id - Get equipment by ID
router.get('/:id', equipmentController.getEquipmentById);

// POST /api/equipment - Create new equipment
router.post('/', equipmentController.createEquipment);

// PUT /api/equipment/:id - Update equipment
router.put('/:id', equipmentController.updateEquipment);

// DELETE /api/equipment/:id - Delete equipment
router.delete('/:id', equipmentController.deleteEquipment);

// GET /api/equipment/:id/revisions - Get equipment's revisions
router.get('/:id/revisions', equipmentController.getEquipmentRevisions);

// GET /api/equipment/:id/service-visits - Get equipment's service visits
router.get('/:id/service-visits', equipmentController.getEquipmentServiceVisits);

// GET /api/equipment/:id/inspections - Get equipment's inspections
router.get('/:id/inspections', equipmentController.getEquipmentInspections);

module.exports = router;
