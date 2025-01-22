// PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ element, requiredStep, redirectTo }) => {
  const {isForgetUsernameSubmitted, isOtpVerified} = useAuth();

  const isAllowed =
    (requiredStep === "otp" && isForgetUsernameSubmitted) ||
    (requiredStep === "reset" && isOtpVerified);

  return isAllowed ? element : <Navigate to={redirectTo} replace />;
};

export default PrivateRoute;
