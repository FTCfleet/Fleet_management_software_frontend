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
import { IoArrowForwardCircleOutline } from "react-icons/io5"; // Icon for View Ledger
const BASE_URL = import.meta.env.VITE_BASE_URL;


const AllOrderPage = () => {
  const { type } = useParams(); // Retrieve the type (all, dispatched, etc.) from the URL
  const [orders, setOrders] = useState([]); // All orders
  const [filteredOrders, setFilteredOrders] = useState([]); // Orders filtered by date or type
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]); // Default to today
  const navigate = useNavigate();
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

  useEffect(() => {
    console.log(type);
    fetchData().then((data) => {
      setOrders(data);
      filterOrdersByTypeAndDate(type);
    });
  }, []);


  useEffect(() => {
    // Mock data for orders
    filterOrdersByTypeAndDate(type);
    
  }, [type]);

  const fetchData = async () => {
    console.log(selectedDate);
    const response = await fetch(`${BASE_URL}/api/parcel/all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: selectedDate,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      // console.log(data);
       
      return data;
    }
    
    return {};
  };


  const filterOrdersByTypeAndDate = (type) => {
    // const filteredByDate = allOrders.filter((order) => order.date === date);
    if (type === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === type));
    }
    // console.log(filteredOrders);
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    filterOrdersByTypeAndDate(type);
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
            // onChange={handleSearchChange}
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
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Status</TableCell>
              {/* <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Source</TableCell> */}
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>Destination</TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>View Order</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.trackingId}>
                  <TableCell sx={{ color: "#25344E" }}>{order.trackingId}</TableCell>
                  <TableCell sx={{ color: "#25344E" }}>{order.sender.name}</TableCell>
                  <TableCell sx={{ color: "#25344E" }}>{order.receiver.name}</TableCell>
                  <TableCell>
                    <span className={`table-status ${order.status}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell sx={{ color: "#25344E" }}>{order.destinationWarehouseName}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      sx={{ textTransform: "none", color: "#1E3A5F", borderColor: "#1E3A5F" }}
                      onClick={() => navigate(`/user/view/order/${order.trackingId}`)}
                    >
                      <IoArrowForwardCircleOutline size={24} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "#7D8695" }}>
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

export default AllOrderPage;
