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
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Close } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import "../css/main.css";

const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
const rowStyle = { color: "#25344E" };
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AllItemPage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItemList, setCurrentItemList] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
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

    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-item`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setItems(data.body);
    setIsLoading(false);
  };

  const applyFilter = () => {
    const filtered = items.filter((item) => {
      return nameFilter
        ? item.name.toLowerCase().startsWith(nameFilter.toLowerCase())
        : true;
    });
    setFilteredItems(filtered);
  };

  const clearFilter = () => {
    setNameFilter("");
    setFilteredItems(items);
  };

  const handleEdit = (Item) => {
    setCurrentItemList([Item]);
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
    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-item`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        itemId: itemToDelete,
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
    setCurrentItemList([{
      name: "",
      freight: 0,
      hamali: 0,
      type: "C/B",
    }]);
    setIsModalOpen(true);
    setIsAdding(true);
  };

  const handleSaveOrAdd = async () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    let method, body;
    if (isAdding) {
      method = "POST";
      body = {items: currentItemList}
    } else {
      method = "PUT";
      body = {items: currentItemList };
    }
    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-item`, {
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
    setCurrentItemList(null);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...currentItemList];
    if (field === "freight" || field === "hamali") {
      value = parseInt(value) || 0;
    }
    if (field === "name") {
      value = value.toUpperCase();
    }

    updatedItems[index][field] = value;
    setCurrentItemList(updatedItems);
  };

  const handleAddItemRow = () => {
    setCurrentItemList((prev) =>
      [...prev,
      { name: "", freight: 0, hamali: 0, type: "C/B" }],
    );
  };

  const handleRemove = (index) => {
    const updatedItems = [...currentItemList];
    updatedItems.splice(index, 1);
    setCurrentItemList(updatedItems);
  };



  const renderPage2 = () => (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Freight</TableCell>
            <TableCell>Hamali</TableCell>
            {isAdding ? <TableCell>Actions</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {currentItemList?.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <TextField
                  value={item.name}
                  size="small"
                  disabled={!isAdding}
                  onChange={(e) =>
                    handleItemChange(idx, "name", e.target.value)
                  }
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select
                    value={item.type}
                    onChange={(e) =>
                      handleItemChange(idx, "type", e.target.value)
                    }
                    size="small"
                  >
                    <MenuItem value="C/B">C/B</MenuItem>
                    <MenuItem value="G/B">G/B</MenuItem>
                    <MenuItem value="BUNDLE">Bundle</MenuItem>
                  </Select>
                </FormControl>
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
              {isAdding ? <TableCell>

                <IconButton
                  color="error"
                  onClick={() => handleRemove(idx)}
                >
                  <Delete />
                </IconButton>
              </TableCell> : null}

            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isAdding ? <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleAddItemRow}
        >
          + Add Row
        </Button>
      </Box> : null}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 12 }}>
        <Button variant="contained" onClick={handleSaveOrAdd}>
          {isAdding ? "Add Item" : "Save Changes"}
          {isLoading1 && (
            <CircularProgress
              size={22}
              sx={{ color: "#fff", ml: 1 }}
            />
          )}
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Item Details
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "center" }}>
        <TextField
          label="Search by Item Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button variant="contained" color="primary" onClick={applyFilter}>
          Apply
        </Button>
        <Button variant="outlined" color="secondary" onClick={clearFilter}>
          Clear
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
              <TableCell sx={headerStyle}>No</TableCell>
              <TableCell sx={headerStyle}>Item Name</TableCell>
              <TableCell sx={headerStyle}>Type</TableCell>
              <TableCell sx={headerStyle}>Freight</TableCell>
              <TableCell sx={headerStyle}>Hamali</TableCell>
              <TableCell sx={headerStyle}>Actions</TableCell>
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
            ) : (filteredItems.length > 0 ?
              filteredItems.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={rowStyle}>{idx+1}</TableCell>
                  <TableCell sx={rowStyle}>{item.name}</TableCell>
                  <TableCell sx={rowStyle}>{item.type}</TableCell>
                  <TableCell sx={rowStyle}>{item.freight}</TableCell>
                  <TableCell sx={rowStyle}>{item.hamali}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) :
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No data to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Add/Edit Item */}
      <Modal open={isModalOpen} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
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
            {isAdding ? "Add Items" : "Edit Item"}
          </Typography>
          {currentItemList && (
            <Box>{renderPage2()}</Box>
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
