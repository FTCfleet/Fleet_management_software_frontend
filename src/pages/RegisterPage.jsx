import {React, useState} from 'react';

const RegisterPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };
  return (
    <div >
      <h1 style={styles.heading}>Welcome back! Glad to see you, Again!</h1>
      <form style={styles.form}>
        <input
          type="text"
          placeholder="Enter your username"
          style={styles.input}
        />
        <div style={styles.passwordContainer}>
        <input
            type={passwordVisible ? 'text' : 'password'}
            placeholder="Enter your password"
            style={styles.input}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            style={styles.showPasswordButton}
          >
            {passwordVisible ? '🙈' : '👁️'}
          </button>
          </div>
        <input
          type="text"
          placeholder="Enter your Name"
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Enter your phone number"
          style={styles.input}
        />
        <a href="/auth/forget" style={styles.forgotPassword}>
          Forgot Password?
        </a>
        <button type="submit" style={styles.loginButton}>
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

export default RegisterPage;
