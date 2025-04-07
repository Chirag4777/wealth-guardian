import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// Common spending categories
const CATEGORIES = [
  { id: 'housing', label: 'Housing', icon: '🏠' },
  { id: 'transportation', label: 'Transportation', icon: '🚗' },
  { id: 'food', label: 'Food & Dining', icon: '🍔' },
  { id: 'utilities', label: 'Utilities', icon: '💡' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'personal', label: 'Personal Care', icon: '💇' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'savings', label: 'Savings', icon: '💰' },
  { id: 'debt', label: 'Debt Payments', icon: '💳' },
  { id: 'gifts', label: 'Gifts & Donations', icon: '🎁' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'other', label: 'Other', icon: '📝' }
];

// Budget periods
const PERIODS = [
  { id: 'DAILY', label: 'Daily' },
  { id: 'WEEKLY', label: 'Weekly' },
  { id: 'MONTHLY', label: 'Monthly' },
  { id: 'QUARTERLY', label: 'Quarterly' },
  { id: 'YEARLY', label: 'Yearly' }
];

/**
 * Form component for creating and editing budgets
 */
const BudgetForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    period: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  const [customCategory, setCustomCategory] = useState('');
  
  // Update form if initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Format dates for date inputs
      const updatedData = { ...initialData };
      if (updatedData.startDate) {
        updatedData.startDate = new Date(updatedData.startDate).toISOString().split('T')[0];
      }
      if (updatedData.endDate) {
        updatedData.endDate = new Date(updatedData.endDate).toISOString().split('T')[0];
      }
      
      setFormData(updatedData);
      
      // Check if we need to use a custom category
      if (updatedData.category && !CATEGORIES.find(c => c.id === updatedData.category)) {
        setCustomCategory(updatedData.category);
      }
    }
  }, [initialData]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      category
    });
    
    if (errors.category) {
      setErrors({
        ...errors,
        category: ''
      });
    }
  };
  
  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
    
    if (e.target.value) {
      setFormData({
        ...formData,
        category: e.target.value
      });
      
      if (errors.category) {
        setErrors({
          ...errors,
          category: ''
        });
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Budget name is required';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Budget amount is required';
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Budget amount must be a positive number';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select or enter a category';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert amount to a number
      const submissionData = {
        ...formData,
        amount: Number(formData.amount)
      };
      
      onSubmit(submissionData);
    }
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {initialData.id ? 'Edit Budget' : 'Create New Budget'}
        </div>
        
        <Input
          label="Budget Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Groceries Budget"
          error={errors.name}
          required
        />
        
        <Input
          label="Amount (₹)"
          name="amount"
          type="number"
          min="0"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Enter budget amount"
          error={errors.amount}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget Period
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {PERIODS.map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => handleChange({
                  target: { name: 'period', value: period.id }
                })}
                className={`py-2 px-3 text-sm rounded-md ${
                  formData.period === period.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-500'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-transparent'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`flex flex-col items-center p-3 rounded-md ${
                  formData.category === category.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-500'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'
                }`}
              >
                <span className="text-xl mb-1">{category.icon}</span>
                <span className="text-xs line-clamp-1">{category.label}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-3">
            <Input
              label="Or Enter Custom Category"
              placeholder="Enter a custom category"
              value={customCategory}
              onChange={handleCustomCategoryChange}
              error={errors.category}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
            required
          />
          
          <Input
            label={`End Date ${formData.period === 'DAILY' ? '(Optional)' : ''}`}
            name="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={handleChange}
            error={errors.endDate}
          />
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
            {isSubmitting 
              ? 'Saving...' 
              : initialData.id 
                ? 'Update Budget' 
                : 'Create Budget'
            }
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BudgetForm; 