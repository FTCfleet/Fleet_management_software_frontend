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

export default function GenReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [monthly, setMonthly] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const lastFourMonths = useRef([]);

  const handleOpenModal = () => setModalOpen(true);
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


  const formatDate = (dateString) => {
    const newMonth = dateString.split("-")[0];
    const newYear = dateString.split("-")[1];
    return `${newYear}${newMonth.toString().padStart(2, "0")}`;
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
      <Typography color="black" fontSize={25}>Loading...</Typography>
    </div>
  ) : (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 5 }}>
      <Typography
        variant="h4"
        sx={{
          color: "#1E3A5F",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Memo Generation
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Select Warehouse</InputLabel>
        <Select
          label="Select Warehouse"
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

      <Box display="flex" gap={2} marginTop={2}>
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
      </Box>

      <button
        className="button button-large"
        style={{
          backgroundColor: destinationWarehouse === "" || monthly === "" ? "grey" : "",
          cursor: destinationWarehouse === "" || monthly === ""? "not-allowed" : "pointer",
          color: "white",
        }}
        disabled={destinationWarehouse === "" || monthly === ""}
        onClick={handleOpenModal}
      >
        <FaDownload /> Download
      </button>

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
              color: "#374151",
            }}
          >
            Download Memo Report
          </Typography>

          {/* Report Info */}
          <Typography
            sx={{
              marginBottom: "12px",
              color: "#374151",
              fontSize: "15px",
            }}
          >
            <strong>Warehouse:</strong> {warehouses.find(w => w.warehouseID === destinationWarehouse)?.name || ''}
          </Typography>
          <Typography
            sx={{
              marginBottom: "12px",
              color: "#374151",
              fontSize: "15px",
            }}
          >
            <strong>Month Date:</strong> {lastFourMonths.current.find(m => m.value === monthly)?.label || ''}
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
                monthly
              )}`}
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
