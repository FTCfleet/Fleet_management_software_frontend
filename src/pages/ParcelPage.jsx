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
import "../css/table.css"; // Import CSS

const ParcelPage = () => {
  const { type } = useParams(); // Retrieve the type (all, dispatched, etc.) from the URL
  const [orders, setOrders] = useState([]); // All orders
  const [filteredOrders, setFilteredOrders] = useState([]); // Orders filtered by date or type
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]); // Default to today
  
  useEffect(() => {
    
    // Mock data for orders
    const mockOrders = [
        { id: 1, sender: "PIN:560001, Bengaluru", receiver: "PIN:110001, Delhi", status: "Delivered", package: 40, date: "2025-01-15" },
        { id: 2, sender: "PIN:560002, Bengaluru", receiver: "PIN:400001, Mumbai", status: "Dispatched", package: 25, date: "2025-01-14" },
        { id: 3, sender: "PIN:500001, Hyderabad", receiver: "PIN:600001, Chennai", status: "Arrived", package: 30, date: "2025-01-15" },
        { id: 4, sender: "PIN:400001, Mumbai", receiver: "PIN:110001, Delhi", status: "Delivered", package: 45, date: "2025-01-13" },
        { id: 5, sender: "PIN:700001, Kolkata", receiver: "PIN:110002, Delhi", status: "In Transit", package: 35, date: "2025-01-14" },
        { id: 6, sender: "PIN:110001, Delhi", receiver: "PIN:500001, Hyderabad", status: "Dispatched", package: 50, date: "2025-01-15" },
        { id: 7, sender: "PIN:600001, Chennai", receiver: "PIN:700001, Kolkata", status: "Delivered", package: 20, date: "2025-01-13" },
        { id: 8, sender: "PIN:23146, Hazaribagh", receiver: "PIN:23146, Hazaribagh", status: "Dispatched", package: 40, date: "2025-01-14" },
        { id: 9, sender: "PIN:500081, Hyderabad", receiver: "PIN:600113, Chennai", status: "Arrived", package: 60, date: "2025-01-15" },
        { id: 10, sender: "PIN:560078, Bengaluru", receiver: "PIN:700091, Kolkata", status: "Delivered", package: 55, date: "2025-01-15" },
        { id: 11, sender: "PIN:400089, Mumbai", receiver: "PIN:560097, Bengaluru", status: "In Transit", package: 45, date: "2025-01-16" },
        { id: 12, sender: "PIN:110094, Delhi", receiver: "PIN:700004, Kolkata", status: "Dispatched", package: 65, date: "2025-01-17" },
      ];

    setOrders(mockOrders);
    filterOrdersByTypeAndDate(type, selectedDate, mockOrders);
  }, [type]);

  const filterOrdersByTypeAndDate = (type, date, allOrders = orders) => {
    const filteredByDate = allOrders.filter((order) => order.date === date);
    if (type === "all") {
      setFilteredOrders(filteredByDate);
    } else {
      setFilteredOrders(filteredByDate.filter((order) => order.status.toLowerCase() === type));
    }
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    filterOrdersByTypeAndDate(type, date);
  };

  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filteredBySearch = filteredOrders.filter(
      (order) =>
        order.sender.toLowerCase().includes(term) ||
        order.receiver.toLowerCase().includes(term) ||
        order.id.toString().includes(term)
    );
    setFilteredOrders(filteredBySearch);
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
        {type.charAt(0).toUpperCase() + type.slice(1)} Orders
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
            placeholder="Search orders..."
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

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Order ID</TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Sender's Address</TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Receiver's Address</TableCell>
              {type === "all" && <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Status</TableCell>}
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Package</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell sx={{ color: "#25344E" }}>{order.id}</TableCell>
                  <TableCell sx={{ color: "#25344E" }}>{order.sender}</TableCell>
                  <TableCell sx={{ color: "#25344E" }}>{order.receiver}</TableCell>
                  {type === "all" && (
                    <TableCell>
                      <span className={`table-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </TableCell>
                  )}
                  <TableCell sx={{ color: "#25344E" }}>{order.package}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={type === "all" ? 5 : 4} align="center" sx={{ color: "#7D8695" }}>
                  No orders found for the selected date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ParcelPage;
