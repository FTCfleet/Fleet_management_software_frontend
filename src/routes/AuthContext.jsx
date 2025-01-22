// AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isForgetUsernameSubmitted, setIsForgetUsernameSubmitted] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth with token:', token); // Debug log
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Auth status response:', data); // Debug log

      if (response.ok && data.flag) {
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw new Error('Auth check failed');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      resetAuth();
    }
  };

  const resetAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/auth/login');
  };

  const resetForgetAuth = () => {
    setIsForgetUsernameSubmitted(false);
    setIsOtpVerified(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn, 
        setIsLoggedIn,
        isForgetUsernameSubmitted,
        setIsForgetUsernameSubmitted,
        isOtpVerified,
        setIsOtpVerified,
        resetAuth,
        resetForgetAuth,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
