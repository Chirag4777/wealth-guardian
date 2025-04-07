import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import BudgetCard from '../components/budget/BudgetCard';
import BudgetForm from '../components/budget/BudgetForm';
import budgetService from '../services/budgetService';
import { PlusIcon } from '@heroicons/react/24/outline';

/**
 * Page component for managing budgets
 */
const BudgetsPage = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch budgets on component mount
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await budgetService.getBudgets();
        setBudgets(data);
      } catch (err) {
        setError('Failed to load budgets');
        console.error('Error fetching budgets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);
  
  // Handle budget create/update
  const handleSubmit = async (budgetData) => {
    setIsSubmitting(true);
    
    try {
      if (editingBudget) {
        // Update existing budget
        await budgetService.updateBudget(editingBudget.id, budgetData);
        toast.success('Budget updated successfully');
      } else {
        // Create new budget
        await budgetService.createBudget(budgetData);
        toast.success('Budget created successfully');
      }
      
      // Reset form state and refresh budgets
      setShowForm(false);
      setEditingBudget(null);
      fetchBudgets();
    } catch (err) {
      console.error('Error saving budget:', err);
      toast.error(err.response?.data?.message || 'Failed to save budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Edit an existing budget
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Delete a budget
  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    try {
      await budgetService.deleteBudget(budgetId);
      toast.success('Budget deleted successfully');
      
      // Remove deleted budget from state
      setBudgets(budgets.filter(budget => budget.id !== budgetId));
    } catch (err) {
      console.error('Error deleting budget:', err);
      toast.error('Failed to delete budget. Please try again.');
    }
  };
  
  // Cancel form submission
  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your budgets...</p>
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
            Budgets
          </h1>
          <Link to="/budgets/create">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Budget
            </Button>
          </Link>
        </div>
        
        {/* Budget form */}
        {showForm && (
          <div className="mb-8">
            <BudgetForm 
              initialData={editingBudget}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {budgets.length === 0 ? (
          <Card className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No budgets yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by creating your first budget
            </p>
            <Link to="/budgets/create">
              <Button>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Budget
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <Card key={budget.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {budget.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {budget.category}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Amount</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{budget.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {budget.description && (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {budget.description}
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

export default BudgetsPage; 