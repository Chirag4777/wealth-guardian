import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import walletService from '../../services/walletService';

const TransactionList = ({ transactions = null, limit = 4 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter] = useState('all'); // 'all', 'credit', 'debit'
  const [loading, setLoading] = useState(false);
  const [localTransactions, setLocalTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  const itemsPerPage = limit;
  
  useEffect(() => {
    // If transactions are passed as props, use them directly
    if (transactions) {
      setLocalTransactions(transactions);
      setTotalCount(transactions.length);
      return;
    }
    
    // Otherwise, fetch transactions from the API
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const filterParams = filter !== 'all' ? { type: filter } : {};
        
        if (searchTerm) {
          filterParams.search = searchTerm;
        }
        
        const response = await walletService.getTransactions(
          filterParams,
          currentPage,
          itemsPerPage
        );
        
        setLocalTransactions(response.transactions);
        setTotalCount(response.totalCount);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [currentPage, filter, searchTerm, transactions, itemsPerPage]);
  
  // Filter transactions based on search term and type filter when using prop-passed transactions
  const filteredTransactions = transactions 
    ? transactions.filter(transaction => {
        const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || transaction.type === filter;
        return matchesSearch && matchesFilter;
      })
    : localTransactions;
  
  // Get paginated transactions
  const currentTransactions = transactions
    ? filteredTransactions.slice(0, itemsPerPage)
    : filteredTransactions;
  
  const totalPages = transactions
    ? Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage))
    : Math.max(1, Math.ceil(totalCount / itemsPerPage));
  
  // Format date to readable format
  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString || 'Unknown date';
    }
  };
  
  // Format amount with currency
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
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
        return transaction.description || 'Transaction';
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
  
  return (
    <Card title="Recent Transactions">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
          </div>
        ) : currentTransactions.length > 0 ? (
          <>
            {currentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {getTransactionLabel(transaction)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.date || transaction.createdAt)}
                    </div>
                    {transaction.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-md truncate">
                        {transaction.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${getAmountClass(transaction.type)}`}>
                    {getAmountPrefix(transaction.type)} {formatAmount(transaction.amount)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  {transactions 
                    ? `Showing ${1} to ${Math.min(itemsPerPage, filteredTransactions.length)} of ${filteredTransactions.length} transactions`
                    : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalCount)} of ${totalCount} transactions`
                  }
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-1 rounded-md ${
                      currentPage === 1 
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-1 rounded-md ${
                      currentPage === totalPages 
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm || filter !== 'all' 
              ? 'No transactions match your search or filter.'
              : 'No transactions yet.'}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TransactionList; 