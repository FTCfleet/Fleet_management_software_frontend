import React from "react";
import { Outlet } from "react-router-dom";

const AuthTemplate = () => {
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
