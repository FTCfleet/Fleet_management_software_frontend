import { AppBar, Box, Typography, Drawer, List, ListItem, ListItemText, Divider } from "@mui/material";
import { Link, NavLink, useLocation } from "react-router-dom";
import logoImg from "../assets/logo.webp";
import "../css/header.css";
import { useAuth } from "../routes/AuthContext";
import { useSidebar } from "../hooks/useSidebar";
import { useThemeMode } from "../hooks/useTheme";
import React, { useState, useEffect } from "react";
import { IconButton, useTheme, useMediaQuery, Tooltip } from "@mui/material";
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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BuildIcon from "@mui/icons-material/Build";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CustomDialog from "./CustomDialog";
import { useDialog } from "../hooks/useDialog";
import NotificationsIcon from "@mui/icons-material/Notifications";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const MobileDrawer = ({ open, onClose }) => {
  const { isLoggedIn, resetAuth, lastUserPage } = useAuth();
  const { dialogState, hideDialog, showConfirm } = useDialog();
  const location = useLocation();

  // Check if we're on a dashboard page (any /user/* page except /user/dashboard which is profile)
  const isDashboardActive = location.pathname.startsWith("/user/") && location.pathname !== "/user/dashboard";
  // Check if we're on the profile page
  const isProfileActive = location.pathname === "/user/dashboard";

  const handleLogout = () => {
    showConfirm("Are you sure you want to logout?", () => { resetAuth(); onClose(); }, "Confirm Logout");
  };

  const menuItems = [
    { url: "/", text: "Home", icon: <HomeIcon /> },
    { url: "/track", text: "Track Shipment", icon: <LocalShippingIcon /> },
    { url: "/services", text: "Services", icon: <BuildIcon /> },
    { url: "/locations", text: "Locations", icon: <LocationOnIcon /> },
    { url: "/about", text: "About Us", icon: <InfoIcon /> },
  ];

  const handleNavClick = () => {
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "300px",
          maxWidth: "85vw",
          background: "linear-gradient(180deg, #0a1628 0%, #1D3557 100%)",
          borderLeft: "1px solid rgba(255, 183, 77, 0.2)",
        },
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255, 183, 77, 0.05)" }}>
        <Typography sx={{ fontWeight: 700, color: "#ffffff", fontSize: "1.1rem" }}>Menu</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", "&:hover": { color: "#FFB74D", background: "rgba(255, 183, 77, 0.1)" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <List sx={{ py: 2, px: 1 }}>
        {menuItems.map((item, index) => {
          // Manual active check to ensure exact matching
          const isActive = location.pathname === item.url;
          return (
            <Link key={index} to={item.url} onClick={handleNavClick} style={{ textDecoration: "none", outline: "none" }}>
              <ListItem 
                disableGutters
                sx={{ 
                  py: 1.5, px: 2, mb: 0.5, borderRadius: "12px",
                  background: isActive ? "rgba(255, 183, 77, 0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(255, 183, 77, 0.3)" : "1px solid transparent",
                  "&:hover": { background: isActive ? "rgba(255, 183, 77, 0.15)" : "rgba(255,255,255,0.05)" },
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <Box sx={{ mr: 2, display: "flex", alignItems: "center", color: isActive ? "#FFB74D" : "rgba(255,255,255,0.5)", fontSize: "1.2rem" }}>{item.icon}</Box>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: "0.95rem", color: isActive ? "#FFB74D" : "rgba(255,255,255,0.9)" }} />
                {isActive && <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#FFB74D", flexShrink: 0 }} />}
              </ListItem>
            </Link>
          );
        })}
        
        <Divider sx={{ my: 2, mx: 1, borderColor: "rgba(255,255,255,0.08)" }} />
        
        {isLoggedIn ? (
          <>
            <Link to={lastUserPage} onClick={onClose} style={{ textDecoration: "none", outline: "none" }}>
              <ListItem 
                disableGutters
                sx={{ 
                  py: 1.5, px: 2, mb: 0.5, borderRadius: "12px",
                  background: isDashboardActive ? "rgba(255, 183, 77, 0.15)" : "transparent",
                  border: isDashboardActive ? "1px solid rgba(255, 183, 77, 0.3)" : "1px solid transparent",
                  "&:hover": { background: isDashboardActive ? "rgba(255, 183, 77, 0.15)" : "rgba(255,255,255,0.05)" },
                  cursor: "pointer",
                }}
              >
                <Box sx={{ mr: 2, display: "flex", alignItems: "center", color: isDashboardActive ? "#FFB74D" : "rgba(255,255,255,0.5)", fontSize: "1.2rem" }}><DashboardIcon /></Box>
                <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: isDashboardActive ? 600 : 500, fontSize: "0.95rem", color: isDashboardActive ? "#FFB74D" : "rgba(255,255,255,0.9)" }} />
                {isDashboardActive && <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#FFB74D", flexShrink: 0 }} />}
              </ListItem>
            </Link>
            <Link to="/user/dashboard" onClick={onClose} style={{ textDecoration: "none", outline: "none" }}>
              <ListItem 
                disableGutters
                sx={{ 
                  py: 1.5, px: 2, mb: 0.5, borderRadius: "12px",
                  background: isProfileActive ? "rgba(255, 183, 77, 0.15)" : "transparent",
                  border: isProfileActive ? "1px solid rgba(255, 183, 77, 0.3)" : "1px solid transparent",
                  "&:hover": { background: isProfileActive ? "rgba(255, 183, 77, 0.15)" : "rgba(255,255,255,0.05)" },
                  cursor: "pointer",
                }}
              >
                <Box sx={{ mr: 2, display: "flex", alignItems: "center", color: isProfileActive ? "#FFB74D" : "rgba(255,255,255,0.5)", fontSize: "1.2rem" }}><PersonIcon /></Box>
                <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: isProfileActive ? 600 : 500, fontSize: "0.95rem", color: isProfileActive ? "#FFB74D" : "rgba(255,255,255,0.9)" }} />
                {isProfileActive && <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#FFB74D", flexShrink: 0 }} />}
              </ListItem>
            </Link>
            <ListItem 
              disableGutters
              onClick={handleLogout} 
              sx={{ 
                py: 1.5, px: 2, borderRadius: "12px", 
                "&:hover": { background: "rgba(255, 107, 107, 0.1)" }, 
                "&:focus, &:focus-visible, &:active": { outline: "none", background: "transparent" },
                cursor: "pointer" 
              }}
            >
              <Box sx={{ mr: 2, display: "flex", alignItems: "center", color: "#ff6b6b", fontSize: "1.2rem" }}><LogoutIcon /></Box>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.95rem", color: "#ff6b6b" }} />
            </ListItem>
          </>
        ) : (
          <Box sx={{ px: 1, mt: 1 }}>
            <Link to="/auth/login" onClick={onClose} style={{ textDecoration: "none" }}>
              <Box sx={{ 
                display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5,
                background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)",
                color: "#1D3557", py: 1.5, borderRadius: "12px", fontWeight: 700,
                boxShadow: "0 4px 20px rgba(255, 183, 77, 0.3)",
              }}>
                <LoginIcon fontSize="small" />
                Login
              </Box>
            </Link>
          </Box>
        )}
      </List>
      
      <CustomDialog open={dialogState.open} onClose={hideDialog} onConfirm={dialogState.onConfirm} title={dialogState.title} message={dialogState.message} type={dialogState.type} confirmText={dialogState.confirmText} cancelText={dialogState.cancelText} showCancel={dialogState.showCancel} />
    </Drawer>
  );
};


