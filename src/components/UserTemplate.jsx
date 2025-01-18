import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { FaRegFileAlt, FaTruckMoving, FaMoneyCheckAlt, FaBoxOpen, FaFileInvoice } from "react-icons/fa"; // Import different icons for headings
import { useAuth } from "../routes/AuthContext";
import "../css/dashboard.css"; // Add custom CSS for fine-tuning if needed

const UserTemplate = () => {
  const {isLoggedIn} = useAuth();
  const navigate = useNavigate();

  const menuSections = [
    {
      heading: "Orders",
      path: "/user/parcel",
      headingIcon: <FaBoxOpen style={{ marginRight: "8px" }} />, // Icon for "Orders"
      items: [
        { text: "All Orders", path: "/user/parcel/all", icon: <FaRegFileAlt /> },
        { text: "Dispatched", path: "/user/parcel/dispatched", icon: <FaRegFileAlt /> },
        { text: "Delivered", path: "/user/parcel/delivered", icon: <FaRegFileAlt /> },
        { text: "Arrived", path: "/user/parcel/arrived", icon: <FaRegFileAlt /> },
      ],
    },
    {
      heading: "Receipts",
      path: "/user/ledgers",
      headingIcon: <FaFileInvoice style={{ marginRight: "8px" }} />, // Icon for "Receipts"
      items: [
        { text: "All Trucks", path: "/user/ledgers/all", icon: <FaTruckMoving /> },
        { text: "Outgoing", path: "/user/ledgers/outgoing", icon: <FaTruckMoving /> },
        { text: "Incoming", path: "/user/ledgers/incoming", icon: <FaTruckMoving /> },
        { text: "Complete", path: "/user/ledgers/complete", icon: <FaTruckMoving /> },
        { text: "Pending", path: "/user/ledgers/pending", icon: <FaTruckMoving /> },
      ],
    },
    {
      heading: "Report Generation",
      path: "/user/gen-report",
      headingIcon: <FaMoneyCheckAlt style={{ marginRight: "8px" }} />, // Icon for "Report Generation"
      items: [
        { text: "Ledger Generation", path: "/user/gen-report/", icon: <FaMoneyCheckAlt /> },
      ],
    },
  ];

  useEffect(() => {
    if (!isLoggedIn) navigate('/auth/login');
  })

  return (
    <div style={{ display: "flex" }}>
      {/* Left Sidebar */}
      <Box
        sx={{
          width: { xs: "60px", sm: "200px" }, // Adjusted width
          backgroundColor: "#f7f9fc",
          padding: { xs: "8px", sm: "12px" }, // Adjusted padding
          minHeight: "100vh",
          borderRight: "1px solid #ddd",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        }}
      >
        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex} sx={{ marginBottom: "12px" }}> {/* Reduced margin between sections */}
            <Typography
              variant="body1"
              sx={{
                color: "#1E3A5F", // Heading color
                fontWeight: "bold",
                fontSize: "16px", // Reduced font size for headings
                display: "flex",
                alignItems: "center",
                marginBottom: "6px", // Reduced gap between heading and items
              }}
            >
              {section.headingIcon} {section.heading}
            </Typography>
            <List>
              {section.items.map((item, index) => (
                <ListItem
                  key={index}
                  disablePadding
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 0", // Reduced padding
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                      borderRadius: "4px",
                      color: "#1976d2", // Hover effect color
                    },
                  }}
                >
                  <NavLink
                    to={item.path}
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#82acc2" : "#25344e", // Active/Inactive color
                      fontWeight: isActive ? "bold" : "normal",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      padding: "4px 12px", // Adjusted padding
                      transform: isActive ? "scale(1.05)" : "none", 
                      backgroundColor: isActive ? "#e3f2fd" : "",// Slight scaling effect for active item
                    })}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "30px",
                        color: "#82acc2",
                      }}
                    >
                      {item.icon} {/* Icon for the menu item */}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        fontSize: "12px", // Reduced font size
                        margin: "0", // Reduced margin
                        color: "#25344e", // Text color
                      }}
                    />
                  </NavLink>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, padding: "16px" }}>
        <Outlet />
      </Box>
    </div>
  );
};

export default UserTemplate;
