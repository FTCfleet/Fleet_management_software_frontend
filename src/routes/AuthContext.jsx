// AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isUsernameSubmitted, setIsUsernameSubmitted] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [username, setUsername] = useState("");

  const resetAuth = () => {
    setIsUsernameSubmitted(false);
    setIsOtpVerified(false);
    setUsername("");
  }

  return (
    <AuthContext.Provider
      value={{
        username,
        setUsername,
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
