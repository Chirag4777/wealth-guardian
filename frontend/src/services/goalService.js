import axios from 'axios';

const API_URL = '/api/goals';

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
      const response = await axios.get(API_URL);
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
      const response = await axios.get(`${API_URL}/${id}`);
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
      
      const response = await axios.post(API_URL, goalData);
      console.log('Create goal response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating goal:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data || 'No detailed error');
      
      // Throw a more descriptive error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
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
      const response = await axios.put(`${API_URL}/${id}`, goalData);
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
      await axios.delete(`${API_URL}/${id}`);
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
      const response = await axios.put(`${API_URL}/${id}/contribute`, { amount });
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
      const response = await axios.get(`${API_URL}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching goals summary:', error);
      throw error;
    }
  }
};

export default goalService; 