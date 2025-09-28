const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');

// GET /api/operators - Get all operators
router.get('/', operatorController.getOperators);

// GET /api/operators/:id - Get operator by ID
router.get('/:id', operatorController.getOperatorById);

// POST /api/operators - Create new operator
router.post('/', operatorController.createOperator);

// PUT /api/operators/:id - Update operator
router.put('/:id', operatorController.updateOperator);

// DELETE /api/operators/:id - Delete (deactivate) operator
router.delete('/:id', operatorController.deleteOperator);

// GET /api/operators/equipment/:equipment_id - Get operators for specific equipment
router.get('/equipment/:equipment_id', operatorController.getOperatorsForEquipment);

module.exports = router;