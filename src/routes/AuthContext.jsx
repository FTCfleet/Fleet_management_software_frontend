// AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isUsernameSubmitted, setIsUsernameSubmitted] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [forgetUsername, setForgetUsername] = useState("");
  const [user, setUser] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const resetAuth = () => {
    setIsUsernameSubmitted(false);
    setIsOtpVerified(false);
    setForgetUsername("");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn, 
        setIsLoggedIn,
        forgetUsername,
        setForgetUsername,
        isUsernameSubmitted,
        setIsUsernameSubmitted,
        isOtpVerified,
        setIsOtpVerified,
        resetAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
