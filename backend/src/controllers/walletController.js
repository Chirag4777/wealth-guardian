const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');
const { createOrder, verifyPaymentSignature } = require('../utils/razorpayUtils');

/**
 * Get wallet details for the logged-in user
 * @route GET /api/wallet
 * @access Private
 */
const getWallet = asyncHandler(async (req, res) => {
  // Find or create wallet for the user
  let wallet = await prisma.wallet.findUnique({
    where: {
      userId: req.user.id,
    },
    include: {
      walletTransactions: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });

  // If wallet doesn't exist, create one with default balance
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: req.user.id,
        balance: 1000, // Default starting balance
      },
      include: {
        walletTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    // Create initial transaction for default balance
    await prisma.walletTransaction.create({
      data: {
        amount: 1000,
        type: 'DEPOSIT',
        description: 'Initial wallet balance',
        walletId: wallet.id,
      },
    });

    // Refresh wallet to include the new transaction
    wallet = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
      include: {
        walletTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
  }

  res.json(wallet);
});

/**
 * Get wallet transaction history
 * @route GET /api/wallet/transactions
 * @access Private
 */
const getWalletTransactions = asyncHandler(async (req, res) => {
  // Find or create wallet for the user
  let wallet = await prisma.wallet.findUnique({
    where: {
      userId: req.user.id,
    },
  });

  // If wallet doesn't exist, create one with default balance
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: req.user.id,
        balance: 1000, // Default starting balance
      },
    });

    // Create initial transaction for default balance
    await prisma.walletTransaction.create({
      data: {
        amount: 1000,
        type: 'DEPOSIT',
        description: 'Initial wallet balance',
        walletId: wallet.id,
      },
    });
  }

  // Get transactions with pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const transactions = await prisma.walletTransaction.findMany({
    where: {
      walletId: wallet.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
    include: {
      sender: {
        select: {
          name: true,
          email: true,
        },
      },
      receiver: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Count total transactions for pagination
  const total = await prisma.walletTransaction.count({
    where: {
      walletId: wallet.id,
    },
  });

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
 * Create Razorpay payment order to add funds
 * @route POST /api/wallet/deposit
 * @access Private
 */
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount. Please enter a positive value.'
    });
  }

  // Find or create wallet for the user
  let wallet = await prisma.wallet.findUnique({
    where: {
      userId: req.user.id,
    },
  });

  // If wallet doesn't exist, create one with default balance
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: req.user.id,
        balance: 1000, // Default starting balance
      },
    });

    // Create initial transaction for default balance
    await prisma.walletTransaction.create({
      data: {
        amount: 1000,
        type: 'DEPOSIT',
        description: 'Initial wallet balance',
        walletId: wallet.id,
      },
    });
  }

  try {
    // Create receipt identifier (keeping it under 40 chars)
    const shortId = req.user.id.substring(0, 8);
    const timestamp = Date.now().toString().substring(0, 10);
    const receipt = `wg_${shortId}_${timestamp}`;

    // Create Razorpay order
    const order = await createOrder(amount, receipt, currency);

    // Store payment info in database
    await prisma.razorpayPayment.create({
      data: {
        id: order.id,
        orderId: order.id,
        amount,
        currency,
        walletId: wallet.id,
        status: 'CREATED',
      },
    });

    res.status(201).json({
      success: true,
      id: order.id,
      amount: amount, // Original amount in rupees
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_UdVjVwRqNtjmU7'
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed. Please try again.',
      error: error.message
    });
  }
});

