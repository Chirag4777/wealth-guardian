import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import WalletCard from '../components/wallet/WalletCard';
import TransactionList from '../components/wallet/TransactionList';
import { 
  ArrowUpCircleIcon, 
  ArrowDownCircleIcon,
  BanknotesIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import authService from '../services/authService';
import walletService from '../services/walletService';

const DashboardPage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: ''
  });
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalSent: 0,
    totalReceived: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userProfile = await authService.getCurrentUser();
        setUserData({
          name: userProfile.name || 'User',
          email: userProfile.email || ''
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Use some default values
        setUserData({
          name: 'User',
          email: ''
        });
        setError('Failed to load user profile data');
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Fetch wallet data
        const wallet = await walletService.getWalletInfo();
        
        // Fetch wallet stats
        const stats = await walletService.getWalletStats();
        
        setWalletData({
          balance: wallet?.balance || 0,
          totalSent: stats?.totalSent || 0,
          totalReceived: stats?.totalReceived || 0
        });
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        // Keep the default values
        setError('Failed to load wallet data');
      } finally {
        setLoadingWallet(false);
      }
    };
    
    fetchWalletData();
  }, []);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch recent transactions (limited to 5)
        const transactionsData = await walletService.getTransactions({}, 1, 5);
        setTransactions(transactionsData?.transactions || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        // Keep empty transactions array
        setError('Failed to load transaction data');
      } finally {
        setLoadingTransactions(false);
      }
    };
    
    fetchTransactions();
  }, []);

  // Update overall loading state when all data is loaded
  useEffect(() => {
    if (!loadingProfile && !loadingWallet && !loadingTransactions) {
      setLoading(false);
    }
  }, [loadingProfile, loadingWallet, loadingTransactions]);

  // Quick access actions
  const quickActions = [
    { 
      title: 'Add Funds', 
      path: '/wallet/add-funds',
      icon: BanknotesIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    { 
      title: 'Transfer Money', 
      path: '/wallet/transfer',
      icon: ArrowTrendingUpIcon,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    { 
      title: 'Transaction History', 
      path: '/transactions',
      icon: ClockIcon,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    },
    { 
      title: 'Analytics', 
      path: '/wallet/analytics',
      icon: ChartBarIcon,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    }
  ];

  // Build wallet stats array from fetched data
  const walletStats = [
    { 
      title: 'Total Sent', 
      value: walletData.totalSent.toFixed(2), 
      icon: ArrowUpCircleIcon, 
      iconColor: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    { 
      title: 'Total Received', 
      value: walletData.totalReceived.toFixed(2), 
      icon: ArrowDownCircleIcon, 
      iconColor: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {userData.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your financial activity.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <Button 
            className="mt-2" 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Wallet Balance Card */}
        <div className="md:col-span-2">
          <WalletCard balance={walletData.balance} />
        </div>

        {/* Wallet Stats */}
        <div className="flex flex-col space-y-4">
          {walletStats.map((stat, index) => (
            <Card key={index}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </h3>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    ₹{stat.value}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${action.bgColor}`}>
                    <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {action.title}
                  </h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-6">
        <TransactionList transactions={transactions} />
        <div className="mt-4 text-center">
          <Link to="/wallet/transactions">
            <Button variant="outline">View All Transactions</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage; 