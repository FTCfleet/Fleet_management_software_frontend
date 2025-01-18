import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { AiOutlineCalendar } from "react-icons/ai";
import { IoArrowForwardCircleOutline } from "react-icons/io5"; // Icon for View Ledger
import "../css/table.css"; // Import CSS

const LedgerPage = () => {
  const { type } = useParams(); // Retrieve the type (all, outgoing, incoming, etc.) from the URL
  const [ledgerEntries, setLedgerEntries] = useState([]); // All ledger entries
  const [filteredLedger, setFilteredLedger] = useState([]); // Filtered ledger entries
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]); // Default to today
  const navigate = useNavigate();
  
  useEffect(() => {

    // Mock data for ledger entries
    const mockLedgerEntries = [
      { id: 1, vehicleNo: "KA-01-AB-1234", deliveryStation: "Station A", status: "Completed", date: "2025-01-15" },
      { id: 2, vehicleNo: "KA-02-CD-5678", deliveryStation: "Station B", status: "Pending", date: "2025-01-14" },
      { id: 3, vehicleNo: "KA-03-EF-9876", deliveryStation: "Station C", status: "Completed", date: "2025-01-15" },
      { id: 4, vehicleNo: "KA-04-GH-6543", deliveryStation: "Station D", status: "Pending", date: "2025-01-13" },
      { id: 5, vehicleNo: "KA-05-IJ-3210", deliveryStation: "Station E", status: "Completed", date: "2025-01-14" },
      { id: 6, vehicleNo: "KA-06-KL-4321", deliveryStation: "Station F", status: "Completed", date: "2025-01-15" },
      { id: 7, vehicleNo: "KA-07-MN-6789", deliveryStation: "Station G", status: "Pending", date: "2025-01-15" },
      { id: 8, vehicleNo: "KA-08-OP-2345", deliveryStation: "Station H", status: "Outgoing", date: "2025-01-14" },
      { id: 9, vehicleNo: "KA-09-QR-8765", deliveryStation: "Station I", status: "Incoming", date: "2025-01-13" },
    ];

    setLedgerEntries(mockLedgerEntries);
    filterLedgerByTypeAndDate(type, selectedDate, mockLedgerEntries);
  }, [type]);

  const filterLedgerByTypeAndDate = (type, date, allEntries = ledgerEntries) => {
    const filteredByDate = allEntries.filter((entry) => entry.date === date);
    if (type === "all") {
      setFilteredLedger(filteredByDate);
    } else {
      setFilteredLedger(filteredByDate.filter((entry) => entry.status.toLowerCase() === type));
    }
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    filterLedgerByTypeAndDate(type, date);
  };

  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filteredBySearch = filteredLedger.filter(
      (entry) =>
        entry.vehicleNo.toLowerCase().includes(term) ||
        entry.deliveryStation.toLowerCase().includes(term) ||
        entry.id.toString().includes(term)
    );
    setFilteredLedger(filteredBySearch);
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          marginBottom: "20px",
          color: "#1E3A5F",
          fontWeight: "bold",
        }}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)} Ledger
      </Typography>

      {/* Filters: Date and Search */}
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AiOutlineCalendar size={24} color="#82ACC2" />
          <TextField
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "5px",
              "& .MuiInputBase-input": {
                color: "#25344E",
              },
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1 }}>
          <FiSearch size={24} color="#82ACC2" />
          <TextField
            placeholder="Search ledger entries..."
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "5px",
              "& .MuiInputBase-input": {
                color: "#25344E",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#7D8695",
              },
            }}
          />
        </Box>
      </Box>

      {/* Ledger Entries Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Ledger No</TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Vehicle No</TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Delivery Station</TableCell>
              {type === "all" && <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Status</TableCell>}
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>View Ledger</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLedger.length > 0 ? (
              filteredLedger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell sx={{ color: "#25344E" }}>{entry.id}</TableCell>
                  <TableCell sx={{ color: "#25344E" }}>{entry.vehicleNo}</TableCell>
                  <TableCell sx={{ color: "#25344E" }}>{entry.deliveryStation}</TableCell>
                  {type === "all" && (
                    <TableCell>
                      <span className={`table-status ${entry.status.toLowerCase()}`}>{entry.status}</span>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="outlined"
                      sx={{ textTransform: "none", color: "#1E3A5F", borderColor: "#1E3A5F" }}
                      onClick={() => navigate(`/user/view/ledger/${entry.id}`)}
                    >
                      <IoArrowForwardCircleOutline size={24} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={type === "all" ? 5 : 4} align="center" sx={{ color: "#7D8695" }}>
                  No ledger entries found for the selected date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LedgerPage;
