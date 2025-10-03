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

export default function AllIte() {
  const [itemTypes, setItemTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentItemType, setCurrentItemType] = useState({ name: "" });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemTypeToDelete, setItemTypeToDelete] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchItemTypes();
  }, []);

  const fetchItemTypes = async () => {
    setIsFetching(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/api/admin/manage/item-type`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch item types");
      }

      const data = await response.json();
      setItemTypes(data.body || []);
    } catch (error) {
      console.error(error);
      alert("Unable to load item types. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAdd = () => {
    setCurrentItemType({ name: "" });
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleEdit = (itemType) => {
    setCurrentItemType({ ...itemType });
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItemType({ name: "" });
  };

  const handleSave = async () => {
    if (!currentItemType.name.trim()) {
      alert("Item type name is required.");
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem("token");
    const newItemName = currentItemType.name.trim();

    const requestConfig = {
      method: isAdding ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(
        isAdding
          ? { name: newItemName }
          : { id: currentItemType._id, name: newItemName }
      ),
    };

    try {
      if (!isAdding && !currentItemType._id) {
        throw new Error("Missing item type identifier");
      }

      const response = await fetch(
        `${BASE_URL}/api/admin/manage/item-type`,
        requestConfig
      );

      if (response.status === 409) {
        alert("Item type already exists.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to save item type");
      }

      await response.json();
      fetchItemTypes();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Unable to save item type. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (itemTypeId) => {
    setItemTypeToDelete(itemTypeId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemTypeToDelete) return;

    setIsDeleting(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/api/admin/manage/item-type`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: itemTypeToDelete }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete item type");
      }

      await response.json();
      fetchItemTypes();
      setDeleteModalOpen(false);
      setItemTypeToDelete(null);
    } catch (error) {
      console.error(error);
      alert("Unable to delete item type. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemTypeToDelete(null);
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Item Types
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
        <button className="button" onClick={handleAdd}>
          Add Item Type
        </button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
            <TableRow>
              <TableCell sx={{ ...headerStyle, textAlign: "center" }} colSpan={9}>All Item Types ({itemTypes.length})</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress size={28} sx={{ color: "#1E3A5F" }} />
                </TableCell>
              </TableRow>
            ) : itemTypes.length > 0 ? (
              itemTypes.reduce((rows, item, index) => {
                if (index % 3 === 0) rows.push([]);
                rows[rows.length - 1].push(item);
                return rows;
              }, []).map((row, rowIndex) => (
                <TableRow key={rowIndex} >
                  {row.map((itemType, colIndex) => (
                    <React.Fragment key={itemType._id}>
                      <TableCell sx={rowStyle}>{rowIndex * 3 + colIndex + 1}.</TableCell>
                      <TableCell sx={rowStyle}>{itemType.name}</TableCell>
                      <TableCell  sx={{borderRight: "1px solid #ddd"}}>
                        <IconButton color="primary" onClick={() => handleEdit(itemType)}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(itemType._id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </React.Fragment>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No item types found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
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
            onClick={handleCloseModal}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ marginBottom: "16px", textAlign: "center", ...headerStyle }}
          >
            {isAdding ? "Add Item Type" : "Edit Item Type"}
          </Typography>
          <TextField
            fullWidth
            label="Item Type Name"
            value={currentItemType.name}
            onChange={(e) =>
              setCurrentItemType({ ...currentItemType, name: e.target.value.toUpperCase() })
            }
            sx={{ marginBottom: "16px" }}
          />
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <button
              className="button button-large"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isAdding ? "Add" : "Save"}
              {isSaving && (
                <CircularProgress
                  size={22}
                  className="spinner"
                  sx={{ color: "#fff", animation: "none !important", ml: 1 }}
                />
              )}
            </button>
          </Box>
        </Box>
      </Modal>

      <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
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
            Delete Item Type
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
              disabled={isDeleting}
            >
              Delete
              {isDeleting && (
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
