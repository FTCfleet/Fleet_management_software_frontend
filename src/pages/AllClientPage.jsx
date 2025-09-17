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
  Autocomplete,
  createFilterOptions,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from "@mui/material";
import { Edit, Delete, Close } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { IoArrowForwardCircleOutline } from "react-icons/io5";

const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
const rowStyle = { color: "#25344E" };
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AllClientPage() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [regItems, setRegItems] = useState([]);
  const [regClientItems, setRegClientItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [currentClient, setCurrentClient] = useState(null);
  const [clientType, setClientType] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  useEffect(() => {
    fetchData();
    fetchItems();
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

  const fetchItems = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-item`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setRegItems(data.body);
  };

  const applyFilter = () => {
    let filtered = clients;
    if (nameFilter) {
      filtered = filtered.filter(
        (client) =>
          client.name
            .toLowerCase()
            .startsWith(nameFilter.toLowerCase())
      );
    }

    if (clientType !== "all") {
      filtered = filtered.filter(
        (client) => 
          clientType === "sender" && client.isSender || 
          clientType === "receiver" && !client.isSender
      );
    }
    setFilteredClients(filtered);
    // setFilteredClients(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setClientType("all");
    setFilteredClients(clients);
  };

  const handleEdit = (client) => {
    setCurrentClient({ ...client });
    setPage(1);
    setIsModalOpen(true);
    setIsAdding(false);
  };

  const handleEditItems = (client) => {
    fetchRegClientItems(client._id).then(() => {
      setCurrentClient({ ...client });
      setPage(2);
      setIsModalOpen(true);
      setIsAdding(false);
    });
  };

  const handleDelete = (id) => {
    setClientToDelete(id);
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
    setCurrentClient({
      name: "",
      phoneNo: "",
      address: "",
      gst: "",
      items: [
        {
          itemDetails: {},
          freight: 0,
          hamali: 0,
          type: "C/B",
        },
      ],
    });
    setIsModalOpen(true);
    setPage(1);
    setIsAdding(true);
  };

  const fetchRegClientItems = async (clientId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${BASE_URL}/api/admin/regular-client-items/${clientId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    setCurrentClient((prev) => ({...prev, items: data.body }));
  };

  const handleSaveOrAdd = async () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    let method, body;
    currentClient.items = currentClient.items.filter((item) => item.itemDetails._id);
    if (isAdding) {
      method = "POST";
      body = {
        name: currentClient.name.toUpperCase(),
        phoneNo: currentClient.phoneNo ? currentClient.phoneNo : "NA",
        address: currentClient.address ? currentClient.address : "NA",
        gst: currentClient.gst ? currentClient.gst : "NA",
        items: currentClient.items.map((item) => ({
          itemDetails: item.itemDetails._id,
          freight: parseInt(item.freight) || 0,
          hamali: parseInt(item.hamali) || 0,
          statisticalCharges: parseInt(item.hamali) || 0,
        })),
        isSender: currentClient.isSender
      };
    } else {
      method = "PUT";
      body = {
        id: currentClient._id,
        updates: {
          name: currentClient.name.toUpperCase(),
          isSender: currentClient.isSender,
          phoneNo: currentClient.phoneNo ? currentClient.phoneNo : "NA",
          address: currentClient.address ? currentClient.address : "NA",
          gst: currentClient.gst ? currentClient.gst : "NA",
          items: currentClient.items.map((item) => ({
            itemDetails: item.itemDetails._id,
            freight: parseInt(item.freight) || 0,
            hamali: parseInt(item.hamali) || 0,
            statisticalCharges: parseInt(item.hamali) || 0,
          })),
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
    if (res.status === 409){
      alert("Client already exists");
      setIsLoading1(false);
      setIsModalOpen(false);
      return;
    }
    const data = await res.json();
    if (data.error?.includes("duplicate")){
      alert("Client exists");
    }
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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...currentClient.items];
    if (field === "autoComplete") {
      const selectedItem = regItems.find((item) => item.name === value);
      updatedItems[index].itemDetails = selectedItem;
      updatedItems[index].name = value;
      updatedItems[index].freight = selectedItem.freight;
      updatedItems[index].hamali = selectedItem.hamali;
      setCurrentClient({ ...currentClient, items: updatedItems });
      return;
    }
    else if (field === "freight" || field === "hamali") {
      value = parseInt(value) || 0;
    }
    updatedItems[index][field] = value;
    setCurrentClient({ ...currentClient, items: updatedItems });
  };

  const handleAddItemRow = () => {
    setCurrentClient((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", freight: 0, hamali: 0, _id: "", itemDetails: {} }],
    }));
  };

  const handleRemove = (index) => {
    const updatedItems = [...currentClient.items];
    updatedItems.splice(index, 1);
    setCurrentClient({ ...currentClient, items: updatedItems });
  };

  const renderPage1 = () => (
    <>
      <TextField
        fullWidth
        label="Client Name"
        value={currentClient.name}
        onChange={(e) =>
          handleFieldChange("name", e.target.value.toUpperCase())
        }
        sx={{ marginBottom: "16px" }}
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
        onChange={(e) =>
          handleFieldChange("address", e.target.value.toUpperCase())
        }
        sx={{ marginBottom: "16px" }}
      />
      <TextField
        fullWidth
        label="GST Number"
        value={currentClient.gst}
        onChange={(e) => handleFieldChange("gst", e.target.value.toUpperCase())}
        sx={{ marginBottom: "16px" }}
      />
      
      <ToggleButtonGroup
        value={currentClient.isSender}
        exclusive
        onChange={(e, newValue) => {
          if (newValue !== null) {
            handleFieldChange("isSender", newValue);
          }
        }}
        sx={{ display: "flex", marginBottom: "16px" }}
      >
        <ToggleButton
          value={true}
          sx={{
            flex: 1,
            backgroundColor: currentClient.isSender
              ? "#003366"
              : "inherit",
            color: currentClient.isSender ? "white" : "black",
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: "#003366",
              color: "white",
            },
          }}
        >
          Sender
        </ToggleButton>
        <ToggleButton
          value={false}
          sx={{
            flex: 1,
            backgroundColor: !currentClient.isSender
              ? "#003366"
              : "inherit",
            color: !currentClient.isSender ? "white" : "black",
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: "#003366",
              color: "white",
            },
          }}
        >
          Receiver
        </ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        {isAdding ? (
          <Button variant="contained" onClick={() => {setPage(2); setCurrentClient({ ...currentClient, items: [] }); handleAddItemRow();}}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSaveOrAdd}>
            Save Changes
            {isLoading1 && (
              <CircularProgress size={22} sx={{ color: "#fff", ml: 1 }} />
            )}
          </Button>
        )}
      </Box>
    </>
  );

  const renderPage2 = () => (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item Name</TableCell>
            <TableCell>Freight</TableCell>
            <TableCell>Hamali</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentClient.items?.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Autocomplete
                  value={item.itemDetails?.name || ""}
                  options={regItems.map((item) => item.name)}
                  onChange={(event, newValue) => {
                    handleItemChange(idx, "autoComplete", newValue);
                  }}
                  filterOptions={createFilterOptions({
                    matchFrom: "start",
                  })}
                  getOptionLabel={(option) => option || item.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Enter Item Name"
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiInputBase-root": {
                          fontSize: "14px",
                          color: "#1b3655",
                        },
                        width: "13vw",
                      }}
                    />
                  )}
                  disableClearable
                  slots={{
                    paper: (props) => (
                      <div
                        {...props}
                        style={{
                          overflowY: "auto",
                          backgroundColor: "#f7f9fc",
                          color: "black",
                          border: "1px solid black",
                        }}
                      />
                    ),
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="text"
                  value={item.freight}
                  size="small"
                  onChange={(e) =>
                    handleItemChange(idx, "freight", e.target.value)
                  }
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="text"
                  value={item.hamali}
                  size="small"
                  onChange={(e) =>
                    handleItemChange(idx, "hamali", e.target.value)
                  }
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <IconButton color="error" onClick={() => handleRemove(idx)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="outlined" size="small" onClick={handleAddItemRow}>
          + Add Row
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 12 }}>
        {isAdding ? (
          <Button variant="outlined" onClick={() => setPage(1)}>
            Previous
          </Button>
        ) : null}
        <Button variant="contained" onClick={handleSaveOrAdd}>
          {isAdding ? "Add Client" : "Save Changes"}
          {isLoading1 && (
            <CircularProgress size={22} sx={{ color: "#fff", ml: 1 }} />
          )}
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Client Details
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "center" }}>
        <TextField
          label="Search by Client Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          variant="outlined"
          size="small"
        />
        <FormControl>
          <InputLabel>Client Type</InputLabel>
          <Select
            label="Choose"
            value={clientType}
            size="small"
            onChange={(e) => setClientType(e.target.value)}
          >
            <MenuItem value="all">All Clients</MenuItem>
            <MenuItem value="sender">Sender</MenuItem>
            <MenuItem value="receiver">Receiver</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={applyFilter}>
          Apply
        </Button>
        <Button variant="outlined" color="secondary" onClick={clearFilter}>
          Clear
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
              <TableCell sx={headerStyle}>Sl No</TableCell>
              <TableCell sx={headerStyle}>Client Name</TableCell>
              <TableCell sx={headerStyle}>Phone Number</TableCell>
              <TableCell sx={headerStyle}>Client Address</TableCell>
              <TableCell sx={headerStyle}>GST</TableCell>
              <TableCell sx={headerStyle}>Client Type</TableCell>
              <TableCell sx={{...headerStyle, textAlign: "center"}}>View Items</TableCell>
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
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={rowStyle}>{idx + 1}.</TableCell>
                  <TableCell sx={rowStyle}>{client.name}</TableCell>
                  <TableCell sx={rowStyle}>{client.phoneNo}</TableCell>
                  <TableCell sx={rowStyle}>{client.address}</TableCell>
                  <TableCell sx={rowStyle}>{client.gst}</TableCell>
                  <TableCell sx={rowStyle}>{client.isSender ? "Sender" : "Receiver"}</TableCell>
                  <TableCell sx={{...rowStyle, textAlign: "center"}}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditItems(client)}
                    >
                      <IoArrowForwardCircleOutline size={24} />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{...headerStyle, textAlign: "center"}}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(client)}
                    >
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No data to display
                </TableCell>
              </TableRow>
            )}
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
            width: page === 1 ? 400 : 600,
            maxHeight: "70vh",
            overflowY: "auto",
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
            {isAdding
              ? page === 1
                ? "Add Client"
                : "Add Item Rate"
              : page === 1
              ? "Edit Client Details"
              : "Edit Item Rate"}
          </Typography>
          {currentClient && (
            <Box>{page === 1 ? renderPage1() : renderPage2()}</Box>
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
            width: 500,
            bgcolor: "background.paper",
            borderRadius: 2,
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
