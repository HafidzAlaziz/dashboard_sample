const express = require('express');
const router = express.Router();
const { createOrder, getOrders, simulatePaymentSuccess, requestCancellation, updateOrderStatus } = require('../controllers/ordersController');

router.post('/', createOrder);
router.get('/', getOrders);
router.post('/simulate-success/:orderId', simulatePaymentSuccess);
router.post('/cancel/:orderId', requestCancellation);
router.put('/status/:orderId', updateOrderStatus);

module.exports = router;
