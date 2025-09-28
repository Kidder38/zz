const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET /api/customers - Get all customers
router.get('/', customerController.getCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', customerController.getCustomerById);

// POST /api/customers - Create new customer
router.post('/', customerController.createCustomer);

// PUT /api/customers/:id - Update customer
router.put('/:id', customerController.updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', customerController.deleteCustomer);

// GET /api/customers/:id/equipment - Get customer's equipment
router.get('/:id/equipment', customerController.getCustomerEquipment);

module.exports = router;
