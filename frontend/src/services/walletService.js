import api from './api';

// Get Razorpay key from environment variables
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_UdVjVwRqNtjmU7';

const walletService = {
  // Get wallet balance and info
  getWalletInfo: async () => {
    try {
      const response = await api.get('/wallet');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      // Return fallback data if the API call fails
      return {
        balance: 0,
        walletId: 'N/A',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
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

  // Create a new Razorpay order
  createRazorpayOrder: async (amount) => {
    try {
      const response = await api.post('/wallet/deposit', { amount });
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          throw new Error(error.response.data.message);
        } else if (error.response.data.error) {
          throw new Error(error.response.data.error);
        }
      }
      
      throw new Error('Failed to create payment order. Please try again.');
    }
  },

  // Verify and process Razorpay payment
  verifyRazorpayPayment: async (paymentData) => {
    try {
      console.log('Verifying payment with backend:', {
        orderId: paymentData.razorpay_order_id,
        paymentId: paymentData.razorpay_payment_id,
        hasSignature: !!paymentData.razorpay_signature
      });
      
      const response = await api.post('/wallet/verify-payment', paymentData);
      console.log('Payment verification response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      
      if (error.response) {
        console.error('Server responded with error:', error.response.status, error.response.data);
        
        if (error.response.data) {
          if (error.response.data.message) {
            throw new Error(error.response.data.message);
          } else if (error.response.data.error) {
            throw new Error(error.response.data.error);
          }
        }
      }
      
      throw new Error('Payment verification failed. Please try again or contact support.');
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

  // Get all transactions for the current user
  getTransactions: async (filter = {}, page = 1, limit = 10) => {
    try {
      const response = await api.get('/wallet/transactions', { 
        params: { ...filter, page, limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return fallback data if the API call fails
      return {
        transactions: [],
        totalCount: 0
      };
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