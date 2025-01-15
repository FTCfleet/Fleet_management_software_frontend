import { React, useState, useEffect } from "react";
import styles from "../css/auth_card.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";

const OtpPage = () => {
  const { setIsOtpVerified } = useAuth();
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const getOtp = () => {
    return "1234";
  };

  useEffect(() => {
    setIsOtpVerified(false);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (otp === getOtp()) {
      setIsOtpVerified(true);
      navigate("/auth/reset");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div>
      <h1 className={styles.heading}>Welcome back! Glad to see you, Again!</h1>
      <form className={styles.form}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          className={styles.input}
          onChange={(event) => setOtp(event.target.value)}
        />
        <button className={styles.loginButton} onClick={handleLogin}>
          Verify Code
        </button>
      </form>
    </div>
  );
};

export default OtpPage;