/**
 * Verify Razorpay payment and add funds to wallet
 * @route POST /api/wallet/verify-payment
 * @access Private
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  console.log('Payment verification request:', { 
    orderId: razorpay_order_id, 
    paymentId: razorpay_payment_id,
    hasSignature: !!razorpay_signature
  });

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing payment verification parameters'
    });
  }

  try {
    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      console.error('Invalid signature for payment:', { 
        orderId: razorpay_order_id, 
        paymentId: razorpay_payment_id 
      });
      
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.'
      });
    }

    // Find the payment record
    const payment = await prisma.razorpayPayment.findUnique({
      where: {
        orderId: razorpay_order_id,
      },
      include: {
        wallet: true,
      },
    });

    if (!payment) {
      console.error('Payment order not found:', razorpay_order_id);
      
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
    }

    // Verify wallet belongs to current user
    if (payment.wallet.userId !== req.user.id) {
      console.error('Unauthorized verification attempt. User:', req.user.id, 'Wallet owner:', payment.wallet.userId);
      
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this payment'
      });
    }

    // If payment is already processed, return success
    if (payment.status === 'CAPTURED') {
      console.log('Payment already processed:', razorpay_payment_id);
      
      // Find the related transaction to return consistent response
      const transaction = await prisma.walletTransaction.findFirst({
        where: {
          razorpayPaymentId: razorpay_payment_id
        }
      });
      
      return res.json({ 
        success: true, 
        message: 'Payment already processed',
        transaction: transaction ? {
          id: transaction.id,
          amount: transaction.amount,
          status: 'completed',
          createdAt: transaction.createdAt
        } : {
          id: payment.id,
          amount: payment.amount,
          status: 'completed'
        }
      });
    }

    console.log('Processing new payment:', razorpay_payment_id);

    // Process the payment in a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Update payment status
      const updatedPayment = await prisma.razorpayPayment.update({
        where: {
          id: payment.id,
        },
        data: {
          id: razorpay_payment_id, // Update with actual payment ID
          status: 'CAPTURED',
        },
      });

      // Create wallet transaction
      const walletTransaction = await prisma.walletTransaction.create({
        data: {
          amount: payment.amount,
          type: 'DEPOSIT',
          description: 'Funds added via Razorpay',
          status: 'COMPLETED',
          walletId: payment.walletId,
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: {
          id: payment.walletId,
        },
        data: {
          balance: {
            increment: payment.amount,
          },
        },
      });

      // Update razorpay payment with the wallet transaction ID
      await prisma.razorpayPayment.update({
        where: {
          id: razorpay_payment_id,
        },
        data: {
          walletTransaction: {
            connect: {
              id: walletTransaction.id,
            },
          },
        },
      });

      return {
        payment: updatedPayment,
        wallet: updatedWallet,
        transaction: walletTransaction,
      };
    });

    console.log('Payment successfully processed:', razorpay_payment_id);

    res.status(200).json({
      success: true,
      message: 'Payment verified and funds added to wallet',
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        status: 'completed',
        createdAt: result.transaction.createdAt
      },
      wallet: {
        id: result.wallet.id,
        balance: result.wallet.balance,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error, { 
      orderID: razorpay_order_id,
      paymentID: razorpay_payment_id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please contact support.',
      error: error.message
    });
  }
});

/**
 * Transfer money to another user
 * @route POST /api/wallet/transfer
 * @access Private
 */
