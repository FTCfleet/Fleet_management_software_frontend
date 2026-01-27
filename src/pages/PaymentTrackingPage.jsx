import React, { useState, useEffect, useMemo } from "react";
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
  Checkbox,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa";
import { useAuth } from "../routes/AuthContext";
import { getDate, dateFormatter } from "../utils/dateFormatter";
import { fromDbValue, formatCurrency } from "../utils/currencyUtils";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";
import "../css/table.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const PaymentTrackingPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getDate());
  const [idFilter, setIdFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingPayments, setUpdatingPayments] = useState(new Set());
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isDarkMode, colors } = useOutletContext() || {};
  const { isAdmin, isSource } = useAuth();

  // Redirect source warehouse staff to dashboard
  useEffect(() => {
    if (isSource && !isAdmin) {
      navigate("/user/dashboard");
    }
  }, [isSource, isAdmin, navigate]);

  const cellStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: 600, fontSize: "0.85rem" };
  const rowCellStyle = { color: colors?.textSecondary || "#25344E", fontSize: "0.9rem" };

  // Don't render anything for source warehouse staff (they'll be redirected)
  if (isSource && !isAdmin) {
    return null;
  }

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/payment-tracking?date=${selectedDate}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch payment tracking data");
      const data = await response.json();
      
      if (data.flag) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching payment tracking:", error);
    }
    setIsLoading(false);
  };

  const handlePaymentToggle = async (parcelId, currentStatus) => {
    setUpdatingPayments(prev => new Set(prev).add(parcelId));
    
    try {
      const token = localStorage.getItem("token");
      const endpoint = currentStatus === "To Pay" ? "received" : "topay";
      
      const response = await fetch(`${BASE_URL}/api/payment-tracking/${parcelId}/${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to update payment status");
      const data = await response.json();
      
      console.log("API Response:", data); // Debug log
      
      if (data.flag) {
        // Update local state with the response data
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.trackingId === parcelId
              ? {
                  ...order,
                  paymentTracking: {
                    ...order.paymentTracking,
                    paymentStatus: currentStatus === "To Pay" ? "Payment Received" : "To Pay",
                    receivedBy: endpoint === "received" ? (data.data?.receivedBy || data.receivedBy) : null,
                    receivedAt: endpoint === "received" ? (data.data?.receivedAt || data.receivedAt || new Date().toISOString()) : null,
                  },
                }
              : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
    } finally {
      setUpdatingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(parcelId);
        return newSet;
      });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesId = !idFilter || order.trackingId?.toLowerCase().includes(idFilter.toLowerCase());
      const matchesName = !nameFilter || 
        order.sender?.name?.toLowerCase().includes(nameFilter.toLowerCase()) ||
        order.receiver?.name?.toLowerCase().includes(nameFilter.toLowerCase());
      
      // Payment status filter
      const paymentStatus = order.paymentTracking?.paymentStatus;
      const matchesPaymentStatus = 
        paymentStatusFilter === "all" ||
        (paymentStatusFilter === "paid" && paymentStatus === "Payment Received") ||
        (paymentStatusFilter === "unpaid" && paymentStatus === "To Pay");
      
      return matchesId && matchesName && matchesPaymentStatus;
    });
  }, [orders, idFilter, nameFilter, paymentStatusFilter]);

  const applyFilter = () => {
    // Filters are applied in real-time via useMemo
  };

  const clearFilter = () => {
    setIdFilter("");
    setNameFilter("");
    setPaymentStatusFilter("all");
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const getPaymentStatusColor = (status) => {
    return status === "Payment Received"
      ? { bg: "#dcfce7", color: "#166534" }
      : { bg: "#fef3c7", color: "#92400e" };
  };

  const calculateTotal = (order) => {
    const freight = order.freight || 0;
    const hamali = order.hamali || 0;
    const doorDelivery = order.isDoorDelivery ? (order.doorDeliveryCharge || 0) : 0;
    return fromDbValue(freight + hamali * 2 + doorDelivery, true);
  };

  // Mobile Card View
  const MobilePaymentCard = React.memo(({ order }) => {
    const statusColor = getPaymentStatusColor(order.paymentTracking?.paymentStatus);
    const isUpdating = updatingPayments.has(order.trackingId);
    const isPaid = order.paymentTracking?.paymentStatus === "Payment Received";

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
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", fontSize: "0.95rem" }}>
                {highlightMatch(order.trackingId, idFilter, isDarkMode)}
              </Typography>
              <Chip
                label={order.paymentTracking?.paymentStatus || "To Pay"}
                size="small"
                sx={{ mt: 0.5, backgroundColor: statusColor.bg, color: statusColor.color, fontWeight: 600, fontSize: "0.75rem" }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Checkbox
                checked={isPaid}
                onChange={() => handlePaymentToggle(order.trackingId, order.paymentTracking?.paymentStatus)}
                disabled={isUpdating}
                icon={isUpdating ? <CircularProgress size={20} /> : undefined}
                checkedIcon={isUpdating ? <CircularProgress size={20} /> : undefined}
                sx={{
                  color: isDarkMode ? colors?.accent : "#1E3A5F",
                  "&.Mui-checked": { color: "#16a34a" },
                }}
              />
              <Link to={`/user/view/order/${order.trackingId}`} target="_blank" rel="noopener noreferrer">
                <IconButton 
                  size="small"
                  sx={{ color: isDarkMode ? "#FFB74D" : "primary.main" }}
                >
                  <IoArrowForwardCircleOutline size={24} />
                </IconButton>
              </Link>
            </Box>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>Sender</Typography>
              <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500, fontSize: "0.85rem" }}>
                {highlightMatch(order.sender?.name, nameFilter, isDarkMode)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>Receiver</Typography>
              <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500, fontSize: "0.85rem" }}>
                {highlightMatch(order.receiver?.name, nameFilter, isDarkMode)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>Route</Typography>
              <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500, fontSize: "0.85rem" }}>
                {order.sourceWarehouse?.warehouseID} → {order.destinationWarehouse?.warehouseID}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>Amount</Typography>
              <Typography sx={{ color: isDarkMode ? colors?.accent : colors?.textPrimary, fontWeight: 700, fontSize: "0.9rem" }}>
                ₹{calculateTotal(order)}
              </Typography>
            </Box>
          </Box>
          {isPaid && order.paymentTracking?.receivedBy && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e8ecf0" }}>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>
                Received by {order.paymentTracking.receivedBy.username} on {dateFormatter(order.paymentTracking.receivedAt)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  });

  const totalAmount = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      const total = parseFloat(calculateTotal(order));
      return sum + (isNaN(total) ? 0 : total);
    }, 0);
  }, [filteredOrders]);

  const receivedAmount = useMemo(() => {
    return filteredOrders
      .filter(order => order.paymentTracking?.paymentStatus === "Payment Received")
      .reduce((sum, order) => {
        const total = parseFloat(calculateTotal(order));
        return sum + (isNaN(total) ? 0 : total);
      }, 0);
  }, [filteredOrders]);

  const pendingAmount = totalAmount - receivedAmount;

  return (
    <Box sx={{ backgroundColor: colors?.bgPrimary || "#f8fafc", minHeight: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2, color: colors?.textPrimary || "#1E3A5F", fontWeight: 700 }}>
        Payment Tracking
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2.5 }}>
        <Card sx={{
          borderRadius: 2,
          boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
          backgroundColor: colors?.bgCard || "#ffffff",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.8rem", mb: 0.5 }}>Total Amount</Typography>
            <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 700, fontSize: "1.5rem" }}>
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{
          borderRadius: 2,
          boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
          backgroundColor: colors?.bgCard || "#ffffff",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.8rem", mb: 0.5 }}>Received</Typography>
            <Typography sx={{ color: "#16a34a", fontWeight: 700, fontSize: "1.5rem" }}>
              ₹{receivedAmount.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{
          borderRadius: 2,
          boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
          backgroundColor: colors?.bgCard || "#ffffff",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.8rem", mb: 0.5 }}>Pending</Typography>
            <Typography sx={{ color: "#dc2626", fontWeight: 700, fontSize: "1.5rem" }}>
              ₹{pendingAmount.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={idFilter}
        onSearchChange={setIdFilter}
        searchPlaceholder="Search by LR ID"
        searchValue2={nameFilter}
        onSearchChange2={setNameFilter}
        searchPlaceholder2="Search by Name"
        showSearch2={true}
        onApply={applyFilter}
        onClear={clearFilter}
        isLoading={isLoading}
        showDatePicker={true}
        dateValue={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Payment Status Filter Tabs */}
      <Box sx={{ 
        display: "flex", 
        gap: 1, 
        mb: 2.5,
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        {[
          { value: "all", label: "All Orders" },
          { value: "unpaid", label: "Unpaid" },
          { value: "paid", label: "Paid" }
        ].map((option) => (
          <Box
            key={option.value}
            onClick={() => setPaymentStatusFilter(option.value)}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              transition: "all 0.2s ease",
              backgroundColor: paymentStatusFilter === option.value
                ? (isDarkMode ? "rgba(255, 183, 77, 0.15)" : "rgba(30, 58, 95, 0.1)")
                : (isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc"),
              color: paymentStatusFilter === option.value
                ? (isDarkMode ? colors?.accent : colors?.primary)
                : colors?.textSecondary,
              border: paymentStatusFilter === option.value
                ? `2px solid ${isDarkMode ? colors?.accent : colors?.primary}`
                : `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#e0e5eb"}`,
              "&:hover": {
                backgroundColor: isDarkMode ? "rgba(255, 183, 77, 0.08)" : "rgba(30, 58, 95, 0.06)",
              }
            }}
          >
            {option.label}
          </Box>
        ))}
      </Box>

      {/* Content */}
      {isMobile ? (
        // Mobile Card View
        <Box>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <ModernSpinner size={40} />
            </Box>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => <MobilePaymentCard key={order.trackingId} order={order} />)
          ) : (
            <Box sx={{ textAlign: "center", py: 4, color: colors?.textSecondary || "#64748b" }}>
              No "To Pay" orders found for the selected date.
            </Box>
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
                <TableCell sx={cellStyle}>Date</TableCell>
                <TableCell sx={cellStyle}>Sender</TableCell>
                <TableCell sx={cellStyle}>Receiver</TableCell>
                <TableCell sx={cellStyle}>Source</TableCell>
                <TableCell sx={cellStyle}>Destination</TableCell>
                <TableCell sx={cellStyle} align="right">Amount</TableCell>
                <TableCell sx={cellStyle}>Status</TableCell>
                <TableCell sx={cellStyle}>Received By</TableCell>
                <TableCell sx={cellStyle} align="center">Received</TableCell>
                <TableCell sx={cellStyle} align="center">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                    <ModernSpinner size={28} />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => {
                  const statusColor = getPaymentStatusColor(order.paymentTracking?.paymentStatus);
                  const isUpdating = updatingPayments.has(order.trackingId);
                  const isPaid = order.paymentTracking?.paymentStatus === "Payment Received";

                  return (
                    <TableRow key={order.trackingId} hover>
                      <TableCell sx={rowCellStyle}>{idx + 1}.</TableCell>
                      <TableCell sx={{ ...rowCellStyle, fontWeight: 600 }}>
                        {highlightMatch(order.trackingId, idFilter, isDarkMode)}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>{dateFormatter(order.placedAt)}</TableCell>
                      <TableCell sx={rowCellStyle}>
                        {highlightMatch(order.sender?.name, nameFilter, isDarkMode)}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {highlightMatch(order.receiver?.name, nameFilter, isDarkMode)}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>{order.sourceWarehouse?.warehouseID}</TableCell>
                      <TableCell sx={rowCellStyle}>{order.destinationWarehouse?.warehouseID}</TableCell>
                      <TableCell align="right" sx={{ ...rowCellStyle, fontWeight: 600 }}>
                        ₹{calculateTotal(order)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.paymentTracking?.paymentStatus || "To Pay"}
                          size="small"
                          sx={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.color,
                            fontWeight: 600,
                            fontSize: "0.75rem"
                          }}
                        />
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {isPaid && order.paymentTracking?.receivedBy ? (
                          <Box>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, color: colors?.textPrimary }}>
                              {order.paymentTracking.receivedBy.username}
                            </Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: colors?.textSecondary }}>
                              {dateFormatter(order.paymentTracking.receivedAt)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: "0.85rem", color: colors?.textMuted }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          {isUpdating ? (
                            <CircularProgress size={20} sx={{ color: isDarkMode ? colors?.accent : "#1E3A5F" }} />
                          ) : (
                            <Checkbox
                              checked={isPaid}
                              onChange={() => handlePaymentToggle(order.trackingId, order.paymentTracking?.paymentStatus)}
                              disabled={isUpdating}
                              sx={{
                                color: isDarkMode ? colors?.accent : "#1E3A5F",
                                "&.Mui-checked": { color: "#16a34a" },
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Link to={`/user/view/order/${order.trackingId}`} target="_blank" rel="noopener noreferrer">
                          <IconButton 
                            color="primary"
                            sx={{ color: isDarkMode ? "#FFB74D" : "primary.main" }}
                          >
                            <IoArrowForwardCircleOutline size={24} />
                          </IconButton>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4, color: colors?.textSecondary || "#64748b" }}>
                    No "To Pay" orders found for the selected date.
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

export default PaymentTrackingPage;
