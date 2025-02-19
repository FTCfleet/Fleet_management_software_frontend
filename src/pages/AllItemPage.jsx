import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import "../css/main.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AllItemPage() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading1, setIsLoading1] = useState(false);
  const [newItemNames, setNewItemNames] = useState([""]);
  const [delCounter, setDelCounter] = useState(0);
  const selected = useRef(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const chunkArray = (arr, size) =>
    arr.length > 0
      ? arr.reduce(
          (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
          []
        )
      : [];

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/api/admin/manage/regular-item`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.flag) {
          setRows(chunkArray(data.body, 3));
          setIsLoading(false);
        }
      });
  };

  const handleSelect = (itemName) => {
    if (!selected.current.has(itemName)) {
      selected.current.add(itemName);
      setDelCounter(delCounter + 1);
    } else {
      selected.current.delete(itemName);
      setDelCounter(delCounter - 1);
    }
  };

  const handleDelete = () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/api/admin/manage/regular-item`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [...selected.current],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.flag) {
          fetchData();
          selected.current = new Set();
          setDelCounter(0);
        }
        setEditing(false);
        setIsLoading1(false);
      });
  };

  const handleAddItems = () => {
    setIsLoading1(true);
    const validItems = newItemNames
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    if (validItems.length === 0) {
      alert("Enter valid item names");
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/api/admin/manage/regular-item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: validItems,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.flag) {
          fetchData();
          setNewItemNames([""]);
          setOpenAddDialog(false);
        }
        setIsLoading1(false);
      });
  };

  const handleInputChange = (index, value) => {
    setNewItemNames((prev) => {
      const newNames = [...prev];
      newNames[index] = value;
      return newNames;
    });
  };

  const addInputField = () => {
    setNewItemNames((prev) => [...prev, ""]);
  };

  const handleOpen = () => {
    setNewItemNames([""]);
    setOpenAddDialog(true);
  };

  const handleClose = () => {
    setNewItemNames([""]);
    setOpenAddDialog(false);
  };

  const handleCancelEdit = () => {
    selected.current = new Set();
    setDelCounter(0);
    setEditing(false);
  };

  return (
    <Paper sx={{ margin: 2, padding: 2 }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingLeft: "10px",
          paddingRight: "30px",
        }}
      >
        <div>
          <h1>Items</h1>
        </div>
        <div style={{ alignContent: "center" }}>
          {!editing && (
            <>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpen}
                style={{ marginRight: "10px" }}
              >
                Add
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Edit />}
                onClick={() => setEditing(!editing)}
              >
                {"Edit"}
              </Button>
            </>
          )}
          {editing && (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Edit />}
                onClick={handleCancelEdit}
                style={{ marginRight: "10px" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                disabled={delCounter === 0}
              >
                Delete ({delCounter}){" "}
                {isLoading1 && (
                  <CircularProgress
                    size={15}
                    className="spinner"
                    sx={{ color: "#fff", animation: "none !important" }}
                  />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <TableContainer>
        <Table>
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
            ) : rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((item, colIndex) => (
                    <TableCell key={colIndex}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {editing && (
                          <Checkbox
                            checked={selected.current.has(item._id)}
                            onChange={() => handleSelect(item._id)}
                          />
                        )}
                        {item.name}
                      </div>
                    </TableCell>
                  ))}
                  {/* Fill empty cells if row has less than 3 items */}
                  {Array(3 - row.length)
                    .fill()
                    .map((_, i) => (
                      <TableCell key={`empty-${i}`} />
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colspan>No data to display</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Items Dialog */}
      <Dialog open={openAddDialog} onClose={handleClose}>
        <DialogTitle>Add New Items</DialogTitle>
        <DialogContent
          style={{ display: "flex", flexDirection: "column", width: "350px" }}
        >
          {newItemNames.map((name, index) => (
            <TextField
              key={index}
              autoFocus={index === 0}
              margin="dense"
              label={`Item ${index + 1}`}
              variant="standard"
              value={name}
              onChange={(e) =>
                handleInputChange(index, e.target.value.toUpperCase())
              }
              sx={{ mb: 2 }}
            />
          ))}
          <Button
            onClick={addInputField}
            variant="outlined"
            size="small"
            style={{ maxWidth: "200px" }}
          >
            Add Another Item
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddItems} variant="contained">
            Add All{" "}
            {isLoading1 && (
              <CircularProgress
                size={15}
                className="spinner"
                sx={{ color: "#fff", animation: "none !important" }}
              />
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
