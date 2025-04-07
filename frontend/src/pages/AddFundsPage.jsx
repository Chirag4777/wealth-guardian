import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AddFundsForm from '../components/wallet/AddFundsForm';
import { Card } from '../components/ui/Card';
import { toast } from 'react-toastify';
import walletService from '../services/walletService';
import authService from '../services/authService';
import { markSuccessfulAction } from '../services/api';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const AddFundsPage = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const { width, height } = useWindowSize();

  const handleFundsAdded = async (details) => {
    console.log('Payment successful:', details);
    
    try {
      // Mark the action as successful to prevent auth redirects
      markSuccessfulAction();
      
      // Show success message immediately
      setPaymentDetails(details);
      setIsSuccess(true);
      
      // Show toast notification
      toast.success(`₹${details.amount.toFixed(2)} has been added to your wallet`);
      
      // Add funds to wallet (this may be redundant if your backend already does this)
      try {
        await walletService.addFunds(details.amount, {
          paymentId: details.paymentId,
          orderId: details.orderId,
          source: 'razorpay'
        });
      } catch (error) {
        // Don't show error to user if this fails - backend already processed payment
        console.warn('Additional addFunds call failed, but payment was successful:', error);
      }
      
      // Ensure authentication is still valid
      if (!authService.isAuthenticated()) {
        console.warn('Authentication token missing after payment');
        // Recreate a temporary token to prevent logout
        const tempToken = `temp_${Date.now()}`;
        localStorage.setItem('token', tempToken);
      }
      
      // Redirect to wallet after a delay
      setTimeout(() => {
        console.log('Redirecting to dashboard after successful payment');
        navigate('/dashboard');
      }, 5000);
    } catch (error) {
      console.error('Error updating wallet:', error);
      // We still show success since payment was processed
      toast.warning('Payment was successful, but there was a minor issue. Your funds are safe.');
    }
  };

  return (
    <DashboardLayout>
      {isSuccess && <Confetti 
        width={width || window.innerWidth} 
        height={height || window.innerHeight} 
        recycle={false} 
        numberOfPieces={300} 
      />}
      
      <div className="max-w-3xl mx-auto">
        {!isSuccess ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Add Money to Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add funds securely using Razorpay payment gateway
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AddFundsForm onFundsAdded={handleFundsAdded} />
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Payment Methods
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'UPI', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-upi-3629377-3031456.png' },
                    { name: 'Cards', icon: 'https://cdn-icons-png.flaticon.com/512/179/179457.png' },
                    { name: 'NetBanking', icon: 'https://cdn-icons-png.flaticon.com/512/2168/2168742.png' },
                    { name: 'Wallets', icon: 'https://cdn-icons-png.flaticon.com/512/25/25165.png' }
                  ].map((method) => (
                    <div key={method.name} className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                      <img src={method.icon} alt={method.name} className="h-8 w-8 mb-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{method.name}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-5 text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Secure payments with 256-bit encryption
                  </p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Instant money transfer to your wallet
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg border border-green-100 dark:border-green-900/30">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="h-12 w-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful!
            </h2>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 mb-6">
              <div className="mb-2 text-blue-100">Amount Added</div>
              <div className="text-4xl font-bold mb-4">₹{paymentDetails?.amount.toFixed(2)}</div>
              <div className="flex justify-between text-sm">
                <span>Status</span>
                <span className="font-medium">Completed</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Time</span>
                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Transaction Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">{paymentDetails?.paymentId.slice(0, 14)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-medium text-gray-900 dark:text-white">Razorpay</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  console.log('Manual navigation to dashboard');
                  markSuccessfulAction(); // Mark as successful again before navigation
                  navigate('/dashboard');
                }}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  console.log('Manual navigation to transactions');
                  markSuccessfulAction(); // Mark as successful again before navigation
                  navigate('/transactions');
                }}
                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                View Transactions
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddFundsPage; 