const HeaderTabs = () => {
  const { isLoggedIn, lastUserPage, resetAuth } = useAuth();
  const { dialogState, hideDialog, showConfirm } = useDialog();
  const location = useLocation();
  const tabsRef = React.useRef([]);

  // Check if we're on a dashboard page (any /user/* page except /user/dashboard which is profile)
  const isDashboardActive = location.pathname.startsWith("/user/") && location.pathname !== "/user/dashboard";
  // Check if we're on the profile page
  const isProfileActive = location.pathname === "/user/dashboard";

  const handleLogout = () => {
    showConfirm("Are you sure you want to logout?", () => { resetAuth(); }, "Confirm Logout");
  };

  const tabs = [
    { url: "/", text: "Home" },
    { url: "/track", text: "Track" },
    { url: "/services", text: "Services" },
    { url: "/locations", text: "Locations" },
    { url: "/about", text: "About" },
  ];

  const activeIndex = tabs.findIndex(tab => tab.url === location.pathname);
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });

  React.useEffect(() => {
    if (activeIndex >= 0 && tabsRef.current[activeIndex]) {
      const activeTab = tabsRef.current[activeIndex];
      setIndicatorStyle({ left: activeTab.offsetLeft, width: activeTab.offsetWidth });
    }
  }, [activeIndex, location.pathname]);

  return (
    <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 0.5, md: 1 }, alignItems: "center" }}>
      {/* Navigation Pills Container */}
      <Box sx={{ 
        display: "flex", 
        gap: { xs: 0.25, sm: 0.25, md: 0.5 }, 
        background: "rgba(255, 255, 255, 0.08)", 
        borderRadius: "14px", 
        p: { xs: 0.25, sm: 0.25, md: 0.5 },
        position: "relative",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        {/* Sliding Indicator */}
        {activeIndex >= 0 && (
          <Box sx={{
            position: "absolute",
            top: 4,
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            height: "calc(100% - 8px)",
            background: "linear-gradient(135deg, #FFB74D 0%, #FFC107 100%)",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(255, 183, 77, 0.3)",
            transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 0,
          }} />
        )}
        {tabs.map((item, index) => (
          <NavLink key={index} to={item.url} style={{ textDecoration: "none" }} ref={el => tabsRef.current[index] = el}>
            {({ isActive }) => (
              <Box sx={{ 
                color: isActive ? "#1D3557" : "rgba(255,255,255,0.75)", 
                px: { xs: 1.5, sm: 1.25, md: 2 }, 
                py: { xs: 0.75, sm: 0.75, md: 1 }, 
                fontSize: { xs: "0.8rem", sm: "0.82rem", md: "0.88rem" }, 
                fontWeight: isActive ? 600 : 500, 
                cursor: "pointer",
                borderRadius: "10px",
                position: "relative",
                zIndex: 1,
                transition: "color 0.25s ease",
                "&:hover": { 
                  color: isActive ? "#1D3557" : "#FFB74D",
                },
              }}>
                {item.text}
              </Box>
            )}
          </NavLink>
        ))}
      </Box>

      {/* Divider */}
      <Box sx={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.15)", mx: { xs: 1, sm: 0.5, md: 1 } }} />

      {/* Auth Section */}
      {isLoggedIn ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 0.25, md: 0.5 } }}>
          <NavLink to={lastUserPage} style={{ textDecoration: "none" }}>
            <Box sx={{
              display: "flex", alignItems: "center", gap: 1,
              background: isDashboardActive 
                ? "linear-gradient(135deg, #FFB74D 0%, #FFC107 100%)" 
                : "linear-gradient(135deg, rgba(255, 183, 77, 0.15) 0%, rgba(255, 183, 77, 0.05) 100%)",
              border: isDashboardActive ? "none" : "1px solid rgba(255, 183, 77, 0.3)",
              color: isDashboardActive ? "#1D3557" : "#FFB74D",
              px: { xs: 1.5, sm: 1.25, md: 2 }, 
              py: { xs: 0.7, sm: 0.7, md: 0.9 },
              fontSize: { xs: "0.8rem", sm: "0.82rem", md: "0.88rem" }, 
              fontWeight: 600,
              borderRadius: "10px",
              transition: "all 0.25s ease",
              boxShadow: isDashboardActive ? "0 2px 10px rgba(255, 183, 77, 0.3)" : "none",
              "&:hover": { 
                background: isDashboardActive 
                  ? "linear-gradient(135deg, #FFB74D 0%, #FFC107 100%)" 
                  : "rgba(255, 183, 77, 0.2)", 
                transform: isDashboardActive ? "none" : "translateY(-1px)" 
              },
            }}>
              <DashboardIcon sx={{ fontSize: "1rem" }} />
              Dashboard
            </Box>
          </NavLink>
          <NavLink to="/user/dashboard" style={{ textDecoration: "none" }}>
            <Box sx={{ 
              color: isProfileActive ? "#1D3557" : "rgba(255,255,255,0.75)", 
              background: isProfileActive ? "linear-gradient(135deg, #FFB74D 0%, #FFC107 100%)" : "transparent",
              px: { xs: 1.2, sm: 1.15, md: 1.5 }, 
              py: { xs: 0.7, sm: 0.7, md: 0.9 }, 
              fontSize: { xs: "0.8rem", sm: "0.82rem", md: "0.88rem" }, 
              fontWeight: isProfileActive ? 600 : 500, 
              borderRadius: "10px",
              boxShadow: isProfileActive ? "0 2px 10px rgba(255, 183, 77, 0.3)" : "none",
              transition: "all 0.2s ease", 
              "&:hover": { 
                color: isProfileActive ? "#1D3557" : "#FFB74D", 
                background: isProfileActive ? "linear-gradient(135deg, #FFB74D 0%, #FFC107 100%)" : "rgba(255, 183, 77, 0.1)" 
              } 
            }}>
              Profile
            </Box>
          </NavLink>
          <Box onClick={handleLogout} sx={{ 
            color: "rgba(255,255,255,0.75)", 
            px: { xs: 1.2, sm: 1.15, md: 1.5 }, 
            py: { xs: 0.7, sm: 0.7, md: 1 }, 
            fontSize: { xs: "0.8rem", sm: "0.82rem", md: "0.88rem" }, 
            fontWeight: 500, 
            cursor: "pointer", 
            borderRadius: "10px",
            transition: "all 0.2s ease", 
            "&:hover": { color: "#ff6b6b", background: "rgba(255, 107, 107, 0.1)" } 
          }}>
            Logout
          </Box>
        </Box>
      ) : (
        <NavLink to="auth/login" style={{ textDecoration: "none" }}>
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1,
            background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)",
            color: "#1D3557",
            px: 2.5, py: 0.9,
            fontSize: "0.88rem", fontWeight: 700,
            borderRadius: "10px",
            transition: "all 0.25s ease",
            boxShadow: "0 4px 15px rgba(255, 183, 77, 0.25)",
            "&:hover": { boxShadow: "0 6px 20px rgba(255, 183, 77, 0.4)", transform: "translateY(-2px)" },
          }}>
            <LoginIcon sx={{ fontSize: "1rem" }} />
            Login
          </Box>
        </NavLink>
      )}
      <CustomDialog open={dialogState.open} onClose={hideDialog} onConfirm={dialogState.onConfirm} title={dialogState.title} message={dialogState.message} type={dialogState.type} confirmText={dialogState.confirmText} cancelText={dialogState.cancelText} showCancel={dialogState.showCancel} />
    </Box>
  );
};

