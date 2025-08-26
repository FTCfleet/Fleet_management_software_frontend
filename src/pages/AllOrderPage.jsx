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
  MenuItem,
  Select,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import "../css/table.css";
import "../css/calendar.css";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AllOrderPage = () => {
  const { type } = useParams();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [warehouses, setWarehouses] = useState([]);
  const { isSource, isAdmin } = useAuth();
  const [nameFilter, setNameFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const navigate = useNavigate();
  const cellStyle = {
    color: "#1E3A5F",
    fontWeight: "bold",
    textAlign: "center",
  };
  const rowCellStyle = {
    color: "#25344E",
    textAlign: "center",
    justifyContent: "center",
  };
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    filterOrdersByTypeAndDate(type);
  }, [type, orders]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/get-all-warehouses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data2 = await res.json();
    setWarehouses(
      data2.body.filter(
        (warehouse) => warehouse.isSource !== isSource || isAdmin
      )
    );
  };

  const fetchData = async () => {
    setIsLoading(true);
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
      alert("Error fetching orders:", error);
    }
    setIsLoading(false);
  };

  const filterOrdersByTypeAndDate = (type) => {
    if (type === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === type));
    }
  };

  const applyFilter = () => {
    let filtered = orders.filter(
      (order) => order.status === type || type === "all"
    );
    if (nameFilter) {
      filtered = filtered.filter(
        (order) =>
          order.sender.name
            .toLowerCase()
            .startsWith(nameFilter.toLowerCase()) ||
          order.receiver.name.toLowerCase().startsWith(nameFilter.toLowerCase()) || 
          order.trackingId.startsWith(nameFilter)
      );
    }

    if (warehouseFilter) {
      filtered = filtered.filter(
        (order) =>
          order.sourceWarehouse.name === warehouseFilter ||
          order.destinationWarehouse.name === warehouseFilter
      );
    }
    setFilteredOrders(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setWarehouseFilter("");
    let filtered = orders.filter(
      (order) => order.status === type || type === "all"
    );
    setFilteredOrders(filtered);
  };

  const handleDateChange = (event) => {
    setIsLoading(true);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const newDate = new Date(event.target.value);
    if (newDate <= today) {
      const date = newDate.toISOString().split("T")[0];
      setSelectedDate(date);
      filterOrdersByTypeAndDate(type);
    }
    setIsLoading(false);
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
            onClick={(e) => e.target.showPicker()}
            onKeyDown={(e) => e.preventDefault()}
            value={selectedDate}
            onChange={handleDateChange}
            disabled={isLoading}
          />
        </Box>
        <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <TextField
            label="Search by ID/Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            displayEmpty
            size="small"
            sx={{ minWidth: "250px" }}
          >
            <MenuItem value="">All Warehouses</MenuItem>
            {warehouses.map((warehouse) => (
              <MenuItem key={warehouse.name} value={warehouse.name}>
                {warehouse.name}
              </MenuItem>
            ))}
          </Select>
          <Button variant="contained" color="primary" onClick={applyFilter} disabled={isLoading}>
            Apply
          </Button>
          <Button variant="outlined" color="secondary" onClick={clearFilter} disabled={isLoading}>
            Clear
          </Button>
        </Box>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={cellStyle}>Sl No</TableCell>
              <TableCell sx={cellStyle}>Order ID</TableCell>
              <TableCell sx={cellStyle}>{"Sender's\nName"}</TableCell>
              <TableCell sx={cellStyle}>{"Receiver's Name"}</TableCell>
              {isAdmin ? (
                <>
                  <TableCell sx={cellStyle}>
                    {"Source" + "\n" + "Warehouse"}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {"Destination" + "\n" + "Warehouse"}
                  </TableCell>
                </>
              ) : (
                <TableCell sx={cellStyle}>
                  {(isSource ? "Destination" : "Source") + "\n" + "Warehouse"}
                </TableCell>
              )}
              <TableCell sx={cellStyle}>Status</TableCell>
              <TableCell sx={cellStyle}>View Order</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress
                    size={22}
                    className="spinner"
                    sx={{ color: "#1E3A5F", animation: "none !important" }}
                  />
                </TableCell>
              </TableRow>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order, idx) => (
                <TableRow key={order.trackingId}>
                  <TableCell sx={rowCellStyle}>{idx + 1}.</TableCell>
                  <TableCell sx={rowCellStyle}>{order.trackingId}</TableCell>
                  <TableCell sx={rowCellStyle}>{order.sender.name}</TableCell>
                  <TableCell sx={rowCellStyle}>{order.receiver.name}</TableCell>

                  {isAdmin ? (
                    <>
                      <TableCell sx={rowCellStyle}>
                        {order.sourceWarehouse.name}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {order.destinationWarehouse.name}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell sx={rowCellStyle}>
                      {isSource
                        ? order.destinationWarehouse.name
                        : order.sourceWarehouse.name}
                    </TableCell>
                  )}
                  <TableCell sx={rowCellStyle}>
                    <span className={`table-status ${order.status}`}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell sx={rowCellStyle}>
                    <IconButton
                      color="primary"
                      onClick={() =>
                        navigate(`/user/view/order/${order.trackingId}`)
                      }
                    >
                      <IoArrowForwardCircleOutline size={24} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: "#7D8695" }}>
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
