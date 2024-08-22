const express = require('express');
const { adminLogin, createAdmin } = require('../controllers/admin.controller');
const admin = express.Router();

// Login route
admin.post('/login', adminLogin);

// Create admin route (for setup purposes, remove or secure this in production)
admin.post('/create', createAdmin);

module.exports = admin;
