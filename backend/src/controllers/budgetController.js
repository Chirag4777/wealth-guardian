const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

/**
 * Get all budgets for the logged-in user
 * @route GET /api/budgets
 * @access Private
 */
const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await prisma.budget.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  res.json(budgets);
});

/**
 * Get a single budget by ID
 * @route GET /api/budgets/:id
 * @access Private
 */
const getBudgetById = asyncHandler(async (req, res) => {
  const budget = await prisma.budget.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!budget) {
    const error = new Error('Budget not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if budget belongs to logged-in user
  if (budget.userId !== req.user.id) {
    const error = new Error('Not authorized to access this budget');
    error.statusCode = 403;
    throw error;
  }

  res.json(budget);
});

/**
 * Create a new budget
 * @route POST /api/budgets
 * @access Private
 */
const createBudget = asyncHandler(async (req, res) => {
  const { name, amount, category, period, startDate, endDate } = req.body;

  const budget = await prisma.budget.create({
    data: {
      name,
      amount,
      category,
      period,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      userId: req.user.id,
    },
  });

  res.status(201).json(budget);
});

/**
 * Update a budget
 * @route PUT /api/budgets/:id
 * @access Private
 */
const updateBudget = asyncHandler(async (req, res) => {
  const budget = await prisma.budget.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!budget) {
    const error = new Error('Budget not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if budget belongs to logged-in user
  if (budget.userId !== req.user.id) {
    const error = new Error('Not authorized to update this budget');
    error.statusCode = 403;
    throw error;
  }

  // Process dates if provided
  const updateData = { ...req.body };
  if (updateData.startDate) {
    updateData.startDate = new Date(updateData.startDate);
  }
  if (updateData.endDate) {
    updateData.endDate = new Date(updateData.endDate);
  }

  const updatedBudget = await prisma.budget.update({
    where: {
      id: req.params.id,
    },
    data: updateData,
  });

  res.json(updatedBudget);
});

/**
 * Delete a budget
 * @route DELETE /api/budgets/:id
 * @access Private
 */
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await prisma.budget.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!budget) {
    const error = new Error('Budget not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if budget belongs to logged-in user
  if (budget.userId !== req.user.id) {
    const error = new Error('Not authorized to delete this budget');
    error.statusCode = 403;
    throw error;
  }

  await prisma.budget.delete({
    where: {
      id: req.params.id,
    },
  });

  res.json({ message: 'Budget deleted successfully' });
});

/**
 * Get budget progress with spending data
 * @route GET /api/budgets/progress
 * @access Private
 */
const getBudgetProgress = asyncHandler(async (req, res) => {
  // Get all active budgets
  const budgets = await prisma.budget.findMany({
    where: {
      userId: req.user.id,
      OR: [
        {
          endDate: {
            gte: new Date(),
          },
        },
        {
          endDate: null,
        },
      ],
    },
  });

  // Get spending data for each budget category
  const budgetProgress = await Promise.all(
    budgets.map(async (budget) => {
      let startDate, endDate;
      
      // Determine date range based on budget period
      switch (budget.period) {
        case 'DAILY':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'WEEKLY':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'MONTHLY':
          startDate = new Date();
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'QUARTERLY':
          startDate = new Date();
          startDate.setMonth(Math.floor(startDate.getMonth() / 3) * 3, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 3, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'YEARLY':
          startDate = new Date();
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = budget.startDate;
          endDate = budget.endDate || new Date();
      }

      // Calculate total spending for this category in the date range
      const totalSpending = await prisma.transaction.aggregate({
        where: {
          userId: req.user.id,
          category: budget.category,
          type: 'EXPENSE',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const spent = totalSpending._sum.amount || 0;
      const remaining = budget.amount - spent;
      const percentUsed = (spent / budget.amount) * 100;

      return {
        ...budget,
        progress: {
          spent,
          remaining,
          percentUsed,
          startDate,
          endDate,
        },
      };
    })
  );

  res.json(budgetProgress);
});

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
}; 