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
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { Edit, Delete, Close } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import "../css/main.css";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AllTruckPage() {
  const [trucks, setTrucks] = useState([]);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTruck, setCurrentTruck] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [truckNoFilter, setTruckNoFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const { isDarkMode, colors } = useOutletContext() || {};
  
  const headerStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: colors?.textSecondary || "#25344E" };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredTrucks(trucks);
  }, [trucks]);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/get-all-drivers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    let lst = data.body;
    lst.sort((a, b) => a.name.localeCompare(b.name));
    setTrucks(lst);
    setIsLoading(false);
  };

  // Filters
  const applyFilter = ({searchValue} = {}) => {
    const val = searchValue ?? nameFilter;
    setNameFilter(val);
    const searchTerm = val.toLowerCase();
    const filtered = trucks.filter((truck) => {
      if (!searchTerm) return true;
      return (
        truck.name.toLowerCase().startsWith(searchTerm) ||
        truck.vehicleNo.toLowerCase().startsWith(searchTerm)
      );
    });
    setFilteredTrucks(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setFilteredTrucks(trucks);
  };

  const handleEdit = (truck) => {
    setCurrentTruck({ ...truck });
    setIsModalOpen(true);
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setTruckToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading2(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/driver`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        vehicleNo: truckToDelete,
      }),
    });

    const data = await res.json();
    fetchData();
    setIsLoading2(false);
    setDeleteModalOpen(false);
    setTruckToDelete(null);
    return;
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setTruckToDelete(null);
  };

  const handleAdd = () => {
    setCurrentTruck({ name: "", phoneNo: "", vehicleNo: "" });
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
        vehicleNo: currentTruck.vehicleNo,
        name: currentTruck.name,
        phoneNo: currentTruck.phoneNo,
      };
    } else {
      method = "PUT";
      body = {
        vehicleNo: currentTruck.vehicleNo,
        updates: {
          name: currentTruck.name,
          phoneNo: currentTruck.phoneNo,
        },
      };
    }
    const res = await fetch(`${BASE_URL}/api/admin/manage/driver`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 409) {
      alert("Truck Number already exists!");
      setIsLoading1(false);
      return;
    }

    const data = await res.json();
    fetchData();
    setIsLoading1(false);
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentTruck(null);
  };

  const handleFieldChange = (field, value) => {
    setCurrentTruck({ ...currentTruck, [field]: value });
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Truck Details
      </Typography>

      {/* Filters */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={nameFilter}
        onSearchChange={setNameFilter}
        searchPlaceholder="Search by Driver Name or Truck No"
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
            Add Truck
          </Button>
        }
      />

      {/* Truck Table */}
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
              <TableCell sx={headerStyle}>Driver Name</TableCell>
              <TableCell sx={headerStyle}>Phone Number</TableCell>
              <TableCell sx={headerStyle}>Truck Number</TableCell>
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
            ) : filteredTrucks.length > 0 ? (
              filteredTrucks.map((truck, idx) => (
                <TableRow key={truck.vehicleNo}>
                  <TableCell sx={rowStyle}>{idx+1}.</TableCell>
                  <TableCell sx={rowStyle}>{highlightMatch(truck.name, nameFilter, isDarkMode)}</TableCell>
                  <TableCell sx={rowStyle}>{truck.phoneNo}</TableCell>
                  <TableCell sx={rowStyle}>{highlightMatch(truck.vehicleNo, nameFilter, isDarkMode)}</TableCell>
                  <TableCell sx={{...rowStyle, textAlign: "center"}}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(truck)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(truck.vehicleNo)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" align="center" sx={rowStyle}>
                  No data to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Add/Edit Truck */}
      <Modal open={isModalOpen} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 450 },
            maxWidth: 450,
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
              {isAdding ? "Add New Truck" : "Edit Truck Details"}
            </Typography>
          </Box>

          {/* Content */}
          {currentTruck && (
            <Box>
              <TextField
                fullWidth
                label="Driver Name"
                value={currentTruck.name}
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
                value={currentTruck.phoneNo}
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
                label="Truck Number"
                value={currentTruck.vehicleNo}
                onChange={(e) =>
                  handleFieldChange("vehicleNo", e.target.value.toUpperCase())
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
                {isAdding ? "Add Truck" : "Save Changes"}
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
            Delete Truck
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
