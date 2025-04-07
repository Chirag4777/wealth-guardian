const express = require('express');
const router = express.Router();
const {
  getWallet,
  getWalletTransactions,
  createPaymentOrder,
  verifyPayment,
  transferMoney,
  handleWebhook,
  getWalletStats,
} = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  transferMoneySchema,
} = require('../utils/validationSchemas');

// Middleware to log requests for debugging
const logRequest = (req, res, next) => {
  console.log(`Wallet API Request: ${req.method} ${req.originalUrl}`);
  console.log('Request Body:', req.body);
  next();
};

// Apply logging middleware
router.use(logRequest);

// Public routes (webhooks)
router.post('/webhook', handleWebhook);

// Protected routes
router.use(protect);

// Wallet details
router.get('/', getWallet);
router.get('/transactions', getWalletTransactions);
router.get('/stats', getWalletStats);

// Payment operations
router.post('/deposit', validate(createPaymentOrderSchema), createPaymentOrder);
router.post('/verify-payment', validate(verifyPaymentSchema), verifyPayment);
router.post('/add-funds', (req, res, next) => {
  console.log('Add funds endpoint called with:', req.body);
  res.json({ success: true, message: 'Funds added' });
});

// Transfers
router.post('/transfer', validate(transferMoneySchema), transferMoney);

module.exports = router; 