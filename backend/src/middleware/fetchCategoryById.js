// src/middleware/fetchCategoryById.js

const { pool } = require("../config/db");
const { http } = require("../utils/http");

const fetchCategoryById = async (req, res, next) => {
    const categoryId = parseInt(req.params.id, 10);

    if (isNaN(categoryId)) {
        res.status(http.badRequest).json({ error: "Invalid category ID" });
        return;
    }

    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
        if (result.rows.length === 0) {
            res.status(http.notFound).json({ error: "Category not found" });
        } else {
            req.category = result.rows[0];
            next();
        }
    } catch (err) {
        console.error("Error fetching category by ID:", err);
        res.status(http.serverError).json({ error: "Internal server Error" });
    } finally {
        client.release();
    }
};

module.exports = fetchCategoryById;
