import { React, useEffect } from "react";
import AllRoutes from "./routes/AllRoutes";
import Header from "./components/Header"
import Footer from "./components/Footer"
import "./App.css";
import { useAuth } from "./routes/AuthContext";

function App() {
  const { checkAuthStatus  } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  return (
    <div className="main-box">
      <Header />
      <AllRoutes />
      <Footer />
    </div>
  );
}

export default App;
