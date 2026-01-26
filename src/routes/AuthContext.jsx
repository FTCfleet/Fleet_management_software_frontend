// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import CustomDialog from "../components/CustomDialog";
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
  
  // Dialog state for auth messages
  const [authDialog, setAuthDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info"
  });
  
  // Flag to prevent multiple dialogs
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const showAuthDialog = (title, message, type) => {
    if (isRedirecting) return; // Prevent multiple dialogs
    setIsRedirecting(true);
    setAuthDialog({ open: true, title, message, type });
  };
  
  const handleAuthDialogClose = () => {
    setAuthDialog({ ...authDialog, open: false });
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/auth/login";
  };

  // Global fetch interceptor to handle session expiry
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Get the URL from the request
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      
      // Skip session expiry check for login, register, and auth endpoints
      const isAuthEndpoint = url.includes('/api/auth/login') || 
                            url.includes('/api/auth/register') || 
                            url.includes('/api/auth/forgot-password') ||
                            url.includes('/api/auth/verify-otp') ||
                            url.includes('/api/auth/reset-password');
      
      if (isAuthEndpoint) {
        return response;
      }
      
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const data = await clonedResponse.json();
          
          // Priority 1: Check for password change (most critical)
          if (data.passwordChanged === true || data.message === "Password was changed. Please login again") {
            showAuthDialog(
              "Password Changed",
              "Your password was changed. Please login again with your new password.",
              "warning"
            );
            return response;
          }
          
          // Priority 2: Check for session expiry (48 hours)
          if (
            response.status === 401 || 
            data.message === "Session expired. Please login again" ||
            (data.message && data.message.includes("jwt expired"))
          ) {
            showAuthDialog(
              "Session Expired",
              "Your session has expired. Please login again.",
              "info"
            );
            return response;
          }
          
          // Priority 3: General authentication failure
          if (data.message === "Please authenticate") {
            showAuthDialog(
              "Authentication Failed",
              "Authentication failed. Please login again.",
              "error"
            );
            return response;
          }
        } catch (e) {
          // Not JSON or parsing error, ignore
        }
      }
      
      return response;
    };
    
    // Cleanup: restore original fetch on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, [isRedirecting]);

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
      
      // Check for session expiry message from backend
      if (!data.flag || data.message === "Session expired. Please login again") {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
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
      <CustomDialog
        open={authDialog.open}
        onClose={handleAuthDialogClose}
        onConfirm={handleAuthDialogClose}
        title={authDialog.title}
        message={authDialog.message}
        type={authDialog.type}
        confirmText="Login Again"
        showCancel={false}
      />
    </AuthContext.Provider>
  );
};
