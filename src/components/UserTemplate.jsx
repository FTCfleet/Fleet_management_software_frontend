import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton } from "@mui/material";
import { FaRegFileAlt, FaTruckMoving, FaMoneyCheckAlt, FaBoxOpen, FaFileInvoice, FaPlus, FaChartBar, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../routes/AuthContext";
import { useSidebar } from "../hooks/useSidebar";
import { useThemeMode, getThemeColors } from "../hooks/useTheme";
import CloseIcon from "@mui/icons-material/Close";
import ModernSpinner from "./ModernSpinner";
import "../css/dashboard.css";
import "../css/main.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const UserTemplate = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [isScreenLoadingText, setIsScreenLoadingText] = useState("");
  const [unseenEnquiriesCount, setUnseenEnquiriesCount] = useState(0);
  const { isLoggedIn, isAdmin, isSource, setLastUserPage, stationCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const isAddOrderPage =
    location.pathname.startsWith("/user/add") ||
    location.pathname.startsWith("/user/edit") ||
    !isSource;

  // Fetch unseen enquiries count
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

  // Mark enquiries as read when visiting the page
  const markEnquiriesAsRead = async () => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/service-enquiry/mark-read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUnseenEnquiriesCount(0);
        // Notify other components that enquiries have been marked as read
        window.dispatchEvent(new CustomEvent('enquiriesMarkedAsRead'));
      }
    } catch (error) {
      console.error("Failed to mark enquiries as read:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUnseenEnquiriesCount();
      // Refresh count every 15 minutes
      const interval = setInterval(fetchUnseenEnquiriesCount, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Mark as read when visiting enquiries page
  useEffect(() => {
    if (location.pathname === "/user/enquiries" && unseenEnquiriesCount > 0) {
      markEnquiriesAsRead();
    }
  }, [location.pathname, unseenEnquiriesCount]);



  const menuSections = [
    {
      heading: "LRs",
      headingIcon: <FaBoxOpen />,
      items: [
        { text: "All LRs", path: "/user/order/all", icon: <FaRegFileAlt /> },
        { text: `${isSource || isAdmin ? "Arrived" : "Incoming"} LRs`, path: "/user/order/arrived", icon: <FaRegFileAlt /> },
        { text: "Dispatched LRs", path: "/user/order/dispatched", icon: <FaRegFileAlt /> },
        { text: "Delivered LRs", path: "/user/order/delivered", icon: <FaRegFileAlt /> },
      ],
    },
    {
      heading: "Receipts",
      headingIcon: <FaFileInvoice />,
      items: [
        { text: "All Memo", path: "/user/ledgers/all", icon: <FaTruckMoving /> },
        { text: `${isAdmin ? "Dispatched" : isSource ? "Outgoing" : "Incoming"} Memo`, path: "/user/ledgers/dispatched", icon: <FaTruckMoving /> },
        { text: "Completed Memo", path: "/user/ledgers/completed", icon: <FaTruckMoving /> },
      ],
    },
    ...(isAdmin
      ? [
          {
            heading: "Reports",
            headingIcon: <FaChartBar />,
            items: [
              { text: "Analytics", path: "/user/analytics", icon: <FaChartBar /> },
              { text: "Monthly Report", path: "/user/gen-report/", icon: <FaMoneyCheckAlt /> },
            ],
          },
          {
            heading: "Enquiries",
            headingIcon: <FaEnvelope />,
            items: [
              { text: "Service Enquiries", path: "/user/enquiries", icon: <FaEnvelope />, notificationCount: unseenEnquiriesCount },
            ],
          },
          {
            heading: "Admin",
            headingIcon: <FaMoneyCheckAlt />,
            items: [
              { text: "Truck Drivers", path: "/user/trucks", icon: <FaMoneyCheckAlt /> },
              { text: "Employees", path: "/user/employees", icon: <FaMoneyCheckAlt /> },
              { text: "Stations", path: "/user/warehouses", icon: <FaMoneyCheckAlt /> },
              { text: "Clients", path: "/user/clients", icon: <FaMoneyCheckAlt /> },
              { text: "Items", path: "/user/items", icon: <FaMoneyCheckAlt /> },
              { text: "Item Types", path: "/user/item-types", icon: <FaMoneyCheckAlt /> },
            ],
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth/login");
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1050;
      setIsMobileView(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/user/dashboard") setLastUserPage(location.pathname);
    if (isMobileView) setIsSidebarOpen(false);
    // Scroll to top instantly when navigating between dashboard pages
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, isMobileView, setLastUserPage]);

  useEffect(() => {
    if (!isMobileView) setIsSidebarOpen(true);
  }, [isMobileView]);

  const { isDarkMode } = useThemeMode();
  const colors = getThemeColors(isDarkMode);

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)", position: "relative" }}>
      {/* Mobile Overlay */}
      {isMobileView && isSidebarOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 40,
            transition: "opacity 0.3s ease",
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Box
        sx={{
          width: isMobileView ? "280px" : "250px",
          backgroundColor: colors.bgSecondary,
          borderRight: `1px solid ${colors.border}`,
          p: 2,
          overflowY: "auto",
          overflowX: "hidden",
          position: isMobileView ? "fixed" : "sticky",
          top: isMobileView ? "60px" : "70px",
          left: 0,
          height: isMobileView ? "calc(100vh - 60px)" : "calc(100vh - 70px)",
          zIndex: 50,
          transform: isMobileView ? (isSidebarOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
          transition: "transform 0.3s ease, background-color 0.3s ease",
          boxShadow: isMobileView && isSidebarOpen ? "4px 0 20px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {isMobileView && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            {stationCode && (
              <Typography
                sx={{
                  backgroundColor: "rgba(255,183,77,0.15)",
                  border: "1px solid rgba(255,183,77,0.4)",
                  color: "#FFB74D",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {isAdmin ? `ADMIN • ${stationCode}` : stationCode}
              </Typography>
            )}
            <IconButton size="small" onClick={() => setIsSidebarOpen(false)} sx={{ color: colors.textSecondary }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex} sx={{ 
            mb: 2.5,
            pb: 2,
            borderBottom: sectionIndex < menuSections.length - 1 
              ? (isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e8ecf0") 
              : "none"
          }}>
            <Typography
              component="div"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                color: colors.textMuted,
                fontWeight: 600,
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                mb: 0.75,
                px: 0.75,
              }}
            >
              <Box sx={{ opacity: 0.7, display: "flex", fontSize: "0.8rem" }}>{section.headingIcon}</Box>
              {section.heading}
            </Typography>
            <List disablePadding>
              {section.items.map((item, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 0.25 }}>
                  <NavLink
                    to={item.path}
                    onClick={() => isMobileView && setIsSidebarOpen(false)}
                    style={{ textDecoration: "none", width: "100%" }}
                  >
                    {({ isActive }) => (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          padding: "0.55rem 0.875rem",
                          borderRadius: "10px",
                          color: isActive 
                            ? (isDarkMode ? colors.accent : colors.primary) 
                            : colors.textSecondary,
                          backgroundColor: isActive 
                            ? (isDarkMode ? "rgba(255, 183, 77, 0.1)" : "rgba(30, 58, 95, 0.08)") 
                            : "transparent",
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "0.85rem",
                          transition: "all 0.2s ease",
                          borderLeft: isActive 
                            ? `3px solid ${isDarkMode ? colors.accent : colors.primary}` 
                            : "3px solid transparent",
                          "&:hover": {
                            backgroundColor: isDarkMode ? "rgba(255, 183, 77, 0.05)" : "rgba(30, 58, 95, 0.04)",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: "28px", 
                          color: isActive 
                            ? (isDarkMode ? colors.accent : colors.primary) 
                            : colors.textMuted, 
                          fontSize: "0.85rem" 
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: "inherit", letterSpacing: "-0.01em" }}
                        />
                        {item.notificationCount > 0 && (
                          <Box
                            sx={{
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
                              ml: 1,
                            }}
                          >
                            {item.notificationCount > 99 ? "99+" : item.notificationCount}
                          </Box>
                        )}
                      </Box>
                    )}
                  </NavLink>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 1.5, sm: 2, md: 2.5 },
          backgroundColor: colors.bgPrimary,
          minWidth: 0,
          overflowY: "auto",
          transition: "background-color 0.3s ease",
        }}
      >
        <Outlet context={{ setIsScreenLoading, setIsScreenLoadingText, isDarkMode, colors }} />

        {/* Loading Overlay */}
        {isScreenLoading && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              background: "linear-gradient(135deg, rgba(10, 22, 40, 0.95) 0%, rgba(29, 53, 87, 0.95) 100%)",
              backdropFilter: "blur(8px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1500,
              gap: 3,
            }}
          >
            <ModernSpinner size={48} />
            {isScreenLoadingText && (
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: "1.1rem", color: "#ffffff", fontWeight: 600, letterSpacing: "0.5px" }}>
                  {isScreenLoadingText}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", mt: 0.5 }}>
                  Please wait...
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Floating Action Buttons */}
        {!isAddOrderPage && (
          <Box
            sx={{
              position: "fixed",
              bottom: { xs: "1rem", sm: "1.5rem" },
              right: { xs: "1rem", sm: "1.5rem" },
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
              zIndex: 100,
            }}
          >
            <Box
              onClick={() => navigate("/user/add/order/")}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                minWidth: "145px",
                padding: "13px 20px",
                background: isDarkMode 
                  ? "linear-gradient(135deg, #FFB74D 0%, #FFA726 50%, #FFB74D 100%)" 
                  : "linear-gradient(135deg, #1E3A5F 0%, #2d5a87 50%, #1E3A5F 100%)",
                color: isDarkMode ? "#0a1628" : "#fff",
                fontSize: "0.85rem",
                fontWeight: 700,
                borderRadius: "30px",
                cursor: "pointer",
                boxShadow: isDarkMode 
                  ? "0 4px 20px rgba(255, 183, 77, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)" 
                  : "0 4px 20px rgba(30, 58, 95, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-3px) scale(1.02)",
                  boxShadow: isDarkMode 
                    ? "0 8px 30px rgba(255, 183, 77, 0.5), inset 0 1px 0 rgba(255,255,255,0.25)" 
                    : "0 8px 30px rgba(30, 58, 95, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                },
              }}
            >
              <FaPlus style={{ fontSize: "0.85rem" }} /> Create L.R.
            </Box>
            <Box
              onClick={() => navigate("/user/add/ledger/")}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                minWidth: "145px",
                padding: "13px 20px",
                background: isDarkMode 
                  ? "linear-gradient(135deg, #FFB74D 0%, #FFA726 50%, #FFB74D 100%)" 
                  : "linear-gradient(135deg, #1E3A5F 0%, #2d5a87 50%, #1E3A5F 100%)",
                color: isDarkMode ? "#0a1628" : "#fff",
                fontSize: "0.85rem",
                fontWeight: 700,
                borderRadius: "30px",
                cursor: "pointer",
                boxShadow: isDarkMode 
                  ? "0 4px 20px rgba(255, 183, 77, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)" 
                  : "0 4px 20px rgba(30, 58, 95, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-3px) scale(1.02)",
                  boxShadow: isDarkMode 
                    ? "0 8px 30px rgba(255, 183, 77, 0.5), inset 0 1px 0 rgba(255,255,255,0.25)" 
                    : "0 8px 30px rgba(30, 58, 95, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                },
              }}
            >
              <FaPlus style={{ fontSize: "0.85rem" }} /> Create Memo
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserTemplate;
