/**
 * API Utility Functions
 * Handles API calls with automatic session expiry detection
 * Note: Auth dialogs are now handled by AuthContext global interceptor
 */

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Check if response indicates session expiry
 * @param {Response} response - Fetch API response
 * @param {Object} data - Parsed JSON data
 * @returns {boolean} - True if session expired
 */
export const isSessionExpired = (response, data) => {
  // Check for 401 Unauthorized
  if (response.status === 401) return true;
  
  // Check for backend session expiry message
  if (data && data.message === "Session expired. Please login again") return true;
  
  // Check for JWT expired error
  if (data && data.message && data.message.includes("jwt expired")) return true;
  
  return false;
};

/**
 * Check if response indicates password was changed
 * @param {Object} data - Parsed JSON data
 * @returns {boolean} - True if password was changed
 */
export const isPasswordChanged = (data) => {
  // Check for password changed flag
  if (data && data.passwordChanged === true) return true;
  
  // Check for password changed message
  if (data && data.message === "Password was changed. Please login again") return true;
  
  return false;
};

/**
 * Handle password change by clearing token and redirecting to login
 * Note: This is now handled by AuthContext global dialog
 */
export const handlePasswordChange = () => {
  localStorage.removeItem("token");
  window.location.href = "/auth/login";
};

/**
 * Handle session expiry by clearing token and redirecting to login
 * Note: This is now handled by AuthContext global dialog
 */
export const handleSessionExpiry = () => {
  localStorage.removeItem("token");
  window.location.href = "/auth/login";
};

/**
 * Handle general authentication failure
 * Note: This is now handled by AuthContext global dialog
 */
export const handleAuthFailure = () => {
  localStorage.removeItem("token");
  window.location.href = "/auth/login";
};

/**
 * Wrapper for fetch that handles session expiry automatically
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  // Add authorization header if token exists
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  const response = await fetch(url, { ...options, headers });
  
  // Skip checks for auth endpoints
  const isAuthEndpoint = url.includes('/api/auth/login') || 
                         url.includes('/api/auth/register') || 
                         url.includes('/api/auth/forgot-password') ||
                         url.includes('/api/auth/verify-otp') ||
                         url.includes('/api/auth/reset-password');
  
  if (isAuthEndpoint) {
    return response;
  }
  
  // For responses with JSON body, check for auth issues
  if (response.headers.get("content-type")?.includes("application/json")) {
    const data = await response.json();
    
    // Priority 1: Check for password change
    if (isPasswordChanged(data)) {
      handlePasswordChange();
      throw new Error("Password changed");
    }
    
    // Priority 2: Check for session expiry
    if (isSessionExpired(response, data)) {
      handleSessionExpiry();
      throw new Error("Session expired");
    }
    
    // Priority 3: Check for general auth failure
    if (data.message === "Please authenticate") {
      handleAuthFailure();
      throw new Error("Authentication failed");
    }
    
    // Return response with parsed data attached for convenience
    return { ...response, data };
  }
  
  return response;
};

/**
 * Check API response and handle auth issues
 * Use this after fetch calls to check for expiry/password change
 * @param {Response} response - Fetch response
 * @param {Object} data - Parsed JSON data (optional)
 * @returns {boolean} - True if session is valid, false if expired/changed
 */
export const checkAuthStatus = (response, data = null) => {
  // Priority 1: Check for password change
  if (isPasswordChanged(data)) {
    handlePasswordChange();
    return false;
  }
  
  // Priority 2: Check for session expiry
  if (isSessionExpired(response, data)) {
    handleSessionExpiry();
    return false;
  }
  
  // Priority 3: Check for general auth failure
  if (data && data.message === "Please authenticate") {
    handleAuthFailure();
    return false;
  }
  
  return true;
};
