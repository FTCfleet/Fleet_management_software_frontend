import { React } from "react";
import AllRoutes from "./routes/AllRoutes";
import Header from "./components/Header"
import Footer from "./components/Footer"
import "./App.css";

function App() {
  return (
    <div className="main-box">
      <Header />
      <AllRoutes />
      <Footer />
    </div>
  );
}

export default App;
