const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    patchOrder,
    deleteOrder
} = require('../controllers/order.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

router.get('/', authenticateUser, getAllOrders);
router.get('/:id', authenticateUser, getOrderById);
router.post('/', authenticateUser, createOrder);
router.put('/:id', authenticateUser, updateOrder);
router.patch('/:id', authenticateUser, patchOrder);
router.delete('/:id', authenticateUser, deleteOrder);

module.exports = router;
