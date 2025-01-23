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
import { FaDownload } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
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

  const handleDateRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setDateRange(newRange);
      switch (newRange) {
        case "today":
          const today = new Date().toISOString().split("T")[0];
          setStartDate(today);
          setEndDate(today);
          break;
        case "weekly":
          setStartDate("");
          setEndDate("");
          break;
        case "monthly":
          setMonth(new Date().getMonth() + 1);
          setYear(new Date().getFullYear());
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

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}${month}${year}`;
  };

  const validateFields = () => {
    if (dateRange === "weekly" || dateRange === "custom") {
      return startDate && endDate;
    } else if (dateRange === "monthly") {
      return month && year;
    }
    return true;
  };

  const openCalendar = (event, field) => {
    setActiveField(field);
    setCalendarAnchor(event.currentTarget);
  };

  const closeCalendar = () => {
    setCalendarAnchor(null);
  };

  const handleDateSelect = (date) => {
    const correctedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    if (activeField === "startDate") {
      setStartDate(correctedDate);
      if (dateRange === "weekly") {
        const endDateForWeek = new Date(correctedDate);
        endDateForWeek.setDate(endDateForWeek.getDate() + 6);
        setEndDate(
          endDateForWeek > new Date()
            ? new Date().toISOString().split("T")[0]
            : endDateForWeek.toISOString().split("T")[0]
        );
      }
    } else if (activeField === "endDate") {
      setEndDate(correctedDate);
    }
    closeCalendar();
  };

  const isDateRangeCustom = dateRange === "custom";
  const isDateRangeWeekly = dateRange === "weekly";
  const isDateRangeMonthly = dateRange === "monthly";

  return (
    <div className="app">
      <Box
        sx={{
          maxWidth: 600,
          margin: "0 auto",
          padding: 4,
          borderRadius: 2,
          backgroundColor: "#f9f9f9",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h5" gutterBottom>
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
          sx={{ marginTop: 2 }}
        >
          <ToggleButton value="today" aria-label="Today">
            Today
          </ToggleButton>
          <ToggleButton value="weekly" aria-label="Weekly">
            Weekly
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="Monthly">
            Monthly
          </ToggleButton>
          <ToggleButton value="custom" aria-label="Custom">
            Custom
          </ToggleButton>
        </ToggleButtonGroup>

        {dateRange === "today" && (
          <Typography variant="body2" sx={{ marginTop: 2 }}>
            Start and End Date: {startDate}
          </Typography>
        )}

        {isDateRangeWeekly && (
          <Box marginTop={2} display="flex" gap={2}>
            <TextField
              label="Start Date"
              value={startDate || "dd-mm-yyyy"}
              onClick={(e) => openCalendar(e, "startDate")}
              sx={{ flex: 1, cursor: "pointer" }}
            />
            <Popover
              open={Boolean(calendarAnchor && activeField === "startDate")}
              anchorEl={calendarAnchor}
              onClose={closeCalendar}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Calendar
                onChange={handleDateSelect}
                maxDate={new Date()}
                className="custom-calendar"
              />
            </Popover>
          </Box>
        )}

        {isDateRangeMonthly && (
          <Box display="flex" gap={2} marginTop={2}>
            <FormControl fullWidth>
              <InputLabel id="month-label">Month</InputLabel>
              <Select
                labelId="month-label"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
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
                labelId="year-label"
                value={year}
                onChange={(e) => setYear(e.target.value)}
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

        {isDateRangeCustom && (
          <Box marginTop={2} display="flex" gap={2}>
            <TextField
              label="Start Date"
              value={startDate || "dd-mm-yyyy"}
              onClick={(e) => openCalendar(e, "startDate")}
              sx={{ flex: 1, cursor: "pointer" }}
            />
            <Popover
              open={Boolean(calendarAnchor && activeField === "startDate")}
              anchorEl={calendarAnchor}
              onClose={closeCalendar}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Calendar
                onChange={handleDateSelect}
                maxDate={new Date()}
                className="custom-calendar"
              />
            </Popover>
            <TextField
              label="End Date"
              value={endDate || "dd-mm-yyyy"}
              onClick={(e) => openCalendar(e, "endDate")}
              sx={{ flex: 1, cursor: "pointer" }}
            />
            <Popover
              open={Boolean(calendarAnchor && activeField === "endDate")}
              anchorEl={calendarAnchor}
              onClose={closeCalendar}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Calendar
                onChange={handleDateSelect}
                maxDate={new Date()}
                className="custom-calendar"
              />
            </Popover>
          </Box>
        )}

        <Link
          to={`${BASE_URL}/api/ledger/generate-report/${formatDate(startDate)}${formatDate(endDate)}` +
            (truckNo ? `?vehicleNo=${truckNo}` : "")}
        >
          <div className="button-wrapper">
            <button
              className="button"
              color="primary"
              disabled={!validateFields()}
            >
              <FaDownload style={{ marginRight: "8px" }} />
              Download
            </button>
          </div>
        </Link>
      </Box>
    </div>
  );
}
