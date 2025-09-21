import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerAdmin = async (adminData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/admin`, adminData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerSeller = async (sellerData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/seller`, sellerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerBuyer = async (buyerData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, buyerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Admin management functions
export const getAllAdmins = async () => {
  try {
    const response = await api.get('/auth/admins');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleAdminBan = async (adminId) => {
  try {
    const response = await api.put(`/auth/admins/${adminId}/ban`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    const response = await api.delete(`/auth/admins/${adminId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Profile photo management functions
export const uploadProfilePhoto = async (photoFile) => {
  try {
    const formData = new FormData();
    formData.append('image', photoFile);

    const response = await api.post('/user/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfilePhoto = async (photoFile) => {
  try {
    const formData = new FormData();
    formData.append('image', photoFile);

    const response = await api.put('/user/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteProfilePhoto = async () => {
  try {
    const response = await api.delete('/user/image');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 