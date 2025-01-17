import { React, useEffect, useState } from "react";
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const CODE = import.meta.env.VITE_CODE;
const BASE_URL = import.meta.env.VITE_BASE_URL;

const RegisterPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setname] = useState("");
  const [userVal, setuserVal] = useState("");
  const [passwordVal, setpasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [phoneNo, setphoneNo] = useState("");
  const [code, setCode] = useState("");
  const [isMatch, setIsMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  let style = {
    borderColor: "red",
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  useEffect(() => {
    setIsMatch(passwordVal === confirmPasswordVal);
  }, [passwordVal, confirmPasswordVal]);

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!isMatch) {
      alert("Enter same password");
      return;
    }
    if (code !== CODE) {
      alert("Enter valid code");
      return;
    }
    setIsLoading(true);
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userVal,
        password: passwordVal,
        phoneNo: phoneNo,
        role: "admin",
        name: name,
      }),
    }).then((response) => {
      if (!response.ok) {
        alert("Error occurred");
      } else {
        alert("Registered Successfully");
        setIsLoading(false);
        navigate("/user/dashboard");
      }
    });
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
        <input
          type="text"
          placeholder="Enter Company code"
          className={styles.input}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <div>
          Already have an account?
          <a href="/auth/login" className={styles.forgotPassword}>
            {" Sign In"}
          </a>
        </div>
        <button className={styles.loginButton} onClick={handleRegister}>
          Create Account {isLoading ? "load" : ""}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
