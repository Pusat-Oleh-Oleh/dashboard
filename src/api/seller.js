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
export const getAllSellers = async () => {
  try {
    const response = await api.get(`${API_URL}/admin/users/seller`);
    return response.data.users;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all shops
export const getAllShops = async () => {
  try {
    const response = await api.get(`${API_URL}/admin/shops`);
    return response.data.shops;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Toggle ban status
export const toggleSellerBan = async (userId) => {
  try {
    const response = await api.patch(`${API_URL}/admin/users/${userId}/toggle-ban`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new seller
export const createSeller = async (userData) => {
  try {
    const response = await api.post(`${API_URL}/admin/users`, {
      ...userData,
      role: 'seller' // Force role to be seller
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update seller
export const updateSeller = async (userId, userData) => {
  try {
    const response = await api.put(`${API_URL}/admin/users/${userId}`, {
      ...userData,
      role: 'seller' // Force role to be seller
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get seller by ID
export const getSellerById = async (userId) => {
  try {
    const response = await api.get(`${API_URL}/admin/users/${userId}`);
    return response.data.user;
  } catch (error) {
    throw error.response?.data || error;
  }
};