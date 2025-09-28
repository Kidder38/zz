const express = require('express');
const router = express.Router();
const defectController = require('../controllers/defectController');

// GET /api/defects - Get all defects
router.get('/', defectController.getDefects);

// GET /api/defects/revision/:revisionId - Get defects by revision ID
router.get('/revision/:revisionId', defectController.getDefectsByRevisionId);

// POST /api/defects - Create new defect
router.post('/', defectController.createDefect);

// PUT /api/defects/:id - Update defect
router.put('/:id', defectController.updateDefect);

// DELETE /api/defects/:id - Delete defect
router.delete('/:id', defectController.deleteDefect);

module.exports = router;