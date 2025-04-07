const crypto = require('crypto');
const Razorpay = require('razorpay');
const config = require('../config/config');

// Initialize Razorpay with API credentials
const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

/**
 * Create a new Razorpay order
 * @param {number} amount - Amount in rupees
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Receipt ID (optional)
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async (amount, currency = 'INR', receipt = '') => {
  try {
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount. Must be a positive number.');
    }

    // Convert amount to paise (Razorpay requires amount in lowest denomination)
    const amountInPaise = Math.round(amount * 100);

    // Create order options
    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto-capture payment
    };

    console.log('Creating Razorpay order with options:', {
      ...options,
      key_id: config.razorpay.keyId.substring(0, 8) + '...',
    });

    // Create order
    const order = await razorpay.orders.create(options);
    
    console.log('Razorpay order created:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });

    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether the signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    // Log parameters (with truncation for security)
    console.log('Verifying signature with params:', {
      orderId: orderId ? orderId.substring(0, 8) + '...' : 'undefined',
      paymentId: paymentId ? paymentId.substring(0, 8) + '...' : 'undefined',
      signatureProvided: !!signature
    });

    // Validate input parameters
    if (!orderId || !paymentId || !signature) {
      console.error('Missing required parameters for signature verification');
      return false;
    }

    // Generate signature verification string (order_id|payment_id)
    const payload = orderId + '|' + paymentId;
    
    // Generate HMAC using SHA256 algorithm and secret key
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(payload)
      .digest('hex');
    
    // Compare generated signature with provided signature
    const isValid = expectedSignature === signature;
    
    if (!isValid) {
      console.warn('Signature verification failed - signatures do not match');
    } else {
      console.log('Payment signature verification successful');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

/**
 * Verify Razorpay webhook signature
 * @param {string} payload - Request body as string
 * @param {string} signature - Webhook signature from headers
 * @returns {boolean} Whether the signature is valid
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    console.log('Verifying webhook signature');
    
    if (!payload || !signature) {
      console.error('Missing payload or signature for webhook verification');
      return false;
    }

    // Generate expected signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(payload)
      .digest('hex');

    // Verify signature
    const isValid = expectedSignature === signature;
    
    if (!isValid) {
      console.warn('Webhook signature verification failed');
    } else {
      console.log('Webhook signature verification successful');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

module.exports = {
  razorpay,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
}; 