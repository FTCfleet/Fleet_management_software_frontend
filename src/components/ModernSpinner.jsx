import React from "react";
import { Box } from "@mui/material";
import { useThemeMode } from "../hooks/useTheme";

const ModernSpinner = ({ size = 40 }) => {
  const dotSize = Math.max(size * 0.15, 6);
  const { isDarkMode } = useThemeMode();
  
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: `${size * 0.15}px`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: isDarkMode 
              ? "linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)" 
              : "linear-gradient(135deg, #1E3A5F 0%, #2d5a87 100%)",
            animation: "dotBounce 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.16}s`,
            boxShadow: isDarkMode 
              ? "0 2px 8px rgba(255, 183, 77, 0.4)" 
              : "0 2px 8px rgba(30, 58, 95, 0.3)",
            "@keyframes dotBounce": {
              "0%, 80%, 100%": { 
                transform: "scale(0.6) translateY(0)",
                opacity: 0.4,
              },
              "40%": { 
                transform: "scale(1) translateY(-8px)",
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default ModernSpinner;
