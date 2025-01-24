// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { replace, useNavigate, useLocation } from "react-router-dom";
const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isForgetUsernameSubmitted, setIsForgetUsernameSubmitted] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [isSource, setIsSource] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth with token:', token); // Debug log
      if (!token) {
        setIsLoggedIn(false);
        return false;
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
        const user_data = JSON.stringify(data.user);
        // setIsAdmin(user_data.isAdmin);
        // setIsSource(user_data.warehouseCode.isSource);
      } else {
        throw new Error('Auth check failed');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      resetAuth();
    }
    finally{
      return false;
    }
  };

  const resetAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    location.pathname = ('/auth/login');
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
        checkAuthStatus,
        isAdmin,
        isSource
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
