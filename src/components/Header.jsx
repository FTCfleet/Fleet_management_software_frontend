import { AppBar, Box, Typography, Button, ButtonGroup } from "@mui/material";
import { Link, NavLink, useParams } from "react-router-dom";
import logoImg from "../assets/logo.jpg";
import "../css/header.css";
import { useAuth } from "../routes/AuthContext";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const HeaderTabs = ({ isDashboard }) => {
  const { isLoggedIn, resetAuth } = useAuth();
  const tabs = [
    { url: "/", text: "Home" },
    { url: "/track", text: "Track Shipment" },
    { url: "/about", text: "About Us" },
  ];
  return (
    <ButtonGroup sx={{ textDecoration: "none", marginRight: 1 }}>
      {tabs.map((item, index) => (
        <NavLink key={index} className="navlink" to={item.url}>
          <Button
            className="header-button"
            style={{ border: "none", outline: "none" }}
            color="inherit"
          >
            {item.text}
          </Button>
        </NavLink>
      ))}
      <NavLink
        className="navlink"
        to={isLoggedIn ? "/user/dashboard" : "/auth/login"}
      >
        <Button
          className="header-button"
          style={{ border: "none", outline: "none" }}
          color="inherit"
        >
          {isLoggedIn ? "Dashboard" : "Login"}
        </Button>
      </NavLink>
      {isLoggedIn ? (
        <NavLink
          className="navlink"
          to={"/auth/login"}
        >
          <Button
            className="header-button"
            style={{ border: "none", outline: "none" }}
            color="inherit"
            onClick={resetAuth}
          >
            Logout
          </Button>
        </NavLink>
      ) : null}
    </ButtonGroup>
  );
};

const Header = () => {
  const { checkAuthStatus } = useAuth();
  const location = useLocation();
  return (
    <div className="header-box">
      <AppBar
        sx={{
          backgroundColor: "rgb(29, 53, 87)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            paddingLeft: 2,
            minHeight: "60px",
          }}
        >
          <Link
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
            to="/"
          >
            <img src={logoImg} height="50px"></img>
          </Link>
          <button onClick={checkAuthStatus}>Check</button>
        </Box>
        <HeaderTabs isDashboard={location.pathname.startsWith("/user/")} />
      </AppBar>
    </div>
  );
};

export default Header;
