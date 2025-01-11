import {React, useState} from 'react';

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
    await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST', // Add the method
    headers: {
      'Content-Type': 'application/json', // Set content type
    },
      body: JSON.stringify({
        username: userVal,
        password: passwordVal,
        // phoneNo: '7845315421',
        // role:'admin',
        // name: 'suraj'
      })
    }).then((response) => {
      // console.log(response.text);
      console.log(response.ok);
      return response.json()})
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
      <h1 style={styles.heading}>Welcome back! Glad to see you, Again!</h1>
      <form style={styles.form}>
        <input
          type="text"
          placeholder="Enter your username"
          style={styles.input}
          onChange={(event) => setuserVal(event.target.value)}
          />
        <div style={styles.passwordContainer}>
        <input
            type={passwordVisible ? 'text' : 'password'}
            placeholder="Enter your password"
            style={styles.input}
            onChange={(event) => setpasswordVal(event.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            style={styles.showPasswordButton}
          >
            {passwordVisible ? '🙈' : '👁️'}
          </button>
        </div>
        <a href="/auth/forget" style={styles.forgotPassword}>
          Forgot Password?
        </a>
        <a href="/auth/register" style={styles.forgotPassword}>
          Don't have a account
        </a>
        <button style={styles.loginButton} onClick={handleLogin}>
          Login
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '12px 16px',
    margin: '8px 0',
    borderRadius: '8px',
    border: '1px solid #E0E0E0',
    fontSize: '16px',
    width: '100%',
    backgroundColor: '#F9FAFB',
    color: '#333',
    outline: 'none',
  },
  inputFocus: {
    borderColor: '#6A67CE',
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  showPasswordButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#6B7280',
  },
  forgotPassword: {
    textAlign: 'right',
    marginTop: '8px',
    color: '#6A67CE',
    textDecoration: 'none',
    fontSize: '14px',
  },
  loginButton: {
    padding: '12px 16px',
    marginTop: '20px',
    backgroundColor: '#1F2937',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  loginButtonHover: {
    backgroundColor: '#111827',
  },
};

export default LoginPage;
