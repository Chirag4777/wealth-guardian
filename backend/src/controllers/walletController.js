const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');
const razorpayUtils = require('../utils/razorpayUtils');
const { createPaymentOrderSchema, verifyPaymentSchema } = require('../utils/validationSchemas');
const config = require('../config/config');

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

    // Create Razorpay order - pass amount first, then currency, then receipt
    const order = await razorpayUtils.createOrder(amount, currency, receipt);

    console.log('Order created with ID:', order.id, 'Amount:', order.amount);

    // Store payment info in database
    await prisma.razorpayPayment.create({
      data: {
        id: order.id,
        orderId: order.id,
        amount,
        currency,
        wallet: {
          connect: {
            id: wallet.id
          }
        },
        status: 'CREATED',
      },
    });

    // Get key ID from config
    const keyId = config.razorpay.keyId;

    res.status(201).json({
      success: true,
      id: order.id,
      amount: order.amount, // This is already in paise
      currency: order.currency,
      key: keyId,
      order_id: order.id // Include explicitly for Razorpay
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
 * Verify Razorpay Payment
 * @route POST /api/wallet/verify-payment
 */
const verifyPayment = asyncHandler(async (req, res) => {
  try {
    console.log('=================== PAYMENT VERIFICATION START ===================');
    console.log('Received payment verification request:', JSON.stringify({
      ...req.body,
      razorpaySignature: req.body.razorpaySignature ? '***signature-present***' : undefined,
      razorpay_signature: req.body.razorpay_signature ? '***signature-present***' : undefined
    }));

    // Validate request body
    const validationResult = verifyPaymentSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error('Payment verification validation failed:', validationResult.error);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.log('Validation passed, extracting parameters');
    
    // Extract parameters - support both camelCase and snake_case formats
    const orderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
    const paymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
    const signature = req.body.razorpaySignature || req.body.razorpay_signature;

    console.log(`Verifying payment with orderId: ${orderId.substring(0, 10)}... paymentId: ${paymentId.substring(0, 10)}...`);

    // Verify payment signature
    console.log('Calling razorpayUtils.verifyPaymentSignature');
    const isValidSignature = razorpayUtils.verifyPaymentSignature(
      orderId,
      paymentId,
      signature
    );

    if (!isValidSignature) {
      console.error('Invalid payment signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    console.log('Signature verification successful, looking up wallet');
    
    // Get wallet for the user
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: req.user.id,
      },
    });
    
    if (!wallet) {
      console.error(`No wallet found for user ID: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    console.log(`Found wallet with ID: ${wallet.id}, balance: ${wallet.balance}`);
    
    // Check if transaction already processed to prevent duplicate processing
    console.log('Checking for existing transaction');
    const existingTransaction = await prisma.walletTransaction.findFirst({
      where: {
        razorpayPaymentId: paymentId,
      }
    });

    if (existingTransaction) {
      console.log(`Transaction already processed: ${existingTransaction.id}`);
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        transaction: existingTransaction
      });
    }

    console.log('No existing transaction found, looking up payment record');
    
    // Find the payment record by orderId (which is unique)
    try {
      const payment = await prisma.razorpayPayment.findUnique({
        where: {
          orderId: orderId
        },
        include: {
          wallet: true
        }
      });

      console.log('Payment lookup result:', payment ? 
        `ID: ${payment.id}, Amount: ${payment.amount}, Status: ${payment.status}` : 
        'No payment found');

      if (!payment) {
        console.error(`No payment record found for orderId: ${orderId}`);
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      // Verify that the payment belongs to this user's wallet
      console.log(`Payment wallet userId: ${payment.wallet.userId}, Current user: ${req.user.id}`);
      if (payment.wallet.userId !== req.user.id) {
        console.error(`Payment belongs to a different user. Expected: ${req.user.id}, Found: ${payment.wallet.userId}`);
        return res.status(403).json({
          success: false,
          message: 'Not authorized to verify this payment'
        });
      }

      console.log('Creating transaction record');
      
      // First update the payment record with new status
      await prisma.razorpayPayment.update({
        where: {
          id: payment.id,
        },
        data: {
          razorpayPaymentId: paymentId,
          status: 'CAPTURED'
        },
      });
      
      // Create transaction
      const transaction = await prisma.walletTransaction.create({
        data: {
          amount: payment.amount,
          type: 'DEPOSIT',
          description: 'Funds added via Razorpay',
          status: 'COMPLETED',
          walletId: wallet.id,
          razorpayPaymentId: payment.id
        },
      });

      console.log(`Transaction created with ID: ${transaction.id}`);
      
      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: payment.amount,
          },
        },
      });

      console.log(`Wallet balance updated. New balance: ${updatedWallet.balance}`);
      console.log('=================== PAYMENT VERIFICATION SUCCESS ===================');

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        transaction: transaction
      });
    } catch (dbError) {
      console.error('Database error during payment verification:', dbError);
      return res.status(500).json({
        success: false,
        message: `Database error: ${dbError.message}`
      });
    }
  } catch (error) {
    console.error('=================== PAYMENT VERIFICATION ERROR ===================');
    console.error('Error verifying payment:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying payment'
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