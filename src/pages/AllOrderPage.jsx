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
import "../css/calendar.css"; // Import Calendar CSS
import { IoArrowForwardCircleOutline } from "react-icons/io5"; // Icon for View Ledger
import { useAuth } from "../routes/AuthContext"

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AllOrderPage = () => {
  const { type } = useParams(); // Retrieve the type (all, dispatched, etc.) from the URL
  const [orders, setOrders] = useState([]); // All orders
  const [filteredOrders, setFilteredOrders] = useState([]); // Orders filtered by date or type
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const { isSource, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    filterOrdersByTypeAndDate(type);
  }, [type, orders]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/parcel/all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      console.log(data);
      if (!data.flag){
        alert("Please login first");
        return;
      }
      setOrders(data.body);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const filterOrdersByTypeAndDate = (type) => {
    if (type === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === type));
    }
  };

  const handleDateChange = (event) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const newDate = new Date(event.target.value);
    if (newDate <= today) {
      const date = newDate.toISOString().split("T")[0];
      setSelectedDate(date);
      filterOrdersByTypeAndDate(type);
    }
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
        <Box className="calendar-input">
          <input
            type="date"
            onFocus={(e) => e.target.showPicker()}
            onKeyDown={(e) => e.preventDefault()}
            value={selectedDate}
            onChange={handleDateChange}
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
            placeholder="Search orders..."
            fullWidth
            value={searchTerm}
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
              <TableCell className="table-header">Order ID</TableCell>
              <TableCell className="table-header">{"Sender's\nName"}</TableCell>
              <TableCell className="table-header">
                {"Receiver's\nName"}
              </TableCell>
              {isAdmin ? 
              (<>
              <TableCell className="table-header">
                {("Source") + "\n" + "Warehouse"}
              </TableCell>
              <TableCell className="table-header">
                {("Destination") + "\n" + "Warehouse"}
              </TableCell>
              </>) : 
              <TableCell className="table-header">
                {(isSource ? "Destination" : "Source") + "\n" + "Warehouse"}
              </TableCell>}
              <TableCell className="table-header">Status</TableCell>
              <TableCell className="table-header">View Order</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.trackingId}>
                  <TableCell sx={{ color: "#25344E" }}>
                    {order.trackingId}
                  </TableCell>
                  <TableCell sx={{ color: "#25344E" }}>
                    {order.sender.name? order.sender.name : "NA" }
                  </TableCell>
                  <TableCell sx={{ color: "#25344E" }}>
                    {order.receiver.name? order.receiver.name : "NA" }
                  </TableCell>

                  {isAdmin ? (<>
                  <TableCell sx={{ color: "#25344E" }}>
                    {order.sourceWarehouse.warehouseID}
                  </TableCell>
                  <TableCell sx={{ color: "#25344E" }}>
                    {order.destinationWarehouse.warehouseID}
                  </TableCell>
                  </>)
                    : (<TableCell sx={{ color: "#25344E" }}>
                      {isSource ? order.destinationWarehouse.warehouseID : order.sourceWarehouse.warehouseID}
                    </TableCell>)}
                  <TableCell>
                    <span className={`table-status ${order.status}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        color: "#1E3A5F",
                        borderColor: "#1E3A5F",
                      }}
                      onClick={() =>
                        navigate(`/user/view/order/${order.trackingId}`)
                      }
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