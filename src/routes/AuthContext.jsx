// AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
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
  const [stationCode, setStationCode] = useState("");
  const [lastUserPage, setLastUserPage] = useState("/user/dashboard");

  const checkAuthStatus = async () => {
    let user_data = {};
    const token = localStorage.getItem("token");
    try {
      if (!token) {
        setIsLoggedIn(false);
        throw new Error("Not Logged In");
      }
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
        throw new Error("Session Expired");
      }

      setIsLoggedIn(true);
      user_data = data.user;
      // user_data = data.user.role;
      // user_data = data.user.warehouseCode;
      // user_data = data.user.isSource;
      setIsAdmin(data.user.role === "admin");
      setIsSource(data.user.isSource);
      setStationCode(data.user.warehouseCode);
    } catch (error) {
      console.error("Auth check failed:");
    } finally {
      return { flag: false, user_data: user_data };
    }
  };

  const resetAuth = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    location.pathname = "/";
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
        lastUserPage,
        setLastUserPage,
        stationCode,
        setStationCode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
