import React from "react";
import { Box, Typography } from "@mui/material";
import logoImg from "../assets/logo.webp";

const Loading = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(10, 22, 40, 0.98) 0%, rgba(29, 53, 87, 0.98) 50%, rgba(30, 58, 95, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Background Glow */}
      <Box
        sx={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(255, 183, 77, 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "pulse 2s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
            "50%": { transform: "scale(1.2)", opacity: 0.8 },
          },
        }}
      />

      {/* Logo Container */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* Logo with Glow Ring */}
        <Box
          sx={{
            position: "relative",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Spinning Ring */}
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: "#FFB74D",
              borderRightColor: "rgba(255, 183, 77, 0.3)",
              animation: "spin 1.2s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
          
          {/* Second Ring */}
          <Box
            sx={{
              position: "absolute",
              width: "85%",
              height: "85%",
              borderRadius: "50%",
              border: "2px solid transparent",
              borderBottomColor: "rgba(255, 183, 77, 0.5)",
              borderLeftColor: "rgba(255, 183, 77, 0.2)",
              animation: "spinReverse 1.5s linear infinite",
              "@keyframes spinReverse": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(-360deg)" },
              },
            }}
          />

          {/* Logo */}
          <Box
            component="img"
            src={logoImg}
            alt="FTC Logo"
            sx={{
              width: 60,
              height: "auto",
              filter: "brightness(0) invert(1) drop-shadow(0 0 10px rgba(255, 183, 77, 0.5))",
              animation: "fadeInOut 2s ease-in-out infinite",
              "@keyframes fadeInOut": {
                "0%, 100%": { opacity: 0.7 },
                "50%": { opacity: 1 },
              },
            }}
          />
        </Box>

        {/* Loading Text */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              color: "#ffffff",
              fontSize: "1.1rem",
              fontWeight: 600,
              letterSpacing: "3px",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Loading
          </Typography>
          
          {/* Animated Dots */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#FFB74D",
                  animation: "bounce 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.16}s`,
                  "@keyframes bounce": {
                    "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                    "40%": { transform: "scale(1)", opacity: 1 },
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Company Name */}
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "0.85rem",
            fontWeight: 500,
            letterSpacing: "1px",
            mt: 2,
          }}
        >
          Friends Transport Company
        </Typography>
      </Box>
    </Box>
  );
};

export default Loading;
