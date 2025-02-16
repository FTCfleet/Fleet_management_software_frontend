import { React, useEffect, useState } from "react";
import styles from "../css/auth_card.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
const BASE_URL = import.meta.env.VITE_BASE_URL;

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
    console.log(forgetUsername);
    const res = await fetch(`${BASE_URL}/api/auth/get-otp`, {
      method:"POST",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: forgetUsername,
      })
    });
    const data = await res.json();
    console.log(data);
    if (res.ok){
      if (data.flag){
        alert("Sent OTP to Mobile Number: xxxx"+data.phoneNo.slice(7));
        setIsForgetUsernameSubmitted(true);
        navigate("/auth/otp", { state: { username: forgetUsername,  phoneNo: data.phoneNo } });
      }
      else{
        alert("No such user exist");
      }
    }

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
