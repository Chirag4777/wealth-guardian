import React from 'react';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  BanknotesIcon,
  TagIcon
} from '@heroicons/react/24/outline';

/**
 * Component for displaying individual budget items
 */
const BudgetCard = ({ 
  budget, 
  onEdit, 
  onDelete 
}) => {
  const { 
    id, 
    name, 
    amount, 
    category, 
    period, 
    startDate, 
    endDate,
    progress
  } = budget;

  // Format budget period for display
  const formatPeriod = (period) => {
    switch (period) {
      case 'DAILY': return 'Daily';
      case 'WEEKLY': return 'Weekly';
      case 'MONTHLY': return 'Monthly';
      case 'QUARTERLY': return 'Quarterly';
      case 'YEARLY': return 'Yearly';
      default: return period;
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString || 'N/A';
    }
  };
  
  // Calculate percentage spent
  const percentSpent = progress 
    ? (progress.spent / amount) * 100
    : 0;
  
  // Determine color based on spending percentage
  const getProgressColor = () => {
    if (percentSpent > 100) return 'danger';
    if (percentSpent > 75) return 'warning';
    return 'success';
  };
  
  return (
    <Card className="h-full">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {name}
          </h3>
          <div className="flex space-x-1">
            {onEdit && (
              <button 
                onClick={() => onEdit(budget)}
                className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <PencilIcon className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(id)}
                className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
              >
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <TagIcon className="h-4 w-4 mr-1" />
          <span className="truncate">{category}</span>
          <span className="px-2">•</span>
          <span>{formatPeriod(period)}</span>
        </div>
        
        <div className="mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budget</div>
          <div className="font-bold text-2xl mb-1 text-gray-900 dark:text-white">
            {formatCurrency(amount)}
          </div>
          
          {progress && (
            <>
              <ProgressBar 
                value={percentSpent} 
                color={getProgressColor()}
                height="h-2.5"
                showLabel={false}
                className="mb-2"
              />
              
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Spent: </span>
                  <span className={`font-medium ${percentSpent > 100 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {formatCurrency(progress.spent)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Left: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(progress.remaining < 0 ? 0 : progress.remaining)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>
            {progress ? (
              `${formatDate(progress.startDate)} - ${formatDate(progress.endDate)}`
            ) : (
              `${formatDate(startDate)}${endDate ? ` - ${formatDate(endDate)}` : ''}`
            )}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCard;

 