import api from './api';

/**
 * Service to handle user profile operations
 */
const profileService = {
  /**
   * Get the current user's profile data
   * @returns {Promise<Object>} The user's profile data
   */
  async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      
      // Store profile data for fallback purposes
      if (response.data && response.data.name) {
        localStorage.setItem('userName', response.data.name);
      }
      if (response.data && response.data.email) {
        localStorage.setItem('userEmail', response.data.email);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return fallback data if the API call fails
      return {
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        username: '',
        phone: '',
        address: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        twoFactorEnabled: false
      };
    }
  },

  /**
   * Update the user's profile information
   * @param {Object} profileData - The updated profile data
   * @returns {Promise<Object>} The updated profile
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      
      // Update local storage for fallback purposes
      if (profileData.name) {
        localStorage.setItem('userName', profileData.name);
      }
      if (profileData.email) {
        localStorage.setItem('userEmail', profileData.email);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Change the user's password
   * @param {Object} passwordData - Object containing old and new passwords
   * @returns {Promise<Object>} Status response
   */
  async changePassword(passwordData) {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },

  /**
   * Toggle two-factor authentication
   * @param {boolean} enableTwoFactor - Whether to enable or disable 2FA
   * @returns {Promise<Object>} Status response
   */
  async toggleTwoFactor(enableTwoFactor) {
    const response = await api.post('/users/two-factor', { enabled: enableTwoFactor });
    return response.data;
  }
};

export default profileService; 