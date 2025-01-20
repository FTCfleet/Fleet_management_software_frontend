import { React, useEffect, useState } from "react";
import styles from "../css/auth_card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Select, MenuItem, InputLabel } from "@mui/material";
const CODE = import.meta.env.VITE_CODE;
const BASE_URL = import.meta.env.VITE_BASE_URL;

const RegisterPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [userVal, setuserVal] = useState("");
  const [passwordVal, setpasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [warehouseNo, setWarehouseNo] = useState("HYO");
  const [code, setCode] = useState("");
  const [isMatch, setIsMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSection1, setIsSection1] = useState(true);
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const navigate = useNavigate();
  const style = {
    borderColor: "red",
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  useEffect(() => {
    setIsMatch(passwordVal === confirmPasswordVal);
  }, [passwordVal, confirmPasswordVal]);

  useEffect(() => {
    fetchData();
    setAllWarehouse(fetchWarehouse());
    // console.log(allWarehouse); // Logs fetched data
  }, []);
  // useEffect(async () => {
  //   fetchWarehouse();
  //   // fetchData();
  // }, []);

  const fetchData = async () => {
    const response = await fetch(`${BASE_URL}/api/auth/get-all-usernames`);
    const data = await response.json();
    setAllUsers(data.body);
    console.log(allUsers); // Logs fetched data
    // setAllUsers(['hello']);
  };

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    const data = await response.json();
    

    // console.log(data.body); // Logs fetched data
    return (data.body); // Update state

  // });
};

  const handleSection1 = async (event) => {
    event.preventDefault();
    if (!isMatch) {
      alert("Enter same password");
      return;
    }
    if (code !== CODE) {
      alert("Enter valid code");
      return;
    }
    if (!allUsers.includes(userVal)) {
      setIsSection1(false);
    } else {
      alert("Username already exists");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userVal,
        password: passwordVal,
        name: name,
        phoneNo: phoneNo,
        warehouseNo: warehouseNo,
        role: "admin",
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
        {isSection1 ? (
          <>
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
            <button className={styles.loginButton} onClick={handleSection1}>
              Proceed {isLoading ? "load" : ""}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter name"
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              type="text"
              placeholder="Enter phone number"
              className={styles.input}
              value={phoneNo}
              onChange={(event) => setPhoneNo(event.target.value)}
            />
              <Select
                id="warehouse-select"
                value={warehouseNo}
                onChange={(event) => setWarehouseNo(event.target.value)}
                fullWidth
                style={{textAlign: 'left', background: '#f9f9f9', borderRadius: '8px'}}
              >
                {allWarehouse.map((element) => {
                  <MenuItem value={element.warehouseID} key={element.warehouseID}>{element.name}</MenuItem>
                })}
              </Select>
            <div>
              Already have an account?
              <a href="/auth/login" className={styles.forgotPassword}>
                {" Sign In"}
              </a>
            </div>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                className={styles.loginButton}
                onClick={() => setIsSection1(true)}
              >
                Back
              </button>
              <button className={styles.loginButton} onClick={handleRegister}>
                Create {isLoading ? "load" : ""}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default RegisterPage;
