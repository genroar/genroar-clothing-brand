// src/routes/category.routes.js

const express = require('express');
const category = express.Router();
const {
    getCategories,
    getCategoryById,
    insertCategory,
    updateCategoryPut,
    updateCategoryPatch,
    deleteCategory
} = require("../controllers/category.controller");
const fetchCategoryById = require("../middleware/fetchCategoryById");
const { authenticateUser } = require('../middleware/auth.middleware');

category.get('/', authenticateUser, getCategories);
category.get("/:id", authenticateUser, fetchCategoryById, getCategoryById);
category.post("/", authenticateUser, insertCategory);
category.put("/:id", authenticateUser, fetchCategoryById, updateCategoryPut);
category.patch("/:id", authenticateUser, fetchCategoryById, updateCategoryPatch);
category.delete("/:id", authenticateUser, fetchCategoryById, deleteCategory);

module.exports = category;
