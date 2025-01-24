import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";

const AuthTemplate = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) navigate("/user/order/all");
  });

  return (
    <>
      <div className="app" />
      <div className="login-overlay">
        <div className="login-modal">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AuthTemplate;
