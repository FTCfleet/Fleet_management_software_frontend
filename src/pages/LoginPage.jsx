import { React, useEffect, useState } from "react";
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { data, useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVal, setpasswordVal] = useState("");
  const [userVal, setuserVal] = useState("");
  const { setIsLoggedIn, resetForgetAuth } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  useEffect(() => {
    resetForgetAuth();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
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
      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setIsLoggedIn(true);
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      alert("Login failed. Please try again. "+err);
    }
  };

  return (
    <div>
      <h1 className={styles.heading}>Welcome back! Glad to see you, Again!</h1>
      <form className={styles.form}>
        <input
          type="text"
          placeholder="Enter your username"
          className={styles.input}
          value={userVal}
          onChange={(event) => setuserVal(event.target.value)}
        />
        <div className={styles.passwordContainer}>
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Enter your password"
            className={styles.input}
            value={passwordVal}
            onChange={(event) => setpasswordVal(event.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={styles.showPasswordButton}
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div>
          Forgot Password?
          <a href="/auth/forget" className={styles.forgotPassword}>
            {" Reset"}
          </a>
        </div>
        <div>
          Create an account?
          <a href="/auth/register" className={styles.forgotPassword}>
            {" Sign Up"}
          </a>
        </div>
        <button className={styles.loginButton} onClick={handleLogin}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
