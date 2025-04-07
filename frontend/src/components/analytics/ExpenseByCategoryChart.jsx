import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import PieChart from '../ui/PieChart';
import analyticsService from '../../services/analyticsService';

const ExpenseByCategoryChart = ({ period = 30 }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categories = await analyticsService.getSpendingByCategory(period);
        setData(categories);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [period]);

  if (loading) {
    return (
      <Card title="Expenses by Category">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card title="Expenses by Category">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No category data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Add transactions with categories to see your spending breakdown
          </p>
        </div>
      </Card>
    );
  }
  
  // Get top 5 categories for the chart
  const topCategories = data.slice(0, 5);
  
  return (
    <Card title="Expenses by Category">
      <div className="h-64">
        <PieChart data={topCategories} />
      </div>
      
      <div className="mt-4 grid grid-cols-1 gap-2">
        {topCategories.map((category, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: PieChart.COLORS[index % PieChart.COLORS.length] }}
              ></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{category.name}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              ₹{parseFloat(category.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExpenseByCategoryChart; 