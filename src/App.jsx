import { React, useEffect } from "react";
import AllRoutes from "./routes/AllRoutes";
import Header from "./components/Header"
import Footer from "./components/Footer"
import "./App.css";
import { useAuth } from "./routes/AuthContext";

function App() {
  // const { isLoggedIn, setIsLoggedIn} = useAuth();
  // const { user, setUser} = useAuth();

  // useEffect( async () => {
  //   await fetch(`${BASE_URL}/api/auth/status`, {
  //     method: "GET",
  //   }).then((response) => {
  //     if (response.ok) {
  //       return response.json();
  //     }
  //   }).then((data) => {
  //     setIsLoggedIn(data.flag);
  //     setUser(data.user);
  //   });
  // }, []);

  return (
    <div className="main-box">
      <Header />
      <AllRoutes />
      <Footer />
    </div>
  );
}

export default App;
