import React from 'react';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  BanknotesIcon,
  PlusCircleIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

/**
 * Component for displaying individual goal items
 */
const GoalCard = ({ 
  goal, 
  onEdit, 
  onDelete,
  onContribute 
}) => {
  const { 
    id, 
    name, 
    targetAmount, 
    currentAmount, 
    startDate, 
    targetDate,
    category,
    daysRemaining,
    percentComplete
  } = goal;
  
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
  
  // Calculate percentage completed
  const completionPercentage = percentComplete || ((currentAmount / targetAmount) * 100);
  const isCompleted = currentAmount >= targetAmount;
  
  return (
    <Card className="h-full">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {name}
          </h3>
          <div className="flex space-x-1">
            {onEdit && !isCompleted && (
              <button 
                onClick={() => onEdit(goal)}
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
        
        {category && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <FlagIcon className="h-4 w-4 mr-1" />
            <span className="truncate">{category}</span>
          </div>
        )}
        
        <div className="mb-3 mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target Amount</div>
          <div className="font-bold text-2xl mb-1 text-gray-900 dark:text-white">
            {formatCurrency(targetAmount)}
          </div>
          
          <ProgressBar 
            value={completionPercentage} 
            color={isCompleted ? 'success' : 'info'}
            height="h-2.5"
            showLabel={false}
            className="mb-2"
          />
          
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Saved: </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(currentAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Remaining: </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(targetAmount - currentAmount < 0 ? 0 : targetAmount - currentAmount)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>
              {`Target: ${formatDate(targetDate)}`}
            </span>
          </div>
          <div className="text-sm">
            {daysRemaining !== undefined && !isCompleted && (
              <span className={`font-medium ${daysRemaining < 30 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {daysRemaining} days left
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Completed
              </span>
            )}
          </div>
        </div>
        
        {onContribute && !isCompleted && (
          <button
            onClick={() => onContribute(goal)}
            className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Contribute
          </button>
        )}
      </div>
    </Card>
  );
};

export default GoalCard; 