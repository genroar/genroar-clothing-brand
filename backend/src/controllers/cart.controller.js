const { pool } = require('../config/db');
const { http } = require('../utils/http');

const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        const client = await pool.connect();
        const query = 'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *';
        const values = [userId, productId, quantity];
        const result = await client.query(query, values);

        res.status(http.created).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

const getCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM cart WHERE user_id = $1';
        const result = await client.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

const updateCart = async (req, res) => {
    const { cartId, quantity } = req.body;

    try {
        const client = await pool.connect();
        const query = 'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
        const result = await client.query(query, [quantity, cartId]);

        if (result.rows.length === 0) {
            return res.status(http.notFound).json({ error: 'Cart item not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating cart:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

const removeFromCart = async (req, res) => {
    const { cartId } = req.body;

    try {
        const client = await pool.connect();
        const query = 'DELETE FROM cart WHERE id = $1 RETURNING *';
        const result = await client.query(query, [cartId]);

        if (result.rows.length === 0) {
            return res.status(http.notFound).json({ error: 'Cart item not found' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        console.error('Error removing from cart:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
};
