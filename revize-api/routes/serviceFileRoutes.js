const express = require('express');
const router = express.Router();
const serviceFileController = require('../controllers/serviceFileController');
const upload = require('../middleware/fileUpload');

// Získat všechny soubory pro servisní výjezd
router.get('/service/:serviceId/files', serviceFileController.getServiceFiles);

// Nahrát soubor k servisnímu výjezdu
router.post('/service/:serviceId/files', upload.single('file'), serviceFileController.uploadServiceFile);

// Stáhnout soubor
router.get('/service-files/:fileId/download', serviceFileController.downloadServiceFile);

// Aktualizovat informace o souboru
router.put('/service-files/:fileId', serviceFileController.updateServiceFileInfo);

// Smazat soubor
router.delete('/service-files/:fileId', serviceFileController.deleteServiceFile);

module.exports = router;