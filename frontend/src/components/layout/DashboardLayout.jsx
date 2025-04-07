import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Logout from '../Auth/Logout';
import {
  HomeIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChartPieIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowsRightLeftIcon,
  ReceiptPercentIcon,
  CalculatorIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { 
      name: 'Wallet',
      href: '/wallet',
      icon: WalletIcon,
      children: [
        { name: 'Overview', href: '/wallet' },
        { name: 'Add Funds', href: '/wallet/add-funds', icon: BanknotesIcon },
        { name: 'Transfer', href: '/wallet/transfer', icon: ArrowsRightLeftIcon },
        { name: 'Transactions', href: '/transactions', icon: ReceiptPercentIcon }
      ]
    },
    { name: 'Analytics', href: '/wallet/analytics', icon: ChartPieIcon },
    { name: 'Budgets', href: '/budgets', icon: CalculatorIcon },
    { name: 'Goals', href: '/goals', icon: FlagIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon }
  ];
  
  const isActive = (path) => {
    if (path === '/wallet' && location.pathname === '/wallet') {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  const renderNavItems = (items) => {
    return items.map((item) => (
      <li key={item.name}>
        {item.children ? (
          <div className="mb-2">
            <div className={`flex items-center px-4 py-2 rounded-md ${
              item.children.some(child => isActive(child.href))
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}>
              {item.icon && <item.icon className="h-5 w-5 mr-3" />}
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <ul className="ml-6 mt-1 space-y-1">
              {item.children.map((child) => (
                <li key={child.name}>
                  <Link
                    to={child.href}
                    className={`flex items-center px-4 py-2 text-sm rounded-md ${
                      isActive(child.href)
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {child.icon && <child.icon className="h-4 w-4 mr-2" />}
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Link
            to={item.href}
            className={`flex items-center px-4 py-2 text-sm rounded-md ${
              isActive(item.href)
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {item.icon && <item.icon className="h-5 w-5 mr-3" />}
            {item.name}
          </Link>
        )}
      </li>
    ));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300"
        >
          {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-full w-64 transition-transform md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}>
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Wealth Guardian
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="mt-4 flex-1 px-2">
            <ul className="space-y-2">
              {renderNavItems(navigation)}
            </ul>
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
              <Logout 
                variant="ghost" 
                className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </Logout>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="md:ml-64 p-4 md:p-8">
        {/* Show user info in header on mobile */}
        <div className="mb-8 md:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Wealth Guardian
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
              <Logout variant="ghost">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </Logout>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentUser?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout; 