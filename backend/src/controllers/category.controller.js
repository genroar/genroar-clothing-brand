// src/controllers/category.controller.js

const { pool } = require("../config/db");
const { http } = require("../utils/http");

// Get Categories
const getCategories = async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM categories');
        const categories = result.rows;
        client.release();
        res.json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(http.serverError).json({ error: "Internal server Error" });
    }
};

// Get Category by ID
const getCategoryById = async (req, res) => {
    try {
        if (req.category) {
            res.json(req.category);
        } else {
            res.status(http.notFound).json({ error: "Category not found" });
        }
    } catch (err) {
        console.error("Error getting category by ID:", err);
        res.status(http.badRequest).json({ error: "Internal Server Error" });
    }
};

// Insert Category
const insertCategory = async (req, res) => {
    const { name, description } = req.body;

    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO categories (name, description)
            VALUES ($1, $2)
            RETURNING id`;
        const values = [name, description];

        const result = await client.query(query, values);
        const insertedCategoryId = result.rows[0].id;

        res.status(http.created).json({
            message: 'Category inserted successfully',
            categoryId: insertedCategoryId
        });
    } catch (err) {
        console.error("Error inserting category:", err);
        res.status(http.serverError).json({ error: "Error inserting category" });
    } finally {
        client.release();
    }
};

// Update Category with PUT
const updateCategoryPut = async (req, res) => {
    const { name, description } = req.body;

    const client = await pool.connect();

    try {
        const query = `
            UPDATE categories
            SET name = $1, description = $2
            WHERE id = $3`;
        const values = [name, description, req.category.id];

        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            res.status(http.notFound).json({ error: "Category not found" });
        } else {
            res.status(http.success).json({ message: "Category updated successfully" });
        }
    } catch (err) {
        console.error("Error updating category:", err);
        res.status(http.serverError).json({ error: "Error updating category" });
    } finally {
        client.release();
    }
};

// Update Category with PATCH
const updateCategoryPatch = async (req, res) => {
    const updates = req.body;

    const client = await pool.connect();

    try {
        const setClause = Object.keys(updates).map((key, idx) => `${key} = $${idx + 1}`).join(", ");
        const values = Object.values(updates);

        const query = `UPDATE categories SET ${setClause} WHERE id = $${values.length + 1}`;
        values.push(req.category.id);

        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            res.status(http.notFound).json({ error: "Category not found" });
        } else {
            res.status(http.success).json({ message: "Category updated successfully" });
        }
    } catch (err) {
        console.error("Error updating category:", err);
        res.status(http.serverError).json({ error: "Error updating category" });
    } finally {
        client.release();
    }
};

// Delete Category
const deleteCategory = async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query('DELETE FROM categories WHERE id = $1', [req.category.id]);

        if (result.rowCount === 0) {
            res.status(http.notFound).json({ error: "Category not found" });
        } else {
            res.status(http.success).json({ message: "Category deleted successfully" });
        }
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(http.serverError).json({ error: "Error deleting category" });
    } finally {
        client.release();
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    insertCategory,
    updateCategoryPut,
    updateCategoryPatch,
    deleteCategory
};
