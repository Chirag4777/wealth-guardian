import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import profileService from '../services/profileService';
import { toast } from 'react-toastify';
import { UserCircleIcon, ShieldCheckIcon, IdentificationIcon, ClockIcon, KeyIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    joinDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    twoFactorEnabled: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await profileService.getUserProfile();
        
        // Update the user data state
        setUserData({
          name: profile.name || '',
          email: profile.email || '',
          username: profile.username || profile.email?.split('@')[0] || '',
          phone: profile.phone || '',
          address: profile.address || '',
          joinDate: profile.createdAt || new Date().toISOString(),
          lastLogin: profile.lastLogin || new Date().toISOString(),
          twoFactorEnabled: profile.twoFactorEnabled || false
        });
        
        // Initialize the form data
        setFormData({
          name: profile.name || '',
          username: profile.username || profile.email?.split('@')[0] || '',
          phone: profile.phone || '',
          address: profile.address || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset form data
      setFormData({
        name: userData.name,
        username: userData.username,
        phone: userData.phone,
        address: userData.address
      });
    }
    setIsEditing(!isEditing);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.includes(' ')) {
      newErrors.username = 'Username cannot contain spaces';
    }
    
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    try {
      // Call the API to update the profile
      await profileService.updateProfile(formData);
      
      // Update local state with new values
      setUserData({
        ...userData,
        ...formData
      });
      
      // Show success message
      toast.success('Profile updated successfully');
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleToggle2FA = async () => {
    try {
      // Call the API to toggle 2FA
      await profileService.toggleTwoFactor(!userData.twoFactorEnabled);
      
      // Update local state
      setUserData({
        ...userData,
        twoFactorEnabled: !userData.twoFactorEnabled
      });
      
      // Show success message
      toast.success(`Two-factor authentication ${userData.twoFactorEnabled ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      toast.error('Failed to update two-factor authentication');
    }
  };

  const handleChangePassword = () => {
    // In a real app, this would open a password change dialog or redirect to a change password page
    toast.info('Change password functionality would be implemented here');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your personal information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Overview */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <div className="h-24 w-24 mx-auto bg-white rounded-full p-1">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 flex items-center justify-center">
                  <UserCircleIcon className="h-16 w-16 text-blue-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-center mt-4">{userData.name || 'User'}</h2>
              <p className="text-blue-100 text-center">{userData.email}</p>
            </div>
            <div className="p-6">
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Account Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Member Since</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatDate(userData.joinDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Last Login</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatDateTime(userData.lastLogin)}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <IdentificationIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Verification Status
                </h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Email</span>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Phone</span>
                    <Badge variant={userData.phone ? 'success' : 'warning'}>
                      {userData.phone ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">KYC</span>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                </div>
                
                <Button className="w-full" onClick={() => toast.info('KYC verification would be implemented here')}>
                  Complete Verification
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Profile Details */}
        <div className="md:col-span-2">
          {/* Personal Information Card */}
          <Card 
            title={
              <div className="flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                <span>Personal Information</span>
              </div>
            } 
            headerAction={
              <Button 
                variant={isEditing ? "outline" : "primary"}
                size="sm" 
                onClick={handleEditToggle}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            }
            className="mb-6"
          >
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    required
                    placeholder="Choose a username"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    value={userData.email}
                    disabled
                    helperText="Email cannot be changed"
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                </div>
                
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
                
                <div className="flex justify-end">
                  <Button type="submit" className="mt-2">
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="py-3 grid grid-cols-1 md:grid-cols-3">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</div>
                  <div className="md:col-span-2 font-medium text-gray-900 dark:text-white mt-1 md:mt-0">{userData.name || '—'}</div>
                </div>
                <div className="py-3 grid grid-cols-1 md:grid-cols-3">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</div>
                  <div className="md:col-span-2 font-medium text-gray-900 dark:text-white mt-1 md:mt-0">{userData.username || '—'}</div>
                </div>
                <div className="py-3 grid grid-cols-1 md:grid-cols-3">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</div>
                  <div className="md:col-span-2 font-medium text-gray-900 dark:text-white mt-1 md:mt-0">{userData.email || '—'}</div>
                </div>
                <div className="py-3 grid grid-cols-1 md:grid-cols-3">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</div>
                  <div className="md:col-span-2 font-medium text-gray-900 dark:text-white mt-1 md:mt-0">{userData.phone || '—'}</div>
                </div>
                <div className="py-3 grid grid-cols-1 md:grid-cols-3">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</div>
                  <div className="md:col-span-2 font-medium text-gray-900 dark:text-white mt-1 md:mt-0">{userData.address || '—'}</div>
                </div>
              </div>
            )}
          </Card>

          {/* Security Settings Card */}
          <Card 
            title={
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-500" />
                <span>Security Settings</span>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <KeyIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Password
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Update your password regularly for better security
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleChangePassword}
                  className="md:self-start"
                >
                  Change Password
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div className="flex items-center">
                  <Badge 
                    variant={userData.twoFactorEnabled ? 'success' : 'warning'}
                    className="mr-3"
                  >
                    {userData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Button 
                    variant={userData.twoFactorEnabled ? 'outline' : 'primary'}
                    onClick={handleToggle2FA}
                  >
                    {userData.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage; 