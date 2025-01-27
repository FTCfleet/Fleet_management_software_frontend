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
} from "@mui/material";
import { Edit, Delete, Close, Warning } from "@mui/icons-material";
import "../css/main.css";

const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
const rowStyle = { color: "#25344E" };
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
      setFilteredTrucks(trucks);
    }, [trucks]);
    
    const fetchData = async () => {
      const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/get-all-drivers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    setTrucks(data.body);
};

// Filters
  const applyFilter = () => {
    const filtered = trucks.filter((truck) => {
      return (
        (nameFilter
          ? truck.name.toLowerCase().includes(nameFilter.toLowerCase())
          : true) &&
        (truckNoFilter
          ? truck.vehicleNo.toLowerCase().includes(truckNoFilter.toLowerCase())
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
    setIsModalOpen(false);
    const res = await fetch(`${BASE_URL}/api/admin/manage/driver`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log(data);
    fetchData();
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
      <Box sx={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <TextField
          label="Search by Driver Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Search by Truck Number"
          value={truckNoFilter}
          onChange={(e) => setTruckNoFilter(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button variant="contained" color="primary" onClick={applyFilter}>
          Apply Filter
        </Button>
        <Button variant="outlined" color="secondary" onClick={clearFilter}>
          Clear Filter
        </Button>
        <button className="button " onClick={handleAdd} style={{ margin: 0 }}>
          Add Truck
        </button>
      </Box>

      {/* Truck Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Driver Name</TableCell>
              <TableCell sx={headerStyle}>Phone Number</TableCell>
              <TableCell sx={headerStyle}>Truck Number</TableCell>
              <TableCell sx={headerStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrucks.map((truck) => (
              <TableRow key={truck.vehicleNo}>
                <TableCell sx={rowStyle}>{truck.name}</TableCell>
                <TableCell sx={rowStyle}>{truck.phoneNo}</TableCell>
                <TableCell sx={rowStyle}>{truck.vehicleNo}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(truck)}>
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Truck Button */}
      {/* <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                
            </Box> */}

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
                onChange={(e) => handleFieldChange("vehicleNo", e.target.value)}
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
            width: 300,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{ marginBottom: "14px", textAlign: "center", color: "#d32f2f" }}
          >
            <Warning
              sx={{ marginRight: 1, marginBottom: -0.5, fontSize: "24px" }}
            />
            Confirm Deletion
          </Typography>
          <Typography
            sx={{ marginBottom: "16px", textAlign: "center", color: "#1E3A5F" }}
          >
            Are you sure you want to delete this truck?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCloseDeleteModal}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={confirmDelete}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
