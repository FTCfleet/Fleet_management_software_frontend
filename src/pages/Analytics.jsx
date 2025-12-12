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

const COLORS = ["#1E3A5F", "#25344E", "#FFB74D", "#4DB6AC", "#BA68C8"];
const warehouses = ["Global", "Alpha", "Beta", "Gamma", "Delta"];
const statuses = ["pending", "in-transit", "delivered"];

const generateDemoOrders = () => {
  const orders = [];
  const today = new Date();
  for (let i = 0; i < 50; i++) {
    const randomDays = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(today.getDate() - randomDays);
    orders.push({
      trackingId: `LR-${1000 + i}`,
      date: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      sourceWarehouse: { name: warehouses[Math.floor(Math.random() * (warehouses.length - 1)) + 1] },
      destinationWarehouse: { name: warehouses[Math.floor(Math.random() * (warehouses.length - 1)) + 1] },
      sender: { name: `Sender ${i}` },
      receiver: { name: `Receiver ${i}` },
    });
  }
  return orders;
};

const Analytics_UI = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0 });
  const [chartType, setChartType] = useState("week");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [chartData, setChartData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("Global");
  const [warehouseTable, setWarehouseTable] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { label: d.toLocaleString("default", { month: "long" }), value: d.getMonth() };
  }).reverse();

  useEffect(() => {
    setTimeout(() => {
      const demoOrders = generateDemoOrders();
      setOrders(demoOrders);
      setIsLoading(false);
    }, 500);
  }, []);

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
        return { day, orders: count };
      });
      setChartData(dailyCounts);
    } else {
      const year = new Date().getFullYear();
      const endOfSelected = new Date(year, selectedMonth + 1, 0);
      const monthDays = Array.from({ length: endOfSelected.getDate() }, (_, i) => i + 1);
      const dailyCounts = monthDays.map((day) => {
        const date = new Date(year, selectedMonth, day);
        const count = orders.filter((o) => isSameDay(o.date, date)).length;
        return { day: day.toString(), orders: count };
      });
      setChartData(dailyCounts);
    }

    // Pie Chart
    let relevantOrders = [...orders];
    if (selectedWarehouse !== "Global") {
      relevantOrders = relevantOrders.filter((o) => o.destinationWarehouse.name === selectedWarehouse);
    }
    const statusMap = { pending: 0, "in-transit": 0, delivered: 0 };
    relevantOrders.forEach((o) => {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1;
    });
    const ledgerList = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
    setLedgerData(ledgerList);

    // Warehouse Table
    const table = warehouses
      .filter((w) => w !== "Global")
      .map((w) => {
        const whOrders = orders.filter((o) => o.destinationWarehouse.name === w);
        const counts = { pending: 0, "in-transit": 0, delivered: 0 };
        whOrders.forEach((o) => counts[o.status]++);
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
        <ResponsiveContainer width="100%" height={isSmall ? 200 : 280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={chartType === "week" ? "day" : "day"} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            />
            <Bar dataKey="orders" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={isSmall ? 220 : 280}>
              <PieChart>
                <Pie
                  data={ledgerData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={isSmall ? 70 : 90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {ledgerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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
                    "&.Mui-selected": { backgroundColor: "#1E3A5F", color: "white" },
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
              <TableCell align="center" sx={{ fontWeight: 600, color: "#1E3A5F" }}>In-Transit</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: "#1E3A5F" }}>Delivered</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouseTable.map((row, idx) => (
              <TableRow key={idx} hover>
                <TableCell sx={{ fontWeight: 500, color: "#1E3A5F" }}>{row.warehouse}</TableCell>
                <TableCell align="center">{row.pending}</TableCell>
                <TableCell align="center">{row["in-transit"]}</TableCell>
                <TableCell align="center">{row.delivered}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
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
