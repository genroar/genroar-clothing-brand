const jwt = require('jsonwebtoken');
const { http } = require('../utils/http');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(http.unauthorized).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(http.unauthorized).json({ error: 'Invalid token' });
    }
};

module.exports = auth;
