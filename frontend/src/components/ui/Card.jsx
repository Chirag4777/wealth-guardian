import React from 'react';

export const Card = ({ 
  children, 
  title,
  className = '', 
  hoverable = false, 
  bordered = true, 
  shadow = 'md',
  padding = 'p-6',
  headerAction,
  footer,
  noPadding = false
}) => {
  // Determine shadow class based on shadow prop
  let shadowClass = '';
  switch (shadow) {
    case 'none':
      shadowClass = '';
      break;
    case 'sm':
      shadowClass = 'shadow-sm';
      break;
    case 'lg':
      shadowClass = 'shadow-lg';
      break;
    case 'xl':
      shadowClass = 'shadow-xl';
      break;
    case 'md':
    default:
      shadowClass = 'shadow';
  }
  
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        ${bordered ? 'border border-gray-200 dark:border-gray-700' : ''}
        rounded-lg 
        ${shadowClass}
        ${hoverable ? 'transition-shadow duration-300 hover:shadow-lg' : ''}
        overflow-hidden
        ${className}
      `}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {headerAction && (
            <div className="flex items-center">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : padding}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {footer}
        </div>
      )}
    </div>
  );
}; 