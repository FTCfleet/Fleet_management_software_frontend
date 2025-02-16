import { React, useState, useEffect } from "react";
import styles from "../css/auth_card.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const OtpPage = () => {
  const { setIsOtpVerified } = useAuth();
  const location = useLocation();
  const userData = location.state;
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(userData);
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      body:JSON.stringify({
        phoneNo: userData.phoneNo,
        otp: otp
      })
    });

    const data = await res.json();
    console.log(data);
    console.log(otp);

    if (res.ok){
      if (data.flag){
        setIsOtpVerified(true);
        navigate("/auth/reset", {state: {token : data.token, username: userData.username}});
      }
      else{
        alert('Invalid OTP');
      }
    }
  };

  useEffect(() => {
    setIsOtpVerified(false);
  }, []);

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
