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
  const [nameFilter, setNameFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const navigate = useNavigate();
  const cellStyle = { color: "#1E3A5F", fontWeight: "bold", textAlign: "center" };
  const rowCellStyle = { color: "#25344E", textAlign: "center" };

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
      if (!data.flag) {
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
    console.log(filteredOrders);
  };

  const applyFilter = () => {
    let filtered = orders.filter((order) => order.status === type || type === "all");
    console.log(orders);
    console.log(filtered);
    console.log(nameFilter, warehouseFilter);
    // Apply name filter
    if (nameFilter) {
      filtered = filtered.filter(
        (order) =>
          order.sender.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
          order.receiver.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Apply warehouse filter
    if (warehouseFilter) {
      filtered = filtered.filter(
        (order) =>
          order.sourceWarehouse.warehouseID.toLowerCase().includes(warehouseFilter.toLowerCase()) ||
          order.destinationWarehouse.warehouseID.toLowerCase().includes(warehouseFilter.toLowerCase())
      );
    }
    console.log(filtered);
    setFilteredOrders(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setWarehouseFilter("");
    let filtered = orders.filter((order) => order.status === type || type === "all");
    setFilteredOrders(filtered);
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
        <Box sx={{ display: "flex", gap: "10px"}}>
          <TextField
            label="Search by Customer Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            variant="outlined"
            size="small"
          />
          <TextField
            label="Search by Warehouse Code"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button variant="contained" color="primary" onClick={applyFilter}>
            Apply Filter
          </Button>
          <Button variant="outlined" color="secondary" onClick={clearFilter}>
            Clear Filter
          </Button>
        </Box>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={cellStyle}>Order ID</TableCell>
              <TableCell sx={cellStyle}>{"Sender's\nName"}</TableCell>
              <TableCell sx={cellStyle}>
                {"Receiver's Name"}
              </TableCell>
              {isAdmin ?
                (<>
                  <TableCell sx={cellStyle}>
                    {("Source") + "\n" + "Warehouse"}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {("Destination") + "\n" + "Warehouse"}
                  </TableCell>
                </>) :
                <TableCell sx={cellStyle}>
                  {(isSource ? "Destination" : "Source") + "\n" + "Warehouse"}
                </TableCell>}
              <TableCell sx={cellStyle}>Status</TableCell>
              <TableCell sx={cellStyle}>View Order</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.trackingId}>
                  <TableCell sx={rowCellStyle}>
                    {order.trackingId}
                  </TableCell>
                  <TableCell sx={rowCellStyle}>
                    {order.sender.name ? order.sender.name : "NA"}
                  </TableCell>
                  <TableCell sx={rowCellStyle}>
                    {order.receiver.name ? order.receiver.name : "NA"}
                  </TableCell>

                  {isAdmin ? (<>
                    <TableCell sx={rowCellStyle}>
                      {order.sourceWarehouse.warehouseID}
                    </TableCell>
                    <TableCell sx={rowCellStyle}>
                      {order.destinationWarehouse.warehouseID}
                    </TableCell>
                  </>)
                    : (<TableCell sx={rowCellStyle}>
                      {isSource ? order.destinationWarehouse.warehouseID : order.sourceWarehouse.warehouseID}
                    </TableCell>)}
                  <TableCell>
                    <span className={`table-status ${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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