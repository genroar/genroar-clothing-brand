const { pool } = require("../config/db");
const { http } = require("../utils/http");

// Get Products
const getProduct = async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM products');
        const products = result.rows;
        client.release();
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(http.serverError).json({ error: "Internal server Error" });
    }
};

// Get Product by id
const getProductById = async (req, res) => {
    try {
        if (req.product) {
            res.json(req.product);
        } else {
            res.status(http.notFound).json({ error: "Product not found" });
        }
    } catch (err) {
        console.error("Error getting product by ID:", err);
        res.status(http.badRequest).json({ error: "Internal Server Error" });
    }
};

// Insert Product
const insertProduct = async (req, res) => {
    const {
        name,
        description,
        price,
        stock,
        size,
        color,
        category,
        brand,
        material,
        images
    } = req.body;

    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO products (name, description, price, stock, size, color, category, brand, material, images)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id`;
        const values = [
            name,
            description,
            price,
            stock,
            size,
            color,
            category,
            brand,
            material,
            images
        ];

        const result = await client.query(query, values);
        const insertedProductId = result.rows[0].id;

        res.status(http.success).json({
            message: 'Product inserted successfully',
            productId: insertedProductId
        });
    } catch (err) {
        console.error("Error inserting product:", err);
        res.status(http.serverError).json({ error: "Error inserting product" });
    } finally {
        client.release();
    }
};

// Update Product
const updateProduct = async (req, res) => {
    const {
        name,
        description,
        price,
        stock,
        size,
        color,
        category,
        brand,
        material,
        images
    } = req.body;

    const client = await pool.connect();

    try {
        const query = `
            UPDATE products
            SET name = $1, description = $2, price = $3, stock = $4, size = $5, color = $6, category = $7, brand = $8, material = $9, images = $10
            WHERE id = $11`;
        const values = [
            name,
            description,
            price,
            stock,
            size,
            color,
            category,
            brand,
            material,
            images,
            req.product.id
        ];

        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            res.status(http.notFound).json({ error: "Product not found" });
        } else {
            res.status(http.success).json({ message: "Product updated successfully" });
        }
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(http.serverError).json({ error: "Error updating product" });
    } finally {
        client.release();
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query('DELETE FROM products WHERE id = $1', [req.product.id]);

        if (result.rowCount === 0) {
            res.status(http.notFound).json({ error: "Product not found" });
        } else {
            res.status(http.success).json({ message: "Product deleted successfully" });
        }
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(http.serverError).json({ error: "Error deleting product" });
    } finally {
        client.release();
    }
};

module.exports = { insertProduct, getProduct, getProductById, updateProduct, deleteProduct };
