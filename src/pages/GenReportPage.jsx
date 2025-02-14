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
  Popover,
} from "@mui/material";
import { Link } from "react-router-dom";
import { FaDownload, FaCalendarAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import "../css/main.css";
import "../css/calendar.css";

export default function GenReportPage() {
  const [dateRange, setDateRange] = useState("custom");
  const [truckNo, setTruckNo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [activeField, setActiveField] = useState(null);

  const handleMonthAndYearChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
    const start = `01${newMonth.toString().padStart(2, "0")}${newYear}`;
    const lastDay = new Date(newYear, newMonth, 0).getDate();
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
          handleMonthAndYearChange(new Date().getMonth() + 1, new Date().getFullYear());
          break;
        case "custom":
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
            <InputLabel id="month-label">Month</InputLabel>
            <Select
              label="Month"
              labelId="month-label"
              value={month}
              onChange={(e) => handleMonthAndYearChange(e.target.value, year)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="year-label">Year</InputLabel>
            <Select
              label="Year"
              labelId="year-label"
              value={year}
              onChange={(e) => handleMonthAndYearChange(month, e.target.value)}
            >
              {Array.from({ length: new Date().getFullYear() - 1999 + 1 }, (_, i) => (
                <MenuItem key={1999 + i} value={1999 + i}>
                  {1999 + i}
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
              onChange={(e) => setStartDate(formatDate(e.target.value))}
            />
          </Box>
          <Box className="calendar-input">
            <input
              type="date"
              onChange={(e) => setEndDate(formatDate(e.target.value))}
            />
          </Box>
        </Box>
      )}

      <Link
        to={`${BASE_URL}/api/ledger/generate-report/${startDate}${endDate}${truckNo ? `?vehicleNo=${truckNo}` : ""
          }`}
        style={{ textDecoration: "none" }}
      >
        <button className="button button-large" disabled={!startDate || !endDate}>
          <FaDownload /> Download
        </button>
      </Link>
    </Box>
  );
}
