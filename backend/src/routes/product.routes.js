const express = require('express');
const router = express.Router();
const { insertProduct, getProduct, getProductById, updateProduct, deleteProduct } = require("../controllers/product.controller");
const fetchProductById = require("../middleware/fetchProductById");
const { authenticateUser } = require('../middleware/auth.middleware');

router.get('/', authenticateUser, getProduct);
router.get("/:id", authenticateUser, fetchProductById, getProductById);
router.post("/", authenticateUser, insertProduct);
router.put("/:id", authenticateUser, fetchProductById, updateProduct);
router.patch("/:id", authenticateUser, fetchProductById, updateProduct);
router.delete("/:id", authenticateUser, fetchProductById, deleteProduct);

module.exports = router;
