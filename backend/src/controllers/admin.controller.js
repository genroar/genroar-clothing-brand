const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { http } = require('../utils/http');

// Admin login
const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(http.badRequest).json({ error: 'Username and password are required' });
    }

    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(http.unauthorized).json({ error: 'Invalid credentials' });
        }

        const admin = result.rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(http.unauthorized).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Error during admin login:', err);
        res.status(http.serverError).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

// Create a new admin (for setup purposes, remove or secure this in production)
const createAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(http.badRequest).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING id',
            [username, hashedPassword]
        );

        console.log("AdminResults:", result)

        res.status(http.created).json({ id: result.rows[0].id });
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(http.serverError).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

module.exports = { adminLogin, createAdmin };
