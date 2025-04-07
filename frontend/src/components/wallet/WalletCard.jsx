import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PlusIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const WalletCard = ({ balance = 0 }) => {
  // Format the balance to show with 2 decimal places
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(balance);

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
      <div className="text-white">
        <h3 className="text-lg font-medium mb-1 opacity-90">Wallet Balance</h3>
        <div className="text-3xl font-bold mb-6">{formattedBalance}</div>
        
        <div className="flex flex-wrap gap-2">
          <Link to="/wallet/add-funds" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-white/30 text-white hover:bg-white/10 flex items-center justify-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </Link>
          <Link to="/wallet/transfer" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-white/30 text-white hover:bg-white/10 flex items-center justify-center"
            >
              <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
              Transfer
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default WalletCard; 