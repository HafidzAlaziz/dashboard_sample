const express = require('express');
const router = express.Router();
const { getCustomers, registerCustomer } = require('../controllers/customersController');

router.get('/', getCustomers);
router.post('/', registerCustomer);

module.exports = router;
