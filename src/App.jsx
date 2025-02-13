import { React, useEffect, useState } from "react";
import AllRoutes from "./routes/AllRoutes";
import Header from "./components/Header";
import Loading from "./components/Loading";
import Footer from "./components/Footer";
import "./App.css";
import { useAuth } from "./routes/AuthContext";

function App() {
  const { checkAuthStatus } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus().then((data) => setLoading(data.flag));
  }, []);

  return (
    <div className="main-box">
      <Header />
      {loading ? <Loading /> : <AllRoutes />}
      <Footer />
    </div>
  );
}

export default App;
