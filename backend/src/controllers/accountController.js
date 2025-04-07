const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

/**
 * Get all accounts for the logged-in user
 * @route GET /api/accounts
 * @access Private
 */
const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await prisma.account.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json(accounts);
});

/**
 * Get a single account by ID
 * @route GET /api/accounts/:id
 * @access Private
 */
const getAccountById = asyncHandler(async (req, res) => {
  const account = await prisma.account.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      transactions: {
        orderBy: {
          date: 'desc',
        },
        take: 10, // Get only the 10 most recent transactions
      },
    },
  });

  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if account belongs to logged-in user
  if (account.userId !== req.user.id) {
    const error = new Error('Not authorized to access this account');
    error.statusCode = 403;
    throw error;
  }

  res.json(account);
});

/**
 * Create a new account
 * @route POST /api/accounts
 * @access Private
 */
const createAccount = asyncHandler(async (req, res) => {
  const { name, type, balance, currency } = req.body;

  const account = await prisma.account.create({
    data: {
      name,
      type,
      balance,
      currency,
      userId: req.user.id,
    },
  });

  res.status(201).json(account);
});

/**
 * Update an account
 * @route PUT /api/accounts/:id
 * @access Private
 */
const updateAccount = asyncHandler(async (req, res) => {
  const account = await prisma.account.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if account belongs to logged-in user
  if (account.userId !== req.user.id) {
    const error = new Error('Not authorized to update this account');
    error.statusCode = 403;
    throw error;
  }

  const updatedAccount = await prisma.account.update({
    where: {
      id: req.params.id,
    },
    data: req.body,
  });

  res.json(updatedAccount);
});

/**
 * Delete an account
 * @route DELETE /api/accounts/:id
 * @access Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const account = await prisma.account.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if account belongs to logged-in user
  if (account.userId !== req.user.id) {
    const error = new Error('Not authorized to delete this account');
    error.statusCode = 403;
    throw error;
  }

  await prisma.account.delete({
    where: {
      id: req.params.id,
    },
  });

  res.json({ message: 'Account deleted successfully' });
});

/**
 * Get account balance summary for all user accounts
 * @route GET /api/accounts/summary
 * @access Private
 */
const getAccountsSummary = asyncHandler(async (req, res) => {
  const accounts = await prisma.account.findMany({
    where: {
      userId: req.user.id,
    },
    select: {
      id: true,
      name: true,
      type: true,
      balance: true,
      currency: true,
    },
  });

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Group by account type
  const summary = {
    totalBalance,
    accounts,
    byType: accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = 0;
      }
      acc[account.type] += account.balance;
      return acc;
    }, {}),
  };

  res.json(summary);
});

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountsSummary,
}; 