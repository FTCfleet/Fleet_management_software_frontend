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
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Close } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import "../css/main.css";

const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
const rowStyle = { color: "#25344E" };
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AllWarehousePage() {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredWarehouses(warehouses);
  }, [warehouses]);

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
    console.log(data);
    setWarehouses(data.body);
    setIsLoading(false);
  };

  // Filters
  const applyFilter = () => {
    const filtered = warehouses.filter((warehouse) => {
      return (
        (warehouseFilter
          ? warehouse.warehouseID
            .toLowerCase()
            .includes(warehouseFilter.toLowerCase())
          : true)
      );
    });
    setFilteredWarehouses(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setWarehouseFilter("");
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
    setCurrentWarehouse({ name: "", phoneNo: "", warehouseID: "", isSource: true });
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
        isSource: currentWarehouse.isSource
      };
    } else {
      method = "PUT";
      body = {
        warehouseID: currentWarehouse.warehouseID,
        updates: {
          name: currentWarehouse.name,
          phoneNo: currentWarehouse.phoneNo,
          isSource: currentWarehouse.isSource
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
    console.log(data);
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
        Warehouse Details
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <Select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: "250px" }}
        >
          <MenuItem value="">All Warehouses</MenuItem>
          {warehouses.map((warehouse) => (
            <MenuItem key={warehouse.warehouseID} value={warehouse.warehouseID}>
              {warehouse.name}
            </MenuItem>
          ))}
        </Select>
        <Button variant="contained" color="primary" onClick={applyFilter}>
          Apply Filter
        </Button>
        <Button variant="outlined" color="secondary" onClick={clearFilter}>
          Clear Filter
        </Button>
        <button className="button" onClick={handleAdd} style={{ margin: "0px" }}>
          Add Warehouse
        </button>
      </Box>

      {/* Warehouse Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Warehouse Name</TableCell>
              <TableCell sx={headerStyle}>Phone Number</TableCell>
              <TableCell sx={headerStyle}>Warehouse Address</TableCell>
              <TableCell sx={headerStyle}>Warehouse Code</TableCell>
              <TableCell sx={headerStyle}>Type</TableCell>
              <TableCell sx={headerStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (<TableRow>
              <TableCell colSpan={7} align="center">
                <CircularProgress
                  size={22}
                  className="spinner"
                  sx={{ color: "#1E3A5F", animation: "none !important" }}
                />
              </TableCell>
            </TableRow>) :
              filteredWarehouses.map((warehouse) => (
                <TableRow key={warehouse.warehouseID}>
                  <TableCell sx={rowStyle}>{warehouse.name}</TableCell>
                  <TableCell sx={rowStyle}>{warehouse.phoneNo}</TableCell>
                  <TableCell sx={rowStyle}>{warehouse.address}</TableCell>
                  <TableCell sx={rowStyle}>{warehouse.warehouseID}</TableCell>
                  <TableCell sx={rowStyle}>{warehouse.isSource ? "Source" : "Destination"}</TableCell>
                  <TableCell>
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
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Warehouse Button */}
      {/* <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                
            </Box> */}

      {/* Modal for Add/Edit Warehouse */}
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
            {isAdding ? "Add Warehouse" : "Edit Warehouse Details"}
          </Typography>
          {currentWarehouse && (
            <Box>
              <TextField
                fullWidth
                label="Warehouse Name"
                value={currentWarehouse.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                sx={{ marginBottom: "16px" }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={currentWarehouse.phoneNo}
                onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                sx={{ marginBottom: "16px" }}
              />
              <ToggleButtonGroup
                value={currentWarehouse.isSource} // Default to true if undefined
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    handleFieldChange("isSource", newValue);
                  }
                }}
                sx={{ display: "flex", marginBottom: "16px" }}
              >
                <ToggleButton
                  value={true}
                  sx={{
                    flex: 1,
                    backgroundColor: currentWarehouse.isSource ? "#003366" : "inherit",
                    color: currentWarehouse.isSource ? "white" : "black",
                    "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: "#003366", color: "white" }
                  }}
                >
                  Source
                </ToggleButton>
                <ToggleButton
                  value={false}
                  sx={{
                    flex: 1,
                    backgroundColor: !currentWarehouse.isSource ? "#003366" : "inherit",
                    color: !currentWarehouse.isSource ? "white" : "black",
                    "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: "#003366", color: "white" }
                  }}
                >
                  Destination
                </ToggleButton>
              </ToggleButtonGroup>
              <TextField
                fullWidth
                label="Warehouse Code"
                value={currentWarehouse.warehouseID}
                onChange={(e) => handleFieldChange("warehouseID", e.target.value.toUpperCase())}
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
                  {isAdding ? "Add" : "Save"}  {isLoading1 && (
                    <CircularProgress
                      size={22}
                      className="spinner"
                      sx={{ color: "#fff", animation: "none !important" }}
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
            Delete Warehouse
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
              Delete {isLoading2 && (
                <CircularProgress
                  size={22}
                  className="spinner"
                  sx={{ color: "#fff", animation: "none !important" }}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
