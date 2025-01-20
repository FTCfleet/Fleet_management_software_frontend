import { React, useEffect } from "react";
import AllRoutes from "./routes/AllRoutes";
import Header from "./components/Header"
import Footer from "./components/Footer"
import "./App.css";
import { useAuth } from "./routes/AuthContext";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function App() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { setUser } = useAuth();

  // useEffect(() => {
  //   setUserData();
  // }, []);

  // useEffect(() => {
  //   console.log(isLoggedIn);
  // }, [isLoggedIn]);
  
  const setUserData = async () => {
    await fetch(`${BASE_URL}/api/auth/status`).then((response) => {
      if (response.ok) {
        return response.json();
      }
    }).then((data) => {
      console.log(data);
      setIsLoggedIn(data.flag);
      setUser(data.user);
    });
  };
  return (
    <div className="main-box">
      <Header />
      <AllRoutes />
      <Footer />
    </div>
  );
}

export default App;
