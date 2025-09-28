const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Veřejné endpointy
router.post('/login', userController.login);

// Chráněné endpointy - vyžadují autentizaci
router.get('/profile', auth.authenticate, userController.getProfile);
router.post('/change-password', auth.authenticate, userController.changePassword);

// Endpointy pouze pro administrátory
router.get('/', auth.authenticate, auth.authorize(['admin']), userController.getUsers);
router.get('/:id', auth.authenticate, auth.authorize(['admin']), userController.getUserById);
router.post('/', auth.authenticate, auth.authorize(['admin']), userController.createUser);
router.put('/:id', auth.authenticate, auth.authorize(['admin']), userController.updateUser);
router.delete('/:id', auth.authenticate, auth.authorize(['admin']), userController.deleteUser);

module.exports = router;