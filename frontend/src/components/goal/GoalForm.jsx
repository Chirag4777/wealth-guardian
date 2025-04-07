import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// Common goal categories
const CATEGORIES = [
  { id: 'emergency', label: 'Emergency Fund', icon: '🚨' },
  { id: 'retirement', label: 'Retirement', icon: '👴' },
  { id: 'home', label: 'Home Purchase', icon: '🏠' },
  { id: 'car', label: 'Vehicle', icon: '🚗' },
  { id: 'vacation', label: 'Vacation', icon: '🏖️' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'wedding', label: 'Wedding', icon: '💍' },
  { id: 'gadget', label: 'Electronics', icon: '📱' },
  { id: 'debt', label: 'Debt Payoff', icon: '💳' },
  { id: 'investment', label: 'Investment', icon: '📈' },
  { id: 'children', label: 'Children', icon: '👶' },
  { id: 'medical', label: 'Medical', icon: '⚕️' },
  { id: 'other', label: 'Other', icon: '🎯' }
];

/**
 * Form component for creating and editing goals
 */
const GoalForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    category: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  const [customCategory, setCustomCategory] = useState('');
  
  // Set default target date to 1 year from now if not provided
  useEffect(() => {
    if (!formData.targetDate) {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      setFormData({
        ...formData,
        targetDate: date.toISOString().split('T')[0]
      });
    }
  }, []);
  
  // Update form if initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Format dates for date inputs
      const updatedData = { ...initialData };
      if (updatedData.startDate) {
        updatedData.startDate = new Date(updatedData.startDate).toISOString().split('T')[0];
      }
      if (updatedData.targetDate) {
        updatedData.targetDate = new Date(updatedData.targetDate).toISOString().split('T')[0];
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
      newErrors.name = 'Goal name is required';
    }
    
    if (!formData.targetAmount) {
      newErrors.targetAmount = 'Target amount is required';
    } else if (isNaN(formData.targetAmount) || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be a positive number';
    }
    
    if (formData.currentAmount && (isNaN(formData.currentAmount) || Number(formData.currentAmount) < 0)) {
      newErrors.currentAmount = 'Current amount must be a positive number';
    }
    
    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else if (new Date(formData.targetDate) < new Date(formData.startDate)) {
      newErrors.targetDate = 'Target date cannot be earlier than start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert amounts to numbers
      const submissionData = {
        ...formData,
        targetAmount: Number(formData.targetAmount),
        currentAmount: formData.currentAmount ? Number(formData.currentAmount) : 0
      };
      
      onSubmit(submissionData);
    }
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {initialData.id ? 'Edit Goal' : 'Create New Goal'}
        </div>
        
        <Input
          label="Goal Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Emergency Fund"
          error={errors.name}
          required
        />
        
        <Input
          label="Target Amount (₹)"
          name="targetAmount"
          type="number"
          min="0"
          step="0.01"
          value={formData.targetAmount}
          onChange={handleChange}
          placeholder="How much do you want to save?"
          error={errors.targetAmount}
          required
        />
        
        <Input
          label="Current Amount (₹) (Optional)"
          name="currentAmount"
          type="number"
          min="0"
          step="0.01"
          value={formData.currentAmount || ''}
          onChange={handleChange}
          placeholder="How much have you already saved?"
          error={errors.currentAmount}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Goal Category
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
            label="Target Date"
            name="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={handleChange}
            error={errors.targetDate}
            required
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
                ? 'Update Goal' 
                : 'Create Goal'
            }
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GoalForm; 