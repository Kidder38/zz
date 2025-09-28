const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  assignEquipmentToProject,
  deleteProject
} = require('../controllers/projectController');

// Middleware pro autentifikaci (pokud je potYeba)
// const { authenticateToken } = require('../middleware/auth');

// GET /api/projects - Z�skat vaechny projekty s filtry
router.get('/', getProjects);

// GET /api/projects/:id - Z�skat detail projektu
router.get('/:id', getProject);

// POST /api/projects - VytvoYit nov� projekt
router.post('/', createProject);

// POST /api/projects/:id/equipment - PYiYadit jeY�b k projektu
router.post('/:id/equipment', assignEquipmentToProject);

// DELETE /api/projects/:id - Smazat projekt
router.delete('/:id', deleteProject);

// PUT /api/projects/:id - Aktualizovat projekt
router.put('/:id', updateProject);

// DELETE /api/projects/:id/equipment/:equipmentId - Odebrat jeY�b z projektu (zat�m neimplementov�no)
// router.delete('/:id/equipment/:equipmentId', removeEquipmentFromProject);

module.exports = router;