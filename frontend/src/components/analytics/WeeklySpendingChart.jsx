import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import BarChart from '../ui/BarChart';
import analyticsService from '../../services/analyticsService';

const WeeklySpendingChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const weeklyData = await analyticsService.getWeeklySpending();
        setData(weeklyData);
      } catch (error) {
        console.error('Error fetching weekly spending data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const title = `Weekly Spending (${currentMonth})`;
  
  if (loading) {
    return (
      <Card title={title}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card title={title}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No weekly spending data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Start adding transactions to see your weekly spending
          </p>
        </div>
      </Card>
    );
  }
  
  // Find the week with the highest spending
  const maxSpendingWeek = data.reduce((maxWeek, currentWeek) => 
    currentWeek.value > maxWeek.value ? currentWeek : maxWeek, data[0]);
  
  return (
    <Card title={title}>
      <BarChart 
        data={data} 
        dataKeys={['value']} 
        colors={['#8884d8']} 
      />
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Highest spending: <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {maxSpendingWeek.name} (₹{maxSpendingWeek.value.toLocaleString()})
          </span>
        </p>
      </div>
    </Card>
  );
};

export default WeeklySpendingChart; 