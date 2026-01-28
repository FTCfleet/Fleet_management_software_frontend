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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
  Button,
} from "@mui/material";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import { getDate, dateFormatter } from "../utils/dateFormatter";
import { fromDbValue } from "../utils/currencyUtils";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar from "../components/SearchFilterBar";
import "../css/table.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const PaymentTrackingPage = () => {
  const [memos, setMemos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getDate());
  const [idFilter, setIdFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const response = await fetch(`${BASE_URL}/api/payment-tracking/memos?date=${selectedDate}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch payment tracking data");
      const data = await response.json();
      
      if (data.flag) {
        setMemos(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching payment tracking:", error);
    }
    setIsLoading(false);
  };

  const filteredMemos = useMemo(() => {
    return memos.filter(memo => {
      // Filter by memo ID
      const matchesMemoId = !idFilter || memo.ledgerId?.toLowerCase().includes(idFilter.toLowerCase());
      return matchesMemoId;
    });
  }, [memos, idFilter]);

  const applyFilter = () => {
    // Filters are applied in real-time via useMemo
  };

  const clearFilter = () => {
    setIdFilter("");
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const calculateTotal = (order) => {
    const freight = order.freight || 0;
    const hamali = order.hamali || 0;
    const doorDelivery = order.isDoorDelivery ? (order.doorDeliveryCharge || 0) : 0;
    return fromDbValue(freight + hamali * 2 + doorDelivery, true);
  };

  const totalAmount = useMemo(() => {
    return filteredMemos.reduce((sum, memo) => {
      const memoTotal = memo.orders?.reduce((orderSum, order) => {
        const total = parseFloat(calculateTotal(order));
        return orderSum + (isNaN(total) ? 0 : total);
      }, 0) || 0;
      return sum + memoTotal;
    }, 0);
  }, [filteredMemos]);

  const receivedAmount = useMemo(() => {
    return filteredMemos.reduce((sum, memo) => {
      const memoReceived = memo.orders
        ?.filter(order => order.paymentTracking?.paymentStatus === "Payment Received")
        .reduce((orderSum, order) => {
          const total = parseFloat(calculateTotal(order));
          return orderSum + (isNaN(total) ? 0 : total);
        }, 0) || 0;
      return sum + memoReceived;
    }, 0);
  }, [filteredMemos]);

  const pendingAmount = totalAmount - receivedAmount;

  const getMemoStats = (memo) => {
    // Only count delivered orders with "To Pay" payment status
    const deliveredToPayOrders = memo.orders?.filter(o => 
      o.status === "delivered" && o.payment === "To Pay"
    ) || [];
    
    const totalToPayOrders = deliveredToPayOrders.length;
    const paidOrders = deliveredToPayOrders.filter(o => 
      o.paymentTracking?.paymentStatus === "Payment Received"
    ).length;
    
    const memoTotal = deliveredToPayOrders.reduce((sum, order) => {
      const total = parseFloat(calculateTotal(order));
      return sum + (isNaN(total) ? 0 : total);
    }, 0);
    
    return { totalToPayOrders, paidOrders, memoTotal };
  };

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
        searchPlaceholder="Search by Memo ID"
        onApply={applyFilter}
        onClear={clearFilter}
        isLoading={isLoading}
        showDatePicker={true}
        dateValue={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Memo List */}
      <Box>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <ModernSpinner size={40} />
          </Box>
        ) : filteredMemos.length > 0 ? (
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
                  <TableCell sx={cellStyle}>Memo ID</TableCell>
                  <TableCell sx={cellStyle}>Date</TableCell>
                  <TableCell sx={cellStyle}>Route</TableCell>
                  <TableCell sx={cellStyle}>To Pay Orders</TableCell>
                  <TableCell sx={cellStyle} align="right">Total Amount</TableCell>
                  <TableCell sx={cellStyle}>Status</TableCell>
                  <TableCell sx={cellStyle} align="center">View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMemos.map((memo, idx) => {
                  const stats = getMemoStats(memo);
                  
                  return (
                    <TableRow key={memo.ledgerId} hover>
                      <TableCell sx={rowCellStyle}>{idx + 1}.</TableCell>
                      <TableCell sx={{ ...rowCellStyle, fontWeight: 600 }}>
                        {memo.ledgerId}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {dateFormatter(memo.dispatchedAt || memo.createdAt)}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {memo.sourceWarehouse?.warehouseID} → {memo.destinationWarehouse?.warehouseID}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {stats.totalToPayOrders} orders
                      </TableCell>
                      <TableCell align="right" sx={{ ...rowCellStyle, fontWeight: 600 }}>
                        ₹{stats.memoTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${stats.paidOrders}/${stats.totalToPayOrders} Paid`}
                          size="small"
                          sx={{
                            backgroundColor: stats.paidOrders === stats.totalToPayOrders ? "#dcfce7" : "#fef3c7",
                            color: stats.paidOrders === stats.totalToPayOrders ? "#166534" : "#92400e",
                            fontWeight: 600,
                            fontSize: "0.75rem"
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Link to={`/user/payment-tracking/${memo.ledgerId}`} target="_blank" rel="noopener noreferrer">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<IoArrowForwardCircleOutline />}
                            sx={{
                              borderColor: isDarkMode ? colors?.accent : colors?.primary,
                              color: isDarkMode ? colors?.accent : colors?.primary,
                              fontSize: "0.75rem",
                              "&:hover": {
                                borderColor: isDarkMode ? colors?.accentHover : colors?.primaryHover,
                                backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.04)",
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: "center", py: 4, color: colors?.textSecondary || "#64748b" }}>
            No memos with "To Pay" orders found for the selected date.
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PaymentTrackingPage;