const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  checkEmailExists,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { 
  registerSchema, 
  loginSchema,
  checkEmailSchema,
  updateUserSchema 
} = require('../utils/validationSchemas');

// Public routes
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/check-email', validate(checkEmailSchema, 'query'), checkEmailExists);

// Protected routes
router.post('/logout', protect, logoutUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, validate(updateUserSchema), updateUserProfile);

module.exports = router; 