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

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AllLedgerPage = () => {
  const { type } = useParams(); // Retrieve the type (all, outgoing, incoming, etc.) from the URL
  const [ledgerEntries, setLedgerEntries] = useState([]); // All ledger entries
  const [filteredLedger, setFilteredLedger] = useState([]); // Filtered ledger entries
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  ); // Default to today
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    if (ledgerEntries.length > 0) filterLedgersByTypeAndDate(type);
  }, [type, ledgerEntries]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/ledger/track-by-date/${selectedDate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: selectedDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setLedgerEntries(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const filterLedgersByTypeAndDate = (type) => {
    if (type === "all") {
      setFilteredLedger(ledgerEntries);
    } else {
      setFilteredLedger(ledgerEntries.filter((order) => order.status === type));
    }
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    filterLedgersByTypeAndDate(type);
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
    <Box
      sx={{ padding: "20px", backgroundColor: "#ffffff", minHeight: "100vh" }}
    >
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexGrow: 1,
          }}
        >
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
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                Ledger No
              </TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                Vehicle No
              </TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                Delivery Station
              </TableCell>
              {type === "all" && (
                <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                  Status
                </TableCell>
              )}
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                View Ledger
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLedger.length > 0 ? (
              filteredLedger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell sx={{ color: "#25344E" }}>{entry.id}</TableCell>
                  <TableCell sx={{ color: "#25344E" }}>
                    {entry.vehicleNo}
                  </TableCell>
                  <TableCell sx={{ color: "#25344E" }}>
                    {entry.deliveryStation}
                  </TableCell>
                  {type === "all" && (
                    <TableCell>
                      <span
                        className={`table-status ${entry.status.toLowerCase()}`}
                      >
                        {entry.status}
                      </span>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        color: "#1E3A5F",
                        borderColor: "#1E3A5F",
                      }}
                      onClick={() => navigate(`/user/view/ledger/${entry.id}`)}
                    >
                      <IoArrowForwardCircleOutline size={24} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={type === "all" ? 5 : 4}
                  align="center"
                  sx={{ color: "#7D8695" }}
                >
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

export default AllLedgerPage;
