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
  Card,
  CardContent,
  Chip,
  IconButton,
} from "@mui/material";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import { dateFormatter } from "../utils/dateFormatter";
import { fromDbValue } from "../utils/currencyUtils";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar from "../components/SearchFilterBar";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import "../css/table.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const PaidLRsPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };
  
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  
  const { isDarkMode, colors } = useOutletContext() || {};

  useEffect(() => {
    fetchPaidLRs();
  }, [dateRange]);

  const fetchPaidLRs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/payment-tracking/paid-lrs?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch paid LRs");
      const data = await response.json();
      
      if (data.flag) {
        setOrders(data.body || []);
      }
    } catch (error) {
      console.error("Error fetching paid LRs:", error);
    }
    setIsLoading(false);
  };

  const calculateTotal = (order) => {
    const freight = order.freight || 0;
    const hamali = order.hamali || 0;
    const doorDelivery = order.isDoorDelivery ? (order.doorDeliveryCharge || 0) : 0;
    return fromDbValue(freight + hamali * 2 + doorDelivery, true);
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (appliedSearchQuery.trim()) {
      const query = appliedSearchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.trackingId?.toLowerCase().startsWith(query) ||
        order.sender?.name?.toLowerCase().startsWith(query) ||
        order.receiver?.name?.toLowerCase().startsWith(query) ||
        order.memoId?.toLowerCase().startsWith(query)
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.paidAt || a.deliveredAt || a.placedAt);
      const dateB = new Date(b.paidAt || b.deliveredAt || b.placedAt);
      return dateB - dateA;
    });
    
    return filtered;
  }, [orders, appliedSearchQuery]);

  const handleApplySearch = ({searchValue} = {}) => {
    const val = searchValue ?? searchQuery;
    setSearchQuery(val);
    setAppliedSearchQuery(val);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
  };

  const totalAmount = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      const total = parseFloat(calculateTotal(order));
      return sum + (isNaN(total) ? 0 : total);
    }, 0);
  }, [filteredOrders]);

  const getStatusColor = (status) => {
    const colors = {
      delivered: { bg: "#dcfce7", color: "#166534" },
      dispatched: { bg: "#fef3c7", color: "#92400e" },
      arrived: { bg: "#dbeafe", color: "#1e40af" },
      pending: { bg: "#fee2e2", color: "#991b1b" },
    };
    return colors[status] || { bg: "#f1f5f9", color: "#475569" };
  };

  const cellStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: 600, fontSize: "0.85rem" };
  const rowCellStyle = { color: colors?.textSecondary || "#25344E", fontSize: "0.9rem" };

  return (
    <Box sx={{ backgroundColor: colors?.bgPrimary || "#f8fafc", minHeight: "100vh", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: colors?.textPrimary || "#1E3A5F", fontWeight: 700 }}>
        Paid LRs
      </Typography>

      {/* Summary Card */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2, mb: 2.5 }}>
        <Card sx={{
          borderRadius: 2,
          boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
          backgroundColor: colors?.bgCard || "#ffffff",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.8rem", mb: 0.5 }}>Total Paid LRs</Typography>
            <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 700, fontSize: "1.5rem" }}>
              {filteredOrders.length}
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
            <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.8rem", mb: 0.5 }}>Total Amount</Typography>
            <Typography sx={{ color: "#16a34a", fontWeight: 700, fontSize: "1.5rem" }}>
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Date Range Picker */}
      <Box sx={{ mb: 2.5, display: "flex", justifyContent: "center" }}>
        <CustomDateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartChange={(newStartDate) => setDateRange(prev => ({ ...prev, startDate: newStartDate }))}
          onEndChange={(newEndDate) => setDateRange(prev => ({ ...prev, endDate: newEndDate }))}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      </Box>

      {/* Loading Bar */}
      {isLoading && (
        <Box sx={{ 
          width: "100%", 
          height: "3px", 
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          borderRadius: "2px",
          overflow: "hidden",
          mb: 2.5
        }}>
          <Box sx={{
            width: "40%",
            height: "100%",
            backgroundColor: isDarkMode ? colors?.accent : colors?.primary,
            animation: "loading 1.5s ease-in-out infinite",
            "@keyframes loading": {
              "0%": { transform: "translateX(-100%)" },
              "50%": { transform: "translateX(250%)" },
              "100%": { transform: "translateX(-100%)" }
            }
          }} />
        </Box>
      )}

      {/* Search Bar */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by LR ID, Sender, Receiver, or Memo ID..."
        onApply={handleApplySearch}
        onClear={handleClearSearch}
        isLoading={isLoading}
      />

      {/* Orders Table */}
      <Box sx={{ mt: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <ModernSpinner size={40} />
          </Box>
        ) : filteredOrders.length > 0 ? (
          <TableContainer component={Paper} sx={{
            borderRadius: 3,
            boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.08)",
            backgroundColor: colors?.bgCard || "#ffffff",
            border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb",
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
                  <TableCell sx={cellStyle}>Sl No</TableCell>
                  <TableCell sx={cellStyle}>Date</TableCell>
                  <TableCell sx={cellStyle}>LR ID</TableCell>
                  <TableCell sx={cellStyle}>Memo ID</TableCell>
                  <TableCell sx={cellStyle}>Sender</TableCell>
                  <TableCell sx={cellStyle}>Receiver</TableCell>
                  <TableCell sx={cellStyle} align="right">Amount</TableCell>
                  <TableCell sx={cellStyle}>Status</TableCell>
                  <TableCell sx={cellStyle} align="center">View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order, idx) => {
                  const statusColor = getStatusColor(order.status);
                  
                  return (
                    <TableRow 
                      key={order.trackingId} 
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        }
                      }}
                    >
                      <TableCell sx={rowCellStyle}>{idx + 1}</TableCell>
                      <TableCell sx={{ ...rowCellStyle, whiteSpace: "nowrap" }}>
                        {dateFormatter(order.paidAt || order.deliveredAt || order.placedAt)}
                      </TableCell>
                      <TableCell sx={{ ...rowCellStyle, fontWeight: 600 }}>
                        {order.trackingId}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        <Chip
                          label={order.memoId || "N/A"}
                          size="small"
                          sx={{
                            backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                            color: colors?.textPrimary,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {order.sender?.name || "N/A"}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {order.receiver?.name || "N/A"}
                      </TableCell>
                      <TableCell align="right" sx={{ ...rowCellStyle, fontWeight: 700, color: "#16a34a" }}>
                        ₹{calculateTotal(order)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          size="small"
                          sx={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.color,
                            fontWeight: 600,
                            fontSize: "0.75rem"
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Link to={`/user/view/order/${order.trackingId}`} target="_blank" rel="noopener noreferrer">
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: isDarkMode ? "#FFB74D" : "primary.main",
                              "&:hover": {
                                backgroundColor: isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(30,58,95,0.08)",
                              }
                            }}
                          >
                            <IoArrowForwardCircleOutline size={20} />
                          </IconButton>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Card sx={{
            borderRadius: 3,
            boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.08)",
            backgroundColor: colors?.bgCard || "#ffffff",
            border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb",
            p: 8,
            textAlign: "center"
          }}>
            <Typography sx={{ color: colors?.textSecondary, fontSize: "1rem" }}>
              No paid LRs found for the selected date range
            </Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default PaidLRsPage;
