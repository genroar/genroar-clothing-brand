const { pool } = require("../config/db");
const { http } = require("../utils/http");

const fetchProductById = async (req, res, next) => {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
        res.status(http.badRequest).json({ error: "Invalid product ID" });
        return;
    }

    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (result.rows.length === 0) {
            res.status(http.notFound).json({ error: "Product not found" });
        } else {
            req.product = result.rows[0];
            next();
        }
    } catch (err) {
        console.error("Error fetching product by ID:", err);
        res.status(http.serverError).json({ error: "Internal server Error" });
    } finally {
        client.release();
    }
};

module.exports = fetchProductById;
