import { React, useEffect, useState } from "react";
import styles from "../css/auth_card.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";

const ForgetPasswordPage = () => {
  const navigate = useNavigate();

  const [forgetUsername, setForgetUsername] = useState("");
  const {
    setIsForgetUsernameSubmitted,
    setIsOtpVerified,
  } = useAuth();
  
  useEffect(() => {
    setIsForgetUsernameSubmitted(false);
    setIsOtpVerified(false);
  }, []);
  
  const handleLogin = async (event) => {
    event.preventDefault();
    setIsForgetUsernameSubmitted(true);
    navigate("/auth/otp");
  };


  return (
    <div>
      <h1 className={styles.heading}>Welcome back! Glad to see you, Again!</h1>
      <form className={styles.form}>
        <input
          type="text"
          placeholder="Enter username"
          className={styles.input}
          value={forgetUsername}
          onChange={(event) => setForgetUsername(event.target.value)}
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
