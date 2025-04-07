const express = require('express');
const router = express.Router();
const {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountsSummary,
} = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { 
  createAccountSchema, 
  updateAccountSchema 
} = require('../utils/validationSchemas');

// All routes are protected
router.use(protect);

// Get account summary
router.get('/summary', getAccountsSummary);

// Account CRUD operations
router.route('/')
  .get(getAccounts)
  .post(validate(createAccountSchema), createAccount);

router.route('/:id')
  .get(getAccountById)
  .put(validate(updateAccountSchema), updateAccount)
  .delete(deleteAccount);

module.exports = router; 