const transferMoney = asyncHandler(async (req, res) => {
  const { receiverEmail, amount, description = 'Funds transfer' } = req.body;

  if (!receiverEmail) {
    return res.status(400).json({
      success: false,
      message: 'Receiver email is required'
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount. Please enter a positive value.'
    });
  }

  // Find or create sender's wallet
  let senderWallet = await prisma.wallet.findUnique({
    where: {
      userId: req.user.id,
    },
  });

  // If sender's wallet doesn't exist, create one with default balance
  if (!senderWallet) {
    senderWallet = await prisma.wallet.create({
      data: {
        userId: req.user.id,
        balance: 1000, // Default starting balance
      },
    });

    // Create initial transaction for default balance
    await prisma.walletTransaction.create({
      data: {
        amount: 1000,
        type: 'DEPOSIT',
        description: 'Initial wallet balance',
        walletId: senderWallet.id,
      },
    });
  }

  // Check if sender has sufficient balance
  if (senderWallet.balance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient wallet balance'
    });
  }

  // Find receiver by email
  const receiver = await prisma.user.findUnique({
    where: {
      email: receiverEmail,
    },
    include: {
      wallet: true,
    },
  });

  if (!receiver) {
    return res.status(404).json({
      success: false,
      message: 'Receiver not found'
    });
  }

  // Ensure sender and receiver are different
  if (receiver.id === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot transfer money to yourself'
    });
  }

  // Find or create receiver's wallet
  let receiverWallet = receiver.wallet;
  if (!receiverWallet) {
    receiverWallet = await prisma.wallet.create({
      data: {
        userId: receiver.id,
        balance: 1000, // Default starting balance
      },
    });

    // Create initial transaction for default balance
    await prisma.walletTransaction.create({
      data: {
        amount: 1000,
        type: 'DEPOSIT',
        description: 'Initial wallet balance',
        walletId: receiverWallet.id,
      },
    });
  }

  try {
    // Process the transfer in a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Update sender's wallet balance
      const updatedSenderWallet = await prisma.wallet.update({
        where: {
          id: senderWallet.id,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Create sender's transaction (outgoing)
      const senderTransaction = await prisma.walletTransaction.create({
        data: {
          amount,
          type: 'TRANSFER_OUT',
          description,
          status: 'COMPLETED',
          senderId: req.user.id,
          receiverId: receiver.id,
          walletId: senderWallet.id,
        },
      });

      // Update receiver's wallet balance
      const updatedReceiverWallet = await prisma.wallet.update({
        where: {
          id: receiverWallet.id,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Create receiver's transaction (incoming)
      const receiverTransaction = await prisma.walletTransaction.create({
        data: {
          amount,
          type: 'TRANSFER_IN',
          description,
          status: 'COMPLETED',
          senderId: req.user.id,
          receiverId: receiver.id,
          walletId: receiverWallet.id,
        },
      });

      return {
        senderWallet: updatedSenderWallet,
        receiverWallet: updatedReceiverWallet,
        senderTransaction,
        receiverTransaction,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Money transferred successfully',
      transaction: {
        id: result.senderTransaction.id,
        amount,
        description,
        receiverEmail,
        receiverName: receiver.name,
      },
      wallet: {
        id: result.senderWallet.id,
        balance: result.senderWallet.balance,
      },
    });
  } catch (error) {
    console.error('Error transferring funds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transfer funds. Please try again.',
      error: error.message
    });
  }
});

/**
 * Handle Razorpay webhook events
 * @route POST /api/wallet/webhook
 * @access Public
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  // Validate webhook signature here if needed
  // Not necessary for this implementation, but good to have
  
  // Process the webhook event
  const event = req.body;
  
  if (event.event === 'payment.captured') {
    // Extract payment details
    const paymentId = event.payload.payment.entity.id;
    const orderId = event.payload.payment.entity.order_id;
    
    // Update payment status in database
    const payment = await prisma.razorpayPayment.findUnique({
      where: {
        orderId
      },
      include: {
        wallet: true
      }
    });
    
    if (payment && payment.status !== 'CAPTURED') {
      // Process the payment in a transaction to ensure atomicity
      await prisma.$transaction(async (prisma) => {
        // Update payment status
        await prisma.razorpayPayment.update({
          where: {
            orderId
          },
          data: {
            id: paymentId,
            status: 'CAPTURED'
          }
        });
        
        // Create wallet transaction
        const walletTransaction = await prisma.walletTransaction.create({
          data: {
            amount: payment.amount,
            type: 'DEPOSIT',
            description: 'Funds added via Razorpay (webhook)',
            status: 'COMPLETED',
            walletId: payment.walletId,
            razorpayPaymentId: paymentId
          }
        });
        
        // Update wallet balance
        await prisma.wallet.update({
          where: {
            id: payment.walletId
          },
          data: {
            balance: {
              increment: payment.amount
            }
          }
        });
        
        // Update razorpay payment with the wallet transaction ID
        await prisma.razorpayPayment.update({
          where: {
            id: paymentId
          },
          data: {
            walletTransaction: {
              connect: {
                id: walletTransaction.id
              }
            }
          }
        });
      });
    }
  }
  
  // Always return a 200 response to Razorpay webhooks
  res.status(200).json({ received: true });
});

/**
 * Get wallet statistics
 * @route GET /api/wallet/stats
 * @access Private
 */
const getWalletStats = asyncHandler(async (req, res) => {
  // Find wallet for the user
  const wallet = await prisma.wallet.findUnique({
    where: {
      userId: req.user.id,
    },
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found'
    });
  }

  // Get all transactions for the wallet
  const transactions = await prisma.walletTransaction.findMany({
    where: {
      walletId: wallet.id,
    },
  });

  // Calculate stats
  let totalSent = 0;
  let totalReceived = 0;
  let lastMonthActivity = 0;
  let recentActivity = [];

  const now = new Date();
  const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

  transactions.forEach(tx => {
    // Calculate total sent/received
    if (['TRANSFER_OUT', 'PAYMENT'].includes(tx.type)) {
      totalSent += parseFloat(tx.amount);
    } else if (['TRANSFER_IN', 'DEPOSIT'].includes(tx.type)) {
      totalReceived += parseFloat(tx.amount);
    }

    // Calculate last month activity
    const txDate = new Date(tx.createdAt);
    if (txDate >= oneMonthAgo) {
      if (['TRANSFER_OUT', 'PAYMENT'].includes(tx.type)) {
        lastMonthActivity -= parseFloat(tx.amount);
      } else if (['TRANSFER_IN', 'DEPOSIT'].includes(tx.type)) {
        lastMonthActivity += parseFloat(tx.amount);
      }
    }
  });

  // Get recent activity (last 5 transactions)
  recentActivity = transactions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      date: tx.createdAt,
    }));

  res.json({
    success: true,
    stats: {
      totalSent,
      totalReceived,
      lastMonthActivity,
      transactionCount: transactions.length,
      recentActivity,
    },
  });
});

module.exports = {
  getWallet,
  getWalletTransactions,
  createPaymentOrder,
  verifyPayment,
  transferMoney,
  handleWebhook,
  getWalletStats,
}; 