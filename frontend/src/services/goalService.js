import api from '../services/api';

// Use just the endpoint without 'api' since the base URL already includes it
const API_URL = '/goals';

/**
 * Service to handle goal operations
 */
const goalService = {
  /**
   * Get all goals
   * @returns {Promise<Array>} List of goals
   */
  getGoals: async () => {
    try {
      console.log(`Fetching goals from ${API_URL}`);
      const response = await api.get(API_URL);
      console.log('Goals API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching goals:', error);
      console.error('Error details:', error.response?.data || 'No detailed error');
      throw error;
    }
  },

  /**
   * Get a goal by ID
   * @param {string} id - Goal ID
   * @returns {Promise<Object>} Goal details
   */
  getGoalById: async (id) => {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching goal:', error);
      throw error;
    }
  },

  /**
   * Create a new goal
   * @param {Object} goalData - Goal data
   * @returns {Promise<Object>} Created goal
   */
  createGoal: async (goalData) => {
    try {
      console.log(`Creating goal with data:`, goalData);
      console.log(`Sending POST request to ${API_URL}`);
      
      // Ensure all required fields are present and properly formatted
      const validatedData = {
        name: goalData.name,
        targetAmount: Number(goalData.targetAmount),
        currentAmount: Number(goalData.currentAmount || 0),
        startDate: goalData.startDate || new Date().toISOString(),
        targetDate: goalData.targetDate,
        category: goalData.category || 'savings',
        description: goalData.description || ''
      };
      
      console.log('Validated data:', validatedData);
      
      const response = await api.post(API_URL, validatedData);
      console.log('Create goal response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating goal:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data || 'No detailed error');
      
      // More descriptive errors based on status codes
      if (error.response) {
        const status = error.response.status;
        const errorMsg = error.response.data?.message || error.message;
        
        if (status === 400) {
          throw new Error(`Validation error: ${errorMsg}`);
        } else if (status === 401) {
          throw new Error('Authentication required. Please login again.');
        } else if (status === 403) {
          throw new Error('You do not have permission to create goals.');
        } else if (status === 404) {
          throw new Error('API endpoint not found. Service may be unavailable.');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Server error: ${status} - ${errorMsg}`);
        }
      } else if (error.request) {
        throw new Error('No response from server. Please check your network connection.');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  },

  /**
   * Update an existing goal
   * @param {string} id - Goal ID
   * @param {Object} goalData - Updated goal data
   * @returns {Promise<Object>} Updated goal
   */
  updateGoal: async (id, goalData) => {
    try {
      console.log(`Updating goal ${id} with data:`, goalData);
      const response = await api.put(`${API_URL}/${id}`, goalData);
      console.log('Update response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating goal:', error);
      console.error('Error details:', error.response?.data || 'No detailed error');
      throw error;
    }
  },

  /**
   * Delete a goal
   * @param {string} id - Goal ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteGoal: async (id) => {
    try {
      await api.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  /**
   * Contribute to a goal
   * @param {string} id - Goal ID
   * @param {Object} data - Contribution data with amount and optional accountId
   * @returns {Promise<Object>} Updated goal with progress information
   */
  contributeToGoal: async (id, amount) => {
    try {
      const response = await api.put(`${API_URL}/${id}/contribute`, { amount });
      return response.data;
    } catch (error) {
      console.error('Error contributing to goal:', error);
      throw error;
    }
  },

  /**
   * Get goals summary with progress information
   * @returns {Promise<Object>} Goals summary data
   */
  getGoalsSummary: async () => {
    try {
      const response = await api.get(`${API_URL}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching goals summary:', error);
      throw error;
    }
  }
};

export default goalService; 