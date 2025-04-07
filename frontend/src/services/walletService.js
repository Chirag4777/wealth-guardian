import api from './api';

// Get Razorpay key from environment variables
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_UdVjVwRqNtjmU7';

const walletService = {
  /**
   * Get wallet balance
   * @returns {Promise<Object>} Wallet information including balance
   */
  async getWalletInfo() {
    try {
      const response = await api.get('/wallet');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      throw error;
    }
  },

  // Check if a user exists by email
  checkUserExists: async (email) => {
    try {
      const response = await api.get(`/users/check-email?email=${encodeURIComponent(email)}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      throw new Error('Unable to verify user email. Please try again later.');
    }
  },

  // Add funds to wallet
  addFunds: async (amount, paymentDetails) => {
    const response = await api.post('/wallet/add-funds', { amount, ...paymentDetails });
    return response.data;
  },

  /**
   * Create a Razorpay order
   * @param {number} amount - Amount in rupees (INR)
   * @returns {Promise<Object>} Order details from Razorpay
   */
  async createRazorpayOrder(amount) {
    // Validate amount
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Invalid amount. Please enter a positive number.');
    }

    // Backend will convert this to paise, so we send in rupees
    try {
      console.log(`Creating Razorpay order for amount: ${numericAmount} INR`);
      const response = await api.post('/wallet/deposit', { 
        amount: numericAmount,
        currency: 'INR'
      });
      console.log('Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      if (error.response && error.response.data) {
        console.error('Error details:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to create payment order');
      }
      throw error;
    }
  },

  /**
   * Verify Razorpay payment signature
   * @param {Object} paymentData - Object containing Razorpay payment data
   * @returns {Promise<Object>} Verification result
   */
  async verifyRazorpayPayment(paymentData) {
    try {
      console.log('Verifying payment with data:', paymentData);
      
      // Basic validation before sending
      if (!paymentData.razorpay_order_id || !paymentData.razorpay_payment_id || !paymentData.razorpay_signature) {
        throw new Error('Missing required Razorpay parameters');
      }
      
      // Don't transform the parameter names, pass them as received
      // This ensures compatibility with both camelCase and snake_case formats
      const response = await api.post('/wallet/verify-payment', paymentData);
      
      console.log('Verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error details:', error.response.data);
        
        // Format validation errors for better display
        if (error.response.status === 400 && error.response.data.errors) {
          const errorMessages = error.response.data.errors.map(err => err.message).join('; ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
        
        // Handle 500 error with more context
        if (error.response.status === 500) {
          console.error('Server error detected in payment verification. Check server logs.');
          throw new Error(error.response.data.message || 'Server error during payment verification');
        }
        
        throw new Error(error.response.data.message || 'Payment verification failed');
      }
      throw error;
    }
  },

  // Transfer funds to another user
  transferFunds: async (transferDetails) => {
    try {
      // First check if the recipient exists
      const userExists = await walletService.checkUserExists(transferDetails.receiverEmail);
      
      if (!userExists) {
        throw new Error(`No user found with email: ${transferDetails.receiverEmail}`);
      }
      
      // If user exists, proceed with transfer
      const response = await api.post('/wallet/transfer', transferDetails);
      return response.data;
    } catch (error) {
      console.error('Error transferring funds:', error);
      
      // Rethrow the specific error about user not existing
      if (error.message.includes('No user found with email')) {
        throw error;
      }
      
      // Otherwise handle API response errors
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          throw new Error(error.response.data.message);
        } else if (error.response.data.error) {
          throw new Error(error.response.data.error);
        }
      }
      
      throw new Error('Failed to transfer funds. Please try again.');
    }
  },

  /**
   * Get wallet transaction history
   * @param {Object} options - Pagination and filtering options
   * @returns {Promise<Object>} Transaction list with pagination info
   */
  async getTransactions(options = {}) {
    try {
      const response = await api.get('/wallet/transactions', { params: options });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    const response = await api.get(`/wallet/transactions/${transactionId}`);
    return response.data;
  },

  // Get wallet stats (total sent, received, etc.)
  getWalletStats: async () => {
    try {
      console.log('Fetching wallet stats from API');
      const response = await api.get('/wallet/stats');
      
      if (response.data && response.data.success) {
        console.log('Wallet stats received:', response.data.stats);
        return response.data.stats;
      } else {
        console.warn('Wallet stats response not in expected format:', response.data);
        return {
          totalSent: 0,
          totalReceived: 0,
          lastMonthActivity: 0,
          transactionCount: 0,
          recentActivity: []
        };
      }
    } catch (error) {
      console.warn('Wallet stats endpoint not available, using fallback data:', error.message);
      
      // If the endpoint doesn't exist, try to calculate from transactions
      try {
        const txResponse = await api.get('/wallet/transactions');
        if (txResponse.data && Array.isArray(txResponse.data.transactions)) {
          const transactions = txResponse.data.transactions;
          
          // Calculate total sent and received
          let totalSent = 0;
          let totalReceived = 0;
          let lastMonthActivity = 0;
          
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          
          transactions.forEach(tx => {
            if (tx.type === 'TRANSFER_OUT' || tx.type === 'PAYMENT') {
              totalSent += parseFloat(tx.amount || 0);
              
              // Last month activity
              const txDate = new Date(tx.createdAt);
              if (txDate >= oneMonthAgo) {
                lastMonthActivity -= parseFloat(tx.amount || 0);
              }
            } else if (tx.type === 'TRANSFER_IN' || tx.type === 'DEPOSIT') {
              totalReceived += parseFloat(tx.amount || 0);
              
              // Last month activity
              const txDate = new Date(tx.createdAt);
              if (txDate >= oneMonthAgo) {
                lastMonthActivity += parseFloat(tx.amount || 0);
              }
            }
          });
          
          // Recent activity (last 5 transactions)
          const recentActivity = transactions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          
          return {
            totalSent,
            totalReceived,
            lastMonthActivity,
            transactionCount: transactions.length,
            recentActivity
          };
        }
      } catch (txError) {
        console.error('Error fetching transactions for stats calculation:', txError);
      }
      
      // Return fallback data if all else fails
      return {
        totalSent: 0,
        totalReceived: 0,
        lastMonthActivity: 0,
        transactionCount: 0,
        recentActivity: []
      };
    }
  }
};

export default walletService; 