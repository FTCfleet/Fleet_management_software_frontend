import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  TextField,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { Edit, Delete, Close } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import "../css/main.css";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AllWarehousePage() {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const { isDarkMode, colors } = useOutletContext() || {};
  
  const headerStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: colors?.textSecondary || "#25344E" };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/get-all-warehouses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
      data.body.sort((a, b) =>
        a.isSource !== b.isSource ? (a.isSource ? -1 : 1) : a.name.localeCompare(b.name)
    );
    setWarehouses(data.body);
    setFilteredWarehouses(data.body);
    setIsLoading(false);
  };

  const applyFilter = () => {
    const searchTerm = searchFilter.toLowerCase().trim();
    if (!searchTerm) {
      setFilteredWarehouses(warehouses);
    } else {
      const filtered = warehouses.filter((warehouse) =>
        warehouse.name.toLowerCase().includes(searchTerm) ||
        warehouse.warehouseID.toLowerCase().includes(searchTerm) ||
        warehouse.address.toLowerCase().includes(searchTerm)
      );
      setFilteredWarehouses(filtered);
    }
  };

  const clearFilter = () => {
    setSearchFilter("");
    setFilteredWarehouses(warehouses);
  };

  const handleEdit = (warehouse) => {
    setCurrentWarehouse({ ...warehouse });
    setIsModalOpen(true);
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setWarehouseToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading2(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/warehouse`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        warehouseID: warehouseToDelete,
      }),
    });

    const data = await res.json();
    fetchData();
    setIsLoading2(false);
    setDeleteModalOpen(false);
    setWarehouseToDelete(null);
    return;
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setWarehouseToDelete(null);
  };

  const handleAdd = () => {
    setCurrentWarehouse({
      name: "",
      phoneNo: "",
      address: "",
      warehouseID: "",
      isSource: true,
    });
    setIsModalOpen(true);
    setIsAdding(true);
  };

  const handleSaveOrAdd = async () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    let method, body;
    if (isAdding) {
      method = "POST";
      body = {
        name: currentWarehouse.name,
        address: currentWarehouse.address,
        phoneNo: currentWarehouse.phoneNo,
        warehouseID: currentWarehouse.warehouseID,
        isSource: currentWarehouse.isSource,
      };
    } else {
      method = "PUT";
      body = {
        warehouseID: currentWarehouse.warehouseID,
        updates: {
          name: currentWarehouse.name,
          address: currentWarehouse.address,
          phoneNo: currentWarehouse.phoneNo,
          isSource: currentWarehouse.isSource,
        },
      };
    }
    const res = await fetch(`${BASE_URL}/api/admin/manage/warehouse`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    fetchData();
    setIsLoading1(false);
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentWarehouse(null);
  };

  const handleFieldChange = (field, value) => {
    setCurrentWarehouse({ ...currentWarehouse, [field]: value });
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Station Details
      </Typography>

      {/* Filters */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={searchFilter}
        onSearchChange={setSearchFilter}
        searchPlaceholder="Search by Name, Code or Address"
        onApply={applyFilter}
        onClear={clearFilter}
        isLoading={isLoading}
        extraButtons={
          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{
              background: isDarkMode ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
              color: isDarkMode ? "#0a1628" : "#fff",
              fontWeight: 600,
              px: 2,
              height: "40px",
              borderRadius: "10px",
              textTransform: "none",
              whiteSpace: "nowrap",
            }}
          >
            Add Station
          </Button>
        }
      />

      {/* Warehouse Table */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
        backgroundColor: colors?.bgCard || "#ffffff",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Sl No.</TableCell>
              <TableCell sx={headerStyle}>Station Name</TableCell>
              <TableCell sx={headerStyle}>Phone Number</TableCell>
              <TableCell sx={headerStyle}>Station Address</TableCell>
              <TableCell sx={headerStyle}>Station Code</TableCell>
              <TableCell sx={headerStyle}>Type</TableCell>
              <TableCell sx={{...headerStyle, textAlign: "center"}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <ModernSpinner size={28} />
                </TableCell>
              </TableRow>
            ) : filteredWarehouses.length > 0 ? (
              filteredWarehouses.map((warehouse, idx) => (
                <TableRow key={warehouse.warehouseID}>
                  <TableCell sx={rowStyle}>{idx + 1}.</TableCell>
                  <TableCell sx={rowStyle}>{highlightMatch(warehouse.name, searchFilter, isDarkMode)}</TableCell>
                  <TableCell sx={rowStyle}>{warehouse.phoneNo}</TableCell>
                  <TableCell sx={rowStyle}>{highlightMatch(warehouse.address, searchFilter, isDarkMode)}</TableCell>
                  <TableCell sx={rowStyle}>{highlightMatch(warehouse.warehouseID, searchFilter, isDarkMode)}</TableCell>
                  <TableCell sx={rowStyle}>
                    {warehouse.isSource ? "Source" : "Destination"}
                  </TableCell>
                  <TableCell sx={{...rowStyle, textAlign: "center"}}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(warehouse)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(warehouse.warehouseID)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: colors?.textMuted || "#7D8695", py: 3 }}>
                  No stations found for the selected filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Add/Edit Warehouse */}
      <Modal open={isModalOpen} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 480 },
            maxWidth: 480,
            bgcolor: isDarkMode ? "#1a2332" : "#ffffff",
            borderRadius: "16px",
            boxShadow: isDarkMode 
              ? "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)" 
              : "0 25px 50px rgba(0,0,0,0.15)",
            p: 3,
          }}
        >
          {/* Header */}
          <Box sx={{ position: "relative", mb: 3 }}>
            <IconButton
              onClick={handleClose}
              sx={{ 
                position: "absolute", 
                top: -8, 
                right: -8,
                color: colors?.textSecondary,
                "&:hover": { backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }
              }}
            >
              <Close />
            </IconButton>
            <Typography
              variant="h5"
              sx={{ 
                color: colors?.textPrimary,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {isAdding ? "Add New Station" : "Edit Station Details"}
            </Typography>
          </Box>

          {/* Content */}
          {currentWarehouse && (
            <Box>
              <TextField
                fullWidth
                label="Station Name"
                value={currentWarehouse.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                sx={{ 
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  },
                  "& .MuiInputLabel-root": { color: colors?.textSecondary },
                  "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
                }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={currentWarehouse.phoneNo}
                onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                sx={{ 
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  },
                  "& .MuiInputLabel-root": { color: colors?.textSecondary },
                  "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
                }}
              />
              <TextField
                fullWidth
                label="Address"
                value={currentWarehouse.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                multiline
                rows={2}
                sx={{ 
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  },
                  "& .MuiInputLabel-root": { color: colors?.textSecondary },
                  "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
                }}
              />
              <ToggleButtonGroup
                value={currentWarehouse.isSource}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    handleFieldChange("isSource", newValue);
                  }
                }}
                sx={{ display: "flex", mb: 2.5, width: "100%" }}
              >
                <ToggleButton
                  value={true}
                  sx={{
                    flex: 1,
                    py: 1.2,
                    borderRadius: "12px 0 0 12px !important",
                    fontWeight: 600,
                    backgroundColor: currentWarehouse.isSource
                      ? (isDarkMode ? "#FFB74D" : "#1D3557")
                      : (isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc"),
                    color: currentWarehouse.isSource 
                      ? (isDarkMode ? "#0a1628" : "#fff") 
                      : (isDarkMode ? colors?.textSecondary : "#64748b"),
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                    "&.Mui-selected, &.Mui-selected:hover": {
                      backgroundColor: isDarkMode ? "#FFB74D" : "#1D3557",
                      color: isDarkMode ? "#0a1628" : "#fff",
                    },
                  }}
                >
                  Source
                </ToggleButton>
                <ToggleButton
                  value={false}
                  sx={{
                    flex: 1,
                    py: 1.2,
                    borderRadius: "0 12px 12px 0 !important",
                    fontWeight: 600,
                    backgroundColor: !currentWarehouse.isSource
                      ? (isDarkMode ? "#FFB74D" : "#1D3557")
                      : (isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc"),
                    color: !currentWarehouse.isSource 
                      ? (isDarkMode ? "#0a1628" : "#fff") 
                      : (isDarkMode ? colors?.textSecondary : "#64748b"),
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                    "&.Mui-selected, &.Mui-selected:hover": {
                      backgroundColor: isDarkMode ? "#FFB74D" : "#1D3557",
                      color: isDarkMode ? "#0a1628" : "#fff",
                    },
                  }}
                >
                  Destination
                </ToggleButton>
              </ToggleButtonGroup>
              <TextField
                fullWidth
                label="Station Code"
                value={currentWarehouse.warehouseID}
                onChange={(e) =>
                  handleFieldChange("warehouseID", e.target.value.toUpperCase())
                }
                disabled={!isAdding}
                sx={{ 
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  },
                  "& .MuiInputLabel-root": { color: colors?.textSecondary },
                  "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.38)",
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleSaveOrAdd}
                disabled={isLoading1}
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  background: isDarkMode 
                    ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)"
                    : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
                  color: isDarkMode ? "#0a1628" : "#fff",
                  boxShadow: "none",
                  "&:hover": {
                    background: isDarkMode 
                      ? "linear-gradient(135deg, #FFA726 0%, #F57C00 100%)"
                      : "linear-gradient(135deg, #25445f 0%, #0f2035 100%)",
                    boxShadow: "none",
                  },
                  "&:disabled": {
                    background: isDarkMode ? "rgba(255,183,77,0.3)" : "rgba(29,53,87,0.3)",
                  }
                }}
              >
                {isAdding ? "Add Station" : "Save Changes"}
                {isLoading1 && (
                  <CircularProgress
                    size={20}
                    sx={{ color: isDarkMode ? "#0a1628" : "#fff", ml: 1 }}
                  />
                )}
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
      {/* Modal for Delete Confirmation */}
      <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 350,
            bgcolor: colors?.bgCard || "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "none",
          }}
        >
          <FaExclamationTriangle
            style={{
              color: "#d32f2f",
              fontSize: "36px",
              marginBottom: "12px",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#d32f2f",
            }}
          >
            Delete Station
          </Typography>
          <Typography
            sx={{
              marginBottom: "20px",
              color: colors?.textSecondary || "#374151",
              fontSize: "15px",
            }}
          >
            This action cannot be undone. Are you sure you want to proceed?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Button
              variant="outlined"
              sx={{ 
                borderColor: isDarkMode ? colors?.accent : "#1E3A5F", 
                color: isDarkMode ? colors?.accent : "#1E3A5F",
                "&:hover": {
                  borderColor: isDarkMode ? colors?.accentHover : "#1E3A5F",
                  backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.04)",
                }
              }}
              onClick={handleCloseDeleteModal}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#d32f2f" }}
              startIcon={<FaTrash />}
              onClick={confirmDelete}
            >
              Delete
              {isLoading2 && (
                <CircularProgress
                  size={22}
                  className="spinner"
                  sx={{ color: "#fff", animation: "none !important", ml: 1 }}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
