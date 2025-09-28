const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET /api/service-visits - Get all service visits
router.get('/', serviceController.getServiceVisits);

// GET /api/service-visits/:id - Get service visit by ID
router.get('/:id', serviceController.getServiceVisitById);

// POST /api/service-visits - Create new service visit
router.post('/', serviceController.createServiceVisit);

// PUT /api/service-visits/:id - Update service visit
router.put('/:id', serviceController.updateServiceVisit);

// DELETE /api/service-visits/:id - Delete service visit
router.delete('/:id', serviceController.deleteServiceVisit);

module.exports = router;
