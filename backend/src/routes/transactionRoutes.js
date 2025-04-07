const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionCategories,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { 
  createTransactionSchema, 
  updateTransactionSchema 
} = require('../utils/validationSchemas');

// All routes are protected
router.use(protect);

// Get transaction categories summary
router.get('/categories', getTransactionCategories);

// Transaction CRUD operations
router.route('/')
  .get(getTransactions)
  .post(validate(createTransactionSchema), createTransaction);

router.route('/:id')
  .get(getTransactionById)
  .put(validate(updateTransactionSchema), updateTransaction)
  .delete(deleteTransaction);

module.exports = router; 