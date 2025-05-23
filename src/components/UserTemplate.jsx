import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  FaRegFileAlt,
  FaTruckMoving,
  FaMoneyCheckAlt,
  FaBoxOpen,
  FaFileInvoice,
  FaPlus,
} from "react-icons/fa";
import { useAuth } from "../routes/AuthContext";
import "../css/dashboard.css";
import "../css/main.css";

const UserTemplate = () => {
  const { isLoggedIn, isAdmin, isSource } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAddOrderPage =
    location.pathname.startsWith("/user/add/order/") ||
    location.pathname.startsWith("/user/edit/order/") ||
    !isSource;

  const { setLastUserPage } = useAuth();

  const menuSections = [
    {
      heading: "Orders",
      path: "/user/order",
      headingIcon: <FaBoxOpen style={{ marginRight: "8px" }} />,
      items: [
        { text: "All Orders", path: "/user/order/all", icon: <FaRegFileAlt /> },
        {
          text: `${isSource || isAdmin ? "Arrived" : "Incoming"} Orders`,
          path: "/user/order/arrived",
          icon: <FaRegFileAlt />,
        },
        {
          text: "Dispatched Orders",
          path: "/user/order/dispatched",
          icon: <FaRegFileAlt />,
        },
        {
          text: "Delivered  Orders",
          path: "/user/order/delivered",
          icon: <FaRegFileAlt />,
        },
      ],
    },
    {
      heading: "Receipts",
      path: "/user/ledgers",
      headingIcon: <FaFileInvoice style={{ marginRight: "8px" }} />,
      items: [
        {
          text: "All Ledgers",
          path: "/user/ledgers/all",
          icon: <FaTruckMoving />,
        },
        ...(isAdmin || isSource
          ? [
              {
                text: "Pending Ledgers",
                path: "/user/ledgers/pending",
                icon: <FaTruckMoving />,
              },
            ]
          : []),
        {
          text: `${
            isAdmin ? "Dispatched" : isSource ? "Outgoing" : "Incoming"
          } Ledgers`,
          path: `/user/ledgers/dispatched`,
          icon: <FaTruckMoving />,
        },
        {
          text: "Verified Ledgers",
          path: "/user/ledgers/verified",
          icon: <FaTruckMoving />,
        },
        {
          text: "Completed Ledgers",
          path: "/user/ledgers/completed",
          icon: <FaTruckMoving />,
        },
      ],
    },
    {
      heading: "Report Generation",
      path: "/user/gen-report",
      headingIcon: <FaMoneyCheckAlt style={{ marginRight: "8px" }} />,
      items: [
        {
          text: "Ledger Generation",
          path: "/user/gen-report/",
          icon: <FaMoneyCheckAlt />,
        },
      ],
    },
    isAdmin
      ? {
          heading: "Admin",
          path: "/user",
          headingIcon: <FaMoneyCheckAlt style={{ marginRight: "8px" }} />,
          items: [
            {
              text: "Truck Drivers List",
              path: "/user/trucks",
              icon: <FaMoneyCheckAlt />,
            },
            {
              text: "Employees List",
              path: "/user/employees",
              icon: <FaMoneyCheckAlt />,
            },
            {
              text: "Warehouse List",
              path: "/user/warehouses",
              icon: <FaMoneyCheckAlt />,
            },
            {
              text: "Client List",
              path: "/user/clients",
              icon: <FaMoneyCheckAlt />,
            },
            {
              text: "Items List",
              path: "/user/items",
              icon: <FaMoneyCheckAlt />,
            },
          ],
        }
      : {},
  ];

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth/login");
  }, []);

  useEffect(() => {
    if (location.pathname !== "/user/dashboard")
    setLastUserPage(location.pathname);
  }, [location.pathname]);

  return (
    <div style={{ display: "flex" }}>
      {/* Left Sidebar */}
      <Box
        sx={{
          width: { xs: "60px", sm: "15vw" },
          backgroundColor: "#f7f9fc",
          padding: { xs: "8px", sm: "12px" },
          minHeight: "100vh",
          borderRight: "1px solid #ddd",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        }}
      >
        {menuSections.map((section, sectionIndex) =>
          Object.keys(section).length === 0 ? null : (
            <Box key={sectionIndex} sx={{ marginBottom: "12px" }}>
              {" "}
              {/* Reduced margin between sections */}
              <Typography
                variant="body1"
                sx={{
                  color: "#1E3A5F",
                  fontWeight: "bold",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "6px",
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
                      padding: "4px 0",
                      "&:hover": {
                        backgroundColor: "#e3f2fd",
                        borderRadius: "4px",
                        color: "#1976d2",
                      },
                    }}
                  >
                    <NavLink
                      to={item.path}
                      style={({ isActive }) => ({
                        textDecoration: "none",
                        color: isActive ? "#82acc2" : "#25344e",
                        fontWeight: isActive ? "bold" : "normal",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        padding: "4px 12px",
                        transform: isActive ? "scale(1.05)" : "none",
                        backgroundColor: isActive ? "#e3f2fd" : "",
                      })}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: "25px",
                          color: "#82acc2",
                        }}
                      >
                        {item.icon} {/* Icon for the menu item */}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{
                          fontSize: "12px",
                          margin: "-5px",
                          color: "#25344e",
                        }}
                      />
                    </NavLink>
                  </ListItem>
                ))}
              </List>
            </Box>
          )
        )}
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          padding: "20px",
          paddingRight: "0px",
          backgroundColor: "#ffffff",
          minHeight: "100vh",
        }}
      >
        <Outlet />
        {/* Floating Add Order Button */}
        {!isAddOrderPage && (
          <Box
            sx={{
              position: "fixed",
              bottom: "16px",
              right: "25px",
              zIndex: 1000,
            }}
          >
            <button
              className="button"
              onClick={() => navigate("/user/add/order/")}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#25344e")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#1E3A5F")}
            >
              <FaPlus style={{ marginRight: "8px" }} /> Add Order
            </button>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default UserTemplate;
