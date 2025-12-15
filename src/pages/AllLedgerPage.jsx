import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import "../css/table.css";
import { getDate } from "../utils/dateFormatter";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AllLedgerPage = () => {
  const { type } = useParams();
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [filteredLedger, setFilteredLedger] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getDate());
  const navigate = useNavigate();
  const { isAdmin, isSource } = useAuth();
  const [nameFilter, setNameFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    filterLedgersByTypeAndDate(type);
  }, [type, ledgerEntries]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/ledger/track-all/${selectedDate.replaceAll("-", "")}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setLedgerEntries(data.body);
      const res = await fetch(`${BASE_URL}/api/admin/get-all-warehouses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data2 = await res.json();
      setWarehouses(
        data2.body.filter(
          (warehouse) => warehouse.isSource !== isSource || isAdmin
        )
      );
    } catch (error) {
      alert("Failed to fetch ledger entries. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterLedgersByTypeAndDate = (type) => {
    if (type === "all") {
      setFilteredLedger(ledgerEntries);
    } else {
      setFilteredLedger(ledgerEntries.filter((order) => order.status === type));
    }
  };

  const handleDateChange = (event) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const newDate = new Date(event.target.value);
    if (newDate <= today) {
      const date = newDate.toISOString().split("T")[0];
      setSelectedDate(date);
      filterLedgersByTypeAndDate(type);
    }
  };

  const applyFilter = () => {
    let filtered = ledgerEntries.filter(
      (order) => order.status === type || type === "all"
    );

    if (nameFilter) {
      filtered = filtered.filter((order) =>
        order.vehicleNo.toLowerCase().replaceAll(" ","").startsWith(nameFilter.toLowerCase()) || 
        order.ledgerId.toLowerCase().startsWith(nameFilter.toLowerCase())
      );
    }
    if (warehouseFilter) {
      filtered = filtered.filter(
        (order) =>
          order.sourceWarehouse.name === warehouseFilter ||
          order.destinationWarehouse.name === warehouseFilter
      );
    }
    setFilteredLedger(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setWarehouseFilter("");
    let filtered = ledgerEntries.filter(
      (order) => order.status === type || type === "all"
    );
    setFilteredLedger(filtered);
  };

  return (
    <Box
      sx={{ padding: "20px", backgroundColor: "#ffffff", minHeight: "100vh" }}
    >
      <Typography
        variant="h4"
        sx={{
          marginBottom: "20px",
          color: "#1E3A5F",
          fontWeight: "bold",
        }}
      >
        {(() => {
          let heading = type;
          if (type === 'dispatched')
            heading = isAdmin ? "Dispatched" : isSource ? "Outgoing" : "Incoming";
          return heading.charAt(0).toUpperCase() + heading.slice(1)})()} Memo
      </Typography>

      {/* Filters: Date and Search */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 1.5, md: 2 },
          marginBottom: "20px",
          alignItems: { xs: "stretch", md: "center" },
        }}
      >
        <Box className="calendar-input">
          <input
            type="date"
            onClick={(e) => e.target.showPicker()}
            onKeyDown={(e) => e.preventDefault()}
            value={selectedDate}
            onChange={handleDateChange}
            disabled={isLoading}
          />
        </Box>
        <TextField
          label="Search by ID/Vehicle No"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: { xs: "100%", md: "200px" } }}
        />
        <Select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: { xs: "100%", md: "200px" } }}
        >
          <MenuItem value="">All Warehouses</MenuItem>
          {warehouses.map((warehouse) => (
            <MenuItem key={warehouse.warehouseID} value={warehouse.name}>
              {warehouse.name}
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" color="primary" onClick={applyFilter} disabled={isLoading}>
            Apply
          </Button>
          <Button variant="outlined" color="secondary" onClick={clearFilter} disabled={isLoading}>
            Clear
          </Button>
        </Box>
      </Box>

      {/* Memo Entries Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                Sl No
              </TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                Memo No
              </TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                Vehicle No
              </TableCell>
              {isAdmin || !isSource ? (
                <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                  Source Station
                </TableCell>
              ) : null}
              {isAdmin || isSource ? (
                <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                  Destination Station
                </TableCell>
              ) : null}

              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                Package Count
              </TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell sx={{ color: "#1E3A5F", fontWeight: "bold", textAlign: "center" }}>
                View Memo
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress
                    size={22}
                    className="spinner"
                    sx={{ color: "#1E3A5F", animation: "none !important" }}
                  />
                </TableCell>
              </TableRow>
            ) : filteredLedger.length > 0 ? (
              filteredLedger.map((entry, idx) => (
                <TableRow key={entry.ledgerId}>
                  <TableCell sx={{ color: "#25344E" }}>{idx + 1}.</TableCell>
                  <TableCell sx={{ color: "#25344E" }}>
                    {entry.ledgerId}
                  </TableCell>
                  <TableCell sx={{ color: "#25344E" }}>
                    {entry.vehicleNo}
                  </TableCell>
                  {isAdmin || !isSource ? (
                    <TableCell sx={{ color: "#25344E" }}>
                      {entry.sourceWarehouse
                        ? entry.sourceWarehouse.name
                        : "NA"}
                    </TableCell>
                  ) : null}

                  {isAdmin || isSource ? (
                    <TableCell sx={{ color: "#25344E" }}>
                      {entry.destinationWarehouse
                        ? entry.destinationWarehouse.name
                        : "NA"}
                    </TableCell>
                  ) : null}
                  <TableCell>{entry.parcels.length}</TableCell>
                  <TableCell>
                    <span
                      className={`table-status ${entry.status.toLowerCase()}`}
                    >
                      {entry.status.toUpperCase().charAt(0) +
                        entry.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell sx={{textAlign: "center"}}>
                    <IconButton
                      color="primary"
                      onClick={() =>
                        navigate(`/user/view/ledger/${entry.ledgerId}`)
                      }
                    >
                      <IoArrowForwardCircleOutline size={24} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" align="center" sx={{ color: "#7D8695" }}>
                  No ledger entries found for the selected date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AllLedgerPage;
