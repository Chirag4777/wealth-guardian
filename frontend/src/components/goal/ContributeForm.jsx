import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';

/**
 * Form component for contributing to a goal
 */
const ContributeForm = ({ 
  goal, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}) => {
  const { 
    name, 
    targetAmount, 
    currentAmount 
  } = goal;
  
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };
  
  // Calculate progress percentage
  const progressPercentage = (currentAmount / targetAmount) * 100;
  
  // Calculate amount needed to reach the goal
  const amountNeeded = targetAmount - currentAmount > 0 ? targetAmount - currentAmount : 0;
  
  // Validate and handle submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || amount.trim() === '') {
      setError('Please enter a contribution amount');
      return;
    }
    
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    
    if (numAmount > amountNeeded) {
      setError(`The maximum contribution needed is ${formatCurrency(amountNeeded)}`);
      return;
    }
    
    onSubmit(numAmount);
  };
  
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setError('');
  };
  
  // Quick amount suggestions
  const getQuickAmounts = () => {
    const suggestions = [];
    const remaining = amountNeeded;
    
    if (remaining >= 100) suggestions.push(100);
    if (remaining >= 500) suggestions.push(500);
    if (remaining >= 1000) suggestions.push(1000);
    if (remaining >= 5000) suggestions.push(5000);
    
    // Add full amount if not already included
    if (remaining > 0 && !suggestions.includes(remaining)) {
      suggestions.push(Math.floor(remaining));
    }
    
    return suggestions.sort((a, b) => a - b);
  };
  
  return (
    <Card>
      <div className="p-4">
        <div className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Contribute to Goal
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {name}
          </h2>
          
          <div className="mt-4 mb-1 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {formatCurrency(currentAmount)} of {formatCurrency(targetAmount)}
            </span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <ProgressBar 
            value={progressPercentage} 
            color="info"
            height="h-2"
            showLabel={false}
          />
          
          <div className="mt-4 text-center">
            <span className="text-gray-600 dark:text-gray-400">
              You need <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(amountNeeded)}</span> more to reach your goal
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Contribution Amount (₹)"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount to contribute"
            error={error}
            required
          />
          
          {/* Quick amount buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Amounts
            </label>
            <div className="flex flex-wrap gap-2">
              {getQuickAmounts().map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                >
                  {formatCurrency(quickAmount)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Contributing...' : 'Contribute'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default ContributeForm; 