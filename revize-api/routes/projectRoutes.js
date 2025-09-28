const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// GET /api/projects - Get all projects with filters
router.get('/', projectController.getProjects);

// GET /api/projects/:id - Get project by ID
router.get('/:id', projectController.getProjectById);

// POST /api/projects - Create new project
router.post('/', projectController.createProject);

// PUT /api/projects/:id - Update project
router.put('/:id', projectController.updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', projectController.deleteProject);

// POST /api/projects/:id/equipment - Assign equipment to project
router.post('/:id/equipment', projectController.assignEquipmentToProject);

// PUT /api/projects/:id/equipment/:equipmentId/remove - Remove equipment from project
router.put('/:id/equipment/:equipmentId/remove', projectController.removeEquipmentFromProject);

module.exports = router;