import React, { useState, useEffect } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import FilterButton from '../components/DropdownFilter';
import NotificationFormModal from '../components/NotificationFormModal';
import {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  toggleNotificationStatus,
  getNotificationStats
} from '../api/notification';
import toast from 'react-hot-toast';
import {
  Bell,
  Plus,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Users,
  TrendingUp,
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

function NotificationManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter states
  const [typeFilter, setTypeFilter] = useState('all');
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        getAllNotifications({
          page: currentPage,
          limit: 10,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          recipient: recipientFilter !== 'all' ? recipientFilter : undefined
        }),
        getNotificationStats()
      ]);

      setNotifications(notificationsData.notifications);
      setTotalPages(notificationsData.totalPages);
      setTotal(notificationsData.total);
      setStats(statsData);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, typeFilter, recipientFilter]);

  // Handle create notification
  const handleCreateNotification = () => {
    setEditingNotification(null);
    setShowFormModal(true);
  };

  // Handle edit notification
  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setShowFormModal(true);
  };

  // Handle form submit
  const handleFormSubmit = async (notificationData) => {
    try {
      setIsFormLoading(true);

      if (editingNotification) {
        // Update existing notification
        const response = await updateNotification(editingNotification._id, notificationData);
        toast.success(response.message || 'Notification updated successfully');

        // Update local state
        setNotifications(notifications.map(notification =>
          notification._id === editingNotification._id
            ? { ...notification, ...response.notification }
            : notification
        ));
      } else {
        // Create new notification
        const response = await createNotification(notificationData);
        toast.success(`Notification sent to ${response.recipientCount} users!`);

        // Refresh data to get latest
        fetchData();
      }

      setShowFormModal(false);
      setEditingNotification(null);
    } catch (error) {
      toast.error(error.message || `Failed to ${editingNotification ? 'update' : 'send'} notification`);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const response = await deleteNotification(notificationId);
      toast.success(response.message || 'Notification deleted successfully');

      // Remove from local state
      setNotifications(notifications.filter(n => n._id !== notificationId));

      // Refresh stats
      const statsData = await getNotificationStats();
      setStats(statsData);
    } catch (error) {
      toast.error(error.message || 'Failed to delete notification');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (notificationId) => {
    try {
      const response = await toggleNotificationStatus(notificationId);
      toast.success(response.message);

      // Update local state
      setNotifications(notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, ...response.notification }
          : notification
      ));
    } catch (error) {
      toast.error(error.message || 'Failed to toggle notification status');
    }
  };


  // Filter notifications based on search
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Get type badge class
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 dark:bg-blue-400/30 text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-400/30 text-yellow-600 dark:text-yellow-400';
      case 'success':
        return 'bg-green-100 dark:bg-green-400/30 text-green-600 dark:text-green-400';
      case 'error':
        return 'bg-red-100 dark:bg-red-400/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-blue-100 dark:bg-blue-400/30 text-blue-600 dark:text-blue-400';
    }
  };

  // Handle form close
  const handleFormClose = () => {
    if (!isFormLoading) {
      setShowFormModal(false);
      setEditingNotification(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Notifications</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage and send notifications to users</p>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-9 py-2"
                  />
                  <div className="absolute inset-0 left-0 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 fill-current text-gray-400 ml-3" viewBox="0 0 16 16">
                      <path d="m11.742 10.344 6.814 6.814a1 1 0 0 1-1.414 1.414l-6.814-6.814a6 6 0 1 1 1.414-1.414ZM5 10a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
                    </svg>
                  </div>
                </div>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>

                {/* Recipient Filter */}
                <select
                  value={recipientFilter}
                  onChange={(e) => setRecipientFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Recipients</option>
                  <option value="all">All Users</option>
                  <option value="sellers">Sellers</option>
                  <option value="buyers">Buyers</option>
                </select>

                {/* Create button */}
                <button
                  onClick={handleCreateNotification}
                  className="btn bg-violet-500 hover:bg-violet-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden xs:block">Send Notification</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg mr-3">
                    <Bell className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Notifications</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{stats.total || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg mr-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{stats.active || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 dark:bg-gray-500/20 rounded-lg mr-3">
                    <PowerOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{stats.inactive || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg mr-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{stats.thisMonth || 0}</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Notifications Table */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                  Notifications <span className="text-gray-400 dark:text-gray-500 font-medium">({filteredNotifications.length} of {total})</span>
                </h2>
              </header>
              <div className="p-3">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white transition ease-in-out duration-150">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading notifications...
                    </div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No notifications found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by sending your first notification.</p>
                    <button
                      onClick={handleCreateNotification}
                      className="btn bg-violet-500 hover:bg-violet-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Send Notification
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full dark:text-gray-300">
                      <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
                        <tr>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Notification</div>
                          </th>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Recipients</div>
                          </th>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Type</div>
                          </th>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Status</div>
                          </th>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Date</div>
                          </th>
                          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-right">Actions</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredNotifications.map((notification) => (
                          <tr key={notification._id}>
                            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="flex items-start">
                                <div className="mr-3 mt-1">
                                  {getTypeIcon(notification.type)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800 dark:text-gray-100">
                                    {notification.title}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate max-w-xs">
                                    {notification.message}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 text-gray-400 mr-1" />
                                <div>
                                  <div className="text-gray-800 dark:text-gray-100 capitalize">
                                    {notification.recipient === 'all' ? 'All Users' : notification.recipient}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {notification.recipientCount || 0} users
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 capitalize ${getTypeBadgeClass(notification.type)}`}>
                                {notification.type}
                              </div>
                            </td>
                            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${
                                notification.isActive
                                  ? 'bg-green-100 dark:bg-green-400/30 text-green-600 dark:text-green-400'
                                  : 'bg-gray-100 dark:bg-gray-400/30 text-gray-600 dark:text-gray-400'
                              }`}>
                                {notification.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </td>
                            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="flex items-center text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4 mr-1" />
                                <div>
                                  <div className="text-xs">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs">
                                    {new Date(notification.createdAt).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => handleEditNotification(notification)}
                                  className="p-1 text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400 rounded"
                                  title="Edit Notification"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(notification._id)}
                                  className={`p-1 rounded ${
                                    notification.isActive
                                      ? 'text-red-500 hover:text-red-600 dark:text-red-400'
                                      : 'text-green-500 hover:text-green-600 dark:text-green-400'
                                  }`}
                                  title={notification.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {notification.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteNotification(notification._id)}
                                  className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded"
                                  title="Delete Notification"
                                >
                                  <Trash2 className="w-4 h-4" />
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

      {/* Notification Form Modal */}
      <NotificationFormModal
        isOpen={showFormModal}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        notification={editingNotification}
        isLoading={isFormLoading}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Notification Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Title</label>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{selectedNotification.title}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Message</label>
                <p className="text-gray-800 dark:text-gray-100">{selectedNotification.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Type</label>
                  <div className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 capitalize mt-1 ${getTypeBadgeClass(selectedNotification.type)}`}>
                    {selectedNotification.type}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Recipients</label>
                  <p className="text-gray-800 dark:text-gray-100 capitalize">
                    {selectedNotification.recipient === 'all' ? 'All Users' : selectedNotification.recipient}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
                  <p className={`font-medium ${
                    selectedNotification.isActive ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {selectedNotification.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Recipients Count</label>
                  <p className="text-gray-800 dark:text-gray-100">{selectedNotification.recipientCount || 0} users</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Sent By</label>
                <p className="text-gray-800 dark:text-gray-100">{selectedNotification.sentBy?.name || 'Unknown'}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Created Date</label>
                <p className="text-gray-800 dark:text-gray-100">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEditNotification(selectedNotification);
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
              >
                Edit Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationManagement;