const Header = () => {
  const theme = useTheme();
  // Use 1050px to match UserTemplate's sidebar breakpoint
  const isMobile = useMediaQuery("(max-width: 1049px)");
  const { stationCode, isLoggedIn, isAdmin } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unseenEnquiriesCount, setUnseenEnquiriesCount] = useState(0);
  const { isDarkMode: darkMode, toggleDarkMode } = useThemeMode();
  const { openSidebar } = useSidebar();
  const location = useLocation();
  
  const publicPages = ["/", "/about", "/track", "/auth/login", "/auth/register", "/services", "/locations"];
  const isPublicPage = publicPages.includes(location.pathname);
  const showNavigationButton = isLoggedIn && !isPublicPage;
  const isDashboardPage = !isPublicPage && isLoggedIn;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch unseen enquiries count for notification
  const fetchUnseenEnquiriesCount = async () => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/service-enquiry/unseen/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUnseenEnquiriesCount(data.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unseen enquiries count:", error);
    }
  };

  // Fetch notification count for admin users
  useEffect(() => {
    if (isAdmin && isDashboardPage) {
      fetchUnseenEnquiriesCount();
      // Refresh count every 15 minutes
      const interval = setInterval(fetchUnseenEnquiriesCount, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, isDashboardPage]);

  // Listen for enquiries marked as read from other components
  useEffect(() => {
    const handleEnquiriesRead = () => {
      setUnseenEnquiriesCount(0);
    };

    window.addEventListener('enquiriesMarkedAsRead', handleEnquiriesRead);
    return () => window.removeEventListener('enquiriesMarkedAsRead', handleEnquiriesRead);
  }, []);

  // Mark enquiries as read when visiting enquiries page
  const markEnquiriesAsRead = async () => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BASE_URL}/api/service-enquiry/mark-read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnseenEnquiriesCount(0);
    } catch (error) {
      console.error("Failed to mark enquiries as read:", error);
    }
  };

  // Reset count when visiting enquiries page
  useEffect(() => {
    if (location.pathname === "/user/enquiries" && unseenEnquiriesCount > 0) {
      markEnquiriesAsRead();
    }
  }, [location.pathname, unseenEnquiriesCount]);

  // For dashboard pages, always use the solid background (no scroll effect)
  const shouldApplyScrollEffect = scrolled && !isDashboardPage;

  return (
    <div className="header-box" style={{ border: "none", outline: "none" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: isDashboardPage 
            ? "rgba(10, 22, 40, 0.98)"
            : shouldApplyScrollEffect 
              ? "rgba(10, 22, 40, 0.98)" 
              : "linear-gradient(90deg, rgba(10, 22, 40, 0.95) 0%, rgba(29, 53, 87, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "none !important",
          borderTop: "none !important",
          borderBottom: "none !important",
          borderLeft: "none !important",
          borderRight: "none !important",
          outline: "none !important",
          boxSizing: "border-box",
          height: { xs: "64px", md: isDashboardPage ? "68px" : (shouldApplyScrollEffect ? "68px" : "76px") },
          transition: "background 0.5s ease-in-out, height 0.5s ease-in-out",
          boxShadow: (isDashboardPage || shouldApplyScrollEffect) 
            ? "0 4px 30px rgba(0, 0, 0, 0.3)" 
            : "none !important",
          "&::before": {
            display: "none !important",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, #FFB74D 20%, #FFC107 50%, #FFB74D 80%, transparent 100%)",
            opacity: 1,
            transition: "opacity 0.5s ease-in-out",
          },
          "&:focus, &:focus-visible, &:focus-within": {
            outline: "none !important",
            border: "none !important",
          },
        }}
      >
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          height: "100%", 
          px: { xs: 2, sm: 2.5, md: 3, lg: 4 }, 
          maxWidth: "1400px", 
          margin: "0 auto", 
          width: "100%" 
        }}>
          {isMobile ? (
            <>
              {showNavigationButton ? (
                <>
                  <Box onClick={openSidebar} sx={{ 
                    background: "rgba(255, 183, 77, 0.1)", 
                    border: "1px solid rgba(255, 183, 77, 0.25)", 
                    borderRadius: "10px", 
                    px: 1.5, py: 0.75, 
                    display: "flex", alignItems: "center", gap: 1, 
                    cursor: "pointer", 
                    transition: "all 0.2s ease", 
                    "&:hover": { background: "rgba(255, 183, 77, 0.2)" } 
                  }}>
                    <AppsIcon sx={{ fontSize: "1rem", color: "#FFB74D" }} />
                    <Typography sx={{ color: "#FFB74D", fontSize: "0.75rem", fontWeight: 600 }}>Nav</Typography>
                  </Box>
                  <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                    <Link to="/" style={{ display: "flex", alignItems: "center" }}>
                      <img src={logoImg} alt="FTC Logo" className="header-logo" style={{ height: "40px" }} />
                    </Link>
                  </Box>
                </>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Link to="/" style={{ display: "flex", alignItems: "center" }}>
                    <img src={logoImg} alt="FTC Logo" className="header-logo" style={{ height: "40px" }} />
                  </Link>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isDashboardPage && (
                  <IconButton 
                    onClick={toggleDarkMode}
                    sx={{ 
                      p: 1, 
                      background: "rgba(255, 255, 255, 0.05)", 
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px", 
                      transition: "all 0.3s ease",
                      "&:hover": { background: "rgba(255, 255, 255, 0.1)" },
                      "&:focus": { outline: "none" },
                      "&:focus-visible": { outline: "none" }
                    }}
                  >
                    {darkMode ? <DarkModeIcon sx={{ fontSize: "1.2rem", color: "#FFB74D" }} /> : <LightModeIcon sx={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.7)" }} />}
                  </IconButton>
                )}
                <IconButton 
                  onClick={() => setDrawerOpen(true)} 
                  sx={{ 
                    color: "#FFB74D", 
                    p: 1, 
                    background: "rgba(255, 183, 77, 0.1)", 
                    border: "1px solid rgba(255, 183, 77, 0.2)",
                    borderRadius: "10px", 
                    "&:hover": { background: "rgba(255, 183, 77, 0.2)" },
                    "&:focus": { outline: "none" },
                    "&:focus-visible": { outline: "none" }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
              <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            </>
          ) : (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Link to="/" style={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.02)" },
                  }}>
                    <img src={logoImg} alt="FTC Logo" className="header-logo" style={{ height: isDashboardPage ? "44px" : (scrolled ? "44px" : "48px"), transition: "height 0.3s ease" }} />
                  </Box>
                </Link>
                {stationCode && (
                  <Box sx={{ 
                    background: "linear-gradient(135deg, rgba(255, 183, 77, 0.15) 0%, rgba(255, 183, 77, 0.05) 100%)", 
                    border: "1px solid rgba(255, 183, 77, 0.3)", 
                    px: 1.5, py: 0.4, 
                    borderRadius: "8px",
                    display: "flex", alignItems: "center", gap: 0.75,
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50" }} />
                    <Typography sx={{ color: "#FFB74D", fontSize: "0.8rem", fontWeight: 600 }}>
                      {isAdmin ? `ADMIN • ${stationCode}` : stationCode}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 1.5, lg: 2 } }}>
                {/* Notification Icon - Large screens only (lg+), Admin Only, Only when unseen */}
                {isDashboardPage && isAdmin && unseenEnquiriesCount > 0 && (
                  <Box sx={{ display: { xs: "none", lg: "block" } }}>
                  <Tooltip title={`${unseenEnquiriesCount} new enquir${unseenEnquiriesCount === 1 ? 'y' : 'ies'}`} arrow>
                    <Box sx={{ position: "relative" }}>
                      <Link to="/user/enquiries" style={{ textDecoration: "none" }}>
                        <IconButton
                          sx={{
                            p: 1,
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "10px",
                            transition: "all 0.3s ease",
                            "&:hover": { 
                              background: "rgba(255, 183, 77, 0.1)",
                              borderColor: "rgba(255, 183, 77, 0.3)"
                            },
                            "&:focus": { outline: "none" },
                            "&:focus-visible": { outline: "none" }
                          }}
                        >
                          <NotificationsIcon sx={{ 
                            fontSize: "1.2rem", 
                            color: "#FFB74D"
                          }} />
                        </IconButton>
                      </Link>
                      <Box
                        sx={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          minWidth: "20px",
                          height: "20px",
                          borderRadius: "10px",
                          backgroundColor: "#FF4444",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          border: "2px solid rgba(10, 22, 40, 0.9)",
                          boxShadow: "0 2px 8px rgba(255, 68, 68, 0.4)",
                        }}
                      >
                        {unseenEnquiriesCount > 99 ? "99+" : unseenEnquiriesCount}
                      </Box>
                    </Box>
                  </Tooltip>
                  </Box>
                )}
                {isDashboardPage && (
                  <IconButton
                    onClick={toggleDarkMode}
                    sx={{ 
                      p: { xs: 1, sm: 0.75, lg: 1 },
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": { 
                        background: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:focus": { outline: "none" },
                      "&:focus-visible": { outline: "none" }
                    }}
                  >
                    {darkMode ? (
                      <DarkModeIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.1rem", lg: "1.2rem" }, color: "#FFB74D" }} />
                    ) : (
                      <LightModeIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.1rem", lg: "1.2rem" }, color: "rgba(255,255,255,0.7)" }} />
                    )}
                  </IconButton>
                )}
                <HeaderTabs />
              </Box>
            </>
          )}
        </Box>
      </AppBar>
    </div>
  );
};

export default Header;
