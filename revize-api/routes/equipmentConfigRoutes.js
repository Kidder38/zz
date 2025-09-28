const express = require('express');
const router = express.Router();
const equipmentConfigController = require('../controllers/equipmentConfigController');

// GET /api/equipment-configs/equipment/:equipment_id - Get all configurations for an equipment
router.get('/equipment/:equipment_id', equipmentConfigController.getConfigurationsForEquipment);

// GET /api/equipment-configs/:id - Get configuration by ID
router.get('/:id', equipmentConfigController.getConfigurationById);

// POST /api/equipment-configs - Create a new configuration
router.post('/', equipmentConfigController.createConfiguration);

// PUT /api/equipment-configs/:id - Update a configuration
router.put('/:id', equipmentConfigController.updateConfiguration);

// DELETE /api/equipment-configs/:id - Delete a configuration
router.delete('/:id', equipmentConfigController.deleteConfiguration);

module.exports = router;