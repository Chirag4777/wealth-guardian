import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center">
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">Wealth Guardian</h2>
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">
              A secure digital wallet platform that allows you to safely manage and transfer funds anytime, anywhere.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-base text-gray-500 dark:text-gray-400 text-center">
            &copy; {currentYear} Wealth Guardian. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 