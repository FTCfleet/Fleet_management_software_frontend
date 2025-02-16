import { React, useState, useEffect } from "react";
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const ResetPasswordPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVal, setpasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [isMatch, setIsMatch] = useState(true);
  const location = useLocation();
  const userData = location.state;
  console.log('reset ');
  console.log(userData);
  const navigate = useNavigate();
  const style = {
    borderColor: "red",
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  useEffect(() => {
    setIsMatch(passwordVal === confirmPasswordVal);
  }, [passwordVal, confirmPasswordVal]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!isMatch) {
      alert("Enter same password");
      return;
    }
    console.log(userData);
    const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userData.username,
        password: passwordVal
      }),
    });
    if (res.ok){
      const data = await res.json();
      if (data.flag){
        alert("Password changed");
        navigate("/auth/login", { replace: true });
      }
    }
  };

  return (
    <div>
      <h1 className={styles.heading}>Welcome back! Glad to see you, Again!</h1>
      <form className={styles.form}>
        <div className={styles.passwordContainer}>
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Enter password"
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
        <div className={styles.passwordContainer}>
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Confirm password"
            className={styles.input}
            onChange={(event) => {
              setConfirmPasswordVal(event.target.value);
            }}
            style={isMatch ? {} : style}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={styles.showPasswordButton}
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button className={styles.loginButton} onClick={handleLogin}>
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
