import { React, useState } from "react";
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVal, setpasswordVal] = useState("");
  const [confirmPasswordVal, setconfirmPasswordVal] = useState("");

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    alert("password changed");
    setTimeout(() => {
      navigate("/auth/login", { replace: true });
    }, 1000);
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
            value={confirmPasswordVal}
            onChange={(event) => setconfirmPasswordVal(event.target.value)}
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
