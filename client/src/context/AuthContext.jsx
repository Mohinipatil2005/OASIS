import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user profile if tokens exist
  const fetchProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/users/profile');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error('Failed to load profile:', error.message);
      if (error.response?.status === 401) {
        localStorage.clear();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email, password, isAdminLogin = false) => {
    const res = await api.post('/auth/login', { email, password, isAdminLogin });
    if (res.data.success) {
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  };

  const verifyOTP = async (email, otp, otpType) => {
    const res = await api.post('/auth/verify-otp', { email, otp, otpType });
    return res.data;
  };

  const resendOTP = async (email, otpType) => {
    const res = await api.post('/auth/resend-otp', { email, otpType });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('refreshToken');
      if (token) {
        await api.post('/auth/logout', { refreshToken: token });
      }
    } catch (err) {
      console.warn('Backend logout failed:', err.message);
    } finally {
      localStorage.clear();
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const toggleWishlist = async (pizzaId) => {
    if (!user) return false;
    try {
      const res = await api.post('/users/wishlist', { pizzaId });
      if (res.data.success) {
        setUser(prev => ({
          ...prev,
          wishlist: res.data.wishlist
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error toggling wishlist:', err.message);
      return false;
    }
  };

  const addAddress = async (addressData) => {
    const res = await api.post('/users/address', addressData);
    if (res.data.success) {
      setUser(prev => ({
        ...prev,
        addresses: res.data.addresses
      }));
    }
    return res.data;
  };

  const deleteAddress = async (addressId) => {
    const res = await api.delete(`/users/address/${addressId}`);
    if (res.data.success) {
      setUser(prev => ({
        ...prev,
        addresses: res.data.addresses
      }));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOTP,
        resendOTP,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        toggleWishlist,
        addAddress,
        deleteAddress,
        fetchProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
