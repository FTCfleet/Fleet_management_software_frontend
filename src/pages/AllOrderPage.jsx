import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Button,
} from "@mui/material";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import "../css/table.css";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import { getDate } from "../utils/dateFormatter";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";
import Pagination from "../components/Pagination";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const PAGE_LIMIT = 200;

const AllOrderPage = () => {
  const { type } = useParams();
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getDate());
  const [warehouses, setWarehouses] = useState([]);
  const { isSource, isAdmin } = useAuth();
  const [idFilter, setIdFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isDarkMode, colors } = useOutletContext() || {};

  const cellStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: 600, fontSize: "0.85rem" };
  const rowCellStyle = { color: colors?.textSecondary || "#25344E", fontSize: "0.9rem" };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData({page: currentPage, idFilterValue: idFilter, nameFilterValue: nameFilter, warehouseFilterValue: warehouseFilter});
  }, [selectedDate, type, currentPage]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [type, selectedDate]);

  const fetchWarehouses = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/get-all-warehouses`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setWarehouses(data.body.filter((w) => w.isSource !== isSource || isAdmin));
  };

  const fetchData = useCallback(async ({page, idFilterValue, nameFilterValue, warehouseFilterValue}) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Build query params
      const params = new URLSearchParams();
      params.append("date", selectedDate);
      params.append("page", page.toString());
      
      // Status filter - map type to backend status
      if (type !== "all") {
        params.append("status", type);
      }
      
      // Optional filters - only add if there's a value
      if (idFilterValue.trim()) {
        params.append("id", idFilterValue.trim());
      }
      if (nameFilterValue.trim()) {
        params.append("name", nameFilterValue.trim());
      }
      if (warehouseFilterValue) {
        // Determine if source or dest based on user role
        if (isAdmin) {
          // For admin, try both
          params.append("src", warehouseFilterValue);
          params.append("dest", warehouseFilterValue);
        } else if (isSource) {
          params.append("dest", warehouseFilterValue);
        } else {
          params.append("src", warehouseFilterValue);
        }
      }
      
      const response = await fetch(`${BASE_URL}/api/parcel/all?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      if (!data.flag) {
        alert("Please login first");
        return;
      }
      console.log(data);
      const fetchedOrders = data.body?.parcels || [];
      setOrders(fetchedOrders);
      setPageSize(data.body?.pageSize || fetchedOrders.length);
      setTotalPages(data.body?.totalPages || 0);
      setTotalOrders(data.body?.totalParcels || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Error fetching orders");
    }
    setIsLoading(false);
  }, [selectedDate, type, isSource, isAdmin]);

  // Client-side filtering for immediate feedback (filters already applied on server)
  const filteredOrders = orders;

  // Memoized orders with serial numbers for performance
  const memoizedOrders = useMemo(() => {
    const perPage = pageSize || filteredOrders.length || 0;
    const offset = perPage ? (currentPage - 1) * perPage : 0;
    return filteredOrders.map((order, index) => ({
      ...order,
      serial: offset + index + 1,
    }));
  }, [filteredOrders, currentPage, pageSize]);

  // Resolved total pages with fallback calculation
  const resolvedTotalPages = useMemo(() => {
    if (totalPages) return totalPages;
    if (totalOrders && pageSize) return Math.ceil(totalOrders / pageSize);
    return totalOrders > 0 ? 1 : 0;
  }, [totalPages, totalOrders, pageSize]);

  // Visible range for pagination info
  const visibleRange = useMemo(() => {
    if (!memoizedOrders.length) return { start: 0, end: 0 };
    return {
      start: memoizedOrders[0].serial,
      end: memoizedOrders[memoizedOrders.length - 1].serial,
    };
  }, [memoizedOrders]);

  const applyFilter = () => {
    setCurrentPage(1);
    fetchData({page: 1, idFilterValue: idFilter, nameFilterValue: nameFilter, warehouseFilterValue: warehouseFilter});
  };

  const clearFilter = () => {
    setIdFilter("");
    setNameFilter("");
    setWarehouseFilter("");
    setCurrentPage(1);
    fetchData({page: 1, idFilterValue: "", nameFilterValue: "", warehouseFilterValue: ""});
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      delivered: { bg: "#dcfce7", color: "#166534" },
      dispatched: { bg: "#fef3c7", color: "#92400e" },
      arrived: { bg: "#dbeafe", color: "#1e40af" },
      pending: { bg: "#fee2e2", color: "#991b1b" },
    };
    return statusColors[status] || { bg: "#f1f5f9", color: "#475569" };
  };

  // Mobile Card View - Memoized for performance
  const MobileOrderCard = React.memo(({ order, idx }) => {
    const statusColor = getStatusColor(order.status);
    const searchTerm = idFilter || nameFilter;
    
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
                {highlightMatch(order.trackingId, idFilter, isDarkMode)}
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
              <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500 }}>
                {highlightMatch(order.sender?.name, nameFilter, isDarkMode)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>Receiver</Typography>
              <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500 }}>
                {highlightMatch(order.receiver?.name, nameFilter, isDarkMode)}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>
                {isAdmin ? "Route" : isSource ? "Destination" : "Source"}
              </Typography>
              <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500 }}>
                {isAdmin
                  ? `${order.sourceWarehouse?.name} → ${order.destinationWarehouse?.name}`
                  : isSource
                  ? order.destinationWarehouse?.name
                  : order.sourceWarehouse?.name}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  });

  return (
    <Box sx={{ backgroundColor: colors?.bgPrimary || "#f8fafc", minHeight: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2, color: colors?.textPrimary || "#1E3A5F", fontWeight: 700 }}>
        {type.charAt(0).toUpperCase() + type.slice(1)} LRs
      </Typography>

      {/* Filters - Two search bars */}
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
        showDropdown={true}
        dropdownValue={warehouseFilter}
        onDropdownChange={setWarehouseFilter}
        dropdownOptions={warehouses.map(w => ({ value: w.warehouseID, label: w.name }))}
        dropdownPlaceholder="All Warehouses"
      />

      {/* Pagination Controls - Above table */}
      <Pagination
        currentPage={currentPage}
        totalPages={resolvedTotalPages}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
        isLoading={isLoading}
        showInfo={true}
        infoText={memoizedOrders.length > 0
          ? `Showing ${visibleRange.start} - ${visibleRange.end} of ${totalOrders} orders`
          : `Showing 0 of ${totalOrders} orders`}
        isDarkMode={isDarkMode}
        colors={colors}
      />

      {/* Content */}
      {isMobile ? (
        // Mobile Card View
        <Box>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <ModernSpinner size={40} />
            </Box>
          ) : memoizedOrders.length > 0 ? (
            memoizedOrders.map((order) => <MobileOrderCard key={order.trackingId || order.serial} order={order} idx={order.serial} />)
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
              ) : memoizedOrders.length > 0 ? (
                memoizedOrders.map((order) => (
                  <TableRow key={order.trackingId || order.serial} hover>
                    <TableCell sx={rowCellStyle}>{order.serial}.</TableCell>
                    <TableCell sx={{ ...rowCellStyle, fontWeight: 600 }}>{highlightMatch(order.trackingId, idFilter, isDarkMode)}</TableCell>
                    <TableCell sx={rowCellStyle}>{highlightMatch(order.sender?.name, nameFilter, isDarkMode)}</TableCell>
                    <TableCell sx={rowCellStyle}>{highlightMatch(order.receiver?.name, nameFilter, isDarkMode)}</TableCell>
                    {isAdmin ? (
                      <>
                        <TableCell sx={rowCellStyle}>{order.sourceWarehouse?.name}</TableCell>
                        <TableCell sx={rowCellStyle}>{order.destinationWarehouse?.name}</TableCell>
                      </>
                    ) : (
                      <TableCell sx={rowCellStyle}>
                        {isSource ? order.destinationWarehouse?.name : order.sourceWarehouse?.name}
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
