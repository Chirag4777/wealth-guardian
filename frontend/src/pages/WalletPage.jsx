import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import WalletCard from '../components/wallet/WalletCard';
import TransactionList from '../components/wallet/TransactionList';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import walletService from '../services/walletService';

const WalletPage = () => {
  const [walletData, setWalletData] = useState({
    balance: 0,
    walletId: '',
    createdAt: '',
    status: 'pending'
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        
        // Fetch wallet information
        const wallet = await walletService.getWalletInfo();
        setWalletData({
          balance: wallet.balance,
          walletId: wallet.walletId,
          createdAt: wallet.createdAt,
          status: wallet.status
        });
        
        // Fetch recent transactions
        const transactionsData = await walletService.getTransactions({}, 1, 6);
        setTransactions(transactionsData.transactions);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading wallet information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          My Wallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your funds and view transaction history
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Wallet Balance Card */}
        <div className="md:col-span-2">
          <WalletCard balance={walletData.balance} />
        </div>

        {/* Wallet Info */}
        <div>
          <Card title="Wallet Information">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Wallet ID
                </h3>
                <p className="text-gray-900 dark:text-white font-mono">
                  {walletData.walletId}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Created On
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(walletData.createdAt)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </h3>
                <Badge 
                  variant={walletData.status === 'active' ? 'success' : 'warning'}
                  withDot
                >
                  {walletData.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Wallet Security Tips */}
      <div className="mb-6">
        <Card title="Security Tips">
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Never share your login credentials or OTP with anyone.
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Always verify the recipient's email before transferring money.
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Enable two-factor authentication for enhanced security.
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Report suspicious activities immediately to our support team.
            </li>
          </ul>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div>
        <TransactionList transactions={transactions} />
      </div>
    </DashboardLayout>
  );
};

export default WalletPage; 