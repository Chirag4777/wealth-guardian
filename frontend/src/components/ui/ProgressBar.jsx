import React from 'react';

/**
 * A reusable progress bar component
 * 
 * @param {Object} props
 * @param {number} props.value - Current progress value (0-100)
 * @param {string} props.color - Color of the progress bar (default, success, warning, danger)
 * @param {boolean} props.showLabel - Whether to show the percentage label
 * @param {string} props.height - Height of the progress bar
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animate - Whether to animate the progress bar
 */
const ProgressBar = ({ 
  value = 0, 
  color = 'default', 
  showLabel = true, 
  height = 'h-4', 
  className = '',
  animate = true
}) => {
  // Ensure value is between 0 and 100
  const percentage = Math.min(Math.max(value, 0), 100);
  
  // Get color classes based on color prop or value
  const getColorClasses = () => {
    if (color === 'auto') {
      // Automatically determine color based on percentage
      if (percentage >= 100) return 'bg-green-500';
      if (percentage >= 70) return 'bg-green-500';
      if (percentage >= 50) return 'bg-blue-500';
      if (percentage >= 25) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    // Use predefined color schemes
    switch (color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  // Invert colors for overconsumption (budget display)
  const isOverBudget = color === 'budget' && percentage > 100;
  
  // Calculate display percentage (cap at 100% for visual, but color will indicate excess)
  const displayPercentage = color === 'budget' ? Math.min(percentage, 100) : percentage;

  // Determine background and text colors
  const bgColorClass = isOverBudget ? 'bg-red-500' : getColorClasses();
  const labelColorClass = showLabel ? 'text-white' : 'text-transparent';
  
  return (
    <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full ${bgColorClass} rounded-full flex items-center justify-center text-xs ${animate ? 'transition-all duration-500 ease-out' : ''}`}
        style={{ width: `${displayPercentage}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {showLabel && percentage >= 10 && (
          <span className={`px-2 ${labelColorClass}`}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar; 