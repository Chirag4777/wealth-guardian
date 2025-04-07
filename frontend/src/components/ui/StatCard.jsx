import React from 'react';
import { Card } from './Card';

const StatCard = ({ 
  title, 
  value = 0, 
  icon, 
  change, 
  tooltip, 
  iconColor = 'text-blue-500', 
  iconBgColor = 'bg-blue-100',
  isCurrency = true
}) => {
  // Format value with commas for thousands, etc.
  const formattedValue = typeof value === 'number' 
    ? isCurrency 
      ? `₹${value.toLocaleString()}`
      : value.toLocaleString()
    : value;
  
  // Format change as percentage with + or - sign
  const formattedChange = change 
    ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` 
    : null;
  
  // Determine color for change value
  const changeColorClass = change 
    ? change > 0 
      ? 'text-green-500' 
      : 'text-red-500' 
    : 'text-gray-500';
  
  return (
    <Card>
      <div className="flex items-start">
        {icon && (
          <div className={`rounded-full p-3 mr-4 ${iconBgColor}`}>
            <span className={`flex-shrink-0 ${iconColor}`}>
              {icon}
            </span>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
            {tooltip && (
              <span className="ml-1 inline-block" title={tooltip}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            )}
          </h4>
          
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formattedValue}
            </span>
            
            {formattedChange && (
              <span className={`ml-2 text-sm font-medium ${changeColorClass}`}>
                {formattedChange}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard; 