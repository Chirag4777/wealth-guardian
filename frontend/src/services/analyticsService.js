import api from './api';
import walletService from './walletService';

const analyticsService = {
  // Get spending by category for the last 30 days
  getSpendingByCategory: async (period = 30) => {
    try {
      // Get transactions for the specified period
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Fetch transactions
      const response = await api.get('/wallet/transactions', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          type: 'TRANSFER_OUT,PAYMENT',
          limit: 100
        }
      });
      
      const transactions = response.data.transactions || [];
      
      // Group transactions by category
      const categoriesMap = {};
      transactions.forEach(transaction => {
        const category = transaction.category || 'Other';
        if (!categoriesMap[category]) {
          categoriesMap[category] = 0;
        }
        categoriesMap[category] += parseFloat(transaction.amount);
      });
      
      // Convert to array for charts
      const categories = Object.keys(categoriesMap).map(category => ({
        name: category,
        value: categoriesMap[category].toFixed(2),
        formattedValue: categoriesMap[category].toFixed(2)
      }));
      
      // Sort by value (highest first)
      return categories.sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Error fetching spending by category:', error);
      return [];
    }
  },
  
  // Get spending trends for the last N months
  getMonthlySpendingTrend: async (months = 6) => {
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months + 1);
      startDate.setDate(1); // Start from the 1st of the month
      
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Fetch transactions
      const response = await api.get('/wallet/transactions', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          limit: 500
        }
      });
      
      const transactions = response.data.transactions || [];
      
      // Group transactions by month
      const monthlyData = {};
      for (let i = 0; i < months; i++) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthKey = month.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.createdAt);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (monthlyData[monthKey]) {
          if (transaction.type === 'TRANSFER_IN' || transaction.type === 'DEPOSIT') {
            monthlyData[monthKey].income += parseFloat(transaction.amount);
          } else if (transaction.type === 'TRANSFER_OUT' || transaction.type === 'PAYMENT') {
            monthlyData[monthKey].expense += parseFloat(transaction.amount);
          }
        }
      });
      
      // Convert to array for charts
      const result = Object.keys(monthlyData)
        .map(month => ({
          name: month,
          income: monthlyData[month].income.toFixed(2),
          expense: monthlyData[month].expense.toFixed(2)
        }))
        .reverse(); // Most recent last
      
      return result;
    } catch (error) {
      console.error('Error fetching monthly spending trend:', error);
      return [];
    }
  },
  
  // Get weekly spending for the current month
  getWeeklySpending: async () => {
    try {
      // Calculate current month range
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Fetch transactions
      const response = await api.get('/wallet/transactions', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          type: 'TRANSFER_OUT,PAYMENT',
          limit: 200
        }
      });
      
      const transactions = response.data.transactions || [];
      
      // Group by week of month
      const weekData = [
        { name: 'Week 1', value: 0 },
        { name: 'Week 2', value: 0 },
        { name: 'Week 3', value: 0 },
        { name: 'Week 4', value: 0 },
        { name: 'Week 5', value: 0 }
      ];
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.createdAt);
        const day = date.getDate();
        
        // Assign to week (simple method)
        let weekIndex = Math.floor((day - 1) / 7);
        if (weekIndex > 4) weekIndex = 4; // Cap at week 5
        
        weekData[weekIndex].value += parseFloat(transaction.amount);
      });
      
      // Format values
      weekData.forEach(week => {
        week.value = parseFloat(week.value.toFixed(2));
      });
      
      return weekData;
    } catch (error) {
      console.error('Error fetching weekly spending:', error);
      return [];
    }
  },
  
  // Get budget vs spending comparison
  getBudgetVsSpending: async () => {
    try {
      // First get the budget data
      const budgetResponse = await api.get('/wallet/budgets');
      const budgets = budgetResponse.data.budgets || [];
      
      if (!budgets.length) {
        return {
          totalBudget: 0,
          totalSpent: 0,
          categories: []
        };
      }
      
      // Get the current month range for transactions
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Fetch transactions for this month
      const txResponse = await api.get('/wallet/transactions', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          type: 'TRANSFER_OUT,PAYMENT',
          limit: 500
        }
      });
      
      const transactions = txResponse.data.transactions || [];
      
      // Group transactions by category
      const categorySpending = {};
      transactions.forEach(transaction => {
        const category = transaction.category || 'Other';
        if (!categorySpending[category]) {
          categorySpending[category] = 0;
        }
        categorySpending[category] += parseFloat(transaction.amount);
      });
      
      // Match with budgets and calculate totals
      let totalBudget = 0;
      let totalSpent = 0;
      
      const categories = budgets.map(budget => {
        const categoryName = budget.category;
        const budgetAmount = parseFloat(budget.amount);
        const spent = categorySpending[categoryName] || 0;
        
        totalBudget += budgetAmount;
        totalSpent += spent;
        
        return {
          name: categoryName,
          budget: budgetAmount,
          spent: spent
        };
      });
      
      return {
        totalBudget,
        totalSpent,
        categories
      };
    } catch (error) {
      console.error('Error fetching budget vs spending:', error);
      return {
        totalBudget: 0,
        totalSpent: 0,
        categories: []
      };
    }
  },
  
  // Get overall wallet statistics
  getWalletStats: async () => {
    try {
      return await walletService.getWalletStats();
    } catch (error) {
      console.error('Error fetching wallet stats:', error);
      return {
        totalSent: 0,
        totalReceived: 0,
        lastMonthActivity: 0,
        transactionCount: 0
      };
    }
  }
};

export default analyticsService; 