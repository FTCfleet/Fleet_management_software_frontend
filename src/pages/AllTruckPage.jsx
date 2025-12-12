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
import { Edit, Delete, Close } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import "../css/main.css";

const headerStyle = { color: "#1E3A5F", fontWeight: "bold"};
const rowStyle = { color: "#25344E"};
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
  const applyFilter = () => {
    const filtered = trucks.filter((truck) => {
      return (
        (nameFilter
          ? truck.name.toLowerCase().startsWith(nameFilter.toLowerCase())
          : true) &&
        (truckNoFilter
          ? truck.vehicleNo.toLowerCase().startsWith(truckNoFilter.toLowerCase())
          : true)
      );
    });
    setFilteredTrucks(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setTruckNoFilter("");
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
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 1.5, md: 2 }, marginBottom: "20px", alignItems: { xs: "stretch", md: "center" } }}>
        <TextField
          label="Search by Driver Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: { xs: "100%", md: "200px" } }}
        />
        <TextField
          label="Search by Truck Number"
          value={truckNoFilter}
          onChange={(e) => setTruckNoFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: { xs: "100%", md: "200px" } }}
        />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" color="primary" onClick={applyFilter}>
            Apply
          </Button>
          <Button variant="outlined" color="secondary" onClick={clearFilter}>
            Clear
          </Button>
          <button className="button " onClick={handleAdd} style={{ margin: 0 }}>
            Add Truck
          </button>
        </Box>
      </Box>

      {/* Truck Table */}
      <TableContainer component={Paper}>
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
                <TableCell colSpan={7} align="center">
                  <CircularProgress
                    size={22}
                    className="spinner"
                    sx={{ color: "#1E3A5F", animation: "none !important" }}
                  />
                </TableCell>
              </TableRow>
            ) : filteredTrucks.length > 0 ? (
              filteredTrucks.map((truck, idx) => (
                <TableRow key={truck.vehicleNo}>
                  <TableCell sx={rowStyle}>{idx+1}.</TableCell>
                  <TableCell sx={rowStyle}>{truck.name}</TableCell>
                  <TableCell sx={rowStyle}>{truck.phoneNo}</TableCell>
                  <TableCell sx={rowStyle}>{truck.vehicleNo}</TableCell>
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
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            color="error"
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ marginBottom: "16px", textAlign: "center", ...headerStyle }}
          >
            {isAdding ? "Add Truck" : "Edit Truck Details"}
          </Typography>
          {currentTruck && (
            <Box>
              <TextField
                fullWidth
                label="Driver Name"
                value={currentTruck.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                sx={{ marginBottom: "16px" }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={currentTruck.phoneNo}
                onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                sx={{ marginBottom: "16px" }}
              />
              <TextField
                fullWidth
                label="Truck Number"
                value={currentTruck.vehicleNo}
                onChange={(e) =>
                  handleFieldChange("vehicleNo", e.target.value.toUpperCase())
                }
                disabled={!isAdding}
                sx={{ marginBottom: "16px" }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "16px",
                }}
              >
                <button
                  className="button button-large"
                  onClick={handleSaveOrAdd}
                >
                  {isAdding ? "Add" : "Save"}
                  {isLoading1 && (
                    <CircularProgress
                      size={22}
                      className="spinner"
                      sx={{ color: "#fff", animation: "none !important", ml: 1}}
                    />
                  )}
                </button>
              </Box>
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
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
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
              color: "#374151",
              fontSize: "15px",
            }}
          >
            This action cannot be undone. Are you sure you want to proceed?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Button
              variant="outlined"
              sx={{ borderColor: "#1E3A5F", color: "#1E3A5F" }}
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
