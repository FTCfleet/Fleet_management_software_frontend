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

const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
const rowStyle = { color: "#25344E" };
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AllItemPage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [itemNoFilter, setItemNoFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

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
    console.log(data);
    setItems(data.body);
    setIsLoading(false);
  };

  // Filters
  const applyFilter = () => {
    const filtered = items.filter((item) => {
      return (
        (nameFilter
          ? item.name.toLowerCase().includes(nameFilter.toLowerCase())
          : true) &&
        (itemNoFilter
          ? item.vehicleNo.toLowerCase().includes(itemNoFilter.toLowerCase())
          : true)
      );
    });
    setFilteredItems(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setItemNoFilter("");
    setFilteredItems(items);
  };

  const handleEdit = (item) => {
    setCurrentItem({ ...item });
    setIsModalOpen(true);
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
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
        vehicleNo: itemToDelete,
      }),
    });

    const data = await res.json();
    fetchData();
    setIsLoading2(false);
    setDeleteModalOpen(false);
    setItemToDelete(null);
    return;
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleAdd = () => {
    setCurrentItem({ name: "", phoneNo: "", vehicleNo: "" });
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
        vehicleNo: currentItem.vehicleNo,
        name: currentItem.name,
        phoneNo: currentItem.phoneNo,
      };
    } else {
      method = "PUT";
      body = {
        vehicleNo: currentItem.vehicleNo,
        updates: {
          name: currentItem.name,
          phoneNo: currentItem.phoneNo,
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

    const data = await res.json();
    console.log(data);
    fetchData();
    setIsLoading1(false);
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleFieldChange = (field, value) => {
    setCurrentItem({ ...currentItem, [field]: value });
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Item Details
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
          label="Search by Item Number"
          value={itemNoFilter}
          onChange={(e) => setItemNoFilter(e.target.value)}
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
          Add Item
        </button>
      </Box>

      {/* Item Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Driver Name</TableCell>
              <TableCell sx={headerStyle}>Phone Number</TableCell>
              <TableCell sx={headerStyle}>Item Number</TableCell>
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
              filteredItems.map((item) => (
                <TableRow key={item.vehicleNo}>
                  <TableCell sx={rowStyle}>{item.name}</TableCell>
                  <TableCell sx={rowStyle}>{item.phoneNo}</TableCell>
                  <TableCell sx={rowStyle}>{item.vehicleNo}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(item)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(item.vehicleNo)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Item Button */}
      {/* <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                
            </Box> */}

      {/* Modal for Add/Edit Item */}
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
            {isAdding ? "Add Item" : "Edit Item Details"}
          </Typography>
          {currentItem && (
            <Box>
              <TextField
                fullWidth
                label="Driver Name"
                value={currentItem.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                sx={{ marginBottom: "16px" }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={currentItem.phoneNo}
                onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                sx={{ marginBottom: "16px" }}
              />
              <TextField
                fullWidth
                label="Item Number"
                value={currentItem.vehicleNo}
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
                  {isAdding ? "Add" : "Save"} {isLoading1 && (
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
            Delete Item
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
