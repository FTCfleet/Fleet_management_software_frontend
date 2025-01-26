import React from "react";
import { Typography, Box, Paper, Stack } from "@mui/material";
import { FaWarehouse, FaPhone, FaMapMarkerAlt as MapsIcon } from "react-icons/fa";
import about from "../assets/about-us.jpg";

export default function AboutPage() {
  return (
    <div className="app" style={{ backgroundColor: "#f5f5f5", padding: "20px" }}>
      {/* Top Section */}
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
        }}
      >
        {/* Image Section */}
        <img
          src={about}
          alt="About Us"
          style={{
            width: "213px",
            height: "220px",
            borderRadius: "20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        />

        {/* Text Section */}
        <Box style={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant="h4"
            style={{ color: "#1565c0", fontWeight: "bold", marginBottom: "10px" }}
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
            variant="body1"
            style={{ color: "#5f6368", maxWidth: "400px", margin: "0 auto" }}
          >
            We offer daily parcel delivery services to key locations, ensuring
            that your packages reach their destinations on time. Our dedicated
            team ensures every parcel is handled with care and reaches its
            destination securely.
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
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} /> Head Office I, Old Feel Khana,<br /> Hyderabad
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                24614381 <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} /> Head Office II, Old Feel Khana,<br /> Hyderabad
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                24614381 <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="flex-start" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} />
                <Box>
                  Branch Office, Near M. Alam Filter, <br />Bahadurpura, Hyderabad
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                XXXXXXX <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} /> Nallagutta, Ramagundam, <br />Secunderabad
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                66321533 <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
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
            <FaWarehouse style={{ marginRight: "8px" }} /> Destination Warehouses
          </Typography>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} /> Karimnagar
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                9908690827 <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} /> Sultanabad
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                9849701721 <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} /> Peddapally
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                9030478492 <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} /> Ramagundam (NTPC & FCI)
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                9866239010 <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} /> Godavari Khani
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                9949121267 <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <MapsIcon style={{ color: "#1976d2" }} /> MNCL
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                XXXXXXXXXX <FaPhone style={{ color: "#1976d2" }} />
              </Box>
            </Box>
          </Stack>
        </Paper>
      </div>
    </div>
  );
}
