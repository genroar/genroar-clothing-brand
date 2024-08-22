const express = require('express');
const router = express.Router();
const { userRegister, userLogin, getUserProfile, updateUserProfile, changePassword, deleteUser } = require('../controllers/user.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

// User Registration
router.post('/register', userRegister);

// User Login
router.post('/login', userLogin);

// Get User Profile
router.get('/:id', authenticateUser, getUserProfile);

// Update User Profile
router.put('/:id', authenticateUser, updateUserProfile);

// Change User Password
router.put('/:id/password', authenticateUser, changePassword);

// Delete User Account
router.delete('/:id', authenticateUser, deleteUser);

module.exports = router;
