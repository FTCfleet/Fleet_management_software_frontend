import { React, useState } from "react";
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVal, setpasswordVal] = useState("");
  const [userVal, setuserVal] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  // const handleLogin = async (event) => {
  //   event.preventDefault();
  //   await fetch('api/auth/login', {
  //     method: 'POST', // Add the method
  //   headers: {
  //     'Content-Type': 'application/json', // Set content type
  //   },
  //     body: JSON.stringify({
  //       user: userVal,
  //       password: passwordVal
  //     })
  //   }).then((response) => console.log(response));
  // };

  const handleLogin = async (event) => {
    event.preventDefault();
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST", // Add the method
      headers: {
        "Content-Type": "application/json", // Set content type
      },
      body: JSON.stringify({
        username: userVal,
        password: passwordVal,
        // phoneNo: '7845315421',
        // role:'admin',
        // name: 'suraj'
      }),
    })
      .then((response) => {
        // console.log(response.text);
        console.log(response.ok);
        return response.json();
      })
      // return response.json()})
      .then((data) => {
        console.log(data);
      });
    // .catch(err){
    //   console.log(err);
    // };
  };

  return (
    <div>
      <h1 className={styles.heading}>Welcome back! Glad to see you, Again!</h1>
      <form className={styles.form}>
        <input
          type="text"
          placeholder="Enter your username"
          className={styles.input}
          value={userVal}
          onChange={(event) => setuserVal(event.target.value)}
        />
        <div className={styles.passwordContainer}>
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Enter your password"
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
        <div>
          Forgot Password?
          <a href="/auth/forget" className={styles.forgotPassword}>
            {" Reset"}
          </a>
        </div>
        <div>
          Create an account?
          <a href="/auth/register" className={styles.forgotPassword}>
            {" Sign Up"}
          </a>
        </div>
        <button className={styles.loginButton} onClick={handleLogin}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
