import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const ThemeContext = createContext();

// Pages that should always be in dark mode
const DARK_MODE_PAGES = ["/", "/about", "/track", "/locations", "/services"];

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  
  const location = useLocation();
  
  // Check if current page should force dark mode
  const isPublicDarkPage = DARK_MODE_PAGES.includes(location.pathname);
  
  // Effective dark mode: force dark on public pages, otherwise use preference
  const effectiveDarkMode = isPublicDarkPage ? true : isDarkMode;

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  // Apply theme class based on effective dark mode
  useEffect(() => {
    if (effectiveDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [effectiveDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode,  // The actual stored preference (use this for dashboard components)
      toggleDarkMode, 
      setIsDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
};

// Theme colors for easy access
export const getThemeColors = (isDarkMode) => ({
  // Backgrounds
  bgPrimary: isDarkMode ? "#0a1628" : "#f8fafc",
  bgSecondary: isDarkMode ? "#0f1d32" : "#ffffff",
  bgCard: isDarkMode ? "#132238" : "#ffffff",
  bgHover: isDarkMode ? "rgba(255, 183, 77, 0.08)" : "rgba(30, 58, 95, 0.04)",
  bgInput: isDarkMode ? "#0a1628" : "#ffffff",
  
  // Text
  textPrimary: isDarkMode ? "#f1f5f9" : "#1E3A5F",
  textSecondary: isDarkMode ? "#cbd5e1" : "#64748b",
  textMuted: isDarkMode ? "#94a3b8" : "#94a3b8",
  
  // Borders
  border: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
  borderLight: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
  
  // Accent
  accent: "#FFB74D",
  accentHover: "#FFA726",
  
  // Primary
  primary: "#1E3A5F",
  primaryLight: isDarkMode ? "#2d5a87" : "#457b9d",
  
  // Status colors
  success: isDarkMode ? "#4ade80" : "#22c55e",
  warning: isDarkMode ? "#fbbf24" : "#f59e0b",
  error: isDarkMode ? "#f87171" : "#ef4444",
  info: isDarkMode ? "#60a5fa" : "#3b82f6",
  
  // Table
  tableHeader: isDarkMode ? "#0f1d32" : "#f8fafc",
  tableRowHover: isDarkMode ? "rgba(255, 183, 77, 0.05)" : "rgba(30, 58, 95, 0.02)",
  tableRowAlt: isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
  
  // Shadows
  shadow: isDarkMode 
    ? "0 4px 20px rgba(0, 0, 0, 0.4)" 
    : "0 4px 20px rgba(0, 0, 0, 0.08)",
  shadowLight: isDarkMode 
    ? "0 2px 8px rgba(0, 0, 0, 0.3)" 
    : "0 2px 8px rgba(0, 0, 0, 0.06)",
});
