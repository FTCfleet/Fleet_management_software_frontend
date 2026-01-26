import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import ModernSpinner from "../components/ModernSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "../routes/AuthContext";
import { useOutletContext } from "react-router-dom";
import { FaBoxOpen, FaTruck, FaCheckCircle, FaChartLine } from "react-icons/fa";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Analytics_UI = () => {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0 });
  const [chartType, setChartType] = useState("week");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [warehouseTable, setWarehouseTable] = useState([]);
  
  const { isDarkMode, colors } = useOutletContext() || {};
  const { isAdmin } = useAuth();
  const { dialogState, hideDialog, showError } = useDialog();

  // Theme-aware colors
  const CHART_COLORS = isDarkMode 
    ? ["#FFB74D", "#60a5fa", "#4ade80", "#f472b6", "#a78bfa"]
    : ["#1E3A5F", "#457b9d", "#2a9d8f", "#e76f51", "#9c6644"];

  const STATUS_COLORS = {
    Arrived: isDarkMode ? "#60a5fa" : "#3b82f6",
    Dispatched: isDarkMode ? "#fbbf24" : "#f59e0b",
    Delivered: isDarkMode ? "#4ade80" : "#22c55e",
    Pending: isDarkMode ? "#f472b6" : "#ec4899",
  };

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { 
      label: d.toLocaleString("default", { month: "short", year: "numeric" }), 
      month: d.getMonth(),
      year: d.getFullYear()
    };
  });

  useEffect(() => {
    fetchData();
    fetchWarehouses();
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchData();
    }
  }, [selectedWarehouse, chartType, selectedMonth, selectedYear]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Build query parameters for filters
      const params = new URLSearchParams();
      if (selectedWarehouse && selectedWarehouse !== 'All') {
        params.append('warehouse', selectedWarehouse);
      }
      params.append('period', chartType);
      if (chartType === 'month') {
        params.append('month', selectedMonth.toString());
        params.append('year', selectedYear.toString());
      }
      
      // Single optimized API call for dashboard analytics with filters
      const response = await fetch(`${BASE_URL}/api/analytics/dashboard?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const { timeCounts, statusDistribution, stationSummary, chartData } = result.data;
        
        // Set stats from API response
        setStats({
          today: timeCounts.today,
          week: timeCounts.thisWeek,
          month: timeCounts.thisMonth,
          total: timeCounts.last60Days
        });
        
        // Set chart data from API response
        setChartData(chartData.map(item => ({
          name: item.day,
          orders: item.count,
          fullDate: new Date(item.date).toLocaleDateString('en', { 
            weekday: chartType === 'week' ? 'long' : 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        })));
        
        // Set status data for pie chart
        const statusList = [
          { name: 'Arrived', value: statusDistribution.arrived, color: STATUS_COLORS.Arrived },
          { name: 'Dispatched', value: statusDistribution.dispatched, color: STATUS_COLORS.Dispatched },
          { name: 'Delivered', value: statusDistribution.delivered, color: STATUS_COLORS.Delivered }
        ].filter(item => item.value > 0);
        setStatusData(statusList);
        
        // Set warehouse table data (only if not filtered by warehouse)
        if (!selectedWarehouse || selectedWarehouse === 'All') {
          setWarehouseTable(stationSummary.map(station => ({
            name: station.stationName,
            arrived: station.arrived,
            dispatched: station.dispatched,
            delivered: station.delivered,
            total: station.total
          })));
        } else {
          setWarehouseTable([]); // Clear table when filtered by specific warehouse
        }
        
        // For backward compatibility
        setOrders([]);
        
      } else {
        throw new Error(result.message || "Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
      showError("Failed to fetch analytics data. Please try again.", "Error");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch warehouse names on mount
  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/analytics/warehouses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setWarehouses(["All", ...result.data.map(w => w.name)]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  };




  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: 2 }}>
        <ModernSpinner size={48} />
        <Typography sx={{ color: colors?.textSecondary }}>Loading analytics...</Typography>
      </Box>
    );
  }

  const cardStyle = {
    p: { xs: 2, md: 2.5 },
    borderRadius: "16px",
    backgroundColor: colors?.bgCard || "#fff",
    border: `1px solid ${colors?.border || "#e2e8f0"}`,
    boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.04)",
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: colors?.textPrimary, fontWeight: 700, mb: 0.5 }}>
          Analytics Dashboard
        </Typography>
        <Typography sx={{ color: colors?.textSecondary, fontSize: "0.9rem" }}>
          Overview of your logistics performance
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        <StatCard 
          title="Today" 
          value={stats.today} 
          icon={<FaBoxOpen />}
          color={isDarkMode ? "#FFB74D" : "#1E3A5F"}
          isDarkMode={isDarkMode}
          colors={colors}
        />
        <StatCard 
          title="This Week" 
          value={stats.week} 
          icon={<FaChartLine />}
          color={isDarkMode ? "#60a5fa" : "#3b82f6"}
          isDarkMode={isDarkMode}
          colors={colors}
        />
        <StatCard 
          title="This Month" 
          value={stats.month} 
          icon={<FaTruck />}
          color={isDarkMode ? "#4ade80" : "#22c55e"}
          isDarkMode={isDarkMode}
          colors={colors}
        />
        <StatCard 
          title="Last 60 Days" 
          value={stats.total} 
          icon={<FaCheckCircle />}
          color={isDarkMode ? "#a78bfa" : "#8b5cf6"}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      </Box>

      {/* Orders Chart */}
      <Paper sx={{ ...cardStyle, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
          <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "1.1rem" }}>
            Orders Overview
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
            {chartType === "month" && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={`${selectedMonth}-${selectedYear}`}
                  onChange={(e) => {
                    const [month, year] = e.target.value.split("-");
                    setSelectedMonth(parseInt(month));
                    setSelectedYear(parseInt(year));
                    // Data will be refetched automatically via useEffect
                  }}
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: colors?.bgPrimary,
                    color: colors?.textPrimary,
                    fontSize: "0.85rem",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: colors?.border },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? "#FFB74D" : "#1E3A5F" },
                  }}
                >
                  {monthOptions.map((opt, idx) => (
                    <MenuItem key={idx} value={`${opt.month}-${opt.year}`}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(_, v) => {
                if (v) {
                  setChartType(v);
                  // Data will be refetched automatically via useEffect
                }
              }}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  px: 2,
                  py: 0.75,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: colors?.textSecondary,
                  borderColor: colors?.border,
                  "&.Mui-selected": {
                    backgroundColor: isDarkMode ? "rgba(255,183,77,0.15)" : "rgba(30,58,95,0.1)",
                    color: isDarkMode ? "#FFB74D" : "#1E3A5F",
                    borderColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
                  },
                },
              }}
            >
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        
        {chartData.some(item => item.orders > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDarkMode ? "#FFB74D" : "#1E3A5F"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isDarkMode ? "#FFB74D" : "#1E3A5F"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors?.border} vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: colors?.textSecondary }}
                axisLine={{ stroke: colors?.border }}
                tickLine={false}
                interval={chartType === "month" ? 2 : 0}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: colors?.textSecondary }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: 12, 
                  border: `1px solid ${colors?.border}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  backgroundColor: colors?.bgCard,
                  padding: "10px 14px"
                }}
                labelStyle={{ color: colors?.textPrimary, fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: colors?.textSecondary }}
                labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ""}
                formatter={(value) => [`${value} orders`, ""]}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke={isDarkMode ? "#FFB74D" : "#1E3A5F"} 
                strokeWidth={2.5}
                fill="url(#colorOrders)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message={`No orders found for this ${chartType}`} colors={colors} />
        )}
      </Paper>

      {/* Status Distribution & Warehouse Filter */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3, mb: 3 }}>
        {/* Pie Chart */}
        <Paper sx={cardStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography sx={{ color: colors?.textPrimary, fontWeight: 600 }}>
              Status Distribution
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedWarehouse}
                onChange={(e) => {
                  setSelectedWarehouse(e.target.value);
                  // Data will be refetched automatically via useEffect
                }}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: colors?.bgPrimary,
                  color: colors?.textPrimary,
                  fontSize: "0.8rem",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors?.border },
                }}
              >
                {warehouses.map((w) => (
                  <MenuItem key={w} value={w}>{w}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={2}
                  minAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: `1px solid ${colors?.border}`,
                    backgroundColor: colors?.bgCard,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    color: colors?.textPrimary,
                  }}
                  itemStyle={{ color: colors?.textPrimary }}
                  formatter={(value, name) => [`${value} orders`, name]}
                />
                <Legend 
                  verticalAlign="bottom"
                  formatter={(value, entry) => (
                    <span style={{ color: colors?.textPrimary, fontSize: "0.85rem" }}>
                      {value} ({entry.payload.value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No status data available" colors={colors} height={260} />
          )}
        </Paper>

        {/* Quick Stats by Status */}
        <Paper sx={cardStyle}>
          <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, mb: 2 }}>
            Status Breakdown
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {statusData.length > 0 ? statusData.map((status, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: "50%", 
                  backgroundColor: status.color,
                  flexShrink: 0
                }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ color: colors?.textPrimary, fontSize: "0.9rem", fontWeight: 500 }}>
                      {status.name}
                    </Typography>
                    <Typography sx={{ color: colors?.textSecondary, fontSize: "0.9rem" }}>
                      {status.value} orders
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    height: 6, 
                    borderRadius: 3, 
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                    overflow: "hidden"
                  }}>
                    <Box sx={{ 
                      height: "100%", 
                      width: `${statusData.length > 0 ? (status.value / statusData.reduce((sum, s) => sum + s.value, 0)) * 100 : 0}%`,
                      backgroundColor: status.color,
                      borderRadius: 3,
                      transition: "width 0.5s ease"
                    }} />
                  </Box>
                </Box>
              </Box>
            )) : (
              <EmptyState message="No data to display" colors={colors} height={200} />
            )}
          </Box>
        </Paper>
      </Box>

      {/* Warehouse Table */}
      <Paper sx={cardStyle}>
        <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, mb: 2 }}>
          Station Summary
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                "& th": { 
                  fontWeight: 600, 
                  color: colors?.textPrimary,
                  fontSize: "0.8rem",
                  py: 1.5,
                  borderBottom: `1px solid ${colors?.border}`
                }
              }}>
                <TableCell>Station</TableCell>
                <TableCell align="center">Arrived</TableCell>
                <TableCell align="center">Dispatched</TableCell>
                <TableCell align="center">Delivered</TableCell>
                <TableCell align="center">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {warehouseTable.length > 0 ? warehouseTable.map((row, idx) => (
                <TableRow 
                  key={idx} 
                  sx={{ 
                    "&:hover": { backgroundColor: colors?.bgHover },
                    "& td": { 
                      borderBottom: `1px solid ${colors?.border}`,
                      py: 1.5
                    }
                  }}
                >
                  <TableCell sx={{ fontWeight: 500, color: colors?.textPrimary, fontSize: "0.85rem" }}>
                    {row.name}
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge value={row.arrived} color={STATUS_COLORS.Arrived} isDarkMode={isDarkMode} />
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge value={row.dispatched} color={STATUS_COLORS.Dispatched} isDarkMode={isDarkMode} />
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge value={row.delivered} color={STATUS_COLORS.Delivered} isDarkMode={isDarkMode} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: colors?.textPrimary }}>
                    {row.total}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 4 }}>
                    <EmptyState message="No station data available" colors={colors} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <CustomDialog
        open={dialogState.open}
        onClose={hideDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
      />
    </Box>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, isDarkMode, colors }) => (
  <Paper sx={{ 
    p: 2.5, 
    borderRadius: "16px",
    backgroundColor: colors?.bgCard || "#fff",
    border: `1px solid ${colors?.border || "#e2e8f0"}`,
    boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.04)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: isDarkMode ? "0 8px 30px rgba(0,0,0,0.35)" : "0 4px 20px rgba(0,0,0,0.08)",
    }
  }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <Box>
        <Typography sx={{ color: colors?.textSecondary, fontSize: "0.8rem", fontWeight: 500, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ color: colors?.textPrimary, fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2 }}>
          {value.toLocaleString()}
        </Typography>
      </Box>
      <Box sx={{ 
        width: 42, 
        height: 42, 
        borderRadius: "12px",
        backgroundColor: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        fontSize: "1.1rem"
      }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

// Status Badge Component
const StatusBadge = ({ value, color, isDarkMode }) => (
  <Box sx={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
    px: 1,
    py: 0.25,
    borderRadius: "6px",
    backgroundColor: `${color}${isDarkMode ? "25" : "15"}`,
    color: color,
    fontSize: "0.8rem",
    fontWeight: 600
  }}>
    {value}
  </Box>
);

// Empty State Component
const EmptyState = ({ message, colors, height = 150 }) => (
  <Box sx={{ 
    height, 
    display: "flex", 
    flexDirection: "column",
    alignItems: "center", 
    justifyContent: "center",
    color: colors?.textSecondary
  }}>
    <Typography sx={{ fontSize: "0.9rem" }}>{message}</Typography>
  </Box>
);

export default Analytics_UI;
