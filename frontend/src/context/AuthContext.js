import React, { createContext, useState, useEffect } from 'react';
import API from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [user]);

  // Login dispatcher
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // Register dispatcher
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // Logout dispatcher
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  // Development Role Switching (Guest, Customer, Administrator)
  const setDevRole = (role) => {
    if (role === 'guest') {
      setUser(null);
    } else if (role === 'customer') {
      setUser({
        _id: 'usr_cust_demo',
        name: 'Jane Customer',
        email: 'customer@aurastore.com',
        role: 'customer',
        token: 'mock_jwt_customer_token_2026',
      });
    } else if (role === 'admin') {
      setUser({
        _id: 'usr_admin_demo',
        name: 'Alex Admin',
        email: 'admin@aurastore.com',
        role: 'admin',
        token: 'mock_jwt_admin_token_2026',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setDevRole,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
