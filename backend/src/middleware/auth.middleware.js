const jwt = require('jsonwebtoken');
const { http } = require('../utils/http');

const authenticateUser = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(http.unauthorized).json({ error: 'Authorization denied, token not found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach the entire decoded token
        next();
    } catch (err) {
        console.error('Authentication Error:', err.message);
        res.status(http.unauthorized).json({ error: 'Invalid token' });
    }
};

module.exports = { authenticateUser };
