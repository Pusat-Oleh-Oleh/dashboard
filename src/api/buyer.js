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

// Get all sellers
export const getAllBuyers = async () => {
  try {
    const response = await api.get(`${API_URL}/admin/users/buyer`);
    return response.data.users;
  } catch (error) {
    throw error.response?.data || error;
  }
};


// Toggle ban status
export const toggleBuyerBan = async (userId) => {
  try {
    const response = await api.patch(`${API_URL}/admin/users/${userId}/toggle-ban`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new buyer
export const createBuyer = async (userData) => {
  try {
    const response = await api.post(`${API_URL}/admin/users`, {
      ...userData,
      role: 'buyer' // Force role to be buyer
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update buyer
export const updateBuyer = async (userId, userData) => {
  try {
    const response = await api.put(`${API_URL}/admin/users/${userId}`, {
      ...userData,
      role: 'buyer' // Force role to be buyer
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get buyer by ID
export const getBuyerById = async (userId) => {
  try {
    const response = await api.get(`${API_URL}/admin/users/${userId}`);
    return response.data.user;
  } catch (error) {
    throw error.response?.data || error;
  }
};