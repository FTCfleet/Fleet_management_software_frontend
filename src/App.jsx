import { React, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import WhatsAppButton from "./components/WhatsAppButton";
import AllRoutes from "./routes/AllRoutes";
import Header from "./components/Header";
import Loading from "./components/Loading";
import Footer from "./components/Footer";
import "./App.css";
import { useAuth } from "./routes/AuthContext";

function App() {
  const { checkAuthStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus().then((data) => setLoading(data.flag));
  }, []);

  const showWhatsAppButton = ["/", "/about", "/track"].includes(
    location.pathname
  );

  return (
    <div className="main-box">
      <Header />
      {loading ? <Loading /> : <AllRoutes />}
      {showWhatsAppButton && <WhatsAppButton />}
      <Footer />
    </div>
  );
}

export default App;
