import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import walletService from '../../services/walletService';

// Transaction type options
const TRANSACTION_TYPES = [
  { id: 'payment', label: 'Payment', icon: '💰' },
  { id: 'food', label: 'Food & Dining', icon: '🍔' },
  { id: 'groceries', label: 'Groceries', icon: '🛒' },
  { id: 'rent', label: 'Rent', icon: '🏠' },
  { id: 'bills', label: 'Bills & Utilities', icon: '📱' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'health', label: 'Healthcare', icon: '🏥' },
  { id: 'other', label: 'Other', icon: '📝' }
];

const TransferForm = ({ onTransfer, balance = 0, getBalance }) => {
  const [formData, setFormData] = useState({
    receiverEmail: '',
    amount: '',
    description: '',
    transactionType: 'transfer'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(balance);
  
  // Fetch balance
  useEffect(() => {
    // Refresh balance
    if (getBalance) {
      getBalance().then(data => {
        setCurrentBalance(data.balance);
      });
    }
  }, [getBalance]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset email validation when email changes
    if (name === 'receiverEmail' && emailExists !== null) {
      setEmailExists(null);
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleSelectTransactionType = (type) => {
    setFormData({
      ...formData,
      transactionType: type
    });
    
    if (errors.transactionType) {
      setErrors({
        ...errors,
        transactionType: ''
      });
    }
  };
  
  const validateForm = async () => {
    const newErrors = {};
    
    // Validate email
    if (!formData.receiverEmail) {
      newErrors.receiverEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.receiverEmail)) {
      newErrors.receiverEmail = 'Email is invalid';
    }
    
    // Validate amount
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > currentBalance) {
      newErrors.amount = 'Amount exceeds your available balance';
    }
    
    // Validate email existence if email is valid
    if (formData.receiverEmail && 
        !newErrors.receiverEmail && 
        emailExists === null) {
      try {
        setIsCheckingEmail(true);
        const exists = await walletService.checkUserExists(formData.receiverEmail);
        setEmailExists(exists);
        
        if (!exists) {
          newErrors.receiverEmail = 'No user found with this email address';
        }
      } catch (error) {
        console.error('Error checking email:', error);
        newErrors.receiverEmail = 'Unable to verify email. Please try again.';
      } finally {
        setIsCheckingEmail(false);
      }
    }
    
    // Validate description
    if (formData.description && formData.description.length > 100) {
      newErrors.description = 'Description cannot exceed 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      const isValid = await validateForm();
      
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Process the transfer
      await onTransfer({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      // Reset form
      setFormData({
        receiverEmail: '',
        amount: '',
        description: '',
        transactionType: 'transfer'
      });
      
      setEmailExists(null);
      
    } catch (error) {
      console.error('Error in transfer:', error);
      setErrors({
        ...errors,
        submit: error.message || 'An error occurred during transfer'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getTransactionTypeDetails = (typeId) => {
    return TRANSACTION_TYPES.find(type => type.id === typeId) || { label: 'Payment', icon: '💰' };
  };
  
  return (
    <>
      <Card>
        <div className="mb-4 flex flex-col items-center">
          <div className="w-full mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <h2 className="text-xl font-bold mb-1">Available Balance</h2>
            <div className="text-3xl font-bold">₹{currentBalance.toFixed(2)}</div>
          </div>
        </div>
        
        {errors.general && (
          <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Recipient Email"
            name="receiverEmail"
            type="email"
            placeholder="recipient@example.com"
            value={formData.receiverEmail}
            onChange={handleChange}
            required
            error={errors.receiverEmail}
          />
          
          <Input
            label="Amount (₹)"
            name="amount"
            type="text"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={handleChange}
            required
            error={errors.amount}
          />
          
          {/* Transaction type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectTransactionType(type.id)}
                  className={`flex flex-col items-center p-3 rounded-lg ${
                    formData.transactionType === type.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl mb-1">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
            {errors.transactionType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.transactionType}</p>
            )}
          </div>
          
          <Input
            label="Description"
            name="description"
            type="text"
            placeholder="What's this for?"
            value={formData.description}
            onChange={handleChange}
            required
            error={errors.description}
          />
          
          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={isSubmitting || isCheckingEmail}
          >
            {isSubmitting ? 'Processing...' : 'Send Money'}
          </Button>
        </form>
      </Card>
      
      {/* Confirmation Modal */}
      {emailExists === false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              User Not Found
            </h3>
            <div className="text-center my-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                ₹{parseFloat(formData.amount).toFixed(2)}
              </div>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-gray-600 dark:text-gray-400">To:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formData.receiverEmail}</span>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mb-3">
                {getTransactionTypeDetails(formData.transactionType).icon} {getTransactionTypeDetails(formData.transactionType).label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formData.description}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{currentBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Amount to Send:</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{parseFloat(formData.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">Remaining Balance:</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{(currentBalance - parseFloat(formData.amount)).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEmailExists(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Retry'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransferForm; 