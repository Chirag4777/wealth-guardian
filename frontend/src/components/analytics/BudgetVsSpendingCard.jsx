import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import analyticsService from '../../services/analyticsService';

const BudgetVsSpendingCard = () => {
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState({
    totalBudget: 0,
    totalSpent: 0,
    categories: []
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getBudgetVsSpending();
        setBudgetData(data);
      } catch (error) {
        console.error('Error fetching budget data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Card title="Budget vs Actual">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    );
  }
  
  if (!budgetData || budgetData.totalBudget === 0) {
    return (
      <Card title="Budget vs Actual">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No budget data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Set up budgets to track your spending against your goals
          </p>
        </div>
      </Card>
    );
  }
  
  const { totalBudget, totalSpent, categories } = budgetData;
  const percentSpent = Math.min((totalSpent / totalBudget) * 100, 100);
  const isOverBudget = totalSpent > totalBudget;
  
  // Find categories that are over budget
  const overBudgetCategories = categories.filter(cat => cat.spent > cat.budget);
  
  return (
    <Card title="Budget vs Actual Spending">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Budget: ₹{totalBudget.toLocaleString()}
          </span>
          <span className={`text-sm font-medium ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
            {percentSpent.toFixed(0)}%
          </span>
        </div>
        <ProgressBar 
          value={percentSpent} 
          color={isOverBudget ? 'red' : percentSpent > 80 ? 'yellow' : 'green'} 
        />
        <div className="mt-1 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">₹0</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <span className={isOverBudget ? 'text-red-500 font-medium' : ''}>₹{totalSpent.toLocaleString()}</span> / ₹{totalBudget.toLocaleString()}
          </span>
        </div>
      </div>
      
      {overBudgetCategories.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Categories Over Budget
          </h4>
          {overBudgetCategories.map((category, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
                <span className="text-xs font-medium text-red-500">
                  {((category.spent / category.budget) * 100).toFixed(0)}%
                </span>
              </div>
              <ProgressBar 
                value={(category.spent / category.budget) * 100} 
                color="red" 
              />
              <div className="mt-1 text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-red-500 font-medium">₹{category.spent.toLocaleString()}</span> / ₹{category.budget.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default BudgetVsSpendingCard; 