const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

/**
 * Get all goals for the logged-in user
 * @route GET /api/goals
 * @access Private
 */
const getGoals = asyncHandler(async (req, res) => {
  const goals = await prisma.goal.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      targetDate: 'asc',
    },
  });

  res.json(goals);
});

/**
 * Get a single goal by ID
 * @route GET /api/goals/:id
 * @access Private
 */
const getGoalById = asyncHandler(async (req, res) => {
  const goal = await prisma.goal.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!goal) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if goal belongs to logged-in user
  if (goal.userId !== req.user.id) {
    const error = new Error('Not authorized to access this goal');
    error.statusCode = 403;
    throw error;
  }

  res.json(goal);
});

/**
 * Create a new goal
 * @route POST /api/goals
 * @access Private
 */
const createGoal = asyncHandler(async (req, res) => {
  const { name, targetAmount, currentAmount, startDate, targetDate, category } = req.body;

  const goal = await prisma.goal.create({
    data: {
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      targetDate: new Date(targetDate),
      category,
      userId: req.user.id,
    },
  });

  res.status(201).json(goal);
});

/**
 * Update a goal
 * @route PUT /api/goals/:id
 * @access Private
 */
const updateGoal = asyncHandler(async (req, res) => {
  const goal = await prisma.goal.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!goal) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if goal belongs to logged-in user
  if (goal.userId !== req.user.id) {
    const error = new Error('Not authorized to update this goal');
    error.statusCode = 403;
    throw error;
  }

  // Process dates if provided
  const updateData = { ...req.body };
  if (updateData.startDate) {
    updateData.startDate = new Date(updateData.startDate);
  }
  if (updateData.targetDate) {
    updateData.targetDate = new Date(updateData.targetDate);
  }

  const updatedGoal = await prisma.goal.update({
    where: {
      id: req.params.id,
    },
    data: updateData,
  });

  res.json(updatedGoal);
});

/**
 * Delete a goal
 * @route DELETE /api/goals/:id
 * @access Private
 */
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await prisma.goal.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!goal) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if goal belongs to logged-in user
  if (goal.userId !== req.user.id) {
    const error = new Error('Not authorized to delete this goal');
    error.statusCode = 403;
    throw error;
  }

  await prisma.goal.delete({
    where: {
      id: req.params.id,
    },
  });

  res.json({ message: 'Goal deleted successfully' });
});

/**
 * Update goal progress (contribution)
 * @route PUT /api/goals/:id/contribute
 * @access Private
 */
const contributeToGoal = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    const error = new Error('Valid positive amount is required');
    error.statusCode = 400;
    throw error;
  }

  const goal = await prisma.goal.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!goal) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if goal belongs to logged-in user
  if (goal.userId !== req.user.id) {
    const error = new Error('Not authorized to update this goal');
    error.statusCode = 403;
    throw error;
  }

  // Calculate new current amount
  const newAmount = goal.currentAmount + amount;
  const isCompleted = newAmount >= goal.targetAmount;

  // Update goal
  const updatedGoal = await prisma.goal.update({
    where: {
      id: req.params.id,
    },
    data: {
      currentAmount: newAmount > goal.targetAmount ? goal.targetAmount : newAmount,
    },
  });

  // Create a transaction record for this contribution if there's an account ID
  if (req.body.accountId) {
    try {
      await prisma.transaction.create({
        data: {
          amount,
          description: `Contribution to goal: ${goal.name}`,
          type: 'EXPENSE',
          category: 'Savings',
          userId: req.user.id,
          accountId: req.body.accountId,
        },
      });

      // Update account balance
      await prisma.account.update({
        where: {
          id: req.body.accountId,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });
    } catch (error) {
      // If transaction creation fails, log but don't fail the main operation
      console.error('Failed to create transaction for goal contribution:', error);
    }
  }

  res.json({
    ...updatedGoal,
    isCompleted,
  });
});

/**
 * Get goal progress summary
 * @route GET /api/goals/summary
 * @access Private
 */
const getGoalsSummary = asyncHandler(async (req, res) => {
  const goals = await prisma.goal.findMany({
    where: {
      userId: req.user.id,
    },
  });

  // Calculate summary statistics
  const summary = {
    totalGoals: goals.length,
    totalTargetAmount: goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
    totalCurrentAmount: goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
    completedGoals: goals.filter(goal => goal.currentAmount >= goal.targetAmount).length,
    upcomingGoals: goals.filter(goal => {
      const daysRemaining = Math.ceil(
        (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysRemaining <= 30 && goal.currentAmount < goal.targetAmount;
    }).length,
    goals: goals.map(goal => {
      const daysRemaining = Math.ceil(
        (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      const percentComplete = (goal.currentAmount / goal.targetAmount) * 100;
      return {
        ...goal,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        percentComplete,
        isCompleted: goal.currentAmount >= goal.targetAmount,
      };
    }),
  };

  res.json(summary);
});

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
  getGoalsSummary,
}; 