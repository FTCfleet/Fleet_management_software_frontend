import { React, useEffect, useRef, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Modal,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { FaDownload, FaTruck } from "react-icons/fa";
import { Close } from "@mui/icons-material";
import "react-calendar/dist/Calendar.css";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import "../css/main.css";
import "../css/calendar.css";
import { getDate } from "../utils/dateFormatter";

export default function GenReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [monthly, setMonthly] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    return oneMonthAgo.toISOString().split("T")[0];
  });
  const [selectedEndDate, setSelectedEndDate] = useState(getDate());
  const [modalOpen, setModalOpen] = useState(false);
  const lastFourMonths = useRef([]);

  const handleOpenModal = () => {
    if (selectedEndDate < selectedStartDate) {
      // Use a better error handling method if available
      alert("End date cannot be earlier than start date.");
      return;
    }
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  useEffect(() => {
    fetchData();
    lastFourMonths.current = getLastFourMonths();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/get-all-warehouses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    setWarehouses(data.body.filter((a) => a.isSource === false));
    setIsLoading(false);
  };

  const formatDate = (dateString, type) => {
    // console.log(selectedStartDate);
    // console.log(dateString);
    // return dateString;
    const newYear = dateString.split("-")[0];
    const newMonth = dateString.split("-")[1];
    const newDay = dateString.split("-")[2];
    if (type === 'show'){
      return `${newDay}/${newMonth}/${newYear}`;
    }
    return `${newDay}${newMonth}${newYear}`;
  };

  const getLastFourMonths = () => {
    const today = new Date();
    const months = [];

    for (let i = 3; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        label: date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        value: `${date.getMonth() + 1}-${date.getFullYear()}`,
      });
    }
    return months;
  };

  const handleDateChange = (event, type) => {
    // setIsLoading(true);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const newDate = new Date(event.target.value);
    if (newDate <= today) {
      const date = newDate.toISOString().split("T")[0];
      // filterOrdersByTypeAndDate(type);
      if (type === "start") setSelectedStartDate(date);
      else setSelectedEndDate(date);
    }
    // setIsLoading(false);
  };

  return isLoading ? (
    <div
      style={{
        position: "fixed",
        top: "40%",
        left: "55%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} />
      <Typography color="black" fontSize={25}>
        Loading...
      </Typography>
    </div>
  ) : (
    <Box sx={{ 
      maxWidth: 600, 
      margin: "0 auto", 
      padding: { xs: 2, md: 5 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "60vh",
      justifyContent: "center"
    }}>
      <Typography
        variant="h4"
        sx={{
          color: "#1E3A5F",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 4,
          fontSize: { xs: "1.5rem", md: "2rem" }
        }}
      >
        Monthly Report Generator
      </Typography>
      
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: 3,
        width: "100%",
        maxWidth: 400
      }}>
        <FormControl sx={{ width: "100%" }}>
          <InputLabel>Select Station</InputLabel>
          <Select
            label="Select Station"
            value={destinationWarehouse}
            onChange={(e) => setDestinationWarehouse(e.target.value)}
          >
            {warehouses.map((w) => (
              <MenuItem key={w.warehouseID} value={w.warehouseID}>
                {w.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

      {/* <Box display="flex" gap={2} marginTop={2}>
        <FormControl fullWidth>
        <InputLabel id="month-year-label">Month & Year</InputLabel>
        <Select
        label="Month & Year"
        labelId="month-year-label"
        value={monthly}
        onChange={(e) => setMonthly(e.target.value)}
        >
        {lastFourMonths.current.map((option) => (
          <MenuItem key={option.value} value={option.value}>
          {option.label}
          </MenuItem>
          ))}
          </Select>
          </FormControl>
          </Box> */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          width: "100%",
          justifyContent: "center"
        }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
              Start Date
            </Typography>
            <Box className="calendar-input">
              <input
                type="date"
                onClick={(e) => e.target.showPicker()}
                onKeyDown={(e) => e.preventDefault()}
                value={selectedStartDate}
                onChange={(e) => handleDateChange(e, "start")}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
              End Date
            </Typography>
            <Box className="calendar-input">
              <input
                type="date"
                onClick={(e) => e.target.showPicker()}
                onKeyDown={(e) => e.preventDefault()}
                value={selectedEndDate}
                onChange={(e) => handleDateChange(e, "end")}
              />
            </Box>
          </Box>
        </Box>

        <button
          className="button button-large"
          style={{
            backgroundColor: destinationWarehouse === "" ? "#94a3b8" : "#1E3A5F",
            cursor: destinationWarehouse === "" ? "not-allowed" : "pointer",
            color: "white",
            width: "100%",
            maxWidth: "300px",
            padding: "12px 24px",
            marginTop: "16px"
          }}
          disabled={destinationWarehouse === ""}
          onClick={handleOpenModal}
        >
          <FaDownload style={{ marginRight: "8px" }} /> Generate Report
        </button>
      </Box>

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 350,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Close Button (Top Right) */}
          <IconButton
            color="error"
            onClick={handleCloseModal}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close />
          </IconButton>

          {/* Truck Icon */}
          <FaTruck
            style={{
              color: "#1976D2",
              fontSize: "36px",
              marginBottom: "12px",
            }}
          />

          {/* Modal Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#1E3A5F",
            }}
          >
            Download Monthly Report
          </Typography>

          {/* Report Info */}
          <Typography
            sx={{
              marginBottom: "12px",
              color: "#374151",
              fontSize: "15px",
            }}
          >
            <strong>Station:</strong>{" "}
            {warehouses.find((w) => w.warehouseID === destinationWarehouse)
              ?.name || ""}
          </Typography>
          <Typography
            sx={{
              marginBottom: "12px",
              color: "#374151",
              fontSize: "15px",
            }}
          >
            <strong>Date Range:</strong>
            {` ${formatDate(selectedStartDate, 'show')} to ${formatDate(selectedEndDate, 'show')}`}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <Button
              variant="contained"
              sx={{ backgroundColor: "#1976D2" }}
              startIcon={<FaDownload />}
              href={`${BASE_URL}/api/ledger/generate-excel/${destinationWarehouse}/${formatDate(
                selectedStartDate
              )}-${formatDate(selectedEndDate)}`}
              // href={`${BASE_URL}/api/ledger/generate-excel/${destinationWarehouse}/${formatDate(monthly)}`}
              target="_blank"
              onClick={() => setModalOpen(false)}
            >
              Confirm Download
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
