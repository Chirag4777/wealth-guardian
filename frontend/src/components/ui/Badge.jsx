import React from 'react';

const variantStyles = {
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  info: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '',
  withDot = false 
}) => {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {withDot && (
        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${variant === 'default' ? 'bg-gray-600 dark:bg-gray-400' : 'bg-current'}`}></span>
      )}
      {children}
    </span>
  );
}; 