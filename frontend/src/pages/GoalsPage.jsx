import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import goalService from '../services/goalService';

/**
 * Page component for managing financial goals
 */
const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goalService.getGoals();
      
      if (!data) {
        throw new Error('No data received from server');
      }

      // Ensure data is an array
      const goalsArray = Array.isArray(data) ? data : [];
      setGoals(goalsArray);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setEditAmount(goal.currentAmount.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingGoal || !editAmount) return;

    try {
      const amount = parseFloat(editAmount);
      if (isNaN(amount) || amount < 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amount > editingGoal.targetAmount) {
        throw new Error('Current amount cannot exceed target amount');
      }

      await goalService.updateGoal(editingGoal.id, {
        currentAmount: amount
      });

      setEditingGoal(null);
      setEditAmount('');
      fetchGoals(); // Refresh the goals list
    } catch (err) {
      setError(err.message || 'Failed to update goal');
    }
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setEditAmount('');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your goals...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Goals
          </h1>
          <Link to="/goals/creategoal">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Goal
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {goals.length === 0 ? (
          <Card className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by creating your first goal
            </p>
            <Link to="/goals/creategoal">
              <Button>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Goal
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {goal.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.category}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Due: {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {editingGoal?.id === goal.id ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter new amount"
                        min="0"
                        max={goal.targetAmount}
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        onClick={handleCancelEdit}
                        className="px-4"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveEdit}
                        className="px-4"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => handleEditClick(goal)}
                      className="flex items-center"
                    >
                      <PencilIcon className="h-5 w-5 mr-2" />
                      Edit Progress
                    </Button>
                  </div>
                )}

                {goal.description && (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {goal.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GoalsPage; 