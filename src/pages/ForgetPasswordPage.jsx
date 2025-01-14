import {React, useState} from 'react';
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
const ForgetPasswordPage = () => {
  
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordVal, setpasswordVal] = useState("");
    const [userVal, setuserVal] = useState("");
  
    const togglePasswordVisibility = () => {
      setPasswordVisible((prevState) => !prevState);
    };

    const handleLogin = async (event) => {
      event.preventDefault();
      navigate('/auth/reset');
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
            <div>
              Already have an account?
              <a href="/auth/login" className={styles.forgotPassword}>
                {" Sign In"}
              </a>
            </div>
            <button className={styles.loginButton} onClick={handleLogin}>
              Send Code
            </button>
          </form>
        </div>
      );
};

export default ForgetPasswordPage;