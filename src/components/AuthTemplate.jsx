import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import { Box } from "@mui/material";

const AuthTemplate = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/user/order/all");
  }, [isLoggedIn, navigate]);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 130px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        py: { xs: 3, md: 4 },
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "420px",
          animation: "fadeIn 0.4s ease",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthTemplate;
