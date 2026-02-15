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
  Checkbox,
  Card,
  CardContent,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Tooltip,
  Fab,
} from "@mui/material";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { FaSave, FaEdit, FaCheckDouble, FaTimes } from "react-icons/fa";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import { dateFormatter } from "../utils/dateFormatter";
import { fromDbValue } from "../utils/currencyUtils";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import "../css/table.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ReceiverWisePaymentPage = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  
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
  
  const navigate = useNavigate();
  const { isDarkMode, colors } = useOutletContext() || {};
  const { isAdmin, isSource } = useAuth();

  const canEditPayments = !isAdmin && !isSource;

  useEffect(() => {
    if (isSource && !isAdmin) {
      navigate("/user/dashboard");
    }
  }, [isSource, isAdmin, navigate]);

  if (isSource && !isAdmin) {
    return null;
  }

  useEffect(() => {
    fetchReceiverWiseData();
  }, [dateRange]);

  const fetchReceiverWiseData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/payment-tracking/receiver-wise?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch receiver-wise payment data");
      const data = await response.json();
      
      if (data.flag) {
        setOrders(data.body || []);
        const initialSelected = new Set();
        (data.body || []).forEach(order => {
          if (order.paymentTracking?.paymentStatus === "Payment Received") {
            initialSelected.add(order.trackingId);
          }
        });
        setSelectedOrders(initialSelected);
      }
    } catch (error) {
      console.error("Error fetching receiver-wise payment data:", error);
    }
    setIsLoading(false);
  };

  const handleOrderToggle = (orderId) => {
    if (!isEditMode) return;
    
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAllForReceiver = (receiverOrders) => {
    if (!isEditMode) return;
    
    const receiverOrderIds = receiverOrders.map(o => o.trackingId);
    const allSelected = receiverOrderIds.every(id => selectedOrders.has(id));
    
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        receiverOrderIds.forEach(id => newSet.delete(id));
      } else {
        receiverOrderIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const orderIdsToUpdate = Array.from(selectedOrders);
      
      const response = await fetch(`${BASE_URL}/api/payment-tracking/batch-update-receiver-wise`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          orderIds: orderIdsToUpdate,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update payment status");
      }
      
      const data = await response.json();
      
      if (data.flag) {
        setOrders(prevOrders => prevOrders.map(order => {
          const isSelected = selectedOrders.has(order.trackingId);
          
          if (isSelected && order.paymentTracking?.paymentStatus !== "Payment Received") {
            return {
              ...order,
              paymentTracking: {
                ...order.paymentTracking,
                paymentStatus: "Payment Received",
                receivedBy: data.receivedBy || { username: "Unknown", name: "Unknown User" },
                receivedAt: data.receivedAt || new Date().toISOString(),
              }
            };
          } else if (!isSelected && order.paymentTracking?.paymentStatus === "Payment Received") {
            return {
              ...order,
              paymentTracking: {
                ...order.paymentTracking,
                paymentStatus: "To Pay",
                receivedBy: null,
                receivedAt: null,
              }
            };
          }
          return order;
        }));
        
        setIsEditMode(false);
        setToast({
          open: true,
          message: `Successfully updated ${data.updatedCount || 0} payment records`,
          severity: "success"
        });
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      setToast({
        open: true,
        message: `Failed to update: ${error.message}`,
        severity: "error"
      });
    } finally {
      setIsSaving(false);
    }
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
        order.trackingId?.toLowerCase().includes(query) ||
        order.receiver?.name?.toLowerCase().includes(query) ||
        order.memoId?.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => {
      const nameA = (a.receiver?.name || "").toLowerCase();
      const nameB = (b.receiver?.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    return filtered;
  }, [orders, appliedSearchQuery]);

  const groupedByReceiver = useMemo(() => {
    const groups = {};
    filteredOrders.forEach(order => {
      const receiverName = order.receiver?.name || "Unknown";
      if (!groups[receiverName]) {
        groups[receiverName] = [];
      }
      groups[receiverName].push(order);
    });
    
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredOrders]);

  const handleApplySearch = () => {
    setAppliedSearchQuery(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
  };

  const calculateReceiverTotal = (orders) => {
    return orders.reduce((sum, order) => {
      const total = parseFloat(calculateTotal(order));
      return sum + (isNaN(total) ? 0 : total);
    }, 0);
  };

  const calculateReceiverReceived = (orders) => {
    return orders
      .filter(order => order.paymentTracking?.paymentStatus === "Payment Received")
      .reduce((sum, order) => {
        const total = parseFloat(calculateTotal(order));
        return sum + (isNaN(total) ? 0 : total);
      }, 0);
  };

  const totalAmount = useMemo(() => {
    return orders.reduce((sum, order) => {
      const total = parseFloat(calculateTotal(order));
      return sum + (isNaN(total) ? 0 : total);
    }, 0);
  }, [orders]);

  const receivedAmount = useMemo(() => {
    return orders
      .filter(order => order.paymentTracking?.paymentStatus === "Payment Received")
      .reduce((sum, order) => {
        const total = parseFloat(calculateTotal(order));
        return sum + (isNaN(total) ? 0 : total);
      }, 0);
  }, [orders]);

  const pendingAmount = totalAmount - receivedAmount;

  const cellStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: 600, fontSize: "0.85rem" };
  const rowCellStyle = { color: colors?.textSecondary || "#25344E", fontSize: "0.9rem" };

  return (
    <Box sx={{ backgroundColor: colors?.bgPrimary || "#f8fafc", minHeight: "100vh", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: colors?.textPrimary || "#1E3A5F", fontWeight: 700 }}>
        Payment Tracking
      </Typography>

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb", 
        mb: 3,
      }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            if (newValue === 0) {
              navigate("/user/payment-tracking");
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              backgroundColor: isDarkMode ? colors?.accent : colors?.primary,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            },
            "& .MuiTab-root": {
              color: colors?.textSecondary,
              fontWeight: 600,
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              textTransform: "none",
              minHeight: 48,
              minWidth: { xs: "auto", sm: 120 },
              px: { xs: 2, sm: 3 },
              transition: "all 0.2s ease",
              "&:hover": {
                color: isDarkMode ? colors?.accent : colors?.primary,
                backgroundColor: isDarkMode ? "rgba(255,183,77,0.05)" : "rgba(30,58,95,0.05)",
              },
              "&.Mui-selected": {
                color: isDarkMode ? colors?.accent : colors?.primary,
                fontWeight: 700,
              }
            }
          }}
        >
          <Tab label="Memo-wise" />
          <Tab label="Receiver-wise" />
        </Tabs>
      </Box>

      <Box
        sx={{
          animation: "slideIn 0.3s ease-out",
          "@keyframes slideIn": {
            from: {
              opacity: 0,
              transform: "translateX(20px)",
            },
            to: {
              opacity: 1,
              transform: "translateX(0)",
            },
          },
        }}
      >
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

        <SearchFilterBar
          isDarkMode={isDarkMode}
          colors={colors}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by Receiver Name, LR ID, or Memo ID..."
          onApply={handleApplySearch}
          onClear={handleClearSearch}
          isLoading={isLoading}
        />

        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          borderRadius: "12px",
          padding: "16px 20px",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", justifyContent: { xs: "center", sm: "flex-start" } }}>
            <Typography sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", fontSize: { xs: "1rem", sm: "1.2rem" } }}>
              Orders by Receiver
            </Typography>
            <Chip 
              label={`${filteredOrders.length} orders`}
              size="small"
              sx={{
                backgroundColor: isDarkMode ? "rgba(255,183,77,0.2)" : "rgba(30,58,95,0.1)",
                color: isDarkMode ? colors?.accent : colors?.primary,
                fontWeight: 700,
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {canEditPayments && !isEditMode ? (
              <Button
                size="medium"
                variant="contained"
                startIcon={<FaEdit />}
                onClick={() => setIsEditMode(true)}
                sx={{
                  backgroundColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
                  color: isDarkMode ? "#0a1628" : "#fff",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: isDarkMode ? "0 4px 12px rgba(255,183,77,0.3)" : "0 4px 12px rgba(30,58,95,0.2)",
                  "&:hover": { 
                    backgroundColor: isDarkMode ? "#FFA726" : "#2d5a87",
                    transform: "translateY(-2px)",
                    boxShadow: isDarkMode ? "0 6px 16px rgba(255,183,77,0.4)" : "0 6px 16px rgba(30,58,95,0.3)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Edit Payments
              </Button>
            ) : canEditPayments && isEditMode ? (
              <>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={() => {
                    setIsEditMode(false);
                    const resetSelected = new Set();
                    orders.forEach(order => {
                      if (order.paymentTracking?.paymentStatus === "Payment Received") {
                        resetSelected.add(order.trackingId);
                      }
                    });
                    setSelectedOrders(resetSelected);
                  }}
                  sx={{
                    borderColor: isDarkMode ? colors?.accent : colors?.primary,
                    color: isDarkMode ? colors?.accent : colors?.primary,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: isDarkMode ? colors?.accentHover : colors?.primaryHover,
                      backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.04)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="medium"
                  variant="contained"
                  startIcon={isSaving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <FaSave />}
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  sx={{
                    backgroundColor: "#16a34a",
                    color: "#fff",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                    "&:hover": { 
                      backgroundColor: "#15803d",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(22,163,74,0.4)",
                    },
                    "&:disabled": { 
                      backgroundColor: "#9ca3af",
                      transform: "none",
                      boxShadow: "none",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : null}
            {!canEditPayments && (
              <Chip 
                label="View Only" 
                sx={{ 
                  fontWeight: 600, 
                  color: isDarkMode ? colors?.accent : colors?.primary,
                  backgroundColor: isDarkMode ? "rgba(255,183,77,0.15)" : "rgba(30,58,95,0.1)",
                  px: 2,
                  py: 2.5,
                }} 
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <ModernSpinner size={40} />
            </Box>
          ) : groupedByReceiver.length > 0 ? (
            groupedByReceiver.map(([receiverName, receiverOrders]) => {
              const receiverTotal = calculateReceiverTotal(receiverOrders);
              const receiverReceived = calculateReceiverReceived(receiverOrders);
              const receiverPending = receiverTotal - receiverReceived;
              const allReceiverSelected = receiverOrders.every(o => selectedOrders.has(o.trackingId));
              const someReceiverSelected = receiverOrders.some(o => selectedOrders.has(o.trackingId));
              
              return (
                <Card 
                  key={receiverName}
                  sx={{
                    borderRadius: 3,
                    boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.08)",
                    backgroundColor: colors?.bgCard || "#ffffff",
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb",
                    overflow: "hidden"
                  }}
                >
                  <Box sx={{ 
                    p: 2.5, 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    background: isDarkMode 
                      ? "linear-gradient(135deg, rgba(255,183,77,0.12) 0%, rgba(255,183,77,0.05) 100%)"
                      : "linear-gradient(135deg, rgba(30,58,95,0.08) 0%, rgba(30,58,95,0.03) 100%)",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e8ecf0",
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: isDarkMode ? colors?.accent : colors?.primary }}>
                        {highlightMatch(receiverName, appliedSearchQuery, isDarkMode)}
                      </Typography>
                      <Chip 
                        label={`${receiverOrders.length} ${receiverOrders.length === 1 ? "order" : "orders"}`}
                        size="small"
                        sx={{
                          backgroundColor: isDarkMode ? "rgba(255,183,77,0.25)" : "rgba(30,58,95,0.2)",
                          color: isDarkMode ? "#FFB74D" : "#1E3A5F",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          height: "26px",
                        }}
                      />
                    </Box>
                    {canEditPayments && isEditMode && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "0.85rem", color: colors?.textSecondary, fontWeight: 600 }}>
                          Select All
                        </Typography>
                        <Checkbox
                          checked={allReceiverSelected}
                          indeterminate={someReceiverSelected && !allReceiverSelected}
                          onChange={() => handleSelectAllForReceiver(receiverOrders)}
                          sx={{
                            color: isDarkMode ? colors?.accent : "#1E3A5F",
                            "&.Mui-checked": { color: "#16a34a" },
                            "&.MuiCheckbox-indeterminate": { color: "#f59e0b" },
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ ...cellStyle, backgroundColor: colors?.tableHeader || "#f8fafc", fontSize: { xs: "0.7rem", sm: "0.85rem" } }}>Date</TableCell>
                          <TableCell sx={{ ...cellStyle, backgroundColor: colors?.tableHeader || "#f8fafc", fontSize: { xs: "0.7rem", sm: "0.85rem" } }}>Memo ID</TableCell>
                          <TableCell sx={{ ...cellStyle, backgroundColor: colors?.tableHeader || "#f8fafc", fontSize: { xs: "0.7rem", sm: "0.85rem" } }}>LR ID</TableCell>
                          <TableCell sx={{ ...cellStyle, backgroundColor: colors?.tableHeader || "#f8fafc", fontSize: { xs: "0.7rem", sm: "0.85rem" } }} align="right">Amount</TableCell>
                          <TableCell sx={{ ...cellStyle, backgroundColor: colors?.tableHeader || "#f8fafc", display: { xs: "none", md: "table-cell" } }}>Status</TableCell>
                          <TableCell sx={{ ...cellStyle, backgroundColor: colors?.tableHeader || "#f8fafc", display: { xs: "none", lg: "table-cell" } }}>Received By</TableCell>
                          <TableCell sx={{ ...cellStyle, backgroundColor: colors?.tableHeader || "#f8fafc", fontSize: { xs: "0.7rem", sm: "0.85rem" } }} align="center">View</TableCell>
                          {canEditPayments && isEditMode && <TableCell sx={{ ...cellStyle, backgroundColor: colors?.tableHeader || "#f8fafc" }} align="center">Select</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {receiverOrders.map((order) => {
                          const isPaid = order.paymentTracking?.paymentStatus === "Payment Received";
                          const isSelected = selectedOrders.has(order.trackingId);

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
                              <TableCell sx={{ ...rowCellStyle, fontSize: { xs: "0.7rem", sm: "0.8rem" }, whiteSpace: "nowrap" }}>
                                {(() => {
                                  // Try multiple date fields in order of preference
                                  const dateToShow = order.placedAt || order.createdAt || order.dispatchedAt || order.deliveredAt;
                                  
                                  if (!dateToShow) {
                                    console.log('Order with no date:', order); // Debug log
                                    return "N/A";
                                  }
                                  
                                  // Show only date part (no time) on mobile
                                  const formatted = dateFormatter(dateToShow);
                                  return formatted.split(',')[0]; // Returns just the date part
                                })()}
                              </TableCell>
                              <TableCell sx={{ ...rowCellStyle, p: { xs: 0.5, sm: 2 } }}>
                                <Chip
                                  label={highlightMatch(order.memoId, appliedSearchQuery, isDarkMode)}
                                  size="small"
                                  sx={{
                                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                                    color: colors?.textPrimary,
                                    fontWeight: 600,
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                    height: { xs: "20px", sm: "24px" },
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ ...rowCellStyle, fontWeight: 600, fontSize: { xs: "0.7rem", sm: "0.9rem" } }}>
                                {highlightMatch(order.trackingId, appliedSearchQuery, isDarkMode)}
                              </TableCell>
                              <TableCell align="right" sx={{ ...rowCellStyle, fontWeight: 700, color: colors?.textPrimary, fontSize: { xs: "0.75rem", sm: "0.9rem" } }}>
                                ₹{calculateTotal(order)}
                              </TableCell>
                              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                                <Chip
                                  label={isPaid ? "Received" : "Pending"}
                                  size="small"
                                  sx={{
                                    backgroundColor: isPaid ? "#dcfce7" : "#fef3c7",
                                    color: isPaid ? "#166534" : "#92400e",
                                    fontWeight: 600,
                                    fontSize: "0.75rem"
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: "0.85rem", display: { xs: "none", lg: "table-cell" } }}>
                                {isPaid && order.paymentTracking?.receivedBy ? (
                                  <Box>
                                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: colors?.textPrimary }}>
                                      {order.paymentTracking.receivedBy.username}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.7rem", color: colors?.textSecondary }}>
                                      {dateFormatter(order.paymentTracking.receivedAt)}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography sx={{ color: colors?.textSecondary }}>—</Typography>
                                )}
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
                              {canEditPayments && isEditMode && (
                                <TableCell align="center">
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => handleOrderToggle(order.trackingId)}
                                    sx={{
                                      color: isDarkMode ? colors?.accent : "#1E3A5F",
                                      "&.Mui-checked": { color: "#16a34a" },
                                    }}
                                  />
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <TableBody>
                        <TableRow sx={{
                          backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.05)",
                          borderTop: `2px solid ${isDarkMode ? "rgba(255,183,77,0.3)" : "rgba(30,58,95,0.2)"}`,
                        }}>
                          <TableCell colSpan={3} sx={{ fontWeight: 700, fontSize: { xs: "0.85rem", sm: "1rem" }, color: colors?.textPrimary, py: 2 }}>
                            Total
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.1rem" }, color: isDarkMode ? colors?.accent : colors?.primary, py: 2 }}>
                            ₹{receiverTotal.toFixed(2)}
                          </TableCell>
                          <TableCell colSpan={canEditPayments && isEditMode ? 4 : 3} sx={{ py: 2 }}>
                            <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, justifyContent: "flex-start", flexWrap: "wrap" }}>
                              <Box sx={{ 
                                px: { xs: 1.5, sm: 2 },
                                py: { xs: 0.5, sm: 1 },
                                borderRadius: "8px",
                                backgroundColor: "rgba(22,163,74,0.15)",
                                border: "1px solid rgba(22,163,74,0.4)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}>
                                <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" }, color: "#15803d", fontWeight: 600 }}>
                                  Received:
                                </Typography>
                                <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" }, color: "#16a34a", fontWeight: 700 }}>
                                  ₹{receiverReceived.toFixed(2)}
                                </Typography>
                              </Box>
                              <Box sx={{ 
                                px: { xs: 1.5, sm: 2 },
                                py: { xs: 0.5, sm: 1 },
                                borderRadius: "8px",
                                backgroundColor: "rgba(220,38,38,0.15)",
                                border: "1px solid rgba(220,38,38,0.4)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}>
                                <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" }, color: "#b91c1c", fontWeight: 600 }}>
                                  Pending:
                                </Typography>
                                <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" }, color: "#dc2626", fontWeight: 700 }}>
                                  ₹{receiverPending.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              );
            })
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
                No orders found for the selected date range
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      {/* Floating Action Buttons - Edit/Save (Only for destination warehouse users) */}
      {canEditPayments && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {!isEditMode ? (
            <Tooltip title="Edit Payments" placement="left">
              <Fab
                color="primary"
                onClick={() => setIsEditMode(true)}
                sx={{
                  backgroundColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
                  color: isDarkMode ? "#0a1628" : "#fff",
                  "&:hover": { 
                    backgroundColor: isDarkMode ? "#FFA726" : "#2d5a87",
                  },
                }}
              >
                <FaEdit size={20} />
              </Fab>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Save Changes" placement="left">
                <Fab
                  color="success"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  sx={{
                    backgroundColor: "#16a34a",
                    color: "#fff",
                    "&:hover": { 
                      backgroundColor: "#15803d",
                    },
                    "&:disabled": { 
                      backgroundColor: "#9ca3af",
                    },
                  }}
                >
                  {isSaving ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : <FaSave size={20} />}
                </Fab>
              </Tooltip>
              <Tooltip title="Cancel" placement="left">
                <Fab
                  size="medium"
                  onClick={() => {
                    setIsEditMode(false);
                    const resetSelected = new Set();
                    orders.forEach(order => {
                      if (order.paymentTracking?.paymentStatus === "Payment Received") {
                        resetSelected.add(order.trackingId);
                      }
                    });
                    setSelectedOrders(resetSelected);
                  }}
                  sx={{
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                    color: isDarkMode ? colors?.textPrimary : "#374151",
                    "&:hover": {
                      backgroundColor: isDarkMode ? "rgba(255,255,255,0.15)" : "#d1d5db",
                    },
                  }}
                >
                  <FaTimes size={18} />
                </Fab>
              </Tooltip>
            </>
          )}
        </Box>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: "100%",
            fontSize: "0.95rem",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReceiverWisePaymentPage;
