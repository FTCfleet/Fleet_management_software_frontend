import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import "../css/table.css";
import { getDate } from "../utils/dateFormatter";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";

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
  const { isDarkMode, colors } = useOutletContext() || {};

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

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    filterLedgersByTypeAndDate(type);
  };

  const applyFilter = ({searchValue} = {}) => {
    const val = searchValue ?? nameFilter;
    setNameFilter(val);
    let filtered = ledgerEntries.filter(
      (order) => order.status === type || type === "all"
    );

    const searchTerm = val.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.vehicleNo.toLowerCase().replaceAll(" ","").includes(searchTerm) || 
        order.ledgerId.toLowerCase().includes(searchTerm)
      );
    }
    if (warehouseFilter) {
      filtered = filtered.filter(
        (order) =>
          order.sourceWarehouse.warehouseID === warehouseFilter ||
          order.destinationWarehouse.warehouseID === warehouseFilter
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
      sx={{ padding: "20px", backgroundColor: colors?.bgPrimary || "#ffffff", minHeight: "100vh" }}
    >
      <Typography
        variant="h4"
        sx={{
          marginBottom: "20px",
          color: colors?.textPrimary || "#1E3A5F",
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
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={nameFilter}
        onSearchChange={setNameFilter}
        searchPlaceholder="Search by ID/Vehicle No"
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

      {/* Memo Entries Table */}
      <TableContainer component={Paper} sx={{ 
        backgroundColor: colors?.bgCard || "#ffffff",
        borderRadius: 2,
        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                Sl No
              </TableCell>
              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                Memo No
              </TableCell>
              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                Vehicle No
              </TableCell>
              {isAdmin || !isSource ? (
                <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                  Source Station
                </TableCell>
              ) : null}
              {isAdmin || isSource ? (
                <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                  Destination Station
                </TableCell>
              ) : null}

              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                Package Count
              </TableCell>
              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold", textAlign: "center" }}>
                View Memo
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <ModernSpinner size={28} />
                </TableCell>
              </TableRow>
            ) : filteredLedger.length > 0 ? (
              filteredLedger.map((entry, idx) => (
                <TableRow key={entry.ledgerId} hover>
                  <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>{idx + 1}.</TableCell>
                  <TableCell sx={{ color: colors?.textSecondary || "#25344E", fontWeight: 600 }}>
                    {highlightMatch(entry.ledgerId, nameFilter, isDarkMode)}
                  </TableCell>
                  <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>
                    {highlightMatch(entry.vehicleNo, nameFilter, isDarkMode)}
                  </TableCell>
                  {isAdmin || !isSource ? (
                    <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>
                      {entry.sourceWarehouse
                        ? entry.sourceWarehouse.name
                        : "NA"}
                    </TableCell>
                  ) : null}

                  {isAdmin || isSource ? (
                    <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>
                      {entry.destinationWarehouse
                        ? entry.destinationWarehouse.name
                        : "NA"}
                    </TableCell>
                  ) : null}
                  <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>{entry.parcels.length}</TableCell>
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
                      sx={{ color: isDarkMode ? "#FFB74D" : "primary.main" }}
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
                <TableCell colSpan="7" align="center" sx={{ color: colors?.textSecondary || "#7D8695" }}>
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
