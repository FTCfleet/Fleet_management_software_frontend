import { AppBar, Box, Typography, Drawer, List, ListItem, ListItemText, Divider } from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import logoImg from "../assets/logo.png";
import "../css/header.css";
import { useAuth } from "../routes/AuthContext";
import { useSidebar } from "../hooks/useSidebar";
import { useState } from "react";
import { IconButton, useTheme, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InfoIcon from "@mui/icons-material/Info";
import AppsIcon from "@mui/icons-material/Apps";
import CustomDialog from "./CustomDialog";
import { useDialog } from "../hooks/useDialog";

const MobileDrawer = ({ open, onClose }) => {
  const { isLoggedIn, resetAuth, lastUserPage, isAdmin } = useAuth();
  const { dialogState, hideDialog, showConfirm } = useDialog();

  const handleLogout = () => {
    showConfirm(
      "Are you sure you want to logout?",
      () => {
        resetAuth();
        onClose();
      },
      "Confirm Logout"
    );
  };

  const menuItems = [
    { url: "/", text: "Home", icon: <HomeIcon /> },
    { url: "/track", text: "Track Shipment", icon: <LocalShippingIcon /> },
    { url: "/about", text: "About Us", icon: <InfoIcon /> },
  ];



  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "260px",
          maxWidth: "80vw",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1E3A5F" }}>
          Menu
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List sx={{ py: 1 }}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.url}
            onClick={onClose}
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive ? "#1E3A5F" : "#4a5568",
            })}
          >
            <ListItem
              sx={{
                py: 1.2,
                px: 2,
                "&:hover": { backgroundColor: "#f8fafc" },
              }}
            >
              <Box sx={{ mr: 1.5, display: "flex", color: "#1E3A5F", fontSize: "1.1rem" }}>{item.icon}</Box>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem" }}
              />
            </ListItem>
          </NavLink>
        ))}
        

        
        <Divider sx={{ my: 1 }} />
        
        {isLoggedIn ? (
          <>
            <NavLink to={lastUserPage} onClick={onClose} style={{ textDecoration: "none", color: "#4a5568" }}>
              <ListItem sx={{ py: 1.2, px: 2, "&:hover": { backgroundColor: "#f8fafc" } }}>
                <Box sx={{ mr: 1.5, display: "flex", color: "#1E3A5F", fontSize: "1.1rem" }}><DashboardIcon /></Box>
                <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem" }} />
              </ListItem>
            </NavLink>
            <NavLink to="/user/dashboard" onClick={onClose} style={{ textDecoration: "none", color: "#4a5568" }}>
              <ListItem sx={{ py: 1.2, px: 2, "&:hover": { backgroundColor: "#f8fafc" } }}>
                <Box sx={{ mr: 1.5, display: "flex", color: "#1E3A5F", fontSize: "1.1rem" }}><PersonIcon /></Box>
                <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem" }} />
              </ListItem>
            </NavLink>
            <ListItem 
              onClick={handleLogout}
              sx={{ 
                py: 1.2, 
                px: 2, 
                "&:hover": { backgroundColor: "#f8fafc" },
                cursor: "pointer"
              }}
            >
              <Box sx={{ mr: 1.5, display: "flex", color: "#f44336", fontSize: "1.1rem" }}><LogoutIcon /></Box>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem", color: "#f44336" }} 
              />
            </ListItem>
          </>
        ) : (
          <NavLink to="/auth/login" onClick={onClose} style={{ textDecoration: "none", color: "#4a5568" }}>
            <ListItem sx={{ py: 1.2, px: 2, "&:hover": { backgroundColor: "#f8fafc" } }}>
              <Box sx={{ mr: 1.5, display: "flex", color: "#1E3A5F", fontSize: "1.1rem" }}><LoginIcon /></Box>
              <ListItemText primary="Login" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem" }} />
            </ListItem>
          </NavLink>
        )}
      </List>
      
      <CustomDialog
        open={dialogState.open}
        onClose={hideDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
      />
    </Drawer>
  );
};

