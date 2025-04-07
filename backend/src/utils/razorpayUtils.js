const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Initialize Razorpay instance with credentials
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_UdVjVwRqNtjmU7',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mP14sROQFJnTxgDdW4UKlQ1B',
});

/**
 * Create a new payment order
 * @param {Number} amount - Amount in smallest currency unit (paise for INR)
 * @param {String} currency - Currency code (default: INR)
 * @param {String} receipt - Receipt identifier
 * @returns {Object} Razorpay order
 */
const createOrder = async (amount, receipt, currency = 'INR') => {
  try {
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
    };

    return await razorpay.orders.create(options);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

/**
 * Verify Razorpay webhook signature
 * @param {String} body - Request body as string
 * @param {String} signature - Request signature header
 * @param {String} secret - Webhook secret
 * @returns {Boolean} Whether signature is valid
 */
const verifyWebhookSignature = (body, signature, secret) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
      
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
};

/**
 * Verify Razorpay payment signature
 * @param {String} orderId - Razorpay order ID
 * @param {String} paymentId - Razorpay payment ID
 * @param {String} signature - Payment signature
 * @returns {Boolean} Whether signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    if (!orderId || !paymentId || !signature) {
      console.error('Missing parameters for signature verification:', {
        hasOrderId: !!orderId,
        hasPaymentId: !!paymentId,
        hasSignature: !!signature
      });
      return false;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'mP14sROQFJnTxgDdW4UKlQ1B';
    const payload = orderId + '|' + paymentId;
    
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    console.log('Signature verification:', {
      provided: signature.substring(0, 10) + '...',
      generated: generatedSignature.substring(0, 10) + '...',
      match: generatedSignature === signature
    });

    return generatedSignature === signature;
  } catch (error) {
    console.error('Payment signature verification error:', error, {
      orderId,
      paymentId
    });
    return false;
  }
};

module.exports = {
  razorpay,
  createOrder,
  verifyWebhookSignature,
  verifyPaymentSignature,
}; 