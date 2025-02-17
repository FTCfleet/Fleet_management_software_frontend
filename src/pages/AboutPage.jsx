import React, { useEffect, useState } from "react";
import { Typography, Box, Paper, Stack } from "@mui/material";
import {
  FaWarehouse,
  FaPhone,
  FaMapMarkerAlt as MapsIcon,
} from "react-icons/fa";
import about from "../assets/about-us.jpg";
import Loading from "../components/Loading";
import { useTheme, useMediaQuery } from "@mui/material";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AboutPage() {
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down(470));
  useEffect(() => {
    fetchWarehouse();
  }, []);

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) {
      const data = await response.json();
      setAllWarehouse(data.body);
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="app" style={{ backgroundColor: "#f5f5f5", padding: "20px" }}>
      <Paper
        elevation={3}
        style={{
          margin: "0 auto",
          padding: "20px",
          backgroundColor: "#e3f2fd",
          maxWidth: "76%",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexDirection: mobileView ? "column" : "row",
        }}
      >
        {!mobileView && (
          <img
            src={about}
            alt="About Us"
            style={{
              width: "25%",
              height: "auto",
              borderRadius: "20px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          />
        )}
        <Box style={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant={mobileView ? "h5" : "h4"}
            style={{
              color: "#1565c0",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Daily Parcel Service
          </Typography>
          <div
            style={{
              height: "4px",
              width: "50px",
              backgroundColor: "#1565c0",
              margin: "0 auto 10px",
            }}
          ></div>
          <Typography
            variant={mobileView ? "body2" : "body1"}
            style={{ color: "#5f6368", maxWidth: "400px", margin: "0 auto" }}
          >
            We offer daily parcel delivery services to key locations, ensuring that your packages reach their destinations on time. Our dedicated team ensures every parcel is handled with care and reaches its destination securely.
          </Typography>
        </Box>
      </Paper>

      {/* Bottom Section */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          width: "80%",
          margin: "30px auto 0",
          flexDirection: mobileView ? "column" : "row",
          position: "relative",
        }}
      >
        {/* Source Warehouses Box */}
        <Paper
          elevation={3}
          style={{
            flex: "55%",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            padding: "40px",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h6"
            style={{ color: "#1565c0", marginBottom: "10px" }}
          >
            <FaWarehouse style={{ marginRight: "8px" }} /> Source Warehouses
          </Typography>
          <Stack spacing={2}>
            {allWarehouse.map((warehouse) => {
              if (warehouse.isSource)
                return (
                  <Box
                    key={warehouse.warehouseID}
                    display="flex"
                    flexDirection={mobileView ? "column" : "row"}
                    justifyContent="space-between"
                    alignItems={mobileView ? "flex-start" : "center"}
                    gap={mobileView ? 1 : 0}
                  >
                    <Box
                      display="flex"
                      alignItems="top"
                      textAlign="left"
                      gap={1}
                    >
                      <MapsIcon
                        style={{ color: "#1976d2", marginTop: "5px" }}
                      />
                      {warehouse.name}
                      <br />
                      {warehouse.address}
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      {warehouse.contactNo}{" "}
                      <FaPhone style={{ color: "#1976d2" }} />
                    </Box>
                  </Box>
                );
            })}
          </Stack>
        </Paper>

        {/* Destination Warehouses Box */}
        <Paper
          elevation={3}
          style={{
            flex: "45%",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            padding: "40px",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h6"
            style={{ color: "#1565c0", marginBottom: "10px" }}
          >
            <FaWarehouse style={{ marginRight: "8px" }} /> Destination
            Warehouses
          </Typography>
          <Stack spacing={2}>
            {allWarehouse.map((warehouse) => {
              if (!warehouse.isSource)
                return (
                  <Box
                    key={warehouse.warehouseID}
                    display="flex"
                    flexDirection={mobileView ? "column" : "row"}
                    justifyContent="space-between"
                    alignItems={mobileView ? "flex-start" : "center"}
                    gap={mobileView ? 1 : 0}
                  >
                    <Box
                      display="flex"
                      alignItems="top"
                      textAlign="left"
                      gap={1}
                    >
                      <MapsIcon
                        style={{ color: "#1976d2", marginTop: "5px" }}
                      />
                      {warehouse.name}
                      <br />
                      {warehouse.address}
                    </Box>
                    <Box display="flex" alignItems={mobileView ? "flex-start" : "center"} gap={1}>
                      {warehouse.contactNo}{" "}
                      <FaPhone style={{ color: "#1976d2" }} />
                    </Box>
                  </Box>
                );
            })}
          </Stack>
        </Paper>
      </div>
    </div>
  );
}
