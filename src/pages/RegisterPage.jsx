import {React, useState} from 'react';
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const RegisterPage = () => {
  

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setname] = useState("");
  const [userVal, setuserVal] = useState("");
    const [passwordVal, setpasswordVal] = useState("");
    const [confirmPasswordVal, setconfirmPasswordVal] = useState("");
    const [phoneNo, setphoneNo] = useState("");
  
    const togglePasswordVisibility = () => {
      setPasswordVisible((prevState) => !prevState);
    };

    const handleLogin = async (event) => {
      event.preventDefault();
    };

  return (
        <div>
          <h1 className={styles.heading}>Hello, Register to get started</h1>
          <form className={styles.form}>
            <input
              type="text"
              placeholder="Enter username"
              className={styles.input}
              value={userVal}
              onChange={(event) => setuserVal(event.target.value)}
            />
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
            <input
              type="text"
              placeholder="Enter name"
              className={styles.input}
              value={name}
              onChange={(event) => setname(event.target.value)}
            />
            <input
              type="text"
              placeholder="Enter phone number"
              className={styles.input}
              value={phoneNo}
              onChange={(event) => setphoneNo(event.target.value)}
            />
            <div>
              Already have an account?
              <a href="/auth/login" className={styles.forgotPassword}>
                {" Sign In"}
              </a>
            </div>
            <button className={styles.loginButton} onClick={handleLogin}>
              Create Account
            </button>
          </form>
        </div>
      );
};

export default RegisterPage;