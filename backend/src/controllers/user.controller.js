const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { http } = require('../utils/http');

// Register a new user
const userRegister = async (req, res) => {
    const { username, password, email, fullName, address, phone } = req.body;

    try {
        const client = await pool.connect();

        // Check if username or email already exists
        const existingUser = await client.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(http.badRequest).json({ error: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user into database
        const newUser = await client.query(
            'INSERT INTO users (username, password, email, full_name, address, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [username, hashedPassword, email, fullName, address, phone]
        );

        client.release();

        res.status(http.created).json(newUser.rows[0]);
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

// Login user
const userLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const client = await pool.connect();

        // Find user by username
        const user = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(http.unauthorized).json({ error: 'Invalid credentials' });
        }

        const storedPassword = user.rows[0].password;
        const isMatch = await bcrypt.compare(password, storedPassword);

        if (!isMatch) {
            return res.status(http.unauthorized).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    const userId = req.params.id;

    try {
        const client = await pool.connect();

        const userProfile = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userProfile.rows.length === 0) {
            return res.status(http.notFound).json({ error: 'User not found' });
        }

        res.json(userProfile.rows[0]);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    const userId = req.params.id;
    const { email, fullName, address, phone } = req.body;

    try {
        const client = await pool.connect();

        const updatedUser = await client.query(
            'UPDATE users SET email = $1, full_name = $2, address = $3, phone = $4 WHERE id = $5 RETURNING *',
            [email, fullName, address, phone, userId]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(http.notFound).json({ error: 'User not found' });
        }

        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(http.serverError).json({ error: 'Server error' });
    }
};

// Change user password
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    if (!currentPassword || !newPassword) {
        return res.status(http.badRequest).json({ error: 'Current and new passwords are required' });
    }

    const client = await pool.connect();
    try {
        const result = await client.query('SELECT password FROM users WHERE id = $1', [userId]);

        console.log("Result:", result)

        if (result.rows.length === 0) {
            return res.status(http.notFound).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        console.log("Password:", isMatch)

        if (!isMatch) {
            return res.status(http.unauthorized).json({ error: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.status(http.success).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing user password:', err);
        res.status(http.serverError).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

// Delete user account
const deleteUser = async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.status(http.badRequest).json({ error: 'User ID is required' });
    }

    const client = await pool.connect();
    try {
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

        if (result.rowCount === 0) {
            return res.status(http.notFound).json({ error: 'User not found' });
        }

        res.status(http.success).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(http.serverError).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

module.exports = { userRegister, userLogin, getUserProfile, updateUserProfile, changePassword, deleteUser };
