import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;

// Setup axios instance dengan default headers untuk auth
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all notifications with filtering and pagination
export const getAllNotifications = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/admin/notifications`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get notification by ID
export const getNotificationById = async (notificationId) => {
  try {
    const response = await api.get(`${API_URL}/admin/notifications/${notificationId}`);
    return response.data.notification;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new notification
export const createNotification = async (notificationData) => {
  try {
    const response = await api.post(`${API_URL}/admin/notifications`, notificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update notification
export const updateNotification = async (notificationId, notificationData) => {
  try {
    const response = await api.put(`${API_URL}/admin/notifications/${notificationId}`, notificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`${API_URL}/admin/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Toggle notification status
export const toggleNotificationStatus = async (notificationId) => {
  try {
    const response = await api.patch(`${API_URL}/admin/notifications/${notificationId}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get notification statistics
export const getNotificationStats = async () => {
  try {
    const response = await api.get(`${API_URL}/admin/notifications/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};