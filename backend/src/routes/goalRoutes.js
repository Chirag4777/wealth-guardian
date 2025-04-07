const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
  getGoalsSummary,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { 
  createGoalSchema, 
  updateGoalSchema 
} = require('../utils/validationSchemas');

// All routes are protected
router.use(protect);

// Get goals summary
router.get('/summary', getGoalsSummary);

// Goal CRUD operations
router.route('/')
  .get(getGoals)
  .post(validate(createGoalSchema), createGoal);

router.route('/:id')
  .get(getGoalById)
  .put(validate(updateGoalSchema), updateGoal)
  .delete(deleteGoal);

// Contribute to goal
router.put('/:id/contribute', contributeToGoal);

module.exports = router; 