import React, { useState, useEffect } from 'react';
import { UserCog, Mail, Phone, Shield, Edit, Save, X, Eye, EyeOff, Camera, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { getProfile, updateProfile, changePassword, uploadProfilePhoto, updateProfilePhoto, deleteProfilePhoto } from '../api/auth';

function AdminProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    createdAt: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setProfile(response.user);
      setEditForm({
        name: response.user.name,
        email: response.user.email,
        phoneNumber: response.user.phoneNumber || ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditForm({
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phoneNumber || ''
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await updateProfile(editForm);
      setProfile(response.user);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);

      let response;
      if (profile.profileImage) {
        response = await updateProfilePhoto(file);
      } else {
        response = await uploadProfilePhoto(file);
      }

      setProfile(prev => ({
        ...prev,
        profileImage: response.userImage.url
      }));

      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setUploadingPhoto(true);
      await deleteProfilePhoto();

      setProfile(prev => ({
        ...prev,
        profileImage: null
      }));

      toast.success('Profile photo removed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to remove photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Admin Profile</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-violet-200 dark:border-violet-700"
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                        }}
                      />
                    ) : (
                      <div className="bg-violet-100 dark:bg-violet-900/50 p-3 rounded-full h-16 w-16 flex items-center justify-center">
                        <UserCog className="h-8 w-8 text-violet-500" />
                      </div>
                    )}
                    <button
                      onClick={() => document.getElementById('photo-upload').click()}
                      className="absolute -bottom-1 -right-1 bg-violet-500 hover:bg-violet-600 text-white p-1.5 rounded-full transition-colors"
                      disabled={uploadingPhoto}
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{profile.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{profile.role}</p>
                    {profile.profileImage && (
                      <button
                        onClick={handleDeletePhoto}
                        className="text-xs text-red-500 hover:text-red-600 mt-1 flex items-center space-x-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove photo</span>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 text-violet-500 hover:text-violet-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>{editMode ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {/* Profile Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      {editMode ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-gray-100">{profile.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <UserCog className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      {editMode ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-gray-100">{profile.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      {editMode ? (
                        <input
                          type="tel"
                          value={editForm.phoneNumber}
                          onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                          placeholder="Enter phone number"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-gray-100">{profile.phoneNumber || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">System Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                          <p className="text-gray-800 dark:text-gray-100 capitalize">{profile.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 text-gray-400 flex items-center justify-center">📅</div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                          <p className="text-gray-800 dark:text-gray-100">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {profile.role === 'admin' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Admin Permissions</h3>
                      <div className="space-y-2">
                        {['User Management', 'Content Management', 'System Settings', 'Analytics Access'].map((permission) => (
                          <div key={permission} className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            <span className="text-gray-700 dark:text-gray-300">{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex space-x-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2 bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg transition-colors duration-150"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors duration-150"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors duration-150"
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Change Password</h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-violet-500 hover:bg-violet-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;
