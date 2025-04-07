import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRightIcon, WalletIcon, BanknotesIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const Hero = () => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          <div className="mb-12 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Secure Digital Wallet & Money Transfer
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Wealth Guardian provides a safe and reliable platform to manage your money, transfer funds instantly, and keep track of your transactions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="flex items-center">
                  Get Started
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:flex lg:items-center">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 md:p-10 relative">
              <div className="absolute -top-6 -right-6 bg-blue-600 dark:bg-blue-500 rounded-full p-4 shadow-lg">
                <WalletIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <WalletIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="ml-3 text-gray-700 dark:text-gray-300">Secure digital wallet with instant access</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="ml-3 text-gray-700 dark:text-gray-300">Easy funds management and deposit</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <ArrowsRightLeftIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="ml-3 text-gray-700 dark:text-gray-300">Fast and secure money transfers to other users</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 