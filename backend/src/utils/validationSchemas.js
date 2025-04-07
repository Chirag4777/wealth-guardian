const { z } = require('zod');

// User validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

const checkEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Account validation schemas
const createAccountSchema = z.object({
  name: z.string().min(2, 'Account name is required').max(50),
  type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'CASH', 'OTHER']),
  balance: z.number().nonnegative('Balance must be a non-negative number'),
  currency: z.string().min(1).max(5).default('USD'),
});

const updateAccountSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'CASH', 'OTHER']).optional(),
  balance: z.number().nonnegative().optional(),
  currency: z.string().min(1).max(5).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Transaction validation schemas
const createTransactionSchema = z.object({
  amount: z.number(),
  description: z.string().min(1, 'Description is required').max(100),
  date: z.string().datetime().or(z.date()).optional(),
  category: z.string().min(1).max(50).optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  accountId: z.string().uuid('Invalid account ID'),
});

const updateTransactionSchema = z.object({
  amount: z.number(),
  description: z.string().min(1).max(100).optional(),
  date: z.string().datetime().or(z.date()).optional(),
  category: z.string().min(1).max(50).optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  accountId: z.string().uuid().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Budget validation schemas
const createBudgetSchema = z.object({
  name: z.string().min(2, 'Budget name is required').max(50),
  amount: z.number().positive('Budget amount must be positive'),
  category: z.string().min(1, 'Category is required').max(50),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).default('MONTHLY'),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional(),
});

const updateBudgetSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).max(50).optional(),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Goal validation schemas
const createGoalSchema = z.object({
  name: z.string().min(2, 'Goal name is required').max(50),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().nonnegative('Current amount must be a non-negative number').default(0),
  startDate: z.string().datetime().or(z.date()).optional(),
  targetDate: z.string().datetime().or(z.date()),
  category: z.string().min(1).max(50).optional(),
});

const updateGoalSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().nonnegative().optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  targetDate: z.string().datetime().or(z.date()).optional(),
  category: z.string().min(1).max(50).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Wallet validation schemas
const createPaymentOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3).max(3).default('INR')
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Payment signature is required')
});

const transferMoneySchema = z.object({
  receiverEmail: z.string().email('Invalid receiver email'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(100)
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  checkEmailSchema,
  createAccountSchema,
  updateAccountSchema,
  createTransactionSchema,
  updateTransactionSchema,
  createBudgetSchema,
  updateBudgetSchema,
  createGoalSchema,
  updateGoalSchema,
  createPaymentOrderSchema,
  verifyPaymentSchema,
  transferMoneySchema,
}; 