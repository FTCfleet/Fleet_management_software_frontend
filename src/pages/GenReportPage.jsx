import { React, useState } from "react";
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
} from "@mui/material";
import { FaDownload, FaTimesCircle, FaTruck } from "react-icons/fa";
import { Close, ConstructionOutlined } from "@mui/icons-material";
import "react-calendar/dist/Calendar.css";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import "../css/main.css";
import "../css/calendar.css";

export default function GenReportPage() {
  const [dateRange, setDateRange] = useState("custom");
  const [truckNo, setTruckNo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthly, setMonthly] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [sDate, setSDate] = useState("");
  const [eDate, setEDate] = useState("");

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleMonthAndYearChange = (newVal) => {
    const newMonth = newVal.split("-")[0];
    const newYear = newVal.split("-")[1];
    const today = new Date();
    setMonthly(newVal);
    const start = `01${newMonth.toString().padStart(2, "0")}${newYear}`;
    today.setHours(23, 59, 59, 999);
    let lastDay = new Date(newYear, newMonth, 0);
    console.log(today);
    console.log(lastDay);
    console.log(lastDay.getMonth(), today.getMonth());
    let t = today.getDate();
    if (lastDay.getMonth() === today.getMonth() && t < lastDay.getDate()) {
      lastDay = t;
    } else {
      lastDay = lastDay.getDate();
    }

    const end = `${lastDay}${newMonth.toString().padStart(2, "0")}${newYear}`;
    setStartDate(start);
    setEndDate(end);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const getLastFourMonths = () => {
    const today = new Date();
    const months = [];

    for (let i = 3; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        label: date.toLocaleString("default", { month: "long", year: "numeric" }),
        value: `${date.getMonth() + 1}-${date.getFullYear()}`,
      });
    }

    return months;
  };

  const lastFourMonths = getLastFourMonths();

  const handleDateChange = (type, value) => {
    if (!value) return;

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const earlyDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    earlyDate.setHours(0, 0, 0, 0);
    console.log(earlyDate);
    if (type === "start") {
      if (selectedDate < earlyDate) {
        alert("Start date cannot be earlier than the last 4 months.");
        return;
      }
      if (selectedDate > today) {
        alert("Start date cannot be in the future.");
        return;
      }
      if (eDate && selectedDate > new Date(eDate)) {
        alert("Start date cannot be later than the selected end date.");
        return;
      }
      setSDate(value);
      setStartDate(formatDate(value));
    } else if (type === "end") {
      if (selectedDate < earlyDate) {
        alert("End date cannot be earlier than the last 4 months.");
        return;
      }
      if (selectedDate > today) {
        alert("End date cannot be in the future.");
        return;
      }
      if (sDate && selectedDate < new Date(sDate)) {
        alert("End date cannot be earlier than the selected start date.");
        return;
      }
      setEDate(value);
      setEndDate(formatDate(value));
    }
  };


  const handleDateRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setDateRange(newRange);
      switch (newRange) {
        case "today":
          const today = new Date();
          const formattedToday = `${today.getDate().toString().padStart(2, "0")}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getFullYear()}`;
          setStartDate(formattedToday);
          setEndDate(formattedToday);
          break;
        case "weekly":
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - 6);
          setStartDate(`${start.getDate().toString().padStart(2, "0")}${(start.getMonth() + 1).toString().padStart(2, "0")}${start.getFullYear()}`);
          setEndDate(`${end.getDate().toString().padStart(2, "0")}${(end.getMonth() + 1).toString().padStart(2, "0")}${end.getFullYear()}`);
          break;
        case "monthly":
          handleMonthAndYearChange(lastFourMonths[3].value);
          break;
        case "custom":
          setSDate("");
          setEDate("");
          setStartDate("");
          setEndDate("");
          break;
        default:
          break;
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 5 }}>
      <Typography variant="h4" sx={{ color: "#1E3A5F", fontWeight: "bold", textAlign: "center" }}>
        Ledger Generation
      </Typography>
      <TextField
        label="Truck Number"
        variant="outlined"
        fullWidth
        margin="normal"
        value={truckNo}
        placeholder="Enter truck no."
        onChange={(e) => setTruckNo(e.target.value)}
      />
      <ToggleButtonGroup
        value={dateRange}
        exclusive
        onChange={handleDateRangeChange}
        aria-label="date range"
        sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}
      >
        <ToggleButton value="today">Today</ToggleButton>
        <ToggleButton value="weekly">Weekly</ToggleButton>
        <ToggleButton value="monthly">Monthly</ToggleButton>
        <ToggleButton value="custom">Custom</ToggleButton>
      </ToggleButtonGroup>

      {dateRange === "monthly" && (
        <Box display="flex" gap={2} marginTop={2}>
          <FormControl fullWidth>
            <InputLabel id="month-year-label">Month & Year</InputLabel>
            <Select
              label="Month & Year"
              labelId="month-year-label"
              value={monthly}
              onChange={(e) => handleMonthAndYearChange(e.target.value)}
            >
              {lastFourMonths.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {dateRange === "custom" && (
        <Box display="flex" justifyContent="center" gap={2} marginTop={2}>
          <Box className="calendar-input">
            <input
              type="date"
              onClick={(e) => e.target.showPicker()}
              onKeyDown={(e) => e.preventDefault()}
              value = {sDate}
              onChange={(e) => handleDateChange("start", e.target.value)}
            />
          </Box>
          <Box className="calendar-input">
            <input
              type="date"
              onClick={(e) => e.target.showPicker()}
              onKeyDown={(e) => e.preventDefault()}
              value ={eDate}
              onChange={(e) => handleDateChange("end", e.target.value)}
            />
          </Box>
        </Box>
      )}


      <button className="button button-large"
        style={{
          backgroundColor: !startDate || !endDate ? "#B0B0B0" : "",
          cursor: !startDate || !endDate ? "not-allowed" : "pointer",
          color: "white",
        }}
        disabled={!startDate || !endDate}
        onClick={handleOpenModal}>
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

          {/* Perform calculations inside the modal */}
          {(() => {
            const formatDate = (date) => {
              return date ? `${date.substring(0, 2)}-${date.substring(2, 4)}-${date.substring(4)}` : "";
            };
            const formatDateUrl = (date) => {
              return date ? `${date.substring(4)}${date.substring(2, 4)}${date.substring(0,2)}` : "";
            };

            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);
            const truckLabel = truckNo ? `Vehicle No: ${truckNo}` : "All Trucks";
            const downloadUrl = `${BASE_URL}/api/ledger/generate-excel/${formatDateUrl(startDate)}${formatDateUrl(endDate)}${truckNo ? `?vehicleNo=${truckNo}` : ""}`;

            return (
              <>
                {/* Modal Title */}
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "12px", color: "#374151" }}>
                  Download Ledger Report
                </Typography>

                {/* Report Info */}
                <Typography sx={{ marginBottom: "12px", color: "#374151", fontSize: "15px" }}>
                  <strong>Start Date:</strong> {formattedStartDate}
                </Typography>
                <Typography sx={{ marginBottom: "12px", color: "#374151", fontSize: "15px" }}>
                  <strong>End Date:</strong> {formattedEndDate}
                </Typography>
                <Typography sx={{ marginBottom: "20px", color: "#374151", fontSize: "15px" }}>
                  <strong>{truckLabel}</strong>
                </Typography>



                <Box sx={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#1976D2" }}
                    startIcon={<FaDownload />}
                    href={downloadUrl}
                  >
                    Confirm Download
                  </Button>
                </Box>
              </>
            );
          })()}
        </Box>
      </Modal>

    </Box>
  );
}
