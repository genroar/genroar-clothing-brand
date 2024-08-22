const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCart, removeFromCart } = require('../controllers/cart.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

router.post('/', authenticateUser, addToCart);
router.get('/', authenticateUser, getCart);
router.put('/', authenticateUser, updateCart);
router.delete('/', authenticateUser, removeFromCart);

module.exports = router;
       