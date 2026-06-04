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
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useAuth } from "../routes/AuthContext";
import "../css/table.css";
import { getDate, dateFormatter, timeFormatter } from "../utils/dateFormatter";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AllUnloadingListPage = () => {
  const [unloadingLists, setUnloadingLists] = useState([]);
  const [filteredLists, setFilteredLists] = useState([]);
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
    applyFilter();
  }, [unloadingLists]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/unloadinglist/track-all/${selectedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch unloading lists");
      }

      const data = await response.json();
      setUnloadingLists(data.body || []);

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
      alert("Failed to fetch unloading lists. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const applyFilter = ({ searchValue } = {}) => {
    const val = searchValue ?? nameFilter;
    setNameFilter(val);
    let filtered = [...unloadingLists];

    const searchTerm = val.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.vehicleNo?.toLowerCase().replaceAll(" ", "").includes(searchTerm) ||
          entry._id?.toLowerCase().includes(searchTerm) ||
          entry.driverName?.toLowerCase().includes(searchTerm)
      );
    }
    if (warehouseFilter) {
      filtered = filtered.filter(
        (entry) =>
          entry.sourceWarehouse?.warehouseID === warehouseFilter ||
          entry.destinationWarehouse?.warehouseID === warehouseFilter
      );
    }
    setFilteredLists(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setWarehouseFilter("");
    setFilteredLists([...unloadingLists]);
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
        Unloading List
      </Typography>

      {/* Filters: Date and Search */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={nameFilter}
        onSearchChange={setNameFilter}
        searchPlaceholder="Search by Vehicle No / Driver"
        onApply={applyFilter}
        onClear={clearFilter}
        isLoading={isLoading}
        showDatePicker={true}
        dateValue={selectedDate}
        onDateChange={handleDateChange}
        showDropdown={true}
        dropdownValue={warehouseFilter}
        onDropdownChange={setWarehouseFilter}
        dropdownOptions={warehouses.map((w) => ({ value: w.warehouseID, label: w.name }))}
        dropdownPlaceholder="All Warehouses"
      />

      {/* Unloading Lists Table */}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: colors?.bgCard || "#ffffff",
          borderRadius: 2,
          boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                Sl No
              </TableCell>
              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                Vehicle No
              </TableCell>
              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" }}>
                Driver
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
                Created At
              </TableCell>
              <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold", textAlign: "center" }}>
                View
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <ModernSpinner size={28} />
                </TableCell>
              </TableRow>
            ) : filteredLists.length > 0 ? (
              filteredLists.map((entry, idx) => (
                <TableRow key={entry._id} hover>
                  <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>{idx + 1}.</TableCell>
                  <TableCell sx={{ color: colors?.textSecondary || "#25344E", fontWeight: 600 }}>
                    {highlightMatch(entry.vehicleNo, nameFilter, isDarkMode)}
                  </TableCell>
                  <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>
                    {highlightMatch(entry.driverName || "N/A", nameFilter, isDarkMode)}
                  </TableCell>
                  {isAdmin || !isSource ? (
                    <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>
                      {entry.sourceWarehouse ? entry.sourceWarehouse.name : "NA"}
                    </TableCell>
                  ) : null}
                  {isAdmin || isSource ? (
                    <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>
                      {entry.destinationWarehouse ? entry.destinationWarehouse.name : "NA"}
                    </TableCell>
                  ) : null}
                  <TableCell sx={{ color: colors?.textSecondary || "#25344E", textAlign: "center" }}>
                    {entry.parcels?.reduce((acc, cur) => acc + cur.count, 0)}
                  </TableCell>
                  <TableCell sx={{ color: colors?.textSecondary || "#25344E" }}>
                    {timeFormatter(entry.createdAt)}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      sx={{ color: isDarkMode ? "#FFB74D" : "primary.main" }}
                      onClick={() => navigate(`/user/view/unloading-list/${entry._id}`)}
                    >
                      <IoArrowForwardCircleOutline size={24} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="8" align="center" sx={{ color: colors?.textSecondary || "#7D8695" }}>
                  No unloading lists found for the selected date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AllUnloadingListPage;
