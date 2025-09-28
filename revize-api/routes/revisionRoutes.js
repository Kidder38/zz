const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revisionController');

// GET /api/revisions - Get all revisions
router.get('/', revisionController.getRevisions);

// GET /api/revisions/:id - Get revision by ID
router.get('/:id', revisionController.getRevisionById);

// POST /api/revisions - Create new revision
router.post('/', revisionController.createRevision);

// PUT /api/revisions/:id - Update revision
router.put('/:id', revisionController.updateRevision);

// DELETE /api/revisions/:id - Delete revision
router.delete('/:id', revisionController.deleteRevision);

// GET /api/revisions/:id/pdf - Generate PDF revision report
router.get('/:id/pdf', revisionController.generateRevisionPdf);

module.exports = router;