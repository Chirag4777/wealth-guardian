import React from 'react';
import { Button } from '../ui/Button';

const AnalyticsFilters = ({ activePeriod, onPeriodChange }) => {
  const periods = [
    { id: '7', label: '7 Days' },
    { id: '30', label: '30 Days' },
    { id: '90', label: '3 Months' },
    { id: '180', label: '6 Months' },
    { id: '365', label: '1 Year' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {periods.map((period) => (
        <Button
          key={period.id}
          variant={activePeriod === period.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodChange(period.id)}
          className={`text-xs md:text-sm ${
            activePeriod === period.id 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
};

export default AnalyticsFilters; 