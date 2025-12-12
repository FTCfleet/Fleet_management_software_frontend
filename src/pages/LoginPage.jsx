import { React, useEffect, useState } from "react";
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../routes/AuthContext";
import { CircularProgress } from "@mui/material";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVal, setPasswordVal] = useState("");
  const [userVal, setUserVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { resetForgetAuth, checkAuthStatus } = useAuth();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  useEffect(() => {
    resetForgetAuth();
  }, [resetForgetAuth]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    
    if (!userVal.trim() || !passwordVal.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userVal,
          password: passwordVal,
        }),
      });

      const data = await response.json();

      if (!data.flag) {
        setError(data.message || "Invalid credentials. Please try again.");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        checkAuthStatus();
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>
        Welcome back!
        <br />
        Glad to see you, Again!
      </h1>
      
      <form className={styles.form} onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Enter your username"
          className={styles.input}
          value={userVal}
          onChange={(e) => setUserVal(e.target.value)}
          onKeyPress={handleKeyPress}
          autoComplete="username"
          disabled={isLoading}
        />
        
        <div className={styles.passwordContainer}>
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Enter your password"
            className={styles.input}
            value={passwordVal}
            onChange={(e) => setPasswordVal(e.target.value)}
            onKeyPress={handleKeyPress}
            autoComplete="current-password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={styles.showPasswordButton}
            tabIndex={-1}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <button
          type="submit"
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              Signing in...
              <CircularProgress size={18} sx={{ color: "#fff", ml: 1 }} />
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
