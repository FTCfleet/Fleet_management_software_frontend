import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import "../css/glassmorphism.css";

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
        background: "linear-gradient(135deg, #0a1628 0%, #1D3557 50%, #1E3A5F 100%)",
        position: "relative",
        overflow: "hidden",
        py: { xs: 4, md: 6 },
        px: 2,
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 30% 20%, rgba(255, 183, 77, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(30, 58, 95, 0.3) 0%, transparent 50%)",
        }}
      />
      
      {/* Floating Particles */}
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: "4px",
              height: "4px",
              background: "rgba(255, 183, 77, 0.3)",
              borderRadius: "50%",
              left: `${15 + i * 15}%`,
              animation: `float ${20 + i * 3}s infinite`,
              animationDelay: `${i * 2}s`,
              "@keyframes float": {
                "0%": { transform: "translateY(100vh)", opacity: 0 },
                "10%": { opacity: 1 },
                "90%": { opacity: 1 },
                "100%": { transform: "translateY(-100vh)", opacity: 0 },
              },
            }}
          />
        ))}
      </Box>

      {/* Large Background Text */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: { xs: "15rem", md: "25rem" },
          fontWeight: 900,
          color: "rgba(255, 183, 77, 0.02)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        FTC
      </Box>

      {/* Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthTemplate;
