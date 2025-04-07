import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layouts/PageHeader';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import StatCard from '../components/ui/StatCard';
import ExpenseByCategoryChart from '../components/analytics/ExpenseByCategoryChart';
import SpendingTrendsChart from '../components/analytics/SpendingTrendsChart';
import WeeklySpendingChart from '../components/analytics/WeeklySpendingChart';
import analyticsService from '../services/analyticsService';
import { FiTrendingUp, FiTrendingDown, FiBarChart, FiPieChart } from 'react-icons/fi';

const AnalyticsPage = () => {
  const [activePeriod, setActivePeriod] = useState('30');
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    lastMonthActivity: 0,
    transactionCount: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const walletStats = await analyticsService.getWalletStats();
        setStats(walletStats);
      } catch (error) {
        console.error('Error fetching wallet stats:', error);
      }
    };
    
    fetchStats();
  }, []);
  
  const handlePeriodChange = (periodId) => {
    setActivePeriod(periodId);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader 
        title="Analytics" 
        description="Track your spending patterns and financial trends" 
      />
      
      <AnalyticsFilters 
        activePeriod={activePeriod} 
        onPeriodChange={handlePeriodChange} 
      />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Expenses" 
          value={stats.totalSent} 
          icon={<FiTrendingDown />}
          change={-2.5}
          tooltip="Money spent over all time"
          iconColor="text-red-500"
          iconBgColor="bg-red-100"
        />
        
        <StatCard 
          title="Total Income" 
          value={stats.totalReceived} 
          icon={<FiTrendingUp />}
          change={5.2}
          tooltip="Money received over all time"
          iconColor="text-green-500"
          iconBgColor="bg-green-100"
        />
        
        <StatCard 
          title="Monthly Activity" 
          value={Math.abs(stats.lastMonthActivity)} 
          icon={<FiBarChart />}
          change={stats.lastMonthActivity > 0 ? 3.1 : -3.1}
          tooltip="Net cash flow for the last month"
          iconColor="text-blue-500"
          iconBgColor="bg-blue-100"
        />
        
        <StatCard 
          title="Transactions" 
          value={stats.transactionCount} 
          icon={<FiPieChart />}
          change={1.8}
          tooltip="Total number of transactions"
          iconColor="text-indigo-500"
          iconBgColor="bg-indigo-100"
          isCurrency={false}
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SpendingTrendsChart />
        <ExpenseByCategoryChart period={parseInt(activePeriod)} />
      </div>
      
      <div className="grid grid-cols-1">
        <WeeklySpendingChart />
      </div>
    </div>
  );
};

export default AnalyticsPage; 