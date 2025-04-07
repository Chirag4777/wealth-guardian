import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import walletService from '../services/walletService';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [page, filter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Create filter object based on selected filter type
      const filterObj = {};
      if (filter !== 'all') {
        filterObj.type = filter;
      }
      
      const result = await walletService.getTransactions(filterObj, page);
      
      if (result && result.transactions) {
        setTransactions(result.transactions);
        setTotalPages(Math.ceil(result.pagination?.total / result.pagination?.limit) || 1);
      } else {
        setTransactions([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
      case 'credit':
        return (
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'TRANSFER_IN':
        return (
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
              <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
          </div>
        );
      case 'TRANSFER_OUT':
      case 'debit':
        return (
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600 dark:text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 1.414L13.586 5H8z" />
            </svg>
          </div>
        );
      case 'PAYMENT':
        return (
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const getTransactionLabel = (transaction) => {
    switch (transaction.type) {
      case 'DEPOSIT':
      case 'credit':
        return 'Money Added';
      case 'TRANSFER_IN':
        return `Received from ${transaction.sender?.name || transaction.sender?.email || 'User'}`;
      case 'TRANSFER_OUT':
      case 'debit':
        return `Sent to ${transaction.receiver?.name || transaction.receiver?.email || 'User'}`;
      case 'PAYMENT':
        return 'Payment';
      default:
        return transaction.type || 'Transaction';
    }
  };

  const getAmountClass = (type) => {
    if (type === 'TRANSFER_OUT' || type === 'PAYMENT' || type === 'debit') {
      return 'text-red-600 dark:text-red-400';
    } else {
      return 'text-green-600 dark:text-green-400';
    }
  };

  const getAmountPrefix = (type) => {
    if (type === 'TRANSFER_OUT' || type === 'PAYMENT' || type === 'debit') {
      return '-';
    } else {
      return '+';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch {
      return dateString || 'Unknown date';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Transaction History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and track all your wallet transactions
        </p>
      </div>

      <Card>
        <div className="p-4">
          {/* Transaction List */}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
              <Button 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={fetchTransactions}
              >
                Try Again
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No transactions yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getTransactionLabel(transaction)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </div>
                      {transaction.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-md truncate">
                          {transaction.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-lg font-medium ${getAmountClass(transaction.type)}`}>
                    {getAmountPrefix(transaction.type)}₹{parseFloat(transaction.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <Button
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default TransactionsPage; 