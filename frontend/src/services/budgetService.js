import api from './api';

/**
 * Service to handle budget operations
 */
const budgetService = {
  /**
   * Get all budgets
   * @returns {Promise<Array>} List of budgets
   */
  async getBudgets() {
    try {
      const response = await api.get('/budgets');
      return response.data;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  },

  /**
   * Get a budget by ID
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} Budget details
   */
  async getBudgetById(id) {
    try {
      const response = await api.get(`/budgets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new budget
   * @param {Object} budgetData - Budget data
   * @returns {Promise<Object>} Created budget
   */
  async createBudget(budgetData) {
    try {
      const response = await api.post('/budgets', budgetData);
      return response.data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  /**
   * Update an existing budget
   * @param {string} id - Budget ID
   * @param {Object} budgetData - Updated budget data
   * @returns {Promise<Object>} Updated budget
   */
  async updateBudget(id, budgetData) {
    try {
      const response = await api.put(`/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      console.error(`Error updating budget ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a budget
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteBudget(id) {
    try {
      const response = await api.delete(`/budgets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting budget ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get budget progress
   * @returns {Promise<Array>} Budget progress data
   */
  async getBudgetProgress() {
    try {
      const response = await api.get('/budgets/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching budget progress:', error);
      throw error;
    }
  }
};

export default budgetService; 