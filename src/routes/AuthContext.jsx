// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { replace, useNavigate, useLocation } from "react-router-dom";
const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isForgetUsernameSubmitted, setIsForgetUsernameSubmitted] =
    useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSource, setIsSource] = useState(true);

  const checkAuthStatus = async () => {
    let user_data = {};
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return { flag: false, user_data: user_data };
    }
    try {
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Bad Response");
      }

      const data = await response.json();
      if (!data.flag) {
        throw new Error("Invalid flag");
      }

      setIsLoggedIn(true);
      user_data = data.user;
      setIsAdmin(data.user.role === "admin");
      setIsSource(data.user.isSource);
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      return { flag: false, user_data: user_data };
    }
  };

  const resetAuth = () => {
    localStorage.removeItem("token");
    // localStorage.removeItem('user');
    setIsLoggedIn(false);
    location.pathname = "/auth/login";
  };

  const resetForgetAuth = () => {
    setIsForgetUsernameSubmitted(false);
    setIsOtpVerified(false);
  };

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
        setIsAdmin,
        isSource,
        setIsSource,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
