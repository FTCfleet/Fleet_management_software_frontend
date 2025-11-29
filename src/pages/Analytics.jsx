import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
    const randomDays = Math.floor(Math.random() * 60); // up to 2 months
    const date = new Date();
    date.setDate(today.getDate() - randomDays);

    orders.push({
      trackingId: `LR-${1000 + i}`,
      date: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      sourceWarehouse: {
        name: warehouses[Math.floor(Math.random() * (warehouses.length - 1)) + 1],
      },
      destinationWarehouse: {
        name: warehouses[Math.floor(Math.random() * (warehouses.length - 1)) + 1],
      },
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
  const [pendingStats, setPendingStats] = useState({ count: 0, earliest: null });
  const [chartType, setChartType] = useState("week"); // week or month
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [chartData, setChartData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("Global");
  const [warehouseTable, setWarehouseTable] = useState([]);

  // Generate last 6 months
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
  }, [orders, chartType, selectedMonth, selectedWarehouse]);

  const isSameDay = (d1, d2) =>
    new Date(d1).toDateString() === new Date(d2).toDateString();

  const computeAnalytics = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const ordersToday = orders.filter((o) => isSameDay(o.date, today));
    const ordersThisWeek = orders.filter((o) => new Date(o.date) >= startOfWeek);
    const ordersThisMonth = orders.filter((o) => new Date(o.date) >= startOfMonth);

    setStats({
      today: ordersToday.length,
      week: ordersThisWeek.length,
      month: ordersThisMonth.length,
    });

    // Pending orders stats
    const pendingOrders = orders.filter((o) => o.status === "pending");
    let earliest = null;
    if (pendingOrders.length > 0) {
      earliest = new Date(
        Math.min(...pendingOrders.map((o) => new Date(o.date)))
      ).toDateString();
    }
    setPendingStats({ count: pendingOrders.length, earliest });

    // --- Bar Chart ---
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
      const startOfSelected = new Date(year, selectedMonth, 1);
      const endOfSelected = new Date(year, selectedMonth + 1, 0);

      const monthDays = Array.from(
        { length: endOfSelected.getDate() },
        (_, i) => i + 1
      );
      const dailyCounts = monthDays.map((day) => {
        const date = new Date(year, selectedMonth, day);
        const count = orders.filter((o) => isSameDay(o.date, date)).length;
        return { day: day.toString(), orders: count };
      });
      setChartData(dailyCounts);
    }

    // --- Ledger Pie Chart ---
    let relevantOrders = [...orders];
    if (selectedWarehouse !== "Global") {
      relevantOrders = relevantOrders.filter(
        (o) => o.destinationWarehouse.name === selectedWarehouse
      );
    }
    const statusMap = { pending: 0, "in-transit": 0, delivered: 0 };
    relevantOrders.forEach((o) => {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1;
    });
    const ledgerList = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
    }));
    setLedgerData(ledgerList);

    // --- Warehouse Table ---
    const table = warehouses
      .filter((w) => w !== "Global")
      .map((w) => {
        const whOrders = orders.filter(
          (o) => o.destinationWarehouse.name === w
        );
        const counts = { pending: 0, "in-transit": 0, delivered: 0 };
        whOrders.forEach((o) => {
          counts[o.status]++;
        });
        return { warehouse: w, ...counts };
      });
    setWarehouseTable(table);
  };

  const handleChartToggle = (_, value) => {
    if (value) setChartType(value);
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ marginBottom: "20px", color: "#1E3A5F", fontWeight: "bold" }}
      >
        Analytics Dashboard
      </Typography>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}
        >
          <CircularProgress sx={{ color: "#1E3A5F" }} />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ marginBottom: "30px" }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: "6px solid #1E3A5F", borderRadius: 3, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", animation: "fadeIn 0.5s ease" }}>
                <CardContent>
                  <Typography color="#25344E" fontWeight="bold" variant="h6">
                    Orders Today
                  </Typography>
                  <Typography
                    variant="h4"
                    color="#1E3A5F"
                    fontWeight="bold"
                  >
                    {stats.today}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: "6px solid #1E3A5F", borderRadius: 3, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", animation: "fadeIn 0.5s ease" }}>
                <CardContent>
                  <Typography color="#25344E" fontWeight="bold" variant="h6">
                    Orders This Week
                  </Typography>
                  <Typography
                    variant="h4"
                    color="#1E3A5F"
                    fontWeight="bold"
                  >
                    {stats.week}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: "6px solid #1E3A5F", borderRadius: 3, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", animation: "fadeIn 0.5s ease" }}>
                <CardContent>
                  <Typography color="#25344E" fontWeight="bold" variant="h6">
                    Orders This Month
                  </Typography>
                  <Typography
                    variant="h4"
                    color="#1E3A5F"
                    fontWeight="bold"
                  >
                    {stats.month}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Paper elevation={2} sx={{ padding: "20px", borderRadius: 3, marginBottom: "30px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", animation: "fadeIn 0.5s ease" }}>
            <Typography variant="h6" sx={{ color: "#1E3A5F", fontWeight: "bold", marginBottom: "10px" }}>
              Orders {chartType === "week" ? "per Day (This Week)" : `per Day (${months.find(m => m.value === selectedMonth)?.label})`}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartType === "week" ? "day" : "day"} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#1E3A5F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Ledger Pie Chart with Selector */}
          <Paper elevation={2} sx={{ padding: "20px", borderRadius: 3, marginBottom: "30px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", animation: "fadeIn 0.5s ease" }}>
            <Grid container spacing={2}>
              {/* Left side: Pie chart */}
              <Grid item xs={12} md={8}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1E3A5F",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Orders Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ledgerData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {ledgerData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>

              {/* Right side: Selector */}
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1, color: "#25344E" }}
                >
                  Select Warehouse
                </Typography>
                <ToggleButtonGroup
                  orientation="vertical"
                  value={selectedWarehouse}
                  exclusive
                  onChange={(_, v) => v && setSelectedWarehouse(v)}
                >
                  {warehouses.map((w) => (
                    <ToggleButton key={w} value={w}>
                      {w}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Paper>

          {/* Warehouse Table */}
          <Paper elevation={2} sx={{ padding: "20px", borderRadius: 3, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", animation: "fadeIn 0.5s ease" }}>
            <Typography
              variant="h6"
              sx={{ color: "#1E3A5F", fontWeight: "bold", marginBottom: "10px" }}
            >
              Warehouse Summary
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Warehouse</TableCell>
                  <TableCell align="center">Pending</TableCell>
                  <TableCell align="center">In-Transit</TableCell>
                  <TableCell align="center">Delivered</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {warehouseTable.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.warehouse}</TableCell>
                    <TableCell align="center">{row.pending}</TableCell>
                    <TableCell align="center">{row["in-transit"]}</TableCell>
                    <TableCell align="center">{row.delivered}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )
      }
    </Box >
  );
};

export default Analytics_UI;
