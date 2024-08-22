const { pool } = require('../config/db');
const { http } = require('../utils/http');

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM orders');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    const orderId = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (result.rows.length === 0) {
            return res.status(http.notFound).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

// Create new order
const createOrder = async (req, res) => {
    const { user_id, product_id, quantity, status } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO orders (user_id, product_id, quantity, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, product_id, quantity, status]
        );
        res.status(http.created).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

// Update order by ID
const updateOrder = async (req, res) => {
    const orderId = req.params.id;
    const { user_id, product_id, quantity, status } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query(
            'UPDATE orders SET user_id = $1, product_id = $2, quantity = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [user_id, product_id, quantity, status, orderId]
        );
        if (result.rows.length === 0) {
            return res.status(http.notFound).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

// Partially update order by ID
const patchOrder = async (req, res) => {
    const orderId = req.params.id;
    const updates = req.body;
    const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
    const values = Object.values(updates);
    values.push(orderId);

    try {
        const client = await pool.connect();
        const result = await client.query(
            `UPDATE orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
            values
        );
        if (result.rows.length === 0) {
            return res.status(http.notFound).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error patching order:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

// Delete order by ID
const deleteOrder = async (req, res) => {
    const orderId = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);
        if (result.rows.length === 0) {
            return res.status(http.notFound).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    patchOrder,
    deleteOrder
};
