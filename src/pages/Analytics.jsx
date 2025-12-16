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
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch orders for the last 60 days in batches
      const allOrders = [];
      const today = new Date();
      
      // Fetch in parallel but limit concurrent requests
      const batchSize = 10;
      for (let batch = 0; batch < 6; batch++) {
        const promises = [];
        for (let i = 0; i < batchSize; i++) {
          const dayOffset = batch * batchSize + i;
          if (dayOffset >= 60) break;
          
          const date = new Date();
          date.setDate(today.getDate() - dayOffset);
          const dateStr = date.toISOString().split("T")[0];
          
          promises.push(
            fetch(`${BASE_URL}/api/parcel/all`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ date: dateStr }),
            })
            .then(res => res.json())
            .then(result => ({ result, dayOffset, date: new Date(date) }))
            .catch(() => ({ result: { flag: false }, dayOffset, date: new Date(date) }))
          );
        }
        
        const results = await Promise.all(promises);
        results.forEach(({ result, date }) => {
          if (result.flag && result.body) {
            result.body.forEach(order => {
              allOrders.push({
                ...order,
                fetchDate: date.toISOString(),
              });
            });
          }
        });
      }

      // Fetch warehouses
      const warehouseResponse = await fetch(`${BASE_URL}/api/admin/get-all-warehouses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const warehouseData = await warehouseResponse.json();
      
      if (warehouseData.flag) {
        setWarehouses(["All", ...warehouseData.body.map(w => w.name)]);
      }

      setOrders(allOrders);
    } catch (error) {
      showError("Failed to fetch analytics data. Please try again.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && orders.length >= 0) computeAnalytics();
  }, [orders, chartType, selectedMonth, selectedYear, selectedWarehouse, isLoading]);

  const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.toDateString() === date2.toDateString();
  };

  const getOrderDate = (order) => {
    // Use the order's actual date if available, otherwise use fetchDate
    return order.date || order.createdAt || order.fetchDate;
  };

  const computeAnalytics = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Calculate stats
    const ordersToday = orders.filter((o) => isSameDay(getOrderDate(o), today));
    const ordersThisWeek = orders.filter((o) => new Date(getOrderDate(o)) >= startOfWeek);
    const ordersThisMonth = orders.filter((o) => new Date(getOrderDate(o)) >= startOfMonth);

    setStats({ 
      today: ordersToday.length, 
      week: ordersThisWeek.length, 
      month: ordersThisMonth.length,
      total: orders.length 
    });

    // Bar/Area Chart Data
    if (chartType === "week") {
      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyCounts = weekDays.map((day, idx) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + idx);
        const count = orders.filter((o) => isSameDay(getOrderDate(o), date)).length;
        return { 
          name: day, 
          orders: count,
          fullDate: date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })
        };
      });
      setChartData(dailyCounts);
    } else {
      const endOfSelected = new Date(selectedYear, selectedMonth + 1, 0);
      const daysInMonth = endOfSelected.getDate();
      const dailyCounts = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const date = new Date(selectedYear, selectedMonth, day);
        const count = orders.filter((o) => isSameDay(getOrderDate(o), date)).length;
        return { 
          name: day.toString(), 
          orders: count,
          fullDate: date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
        };
      });
      setChartData(dailyCounts);
    }

    // Status Distribution (Pie Chart)
    let relevantOrders = [...orders];
    if (selectedWarehouse !== "All") {
      relevantOrders = relevantOrders.filter((o) => 
        o.sourceWarehouse?.name === selectedWarehouse || 
        o.destinationWarehouse?.name === selectedWarehouse
      );
    }
    
    const statusMap = { arrived: 0, dispatched: 0, delivered: 0 };
    relevantOrders.forEach((o) => {
      const status = o.status?.toLowerCase();
      if (statusMap.hasOwnProperty(status)) {
        statusMap[status]++;
      }
    });
    
    const statusList = Object.entries(statusMap)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value,
        color: STATUS_COLORS[name.charAt(0).toUpperCase() + name.slice(1)]
      }));
    setStatusData(statusList);

    // Warehouse Table
    const warehouseNames = warehouses.filter((w) => w !== "All");
    const table = warehouseNames.map((w) => {
      const whOrders = orders.filter((o) => 
        o.sourceWarehouse?.name === w || o.destinationWarehouse?.name === w
      );
      const counts = { arrived: 0, dispatched: 0, delivered: 0, total: whOrders.length };
      whOrders.forEach((o) => {
        const status = o.status?.toLowerCase();
        if (counts.hasOwnProperty(status)) {
          counts[status]++;
        }
      });
      return { warehouse: w, ...counts };
    });
    setWarehouseTable(table);
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
              onChange={(_, v) => v && setChartType(v)}
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
                onChange={(e) => setSelectedWarehouse(e.target.value)}
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
                  }}
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
                      width: `${(status.value / orders.length) * 100}%`,
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
                    {row.warehouse}
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