const HeaderTabs = () => {
  const { isLoggedIn, lastUserPage, resetAuth } = useAuth();
  const { dialogState, hideDialog, showConfirm } = useDialog();

  const handleLogout = () => {
    showConfirm(
      "Are you sure you want to logout?",
      () => {
        resetAuth();
      },
      "Confirm Logout"
    );
  };
  const tabs = [
    { url: "/", text: "Home" },
    { url: "/track", text: "Track Shipment" },
    { url: "/about", text: "About Us" },
  ];

  return (
    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
      {tabs.map((item, index) => (
        <NavLink 
          key={index} 
          to={item.url}
          style={{ textDecoration: "none" }}
        >
          {({ isActive }) => (
            <Box
              sx={{ 
                color: isActive ? "#FFB74D" : "rgba(255,255,255,0.9)", 
                px: 2,
                py: 1,
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                borderBottom: isActive ? "2px solid #FFB74D" : "2px solid transparent",
                transition: "all 0.2s ease",
                "&:hover": { 
                  color: "#ffffff",
                },
              }}
            >
              {item.text}
            </Box>
          )}
        </NavLink>
      ))}
      <NavLink 
        to={isLoggedIn ? lastUserPage : "auth/login"}
        style={{ textDecoration: "none" }}
      >
        <Box
          sx={{
            color: "rgba(255,255,255,0.9)",
            px: 2,
            py: 1,
            fontSize: "0.9rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
            "&:hover": { color: "#ffffff" },
          }}
        >
          {isLoggedIn ? "Dashboard" : "Login"}
        </Box>
      </NavLink>
      {isLoggedIn && (
        <>
          <NavLink to="/user/dashboard" style={{ textDecoration: "none" }}>
            <Box
              sx={{ 
                color: "rgba(255,255,255,0.9)", 
                px: 2,
                py: 1,
                fontSize: "0.9rem",
                fontWeight: 500,
                transition: "all 0.2s ease",
                "&:hover": { color: "#ffffff" },
              }}
            >
              Profile
            </Box>
          </NavLink>
          <Box
            onClick={handleLogout}
            sx={{ 
              color: "rgba(255,255,255,0.9)", 
              px: 2,
              py: 1,
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": { color: "#ffffff" },
            }}
          >
            Logout
          </Box>
        </>
      )}
      
      <CustomDialog
        open={dialogState.open}
        onClose={hideDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
      />
    </Box>
  );
};

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { stationCode } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { openSidebar } = useSidebar();

  return (
    <div className="header-box">
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "#1D3557",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          height: { xs: "60px", md: "70px" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "space-between" : "space-between",
            height: "100%",
            px: { xs: 1.5, sm: 2, md: 3 },
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {isMobile ? (
            <>
              {/* Left: Navigation Button */}
              <Box
                onClick={openSidebar}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  px: 1.5,
                  py: 0.75,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                }}
              >
                <AppsIcon sx={{ fontSize: "1rem", color: "white" }} />
                <Typography sx={{ color: "white", fontSize: "0.75rem", fontWeight: 500 }}>
                  Navigation
                </Typography>
              </Box>

              {/* Center: Logo */}
              <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                <Link to="/" style={{ display: "flex", alignItems: "center" }}>
                  <img src={logoImg} alt="FTC Logo" className="header-logo" style={{ height: "40px" }} />
                </Link>
              </Box>

              {/* Right: Hamburger Menu */}
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  color: "white",
                  p: 1,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                <MenuIcon />
              </IconButton>
              <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            </>
          ) : (
            <>
              {/* Desktop Layout */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Link to="/" style={{ display: "flex", alignItems: "center" }}>
                  <img src={logoImg} alt="FTC Logo" className="header-logo" style={{ height: "48px" }} />
                </Link>
                {stationCode && (
                  <Typography
                    sx={{
                      backgroundColor: "rgba(255,183,77,0.2)",
                      border: "1px solid rgba(255,183,77,0.5)",
                      color: "#FFB74D",
                      px: 1.25,
                      py: 0.25,
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    {stationCode}
                  </Typography>
                )}
              </Box>
              <HeaderTabs />
            </>
          )}
        </Box>
      </AppBar>
    </div>
  );
};

export default Header;
