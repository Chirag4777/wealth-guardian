import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import LineChart from '../ui/LineChart';
import analyticsService from '../../services/analyticsService';

const SpendingTrendsChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const trendData = await analyticsService.getMonthlySpendingTrend(6);
        setData(trendData);
      } catch (error) {
        console.error('Error fetching spending trend data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Card title="Monthly Spending Trends">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card title="Monthly Spending Trends">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No spending data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Start adding transactions to see your spending trends
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card title="Monthly Spending Trends">
      <LineChart 
        data={data} 
        dataKeys={['expense', 'income']} 
        colors={['#FF8042', '#00C49F']} 
      />
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#FF8042] mr-2"></span>
          <span className="text-sm text-gray-600 dark:text-gray-300">Expenses</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#00C49F] mr-2"></span>
          <span className="text-sm text-gray-600 dark:text-gray-300">Income</span>
        </div>
      </div>
    </Card>
  );
};

export default SpendingTrendsChart; 