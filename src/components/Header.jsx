import { AppBar, Box, Button, ButtonGroup } from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import logoImg from "../assets/logo.jpg";
import "../css/header.css";
import { useAuth } from "../routes/AuthContext";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { IconButton, Menu, MenuItem , useTheme , useMediaQuery } from "@mui/material";
import Menuicon from "@mui/icons-material/Menu";

const Menubutton = () => {
  const { isLoggedIn, resetAuth } = useAuth();
  const [anchorElm, setAnchorElm] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setAnchorElm(null);
    setOpen(false);
  };
  const handleClick = (e) => {
    setAnchorElm(e.currentTarget);
    setOpen(true);
  };

  const logout = () => {
    resetAuth();
    handleClose();
  };

  const lastUserPage = localStorage.getItem("lastUserPage") || "/user/dashboard";
    

  return (
    <Box sx={{ paddingRight: 1 }}>
      <IconButton onClick={handleClick} className="icon-button" aria-label="delete" size="large">
        <Menuicon cls={"icon-buttons"} sx= {{color: "#fff"}} />
      </IconButton>
      <Menu anchorEl={anchorElm} open={open} onClose={handleClose}>
        <NavLink style={{ textDecoration: "none" }} to="/">
          <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
            Home
          </MenuItem>
        </NavLink>
        <NavLink style={{ textDecoration: "none" }} to="/track">
          <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
            Track Order
          </MenuItem>
        </NavLink>
        <NavLink style={{ textDecoration: "none" }} to="/about">
          <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
            About Us
          </MenuItem>
        </NavLink>
        {isLoggedIn ?
          <div>
            <NavLink style={{ textDecoration: "none" }} to={lastUserPage}>
              <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
                DashBoard
              </MenuItem>
            </NavLink>
            <NavLink style={{ textDecoration: "none" }} to="/auth/login">
              <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={logout}>
                Logout
              </MenuItem>
            </NavLink>
          </div> :
          <NavLink style={{ textDecoration: "none" }} to="/auth/login">
            <MenuItem sx={{ textDecoration: "none", color: "black" }} onClick={handleClose}>
              Login
            </MenuItem>
          </NavLink>
        }
      </Menu>
    </Box>
  );
};

const HeaderTabs = ({ isDashboard }) => {
  const { isLoggedIn, resetAuth } = useAuth();
  const tabs = [
    { url: "/", text: "Home" },
    { url: "/track", text: "Track Shipment" },
    { url: "/about", text: "About Us" },
  ];
  const lastUserPage = localStorage.getItem("lastUserPage") || "/user/dashboard";

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
        to={isLoggedIn ? lastUserPage : "/auth/login"}
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
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down(470));
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
          <button style={{ color: "red" }} onClick={checkAuthStatus}>Check</button>
        </Box>
        {mobileView ? <Menubutton /> : <HeaderTabs />}
      </AppBar>
    </div>
  );
};

export default Header;
