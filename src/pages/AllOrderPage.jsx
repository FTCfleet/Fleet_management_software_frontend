import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import "../css/table.css";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import { getDate } from "../utils/dateFormatter";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";

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
  const { isDarkMode, colors } = useOutletContext() || {};

  const cellStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: 600, fontSize: "0.85rem" };
  const rowCellStyle = { color: colors?.textSecondary || "#25344E", fontSize: "0.9rem" };

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
    const searchTerm = nameFilter.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.sender.name.toLowerCase().includes(searchTerm) ||
          order.receiver.name.toLowerCase().includes(searchTerm) ||
          order.trackingId.toLowerCase().includes(searchTerm)
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

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
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
      <Card sx={{ 
        mb: 1.5, 
        borderRadius: 2, 
        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
        backgroundColor: colors?.bgCard || "#ffffff",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
      }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", fontSize: "0.95rem" }}>
                {order.trackingId}
              </Typography>
              <Chip
                label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                size="small"
                sx={{ mt: 0.5, backgroundColor: statusColor.bg, color: statusColor.color, fontWeight: 600, fontSize: "0.75rem" }}
              />
            </Box>
            <IconButton sx={{ color: isDarkMode ? "#FFB74D" : "primary.main" }} onClick={() => navigate(`/user/view/order/${order.trackingId}`)}>
              <IoArrowForwardCircleOutline size={28} />
            </IconButton>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, fontSize: "0.85rem" }}>
            <Box>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>Sender</Typography>
              <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500 }}>{order.sender.name}</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>Receiver</Typography>
              <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500 }}>{order.receiver.name}</Typography>
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>
                {isAdmin ? "Route" : isSource ? "Destination" : "Source"}
              </Typography>
              <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500 }}>
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
    <Box sx={{ backgroundColor: colors?.bgPrimary || "#f8fafc", minHeight: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2, color: colors?.textPrimary || "#1E3A5F", fontWeight: 700 }}>
        {type.charAt(0).toUpperCase() + type.slice(1)} LRs
      </Typography>

      {/* Filters */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={nameFilter}
        onSearchChange={setNameFilter}
        searchPlaceholder="Search by ID/Name"
        onApply={applyFilter}
        onClear={clearFilter}
        isLoading={isLoading}
        showDatePicker={true}
        dateValue={selectedDate}
        onDateChange={handleDateChange}
        showDropdown={true}
        dropdownValue={warehouseFilter}
        onDropdownChange={setWarehouseFilter}
        dropdownOptions={warehouses.map(w => ({ value: w.name, label: w.name }))}
        dropdownPlaceholder="All Warehouses"
      />

      {/* Content */}
      {isMobile ? (
        // Mobile Card View
        <Box>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <ModernSpinner size={40} />
            </Box>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => <MobileOrderCard key={order.trackingId} order={order} idx={idx} />)
          ) : (
            <Box sx={{ textAlign: "center", py: 4, color: colors?.textSecondary || "#64748b" }}>No orders found for the selected date.</Box>
          )}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer component={Paper} sx={{ 
          borderRadius: 2, 
          boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
          backgroundColor: colors?.bgCard || "#ffffff",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
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
                    <ModernSpinner size={28} />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <TableRow key={order.trackingId} hover>
                    <TableCell sx={rowCellStyle}>{idx + 1}</TableCell>
                    <TableCell sx={{ ...rowCellStyle, fontWeight: 600 }}>{highlightMatch(order.trackingId, nameFilter, isDarkMode)}</TableCell>
                    <TableCell sx={rowCellStyle}>{highlightMatch(order.sender.name, nameFilter, isDarkMode)}</TableCell>
                    <TableCell sx={rowCellStyle}>{highlightMatch(order.receiver.name, nameFilter, isDarkMode)}</TableCell>
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
                  <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 4, color: colors?.textSecondary || "#64748b" }}>
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
