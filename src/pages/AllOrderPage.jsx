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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import "../css/table.css";
import "../css/calendar.css";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import { getDate } from "../utils/dateFormatter";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AllOrderPage = () => {
  const { type } = useParams();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getDate());
  const [warehouses, setWarehouses] = useState([]);
  const { isSource, isAdmin } = useAuth();
  const [nameFilter, setNameFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const cellStyle = { color: "#1E3A5F", fontWeight: 600, fontSize: "0.85rem" };
  const rowCellStyle = { color: "#25344E", fontSize: "0.9rem" };

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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setWarehouses(data.body.filter((w) => w.isSource !== isSource || isAdmin));
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/parcel/all`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: selectedDate }),
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      if (!data.flag) {
        alert("Please login first");
        return;
      }
      setOrders(data.body);
    } catch (error) {
      alert("Error fetching orders");
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
    let filtered = orders.filter((order) => order.status === type || type === "all");
    if (nameFilter) {
      filtered = filtered.filter(
        (order) =>
          order.sender.name.toLowerCase().startsWith(nameFilter.toLowerCase()) ||
          order.receiver.name.toLowerCase().startsWith(nameFilter.toLowerCase()) ||
          order.trackingId.toLowerCase().startsWith(nameFilter.toLowerCase())
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
    filterOrdersByTypeAndDate(type);
  };

  const handleDateChange = (event) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const newDate = new Date(event.target.value);
    if (newDate <= today) {
      setSelectedDate(newDate.toISOString().split("T")[0]);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: { bg: "#dcfce7", color: "#166534" },
      dispatched: { bg: "#fef3c7", color: "#92400e" },
      arrived: { bg: "#dbeafe", color: "#1e40af" },
      pending: { bg: "#fee2e2", color: "#991b1b" },
    };
    return colors[status] || { bg: "#f1f5f9", color: "#475569" };
  };

  // Mobile Card View
  const MobileOrderCard = ({ order, idx }) => {
    const statusColor = getStatusColor(order.status);
    return (
      <Card sx={{ mb: 1.5, borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem" }}>
                {order.trackingId}
              </Typography>
              <Chip
                label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                size="small"
                sx={{ mt: 0.5, backgroundColor: statusColor.bg, color: statusColor.color, fontWeight: 600, fontSize: "0.75rem" }}
              />
            </Box>
            <IconButton color="primary" onClick={() => navigate(`/user/view/order/${order.trackingId}`)}>
              <IoArrowForwardCircleOutline size={28} />
            </IconButton>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, fontSize: "0.85rem" }}>
            <Box>
              <Typography sx={{ color: "#64748b", fontSize: "0.75rem" }}>Sender</Typography>
              <Typography sx={{ color: "#1E3A5F", fontWeight: 500 }}>{order.sender.name}</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: "#64748b", fontSize: "0.75rem" }}>Receiver</Typography>
              <Typography sx={{ color: "#1E3A5F", fontWeight: 500 }}>{order.receiver.name}</Typography>
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                {isAdmin ? "Route" : isSource ? "Destination" : "Source"}
              </Typography>
              <Typography sx={{ color: "#1E3A5F", fontWeight: 500 }}>
                {isAdmin
                  ? `${order.sourceWarehouse.name} → ${order.destinationWarehouse.name}`
                  : isSource
                  ? order.destinationWarehouse.name
                  : order.sourceWarehouse.name}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#1E3A5F", fontWeight: 700 }}>
        {type.charAt(0).toUpperCase() + type.slice(1)} LRs
      </Typography>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
          mb: 2.5,
          p: { xs: 1.5, md: 2 },
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
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
        <TextField
          label="Search by ID/Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: { xs: "100%", md: "200px" } }}
        />
        <Select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: { xs: "100%", md: "200px" } }}
        >
          <MenuItem value="">All Warehouses</MenuItem>
          {warehouses.map((w) => (
            <MenuItem key={w.name} value={w.name}>{w.name}</MenuItem>
          ))}
        </Select>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={applyFilter} disabled={isLoading} sx={{ backgroundColor: "#1E3A5F" }}>
            Apply
          </Button>
          <Button variant="outlined" onClick={clearFilter} disabled={isLoading}>
            Clear
          </Button>
        </Box>
      </Box>

      {/* Content */}
      {isMobile ? (
        // Mobile Card View
        <Box>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#1E3A5F" }} />
            </Box>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => <MobileOrderCard key={order.trackingId} order={order} idx={idx} />)
          ) : (
            <Box sx={{ textAlign: "center", py: 4, color: "#64748b" }}>No orders found for the selected date.</Box>
          )}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={cellStyle}>Sl No</TableCell>
                <TableCell sx={cellStyle}>LR ID</TableCell>
                <TableCell sx={cellStyle}>Sender</TableCell>
                <TableCell sx={cellStyle}>Receiver</TableCell>
                {isAdmin ? (
                  <>
                    <TableCell sx={cellStyle}>Source</TableCell>
                    <TableCell sx={cellStyle}>Destination</TableCell>
                  </>
                ) : (
                  <TableCell sx={cellStyle}>{isSource ? "Destination" : "Source"}</TableCell>
                )}
                <TableCell sx={cellStyle}>Status</TableCell>
                <TableCell sx={cellStyle} align="center">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} sx={{ color: "#1E3A5F" }} />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <TableRow key={order.trackingId} hover>
                    <TableCell sx={rowCellStyle}>{idx + 1}</TableCell>
                    <TableCell sx={{ ...rowCellStyle, fontWeight: 600 }}>{order.trackingId}</TableCell>
                    <TableCell sx={rowCellStyle}>{order.sender.name}</TableCell>
                    <TableCell sx={rowCellStyle}>{order.receiver.name}</TableCell>
                    {isAdmin ? (
                      <>
                        <TableCell sx={rowCellStyle}>{order.sourceWarehouse.name}</TableCell>
                        <TableCell sx={rowCellStyle}>{order.destinationWarehouse.name}</TableCell>
                      </>
                    ) : (
                      <TableCell sx={rowCellStyle}>
                        {isSource ? order.destinationWarehouse.name : order.sourceWarehouse.name}
                      </TableCell>
                    )}
                    <TableCell>
                      <span className={`table-status ${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => navigate(`/user/view/order/${order.trackingId}`)}>
                        <IoArrowForwardCircleOutline size={24} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 4, color: "#64748b" }}>
                    No orders found for the selected date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AllOrderPage;
