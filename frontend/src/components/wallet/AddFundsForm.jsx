import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import walletService from '../../services/walletService';
import authService from '../../services/authService';

const AddFundsForm = ({ onFundsAdded }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Get user data for prefilling Razorpay
    const fetchUserData = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUserData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
    if (error) {
      setError('');
    }
  };
  
  const validateAmount = () => {
    const parsedAmount = parseFloat(amount);
    
    if (!amount) {
      setError('Amount is required');
      return false;
    }
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (parsedAmount < 10) {
      setError('Minimum amount is ₹10');
      return false;
    }
    
    if (parsedAmount > 100000) {
      setError('Maximum amount is ₹1,00,000');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAmount()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Create order on server
      console.log('Creating payment order for amount:', amount);
      const orderData = await walletService.createRazorpayOrder(parseFloat(amount));
      console.log('Payment order created:', orderData);

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }
      
      // 2. Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: parseFloat(amount) * 100, // Convert to paise
        currency: orderData.currency || 'INR',
        name: 'Wealth Guardian',
        description: 'Add funds to wallet',
        order_id: orderData.id,
        handler: function(response) {
          console.log('Razorpay success response:', response);
          
          // Call verification in a separate function to avoid Razorpay callback issues
          verifyPayment(response);
        },
        prefill: {
          name: userData.name || 'User',
          email: userData.email || '',
          contact: userData.phone || ''
        },
        theme: {
          color: '#4285F4', // Google Blue
        },
        modal: {
          ondismiss: function() {
            console.log('Razorpay payment modal dismissed');
            setIsLoading(false);
          }
        }
      };
      
      console.log('Initializing Razorpay with options:', {
        ...options,
        key: options.key ? options.key.substring(0, 8) + '...' : 'undefined'
      });
      
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function(response) {
        console.error('Razorpay payment failed:', response.error);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setIsLoading(false);
      });
      
      razorpayInstance.open();
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      setError(error.message || 'Failed to initialize payment. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Separate function to handle payment verification to avoid Razorpay callback issues
  const verifyPayment = async (response) => {
    try {
      // 3. Verify payment with backend
      console.log('Verifying payment with params:', response);
      const result = await walletService.verifyRazorpayPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
        // No amount parameter needed
      });
      
      console.log('Payment verification result:', result);
      
      // 4. Update UI
      if (result.success && onFundsAdded) {
        onFundsAdded({
          amount: parseFloat(amount),
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          transaction: result.transaction || {}
        });
      } else {
        setError(result.message || 'Payment verification failed');
        setIsLoading(false);
      }
      
      // Reset form
      setAmount('');
    } catch (error) {
      console.error('Payment verification failed:', error);
      setError(error.message || 'Payment verification failed. Please contact support.');
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <div className="px-2 py-4 sm:px-4">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white rounded-full p-3 shadow-md">
            <div className="h-16 w-16 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
          Add Money to Wallet
        </h2>
        
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
            <div className="flex">
              <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="text-xl text-gray-600 dark:text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">₹</div>
            <input
              name="amount"
              type="text"
              className="w-full px-10 py-6 text-center text-3xl font-medium rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[100, 200, 500, 1000, 2000, 5000, 10000, 20000].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                className="py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 text-center"
                onClick={() => setAmount(quickAmount.toString())}
              >
                ₹{quickAmount.toLocaleString()}
              </button>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Min: ₹10 | Max: ₹1,00,000
          </div>
          
          <Button
            type="submit"
            className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Proceed to Pay'
            )}
          </Button>
        </form>
        
        <div className="mt-6 flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1200px-Google_Pay_Logo_%282020%29.svg.png" 
                alt="Google Pay" className="h-6" />
            <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-5" />
            <img src="https://cdn.iconscout.com/icon/free/png-256/free-upi-3629377-3031456.png" alt="UPI" className="h-6" />
          </div>
          <div className="text-xs text-gray-500">Secure payments powered by Razorpay</div>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit encryption for secure transactions
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AddFundsForm; 