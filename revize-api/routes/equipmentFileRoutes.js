const express = require('express');
const router = express.Router();
const equipmentFileController = require('../controllers/equipmentFileController');
const upload = require('../middleware/fileUpload');

// Get all files for an equipment
router.get('/equipment/:equipmentId/files', equipmentFileController.getEquipmentFiles);

// Get files by type for an equipment
router.get('/equipment/:equipmentId/files/:fileType', equipmentFileController.getEquipmentFilesByType);

// Upload a file for an equipment
router.post('/equipment/:equipmentId/files', upload.single('file'), equipmentFileController.uploadEquipmentFile);

// Get a specific file
router.get('/files/:fileId', equipmentFileController.getEquipmentFile);

// Download a file
router.get('/files/:fileId/download', equipmentFileController.downloadEquipmentFile);

// Update file info
router.put('/files/:fileId', equipmentFileController.updateEquipmentFileInfo);

// Delete a file
router.delete('/files/:fileId', equipmentFileController.deleteEquipmentFile);

module.exports = router;