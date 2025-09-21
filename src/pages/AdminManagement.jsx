import React, { useState, useEffect } from 'react';
import { Edit, Trash2, UserPlus, Search, Calendar, Mail, Phone, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { registerAdmin, getAllAdmins, toggleAdminBan, deleteAdmin } from '../api/auth';

function AdminManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form data for adding/editing admin
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch admins data
  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await getAllAdmins();
      setAdmins(response.admins);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      toast.error(error.message || 'Failed to fetch admins data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!editingAdmin && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!editingAdmin && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle add admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerAdmin(formData);
      toast.success('Admin added successfully!');

      // Refresh the admins list
      await fetchAdmins();

      // Reset form and close modal
      setFormData({ name: '', email: '', password: '', phoneNumber: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error(error.message || 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit admin
  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      phoneNumber: admin.phoneNumber || ''
    });
    setShowEditModal(true);
  };

  // Handle delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      try {
        await deleteAdmin(adminId);
        toast.success('Admin deleted successfully');
        await fetchAdmins(); // Refresh list
      } catch (error) {
        console.error('Error deleting admin:', error);
        toast.error(error.message || 'Failed to delete admin');
      }
    }
  };

  // Handle ban/unban admin
  const handleToggleBan = async (adminId) => {
    try {
      const response = await toggleAdminBan(adminId);
      toast.success(response.message);
      await fetchAdmins(); // Refresh list
    } catch (error) {
      console.error('Error toggling admin ban:', error);
      toast.error(error.message || 'Failed to update admin status');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  Admin Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage system administrators and their permissions
                </p>
              </div>

              {/* Add Admin Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Admin</span>
              </button>
            </div>

            {/* Search and filters */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg mb-8">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search admins..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Administrators ({filteredAdmins.length})
                </h2>

                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                  </div>
                ) : filteredAdmins.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No admins found matching your search.' : 'No admins found.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Admin
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAdmins.map((admin) => (
                          <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {admin.profileImage ? (
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={admin.profileImage}
                                      alt={admin.name}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHA+dGggZD0iTTIwIDEyQzE3Ljc5IDEyIDE2IDEzLjc5IDE2IDE2UzE3Ljc5IDIwIDIwIDIwUzI0IDE4LjIxIDI0IDE2UzIyLjIxIDEyIDIwIDEyWk0yMCAyNkMxNS4zMyAyNiAxMS44NyAyOC40OSAxMC42IDMySDI5LjRDMjguMTMgMjguNDkgMjQuNjcgMjYgMjAgMjZaIiBmaWxsPSIjOUI5Qjk2Ii8+Cjwvc3ZnPgo=';
                                      }}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                      <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {admin.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {admin.role}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                {admin.email}
                              </div>
                              {admin.phoneNumber && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                  {admin.phoneNumber}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.isBanned
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              }`}>
                                {admin.isBanned ? (
                                  <>
                                    <Ban className="h-3 w-3 mr-1" />
                                    Banned
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(admin.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleEditAdmin(admin)}
                                  className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300"
                                  title="Edit Admin"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleBan(admin._id)}
                                  className={`${
                                    admin.isBanned
                                      ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                      : 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                                  }`}
                                  title={admin.isBanned ? 'Unban Admin' : 'Ban Admin'}
                                >
                                  {admin.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteAdmin(admin._id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete Admin"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Add New Admin</h2>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100 ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100 ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100 ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter password (min. 6 characters)"
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter phone number (optional)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-violet-500 hover:bg-violet-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', email: '', password: '', phoneNumber: '' });
                    setErrors({});
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

export default AdminManagement;