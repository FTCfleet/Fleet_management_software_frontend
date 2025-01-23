import React, { useState } from "react";
import {
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const GenReportPage = () => {
  const [truckNumber, setTruckNumber] = useState("");
  const [mode, setMode] = useState("TODAY");
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleModeChange = (event, newMode) => {
    setMode(newMode);
    const today = dayjs();

    if (newMode === "TODAY") {
      setStartDate(today);
      setEndDate(today);
    } else if (newMode === "WEEKLY") {
      setStartDate(today.subtract(7, "day"));
      setEndDate(today);
    } else if (newMode === "MONTHLY") {
      setStartDate(dayjs().startOf("month"));
      setEndDate(dayjs().endOf("month"));
    }
  };

  const handleMonthYearChange = () => {
    if (month && year) {
      const startOfMonth = dayjs(`${year}-${month}-01`);
      setStartDate(startOfMonth.startOf("month"));
      setEndDate(startOfMonth.endOf("month"));
    }
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <h1>Ledger Generation</h1>
      <TextField
        label="Truck Number"
        variant="outlined"
        value={truckNumber}
        onChange={(e) => setTruckNumber(e.target.value)}
        style={{ marginBottom: "20px", width: "300px" }}
      />
      <div style={{ margin: "20px 0" }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="Date Range Mode"
        >
          <ToggleButton value="TODAY">Today</ToggleButton>
          <ToggleButton value="WEEKLY">Weekly</ToggleButton>
          <ToggleButton value="MONTHLY">Monthly</ToggleButton>
          <ToggleButton value="CUSTOM">Custom</ToggleButton>
        </ToggleButtonGroup>
      </div>
      {mode === "MONTHLY" && (
        <div style={{ marginBottom: "20px" }}>
          <TextField
            select
            label="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ width: "150px", marginRight: "10px" }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {dayjs().month(i).format("MMMM")}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ width: "150px" }}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <MenuItem key={2020 + i} value={2020 + i}>
                {2020 + i}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={handleMonthYearChange}
            style={{ marginLeft: "10px" }}
          >
            Set Date
          </Button>
        </div>
      )}
      {mode !== "MONTHLY" && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div style={{ marginBottom: "20px" }}>
            <DesktopDatePicker
              label="Start Date"
              inputFormat="DD-MM-YYYY"
              value={startDate}
              onChange={(date) => setStartDate(date)}
              disabled={mode !== "CUSTOM"}
              renderInput={(params) => <TextField {...params} />}
              style={{ marginRight: "20px" }}
            />
            <DesktopDatePicker
              label="End Date"
              inputFormat="DD-MM-YYYY"
              value={endDate}
              onChange={(date) => setEndDate(date)}
              disabled={mode !== "CUSTOM"}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
        </LocalizationProvider>
      )}
      <Button
        variant="contained"
        style={{ backgroundColor: "#001F54", color: "#FFF" }}
      >
        Download
      </Button>
    </div>
  );
};

export default GenReportPage;
