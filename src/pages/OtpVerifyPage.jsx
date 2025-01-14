import {React, useState} from 'react';
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const OtpVerifyPage = () => {
  

  const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordVal, setpasswordVal] = useState("");
    const [userVal, setuserVal] = useState("");
  
    const togglePasswordVisibility = () => {
      setPasswordVisible((prevState) => !prevState);
    };

    const handleLogin = async (event) => {
      event.preventDefault();
    };

  return (
        <div>
          <h1 className={styles.heading}>Welcome back! Glad to see you, Again!</h1>
          <form className={styles.form}>
            <input
              type="text"
              placeholder="Enter username"
              className={styles.input}
              onChange={(event) => setuserVal(event.target.value)}
            />
            <div className={styles.passwordContainer}>
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your password"
                className={styles.input}
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
              Already have an account?
              <a href="/auth/forget" className={styles.forgotPassword}>
                {" Sign In"}
              </a>
            </div>
            <button className={styles.loginButton} onClick={handleLogin}>
              Login
            </button>
          </form>
        </div>
      );
};

export default OtpVerifyPage;