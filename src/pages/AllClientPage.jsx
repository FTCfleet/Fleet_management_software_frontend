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

export default function AllClientPage() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-client`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setClients(data.body);
    setIsLoading(false);
  };

  // Filters
  const applyFilter = () => {
    const filtered = clients.filter((client) => {
      return (
        (nameFilter
          ? client.name.toLowerCase().includes(nameFilter.toLowerCase())
          : true)
      );
    });
    setFilteredClients(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setFilteredClients(clients);
  };

  const handleEdit = (client) => {
    setCurrentClient({ ...client });
    setIsModalOpen(true);
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setClientToDelete(id);
    console.log(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading2(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-client`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: clientToDelete,
      }),
    });

    const data = await res.json();
    fetchData();
    setIsLoading2(false);
    setDeleteModalOpen(false);
    setClientToDelete(null);
    return;
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleAdd = () => {
    setCurrentClient({ name: "", phoneNo: "", address: "" });
    setIsModalOpen(true);
    setIsAdding(true);
  };

  const handleSaveOrAdd = async () => {
    setIsLoading1(true);
    console.log(currentClient._id);
    const token = localStorage.getItem("token");
    let method, body;
    if (isAdding) {
      method = "POST";
      body = {
        name: currentClient.name.toUpperCase(),
        phoneNo: currentClient.phoneNo,
        address: currentClient.address.name.toUpperCase(),
      };
    } else {
      method = "PUT";
      body = {
        id: currentClient._id,
        updates: {
          phoneNo: currentClient.phoneNo,
          address: currentClient.address.name.toUpperCase(),
        },
      };
    }
    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-client`, {
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
    setCurrentClient(null);
  };

  const handleFieldChange = (field, value) => {
    setCurrentClient({ ...currentClient, [field]: value });
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Client Details
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <TextField
          label="Search by Client Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
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
          Add Client
        </button>
      </Box>

      {/* Client Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Client Name</TableCell>
              <TableCell sx={headerStyle}>Phone Number</TableCell>
              <TableCell sx={headerStyle}>Client Address</TableCell>
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
              filteredClients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell sx={rowStyle}>{client.name}</TableCell>
                  <TableCell sx={rowStyle}>{client.phoneNo}</TableCell>
                  <TableCell sx={rowStyle}>{client.address}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(client)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(client._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Add/Edit Client */}
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
            {isAdding ? "Add Client" : "Edit Client Details"}
          </Typography>
          {currentClient && (
            <Box>
              <TextField
                fullWidth
                label="Client Name"
                value={currentClient.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                sx={{ marginBottom: "16px" }}
                disabled={!isAdding}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={currentClient.phoneNo}
                onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                sx={{ marginBottom: "16px" }}
              />
              <TextField
                fullWidth
                label="Client Address"
                value={currentClient.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
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
            Delete Client
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
