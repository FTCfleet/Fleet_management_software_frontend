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
  Card,
  CardContent,
  Button,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import { useNavigate, useOutletContext, useParams, Link } from "react-router-dom";
import { FaSave, FaEdit } from "react-icons/fa";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import { dateFormatter } from "../utils/dateFormatter";
import { fromDbValue } from "../utils/currencyUtils";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";
import "../css/table.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const MemoPaymentDetailsPage = () => {
  const { memoId } = useParams();
  const [memo, setMemo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { isDarkMode, colors } = useOutletContext() || {};
  const { isAdmin, isSource, user } = useAuth();

  // Check if current user can edit payments (only destination staff, not admin or source staff)
  const canEditPayments = !isAdmin && !isSource;

  // Redirect source warehouse staff
  useEffect(() => {
    if (isSource && !isAdmin) {
      navigate("/user/dashboard");
    }
  }, [isSource, isAdmin, navigate]);

  if (isSource && !isAdmin) {
    return null;
  }

  useEffect(() => {
    fetchMemoDetails();
  }, [memoId]);

  const fetchMemoDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/payment-tracking/memo/${memoId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch memo details");
      const data = await response.json();
      
      if (data.flag) {
        setMemo(data.data);
        // Initialize selected orders based on current payment status
        const initialSelected = new Set();
        data.data.orders?.forEach(order => {
          if (order.paymentTracking?.paymentStatus === "Payment Received") {
            initialSelected.add(order.trackingId);
          }
        });
        setSelectedOrders(initialSelected);
      }
    } catch (error) {
      console.error("Error fetching memo details:", error);
      alert("Failed to load memo details");
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

  const handleSelectAll = () => {
    if (!isEditMode) return;
    
    const deliveredToPayOrders = memo.orders?.filter(o => 
      o.status === "delivered" && o.payment === "To Pay"
    ) || [];
    
    const allOrderIds = deliveredToPayOrders.map(o => o.trackingId);
    const allSelected = allOrderIds.every(id => selectedOrders.has(id));
    
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        allOrderIds.forEach(id => newSet.delete(id));
      } else {
        allOrderIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const orderIdsToUpdate = Array.from(selectedOrders);
      
      console.log("Sending to backend:", { orderIds: orderIdsToUpdate, memoId: memoId }); // Debug log
      
      const response = await fetch(`${BASE_URL}/api/payment-tracking/batch-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          orderIds: orderIdsToUpdate,
          memoId: memoId // Required by optimized backend
        }),
      });

      console.log("Response status:", response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `${response.status} ${response.statusText}`;
        throw new Error(`Failed to update payment status: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log("Success response:", data); // Debug log
      
      if (data.flag) {
        // Update local state with optimized bulk response
        setMemo(prevMemo => ({
          ...prevMemo,
          orders: prevMemo.orders?.map(order => {
            const isSelected = selectedOrders.has(order.trackingId);
            
            // Only update orders that are in the delivered "To Pay" list
            const isDeliveredToPay = order.status === "delivered" && order.payment === "To Pay";
            if (!isDeliveredToPay) return order;
            
            if (isSelected && order.paymentTracking?.paymentStatus !== "Payment Received") {
              // Mark as received - use data from backend response
              return {
                ...order,
                paymentTracking: {
                  ...order.paymentTracking,
                  paymentStatus: "Payment Received",
                  receivedBy: data.receivedBy || { 
                    username: data.receivedBy?.username || "Unknown",
                    name: data.receivedBy?.name || "Unknown User"
                  },
                  receivedAt: data.receivedAt || new Date().toISOString(),
                }
              };
            } else if (!isSelected && order.paymentTracking?.paymentStatus === "Payment Received") {
              // Mark as To Pay
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
          })
        }));
        
        setIsEditMode(false);
        
        // Show success message with update count if available
        if (data.updatedCount) {
          console.log(`Successfully updated ${data.updatedCount} payment records`);
        }
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      
      // Handle specific error cases from optimized backend
      let errorMessage = error.message;
      if (error.message.includes("memoId is required")) {
        errorMessage = "Memo ID is missing. Please refresh the page and try again.";
      } else if (error.message.includes("Memo not found")) {
        errorMessage = "This memo could not be found. It may have been deleted.";
      } else if (error.message.includes("No delivered To Pay orders")) {
        errorMessage = "No eligible orders found for payment update in this memo.";
      } else if (error.message.includes("You do not have access")) {
        errorMessage = "You don't have permission to update payments for this memo.";
      }
      
      alert(`Failed to update payment status: ${errorMessage}`);
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

  const getPaymentStatusColor = (status) => {
    return status === "Payment Received"
      ? { bg: "#dcfce7", color: "#166534" }
      : { bg: "#fef3c7", color: "#92400e" };
  };

  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  // Filter only delivered orders with "To Pay" payment
  const deliveredToPayOrders = useMemo(() => {
    const allOrders = memo?.orders?.filter(o => 
      o.status === "delivered" && o.payment === "To Pay"
    ) || [];
    
    // Apply search filter using appliedSearchQuery
    let filtered = allOrders;
    if (appliedSearchQuery.trim()) {
      const query = appliedSearchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.trackingId?.toLowerCase().startsWith(query) ||
        order.sender?.name?.toLowerCase().startsWith(query) ||
        order.receiver?.name?.toLowerCase().startsWith(query)
      );
    }
    
    // Apply payment status filter
    if (paymentStatusFilter === "received") {
      filtered = filtered.filter(o => o.paymentTracking?.paymentStatus === "Payment Received");
    } else if (paymentStatusFilter === "not-received") {
      filtered = filtered.filter(o => o.paymentTracking?.paymentStatus === "To Pay");
    }
    
    // Sort by receiver name (lexicographical order)
    filtered.sort((a, b) => {
      const nameA = (a.receiver?.name || "").toLowerCase();
      const nameB = (b.receiver?.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    return filtered;
  }, [memo, paymentStatusFilter, appliedSearchQuery]);

  // Group orders by receiver name
  const groupedByReceiver = useMemo(() => {
    const groups = {};
    deliveredToPayOrders.forEach(order => {
      const receiverName = order.receiver?.name || "Unknown";
      if (!groups[receiverName]) {
        groups[receiverName] = [];
      }
      groups[receiverName].push(order);
    });
    
    // Convert to array and sort by receiver name
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [deliveredToPayOrders]);

  const handleApplySearch = ({searchValue} = {}) => {
    const val = searchValue ?? searchQuery;
    setSearchQuery(val);
    setAppliedSearchQuery(val);
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
    const allDeliveredOrders = memo?.orders?.filter(o => 
      o.status === "delivered" && o.payment === "To Pay"
    ) || [];
    return allDeliveredOrders.reduce((sum, order) => {
      const total = parseFloat(calculateTotal(order));
      return sum + (isNaN(total) ? 0 : total);
    }, 0);
  }, [memo]);

  const receivedAmount = useMemo(() => {
    const allDeliveredOrders = memo?.orders?.filter(o => 
      o.status === "delivered" && o.payment === "To Pay"
    ) || [];
    return allDeliveredOrders
      .filter(order => order.paymentTracking?.paymentStatus === "Payment Received")
      .reduce((sum, order) => {
        const total = parseFloat(calculateTotal(order));
        return sum + (isNaN(total) ? 0 : total);
      }, 0);
  }, [memo]);

  const pendingAmount = totalAmount - receivedAmount;

  const cellStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: 600, fontSize: "0.85rem" };
  const rowCellStyle = { color: colors?.textSecondary || "#25344E", fontSize: "0.9rem" };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <ModernSpinner size={48} />
      </Box>
    );
  }

  if (!memo) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" sx={{ color: colors?.textSecondary }}>
          Memo not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: colors?.bgPrimary || "#f8fafc", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 700 }}>
            Memo: {memo.ledgerId}
          </Typography>
          <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.9rem", mt: 0.5 }}>
            {memo.sourceWarehouse?.warehouseID} → {memo.destinationWarehouse?.warehouseID} | {dateFormatter(memo.dispatchedAt || memo.createdAt)}
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
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
          { value: "not-received", label: "Amount Not Received" },
          { value: "received", label: "Amount Received" }
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

      {/* Search Bar */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by LR ID, Sender, or Receiver..."
        onApply={handleApplySearch}
        onClear={handleClearSearch}
        isLoading={isLoading}
      />

      {/* Orders Table */}
      <Card sx={{
        borderRadius: 2,
        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
        backgroundColor: colors?.bgCard || "#ffffff",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
      }}>
        <Box sx={{ 
          p: 2.5, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e8ecf0",
          background: isDarkMode 
            ? "linear-gradient(135deg, rgba(255,183,77,0.05) 0%, rgba(255,183,77,0.02) 100%)"
            : "linear-gradient(135deg, rgba(30,58,95,0.03) 0%, rgba(30,58,95,0.01) 100%)",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isDarkMode ? colors?.accent : colors?.primary,
              boxShadow: isDarkMode 
                ? "0 0 8px rgba(255,183,77,0.4)" 
                : "0 0 8px rgba(30,58,95,0.3)",
            }} />
            <Typography sx={{ 
              fontWeight: 700, 
              color: colors?.textPrimary || "#1E3A5F", 
              fontSize: "1.1rem",
              letterSpacing: "0.02em"
            }}>
              Orders
            </Typography>
            <Box sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "12px",
              backgroundColor: isDarkMode 
                ? "rgba(255,183,77,0.15)" 
                : "rgba(30,58,95,0.1)",
              border: isDarkMode 
                ? "1px solid rgba(255,183,77,0.2)" 
                : "1px solid rgba(30,58,95,0.15)",
            }}>
              <Typography sx={{ 
                fontWeight: 600, 
                color: isDarkMode ? colors?.accent : colors?.primary,
                fontSize: "0.85rem"
              }}>
                {deliveredToPayOrders.length}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {canEditPayments && !isEditMode ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<FaEdit />}
                onClick={() => setIsEditMode(true)}
                sx={{
                  backgroundColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
                  color: isDarkMode ? "#0a1628" : "#fff",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  px: 2,
                  py: 0.75,
                  borderRadius: "8px",
                  boxShadow: isDarkMode 
                    ? "0 2px 8px rgba(255,183,77,0.3)" 
                    : "0 2px 8px rgba(30,58,95,0.2)",
                  "&:hover": {
                    backgroundColor: isDarkMode ? "#FFA726" : "#2d5a87",
                    transform: "translateY(-1px)",
                    boxShadow: isDarkMode 
                      ? "0 4px 12px rgba(255,183,77,0.4)" 
                      : "0 4px 12px rgba(30,58,95,0.3)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Edit
              </Button>
            ) : canEditPayments && isEditMode ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setIsEditMode(false);
                    // Reset selected orders to match current payment status without API call
                    const resetSelected = new Set();
                    memo.orders?.forEach(order => {
                      if (order.paymentTracking?.paymentStatus === "Payment Received") {
                        resetSelected.add(order.trackingId);
                      }
                    });
                    setSelectedOrders(resetSelected);
                  }}
                  sx={{
                    borderColor: isDarkMode ? "rgba(255,183,77,0.5)" : "rgba(30,58,95,0.5)",
                    color: isDarkMode ? colors?.accent : colors?.primary,
                    fontSize: "0.8rem",
                    px: 2,
                    py: 0.75,
                    borderRadius: "8px",
                    "&:hover": {
                      borderColor: isDarkMode ? colors?.accent : colors?.primary,
                      backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.04)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={isSaving ? <CircularProgress size={12} sx={{ color: "#fff" }} /> : <FaSave />}
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  sx={{
                    backgroundColor: "#16a34a",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    px: 2,
                    py: 0.75,
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                    "&:hover": {
                      backgroundColor: "#15803d",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(22,163,74,0.4)",
                    },
                    "&:disabled": {
                      backgroundColor: "#9ca3af",
                      transform: "none",
                      boxShadow: "none",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSelectAll}
                  sx={{
                    borderColor: isDarkMode ? "rgba(255,183,77,0.5)" : "rgba(30,58,95,0.5)",
                    color: isDarkMode ? colors?.accent : colors?.primary,
                    fontSize: "0.8rem",
                    px: 2,
                    py: 0.75,
                    borderRadius: "8px",
                    "&:hover": {
                      borderColor: isDarkMode ? colors?.accent : colors?.primary,
                      backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.04)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Select All
                </Button>
              </>
            ) : null}
            {!canEditPayments && (
              <Box sx={{
                px: 2,
                py: 0.75,
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(30,58,95,0.1)",
                border: isDarkMode ? "1px solid rgba(255,183,77,0.3)" : "1px solid rgba(30,58,95,0.3)",
              }}>
                <Typography sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: isDarkMode ? colors?.accent : colors?.primary,
                }}>
                  View Only
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
                <TableCell sx={cellStyle}>LR ID</TableCell>
                <TableCell sx={cellStyle}>Sender</TableCell>
                <TableCell sx={cellStyle}>Receiver</TableCell>
                <TableCell sx={cellStyle} align="right">Amount</TableCell>
                <TableCell sx={cellStyle}>Status</TableCell>
                <TableCell sx={cellStyle}>Received By</TableCell>
                <TableCell sx={cellStyle} align="center">View</TableCell>
                {canEditPayments && isEditMode && <TableCell sx={cellStyle} align="center">Select</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedByReceiver.length > 0 ? (
                groupedByReceiver.map(([receiverName, orders]) => {
                  const receiverTotal = calculateReceiverTotal(orders);
                  const receiverReceived = calculateReceiverReceived(orders);
                  const receiverPending = receiverTotal - receiverReceived;
                  
                  return (
                    <React.Fragment key={receiverName}>
                      {orders.map((order, idx) => {
                        const isPaid = order.paymentTracking?.paymentStatus === "Payment Received";
                        const isSelected = selectedOrders.has(order.trackingId);
                        const statusColor = getPaymentStatusColor(order.paymentTracking?.paymentStatus);

                        return (
                          <TableRow key={order.trackingId} hover>
                            <TableCell sx={{ ...rowCellStyle, fontWeight: 600 }}>
                              {highlightMatch(order.trackingId, appliedSearchQuery, isDarkMode)}
                            </TableCell>
                            <TableCell sx={rowCellStyle}>
                              {highlightMatch(order.sender?.name, appliedSearchQuery, isDarkMode)}
                            </TableCell>
                            <TableCell sx={rowCellStyle}>
                              {highlightMatch(order.receiver?.name, appliedSearchQuery, isDarkMode)}
                            </TableCell>
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
                            <TableCell sx={{ fontSize: "0.85rem" }}>
                              {isPaid && order.paymentTracking?.receivedBy ? (
                                <Box>
                                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                                    {order.paymentTracking.receivedBy.username}
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.75rem", color: colors?.textSecondary }}>
                                    {dateFormatter(order.paymentTracking.receivedAt)}
                                  </Typography>
                                </Box>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Link to={`/user/view/order/${order.trackingId}`} target="_blank" rel="noopener noreferrer">
                                <IconButton size="small" sx={{ color: isDarkMode ? "#FFB74D" : "primary.main" }}>
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
                      {/* Receiver Subtotal Row */}
                      <TableRow sx={{ 
                        background: "transparent",
                        "& td": {
                          border: "none",
                          padding: 0,
                        }
                      }}>
                        <TableCell colSpan={canEditPayments && isEditMode ? 8 : 7} sx={{ padding: "8px !important" }}>
                          <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            background: isDarkMode 
                              ? "linear-gradient(135deg, rgba(255,183,77,0.06) 0%, rgba(255,183,77,0.03) 100%)" 
                              : "linear-gradient(135deg, rgba(30,58,95,0.08) 0%, rgba(30,58,95,0.04) 100%)",
                            border: isDarkMode 
                              ? "1px solid rgba(255,183,77,0.25)" 
                              : "1px solid rgba(30,58,95,0.2)",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            gap: 2,
                            "&:hover": {
                              background: isDarkMode 
                                ? "linear-gradient(135deg, rgba(255,183,77,0.1) 0%, rgba(255,183,77,0.05) 100%)" 
                                : "linear-gradient(135deg, rgba(30,58,95,0.12) 0%, rgba(30,58,95,0.06) 100%)",
                            }
                          }}>
                            {/* Left section - Receiver name and order count */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: "0 0 auto", minWidth: "300px" }}>
                              <Box sx={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                backgroundColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
                              }} />
                              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: isDarkMode ? colors?.accent : colors?.primary }}>
                                Subtotal for {highlightMatch(receiverName, appliedSearchQuery, isDarkMode)}
                              </Typography>
                              <Chip 
                                label={`${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
                                size="small"
                                sx={{
                                  backgroundColor: isDarkMode ? "rgba(255,183,77,0.25)" : "rgba(30,58,95,0.2)",
                                  color: isDarkMode ? "#FFB74D" : "#1E3A5F",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  height: "20px",
                                }}
                              />
                            </Box>
                            
                            {/* Middle section - Total amount */}
                            <Box sx={{ flex: "0 0 auto", minWidth: "120px", textAlign: "right" }}>
                              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: isDarkMode ? colors?.accent : colors?.primary }}>
                                ₹{receiverTotal.toFixed(2)}
                              </Typography>
                            </Box>
                            
                            {/* Right section - Received and Pending */}
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
                              <Box sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 0.5,
                                px: 1.25,
                                py: 0.5,
                                borderRadius: "6px",
                                backgroundColor: "rgba(22,163,74,0.1)",
                                border: "1px solid rgba(22,163,74,0.3)",
                              }}>
                                <Typography sx={{ 
                                  fontSize: "0.75rem", 
                                  color: "#15803d",
                                  fontWeight: 600
                                }}>
                                  Received:
                                </Typography>
                                <Typography sx={{ 
                                  fontSize: "0.8rem", 
                                  fontWeight: 700,
                                  color: "#16a34a"
                                }}>
                                  ₹{receiverReceived.toFixed(2)}
                                </Typography>
                              </Box>
                              <Box sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 0.5,
                                px: 1.25,
                                py: 0.5,
                                borderRadius: "6px",
                                backgroundColor: "rgba(220,38,38,0.1)",
                                border: "1px solid rgba(220,38,38,0.3)",
                              }}>
                                <Typography sx={{ 
                                  fontSize: "0.75rem", 
                                  color: "#b91c1c",
                                  fontWeight: 600
                                }}>
                                  Pending:
                                </Typography>
                                <Typography sx={{ 
                                  fontSize: "0.8rem", 
                                  fontWeight: 700,
                                  color: "#dc2626"
                                }}>
                                  ₹{receiverPending.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={canEditPayments && isEditMode ? 8 : 7} sx={{ textAlign: "center", py: 4 }}>
                    <Typography sx={{ color: colors?.textSecondary }}>
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default MemoPaymentDetailsPage;
