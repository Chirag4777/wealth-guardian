const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { 
  createBudgetSchema, 
  updateBudgetSchema 
} = require('../utils/validationSchemas');

// All routes are protected
router.use(protect);

// Get budget progress
router.get('/progress', getBudgetProgress);

// Budget CRUD operations
router.route('/')
  .get(getBudgets)
  .post(validate(createBudgetSchema), createBudget);

router.route('/:id')
  .get(getBudgetById)
  .put(validate(updateBudgetSchema), updateBudget)
  .delete(deleteBudget);

module.exports = router; 