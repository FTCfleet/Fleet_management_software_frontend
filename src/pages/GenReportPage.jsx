import { React, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {Link} from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function GenReportPage() {
  const [dateRange, setDateRange] = useState("");
  const [truckNo, setTruckNo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startDateFormatted, setStartDateFormatted] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endDateFormatted, setEndDateFormatted] = useState("");
  const handleDateRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setDateRange(newRange);
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}${month}${year}`;
  };

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

        <Box display="flex" gap={2} marginTop={2}>
          <TextField
            label="Start Date"
            type="date"
            variant="outlined"
            fullWidth
            value={startDate}
            onChange={(e) => {setStartDate(e.target.value); setStartDateFormatted(formatDate(e.target.value))}}
            InputLabelProps={{
              shrink: true,
            }}
            />

          <TextField
            label="End Date"
            type="date"
            variant="outlined"
            fullWidth
            value={endDate}
            onChange={(e) => {setEndDate(e.target.value); setEndDateFormatted(formatDate(e.target.value))}}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
        
        {/* <ToggleButtonGroup
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
        </ToggleButtonGroup> */}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 3 }}          
        >
          <Link to={`${BASE_URL}/api/ledger/generate-report/${startDateFormatted}${endDateFormatted}` + (truckNo ? `?vehicleNo=${truckNo}` : "")}>
          Download
          </Link>
        </Button>
      </Box>
    </div>
  );
}
