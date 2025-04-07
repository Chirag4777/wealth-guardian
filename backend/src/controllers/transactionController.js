const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

/**
 * Get all transactions for the logged-in user
 * @route GET /api/transactions
 * @access Private
 */
const getTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  // Build filter conditions
  const where = { userId: req.user.id };
  
  // Filter by account if provided
  if (req.query.accountId) {
    where.accountId = req.query.accountId;
  }
  
  // Filter by type if provided
  if (req.query.type) {
    where.type = req.query.type;
  }
  
  // Filter by category if provided
  if (req.query.category) {
    where.category = req.query.category;
  }
  
  // Filter by date range if provided
  if (req.query.startDate) {
    where.date = {
      ...where.date,
      gte: new Date(req.query.startDate),
    };
  }
  
  if (req.query.endDate) {
    where.date = {
      ...where.date,
      lte: new Date(req.query.endDate),
    };
  }

  // Get transactions with pagination
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      account: {
        select: {
          name: true,
          type: true,
          currency: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
    skip,
    take: limit,
  });

  // Count total transactions for pagination
  const total = await prisma.transaction.count({ where });
  
  res.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get transaction by ID
 * @route GET /api/transactions/:id
 * @access Private
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      account: {
        select: {
          name: true,
          type: true,
          currency: true,
        },
      },
    },
  });

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if transaction belongs to logged-in user
  if (transaction.userId !== req.user.id) {
    const error = new Error('Not authorized to access this transaction');
    error.statusCode = 403;
    throw error;
  }

  res.json(transaction);
});

/**
 * Create a new transaction
 * @route POST /api/transactions
 * @access Private
 */
const createTransaction = asyncHandler(async (req, res) => {
  const { amount, description, date, category, type, accountId } = req.body;
  
  // Check if account exists and belongs to the user
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
    },
  });

  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }

  if (account.userId !== req.user.id) {
    const error = new Error('Not authorized to create transaction for this account');
    error.statusCode = 403;
    throw error;
  }

  // Create transaction in a transaction to ensure atomicity
  const transaction = await prisma.$transaction(async (prisma) => {
    // Create the transaction
    const newTransaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        date: date ? new Date(date) : new Date(),
        category,
        type,
        accountId,
        userId: req.user.id,
      },
    });
    
    // Update account balance based on transaction type
    let balanceChange = amount;
    if (type === 'EXPENSE') {
      balanceChange = -amount;
    }
    
    // Update account balance
    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });
    
    return newTransaction;
  });

  res.status(201).json(transaction);
});

/**
 * Update a transaction
 * @route PUT /api/transactions/:id
 * @access Private
 */
const updateTransaction = asyncHandler(async (req, res) => {
  // First get the original transaction
  const originalTransaction = await prisma.transaction.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      account: true,
    },
  });

  if (!originalTransaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if transaction belongs to logged-in user
  if (originalTransaction.userId !== req.user.id) {
    const error = new Error('Not authorized to update this transaction');
    error.statusCode = 403;
    throw error;
  }

  // If accountId is changing, verify the new account belongs to the user
  if (req.body.accountId && req.body.accountId !== originalTransaction.accountId) {
    const newAccount = await prisma.account.findUnique({
      where: {
        id: req.body.accountId,
      },
    });

    if (!newAccount) {
      const error = new Error('New account not found');
      error.statusCode = 404;
      throw error;
    }

    if (newAccount.userId !== req.user.id) {
      const error = new Error('Not authorized to move transaction to this account');
      error.statusCode = 403;
      throw error;
    }
  }

  // Calculate financial impacts of the update
  const originalImpact = originalTransaction.type === 'EXPENSE' 
    ? -originalTransaction.amount 
    : originalTransaction.amount;
  
  const newAmount = req.body.amount !== undefined ? req.body.amount : originalTransaction.amount;
  const newType = req.body.type || originalTransaction.type;
  const newImpact = newType === 'EXPENSE' ? -newAmount : newAmount;
  
  // Execute the update in a transaction to ensure atomicity
  const updatedTransaction = await prisma.$transaction(async (prisma) => {
    // Revert the original transaction's effect on the original account
    await prisma.account.update({
      where: {
        id: originalTransaction.accountId,
      },
      data: {
        balance: {
          decrement: originalImpact,
        },
      },
    });
    
    // Update the transaction
    const updated = await prisma.transaction.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
      },
    });
    
    // Apply the new transaction's effect to the (possibly new) account
    await prisma.account.update({
      where: {
        id: req.body.accountId || originalTransaction.accountId,
      },
      data: {
        balance: {
          increment: newImpact,
        },
      },
    });
    
    return updated;
  });

  res.json(updatedTransaction);
});

/**
 * Delete a transaction
 * @route DELETE /api/transactions/:id
 * @access Private
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  // First get the original transaction
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if transaction belongs to logged-in user
  if (transaction.userId !== req.user.id) {
    const error = new Error('Not authorized to delete this transaction');
    error.statusCode = 403;
    throw error;
  }

  // Calculate the transaction's impact on account balance
  const balanceImpact = transaction.type === 'EXPENSE' 
    ? -transaction.amount 
    : transaction.amount;

  // Delete transaction and update account balance atomically
  await prisma.$transaction(async (prisma) => {
    // Delete the transaction
    await prisma.transaction.delete({
      where: {
        id: req.params.id,
      },
    });
    
    // Revert the transaction's effect on the account
    await prisma.account.update({
      where: {
        id: transaction.accountId,
      },
      data: {
        balance: {
          decrement: balanceImpact,
        },
      },
    });
  });

  res.json({ message: 'Transaction deleted successfully' });
});

/**
 * Get transaction categories summary
 * @route GET /api/transactions/categories
 * @access Private
 */
const getTransactionCategories = asyncHandler(async (req, res) => {
  // Filter parameters
  const type = req.query.type || 'EXPENSE'; // Default to expense
  const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

  // Get transactions grouped by category
  const categories = await prisma.transaction.groupBy({
    by: ['category'],
    where: {
      userId: req.user.id,
      type,
      date: {
        gte: startDate,
        lte: endDate,
      },
      category: {
        not: null,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
  });

  // Format the response
  const formattedCategories = categories.map(category => ({
    category: category.category,
    amount: category._sum.amount,
  }));

  res.json(formattedCategories);
});

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionCategories,
}; 