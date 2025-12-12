import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, CircularProgress, IconButton } from "@mui/material";
import { FaRegFileAlt, FaTruckMoving, FaMoneyCheckAlt, FaBoxOpen, FaFileInvoice, FaPlus, FaChartBar } from "react-icons/fa";
import { useAuth } from "../routes/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import "../css/dashboard.css";
import "../css/main.css";

const UserTemplate = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [isScreenLoadingText, setIsScreenLoadingText] = useState("");
  const { isLoggedIn, isAdmin, isSource, setLastUserPage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAddOrderPage =
    location.pathname.startsWith("/user/add") ||
    location.pathname.startsWith("/user/edit") ||
    !isSource;

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
  }, [location.pathname, isMobileView, setLastUserPage]);

  useEffect(() => {
    if (!isMobileView) setIsSidebarOpen(true);
  }, [isMobileView]);

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)", position: "relative" }}>
      {/* Mobile Overlay */}
      {isMobileView && isSidebarOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 40,
            transition: "opacity 0.3s ease",
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Box
        sx={{
          width: isMobileView ? "280px" : "260px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          p: 2,
          overflowY: "auto",
          overflowX: "hidden",
          position: isMobileView ? "fixed" : "sticky",
          top: isMobileView ? "60px" : "70px",
          left: 0,
          height: isMobileView ? "calc(100vh - 60px)" : "calc(100vh - 70px)",
          zIndex: 50,
          transform: isMobileView ? (isSidebarOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
          transition: "transform 0.3s ease",
          boxShadow: isMobileView && isSidebarOpen ? "4px 0 15px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {isMobileView && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <IconButton size="small" onClick={() => setIsSidebarOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex} sx={{ mb: 2.5 }}>
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#1E3A5F",
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                mb: 1,
                px: 0.5,
              }}
            >
              {section.headingIcon}
              {section.heading}
            </Typography>
            <List disablePadding>
              {section.items.map((item, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 0.25 }}>
                  <NavLink
                    to={item.path}
                    onClick={() => isMobileView && setIsSidebarOpen(false)}
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      padding: "0.6rem 0.875rem",
                      borderRadius: "8px",
                      color: isActive ? "#1E3A5F" : "#4a5568",
                      backgroundColor: isActive ? "#e0f2fe" : "transparent",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.875rem",
                      transition: "all 0.2s ease",
                    })}
                  >
                    <ListItemIcon sx={{ minWidth: "32px", color: "#82acc2", fontSize: "0.9rem" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: "inherit" }}
                    />
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
          backgroundColor: "#f8fafc",
          minWidth: 0,
          overflowY: "auto",
        }}
      >
        {/* Mobile Menu Toggle */}
        {isMobileView && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              position: "sticky",
              top: 0,
              zIndex: 30,
              backgroundColor: "#f8fafc",
              py: 1,
              mx: -1.5,
              px: 1.5,
            }}
          >
            <button className="button" style={{ margin: 0, padding: "0.5rem 1rem" }} onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon fontSize="small" />
              <span>Menu</span>
            </button>
          </Box>
        )}

        <Outlet context={{ setIsScreenLoading, setIsScreenLoadingText }} />

        {/* Loading Overlay */}
        {isScreenLoading && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1500,
              gap: 2,
            }}
          >
            <CircularProgress size={50} sx={{ color: "#1E3A5F" }} />
            {isScreenLoadingText && (
              <Typography sx={{ fontSize: "1.1rem", color: "#1E3A5F", fontWeight: 500 }}>
                {isScreenLoadingText}
              </Typography>
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
              gap: 1,
              zIndex: 100,
            }}
          >
            <button 
              className="button" 
              onClick={() => navigate("/user/add/order/")}
              style={{ 
                minWidth: "140px", 
                padding: "12px 16px",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <FaPlus /> Create L.R.
            </button>
            <button 
              className="button" 
              onClick={() => navigate("/user/add/ledger/")}
              style={{ 
                minWidth: "140px", 
                padding: "12px 16px",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <FaPlus /> Create Memo
            </button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserTemplate;
