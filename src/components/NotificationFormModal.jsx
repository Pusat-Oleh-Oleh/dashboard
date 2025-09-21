import React, { useState, useEffect } from 'react';
import { X, Bell, Users, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  notification = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipient: 'all'
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when notification prop changes
  useEffect(() => {
    if (notification) {
      setFormData({
        title: notification.title || '',
        message: notification.message || '',
        type: notification.type || 'info',
        recipient: notification.recipient || 'all'
      });
    } else {
      setFormData({
        title: '',
        message: '',
        type: 'info',
        recipient: 'all'
      });
    }
    setErrors({});
  }, [notification, isOpen]);

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

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    // Prepare data for submission
    const submitData = {
      title: formData.title.trim(),
      message: formData.message.trim(),
      type: formData.type,
      recipient: formData.recipient
    };

    onSubmit(submitData);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRecipientIcon = (recipient) => {
    switch (recipient) {
      case 'all':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'sellers':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'buyers':
        return <Users className="w-5 h-5 text-blue-500" />;
      default:
        return <Users className="w-5 h-5 text-purple-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-violet-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {notification ? 'Edit Notification' : 'Create New Notification'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {notification ? 'Update notification details' : 'Send notification to users'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center">
                {getRecipientIcon(formData.recipient)}
                <span className="ml-2">Recipients *</span>
              </div>
            </label>
            <select
              name="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              className="form-select w-full"
              disabled={isLoading}
            >
              <option value="all">All Users</option>
              <option value="sellers">All Sellers</option>
              <option value="buyers">All Buyers</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select who will receive this notification
            </p>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center">
                {getTypeIcon(formData.type)}
                <span className="ml-2">Notification Type *</span>
              </div>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-select w-full"
              disabled={isLoading}
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose the notification type to set appropriate styling
            </p>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input w-full ${
                errors.title ? 'border-red-500 focus:border-red-500' : ''
              }`}
              placeholder="Enter notification title"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={5}
              className={`form-textarea w-full ${
                errors.message ? 'border-red-500 focus:border-red-500' : ''
              }`}
              placeholder="Enter notification message"
              disabled={isLoading}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.message.length}/1000 characters
            </p>
          </div>

          {/* Preview */}
          {formData.title && formData.message && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">Preview:</h4>
              <div className={`p-3 rounded-lg border-l-4 ${
                formData.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                formData.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                formData.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}>
                <div className="flex items-start">
                  {getTypeIcon(formData.type)}
                  <div className="ml-3">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">{formData.title}</h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{formData.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {notification ? 'Updating...' : 'Sending...'}
                </span>
              ) : (
                notification ? 'Update Notification' : 'Send Notification'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationFormModal;