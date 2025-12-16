import { React, useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { useAuth } from "../routes/AuthContext";
import { CircularProgress, Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import "../css/glassmorphism.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVal, setPasswordVal] = useState("");
  const [userVal, setUserVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { resetForgetAuth, checkAuthStatus } = useAuth();

  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);

  useEffect(() => { resetForgetAuth(); }, [resetForgetAuth]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    if (!userVal.trim() || !passwordVal.trim()) { setError("Please enter both username and password"); return; }
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userVal, password: passwordVal }),
      });
      const data = await response.json();
      if (!data.flag) { setError(data.message || "Invalid credentials. Please try again."); return; }
      if (data.token) { localStorage.setItem("token", data.token); checkAuthStatus(); }
      else { throw new Error("No token received"); }
    } catch (error) { setError("Login failed. Please check your connection and try again."); }
    finally { setIsLoading(false); }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleLogin(e); };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}>
      <Box sx={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(9px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "28px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        p: { xs: 4, md: 5 },
        maxWidth: "420px",
        width: "100%",
        mx: "auto",
      }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ width: 70, height: 70, mx: "auto", mb: 3, background: "linear-gradient(135deg, rgba(255, 183, 77, 0.2) 0%, rgba(255, 183, 77, 0.05) 100%)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaUser size={28} color="#FFB74D" />
          </Box>
          <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 700, mb: 1, fontSize: { xs: "1.5rem", md: "1.75rem" } }}>
            Welcome Back!
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>
            Sign in to access your dashboard
          </Typography>
        </Box>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Username Field */}
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 500, mb: 1, ml: 0.5 }}>Username</Typography>
            <Box sx={{ position: "relative" }}>
              <Box sx={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", zIndex: 1 }}><FaUser size={16} /></Box>
              <input
                type="text"
                placeholder="Enter your username"
                value={userVal}
                onChange={(e) => setUserVal(e.target.value)}
                onKeyPress={handleKeyPress}
                autoComplete="username"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "16px 16px 16px 48px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "14px",
                  color: "#ffffff",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#FFB74D"; e.target.style.background = "rgba(255, 255, 255, 0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.05)"; }}
              />
            </Box>
          </Box>

          {/* Password Field */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 500, mb: 1, ml: 0.5 }}>Password</Typography>
            <Box sx={{ position: "relative" }}>
              <Box sx={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", zIndex: 1 }}><FaLock size={16} /></Box>
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your password"
                value={passwordVal}
                onChange={(e) => setPasswordVal(e.target.value)}
                onKeyPress={handleKeyPress}
                autoComplete="current-password"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "16px 50px 16px 48px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "14px",
                  color: "#ffffff",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#FFB74D"; e.target.style.background = "rgba(255, 255, 255, 0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.05)"; }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => e.target.style.color = "#FFB74D"}
                onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </Box>
          </Box>

          {/* Error Message */}
          {error && (
            <Box sx={{ background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: "10px", p: 1.5, mb: 2.5 }}>
              <Typography sx={{ color: "#ff6b6b", fontSize: "0.85rem", textAlign: "center" }}>{error}</Typography>
            </Box>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)",
              border: "none",
              borderRadius: "14px",
              color: "#1D3557",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 8px 25px rgba(255, 183, 77, 0.35)",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 0.3s ease",
            }}
          >
            {isLoading ? (
              <>Signing in...<CircularProgress size={20} sx={{ color: "#1D3557" }} /></>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Friends Transport Company
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default LoginPage;
