import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  useMediaQuery,
} from "@mui/material";
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
} from "recharts";
import { useAuth } from "../routes/AuthContext";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const COLORS = ["#1E3A5F", "#000000", "#FFB74D", "#4DB6AC", "#BA68C8"];

const Analytics_UI = () => {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0 });
  const [chartType, setChartType] = useState("week");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [chartData, setChartData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [warehouseTable, setWarehouseTable] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const { isAdmin, isSource } = useAuth();
  const { dialogState, hideDialog, showError } = useDialog();

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { label: d.toLocaleString("default", { month: "long" }), value: d.getMonth() };
  }).reverse();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch orders for the last 60 days
      const ordersPromises = [];
      const today = new Date();
      
      for (let i = 0; i < 60; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        
        ordersPromises.push(
          fetch(`${BASE_URL}/api/parcel/all`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ date: dateStr }),
          }).then(res => res.json())
        );
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
        const warehouseList = ["All", ...warehouseData.body.map(w => w.name)];
        setWarehouses(warehouseList);
      }

      // Process orders data
      const ordersResults = await Promise.all(ordersPromises);
      const allOrders = [];
      
      ordersResults.forEach((result, index) => {
        if (result.flag && result.body) {
          const date = new Date();
          date.setDate(today.getDate() - index);
          result.body.forEach(order => {
            allOrders.push({
              ...order,
              date: date.toISOString(),
            });
          });
        }
      });

      setOrders(allOrders);
    } catch (error) {
      showError("Failed to fetch analytics data. Please try again.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) computeAnalytics();
  }, [orders, chartType, selectedMonth, selectedWarehouse, isLoading]);

  const isSameDay = (d1, d2) => new Date(d1).toDateString() === new Date(d2).toDateString();

  const computeAnalytics = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const ordersToday = orders.filter((o) => isSameDay(o.date, today));
    const ordersThisWeek = orders.filter((o) => new Date(o.date) >= startOfWeek);
    const ordersThisMonth = orders.filter((o) => new Date(o.date) >= startOfMonth);

    setStats({ today: ordersToday.length, week: ordersThisWeek.length, month: ordersThisMonth.length });

    // Bar Chart
    if (chartType === "week") {
      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyCounts = weekDays.map((day, idx) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + idx);
        const count = orders.filter((o) => isSameDay(o.date, date)).length;
        return { 
          day: day, 
          orders: count,
          fullDate: date.toLocaleDateString('en', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        };
      });
      setChartData(dailyCounts);
    } else {
      const year = new Date().getFullYear();
      const endOfSelected = new Date(year, selectedMonth + 1, 0);
      const monthDays = Array.from({ length: endOfSelected.getDate() }, (_, i) => i + 1);
      const dailyCounts = monthDays.map((day) => {
        const date = new Date(year, selectedMonth, day);
        const count = orders.filter((o) => isSameDay(o.date, date)).length;
        const dayName = date.toLocaleDateString('en', { weekday: 'long' });
        return { 
          day: day.toString(), 
          orders: count,
          fullDate: `${dayName}, ${date.toLocaleDateString('en', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`
        };
      });
      setChartData(dailyCounts);
    }

    // Pie Chart - Status Distribution
    let relevantOrders = [...orders];
    if (selectedWarehouse !== "All") {
      relevantOrders = relevantOrders.filter((o) => 
        o.sourceWarehouse?.name === selectedWarehouse || 
        o.destinationWarehouse?.name === selectedWarehouse
      );
    }
    
    const statusMap = { pending: 0, dispatched: 0, arrived: 0, delivered: 0 };
    relevantOrders.forEach((o) => {
      if (statusMap.hasOwnProperty(o.status)) {
        statusMap[o.status]++;
      }
    });
    
    const ledgerList = Object.entries(statusMap)
      .filter(([name, value]) => value > 0)
      .map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
      }));
    setLedgerData(ledgerList);

    // Warehouse Table
    const warehouseNames = warehouses.filter((w) => w !== "All");
    const table = warehouseNames.map((w) => {
      const whOrders = orders.filter((o) => 
        o.sourceWarehouse?.name === w || o.destinationWarehouse?.name === w
      );
      const counts = { pending: 0, dispatched: 0, arrived: 0, delivered: 0 };
      whOrders.forEach((o) => {
        if (counts.hasOwnProperty(o.status)) {
          counts[o.status]++;
        }
      });
      return { warehouse: w, ...counts };
    });
    setWarehouseTable(table);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#1E3A5F" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100%" }}>
      <Typography variant="h5" sx={{ mb: 3, color: "#1E3A5F", fontWeight: 700 }}>
        Analytics Dashboard
      </Typography>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard title="Orders Today" value={stats.today} color="#1E3A5F" />
        <StatCard title="This Week" value={stats.week} color="#25344E" />
        <StatCard title="This Month" value={stats.month} color="#457b9d" />
      </Box>

      {/* Bar Chart */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography sx={{ color: "#1E3A5F", fontWeight: 600 }}>
            Orders {chartType === "week" ? "This Week" : months.find((m) => m.value === selectedMonth)?.label}
          </Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(_, v) => v && setChartType(v)}
            size="small"
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {chartData.some(item => item.orders > 0) ? (
          <ResponsiveContainer width="100%" height={isSmall ? 200 : 280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: isSmall ? 10 : 12, textAnchor: 'middle' }}
                interval={0}
                height={40}
                tickFormatter={(value) => {
                  if (!isSmall || chartType !== "month") return value;
                  
                  const numValue = parseInt(value);
                  // Show odd numbers: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31
                  return numValue % 2 === 1 ? value : '';
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ 
                  borderRadius: 8, 
                  border: "none", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  backgroundColor: "white",
                  padding: "12px"
                }}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.day === label);
                  return item ? item.fullDate : label;
                }}
                formatter={(value, name) => [
                  `${value} ${value === 1 ? 'order' : 'orders'}`, 
                  'Orders'
                ]}
              />
              <Bar dataKey="orders" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box 
            sx={{ 
              height: isSmall ? 200 : 280,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              textAlign: "center"
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, color: "#94a3b8" }}>
              No Orders Found
            </Typography>
            <Typography sx={{ fontSize: "0.9rem" }}>
              No orders were placed during this {chartType === "week" ? "week" : "month"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Pie Chart & Warehouse Selector */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Typography sx={{ color: "#1E3A5F", fontWeight: 600, mb: 2 }}>
              Status Distribution {selectedWarehouse !== "All" && `- ${selectedWarehouse}`}
            </Typography>
            {ledgerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={isSmall ? 250 : 300}>
                <PieChart>
                  <Pie
                    data={ledgerData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isSmall ? 60 : 80}
                    innerRadius={isSmall ? 25 : 35}
                    paddingAngle={1}
                    minAngle={5}
                    label={false}
                  >
                    {ledgerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: "none", 
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "0.9rem"
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color, fontSize: "0.85rem" }}>
                        {value} ({entry.payload.value})
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box 
                sx={{ 
                  height: isSmall ? 250 : 300,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  textAlign: "center",
                  p: 3
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: "#94a3b8" }}>
                  No Data Available
                </Typography>
                <Typography sx={{ fontSize: "0.9rem" }}>
                  {selectedWarehouse === "All" 
                    ? "No orders found in the selected time period"
                    : `No orders found for ${selectedWarehouse}`
                  }
                </Typography>
              </Box>
            )}
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1.5, color: "#25344E", fontSize: "0.9rem" }}>
              Select Warehouse
            </Typography>
            <ToggleButtonGroup
              orientation={isMobile ? "horizontal" : "vertical"}
              value={selectedWarehouse}
              exclusive
              onChange={(_, v) => v && setSelectedWarehouse(v)}
              sx={{ flexWrap: "wrap" }}
            >
              {warehouses.map((w) => (
                <ToggleButton
                  key={w}
                  value={w}
                  sx={{
                    px: 2,
                    py: 1,
                    fontSize: "0.85rem",
                    color: "#1E3A5F",
                    borderColor: "#e2e8f0",
                    "&.Mui-selected": { 
                      backgroundColor: "#1E3A5F", 
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#25344E",
                        color: "white"
                      }
                    },
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      borderColor: "#1E3A5F"
                    }
                  }}
                >
                  {w}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* Warehouse Table */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflowX: "auto" }}>
        <Typography sx={{ color: "#1E3A5F", fontWeight: 600, mb: 2 }}>
          Warehouse Summary
        </Typography>
        <Table size={isSmall ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }}>Warehouse</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: "#1E3A5F" }}>Pending</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: "#1E3A5F" }}>Dispatched</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: "#1E3A5F" }}>Arrived</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: "#1E3A5F" }}>Delivered</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouseTable.length > 0 ? (
              warehouseTable.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 500, color: "#1E3A5F" }}>{row.warehouse}</TableCell>
                  <TableCell align="center">{row.pending}</TableCell>
                  <TableCell align="center">{row.dispatched}</TableCell>
                  <TableCell align="center">{row.arrived}</TableCell>
                  <TableCell align="center">{row.delivered}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "#64748b" }}>
                  <Typography variant="h6" sx={{ mb: 1, color: "#94a3b8" }}>
                    No Warehouse Data
                  </Typography>
                  <Typography sx={{ fontSize: "0.9rem" }}>
                    No warehouses found or no orders available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
const StatCard = ({ title, value, color }) => (
  <Card sx={{ borderRadius: 2, borderLeft: `4px solid ${color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
    <CardContent sx={{ py: 2 }}>
      <Typography sx={{ color: "#64748b", fontSize: "0.85rem", mb: 0.5 }}>{title}</Typography>
      <Typography variant="h4" sx={{ color, fontWeight: 700 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default Analytics_UI;
