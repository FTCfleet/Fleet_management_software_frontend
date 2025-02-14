import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { FaCopy, FaTrash, FaPlus } from "react-icons/fa";
import "../css/main.css";
import { useAuth } from "../routes/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AddOrderPage({ }) {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [counter, setCounter] = useState(1);
  const [senderDetails, setSenderDetails] = useState({ name: "NA", phoneNo: "NA", address: "NA", role: "sender" });
  const [receiverDetails, setReceiverDetails] = useState({ name: "NA", phoneNo: "NA", address: "NA", role: "receiver" });
  const [error, setError] = useState(false);
  const [charges, setCharges] = useState(0);
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWarehouse();
  }, []);

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) {
      const data = await response.json();
      setAllWarehouse(data.body);
    }
  };

  const handleAddRow = () => {
    setItems([...items, { id: counter, name: "", quantity: "" }]);
    setCounter(counter + 1);
  };

  const handleRemoveRow = (id) => {
    const updatedItems = items
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        id: index + 1,
      }));
    setItems(updatedItems);
    setCounter(updatedItems.length + 1);
  };

  const handleCopyRow = (id) => {
    const itemToCopy = items.find((item) => item.id === id);
    if (itemToCopy) {
      setItems([...items, { ...itemToCopy, id: counter }]);
      setCounter(counter + 1);
    }
  };

  const handleInputChange = (id, field, value) => {
    if (field === "quantity") {
      value = parseInt(value) || 0;
    }
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };


  const validateOrder = () => {
    console.log(senderDetails);
    if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) {
      return false;
    }
    if (items.length === 0 || items.some(item => !item.name || !item.quantity)) {
      return false;
    }
    return true;
  };

  const handleAddOrder = async () => {
    if (!validateOrder()) {
      setError(true);
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/parcel/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderDetails,
          receiverDetails,
          items,
          destinationWarehouse,
          charges,
          ...(isAdmin ? { sourceWarehouse } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok || data.flag) {
        alert("Error occurred");
      } else {
        alert("Order Added Successfully");
        navigate(`/user/view/order/${data.body}`);
      }
    } catch (error) {
      console.error("Error adding order:", error);
      alert("Network error occurred");
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  return (
    <Box sx={{ padding: "20px", margin: "auto", backgroundColor: "#ffffff", color: "#1b3655" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", textAlign: "center", color: "#1c3553" }}>
        Add Order
      </Typography>

      <Box sx={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(3, 1fr)" }}>
        <TextField
          label="Sender's Name"
          name="name"
          onChange={(e) => setSenderDetails({ ...senderDetails, name: e.target.value })}
        />
        <TextField
          label="Sender's Phone No."
          name="phoneNo"
          onChange={(e) => setSenderDetails({ ...senderDetails, phoneNo: e.target.value })}
        />
        <TextField
          label="Sender's Address (Optional)"
          name="address"
          onChange={(e) => setSenderDetails({ ...senderDetails, address: e.target.value })}
        />
        <TextField
          label="Receiver's Name"
          name="name"
          onChange={(e) => setReceiverDetails({ ...receiverDetails, name: e.target.value })}
        />
        <TextField
          label="Receiver's Phone No."
          name="phoneNo"
          onChange={(e) => setReceiverDetails({ ...receiverDetails, phoneNo: e.target.value })}
        />
        <TextField
          label="Receiver's Address"
          name="address"
          onChange={(e) => setReceiverDetails({ ...receiverDetails, address: e.target.value })}
        />
        <TextField
          label="Charges"
          type="text"
          value={charges}
          onChange={(e) => setCharges(parseInt(e.target.value) || 0)}
        />
        <FormControl>
          <InputLabel>Destination Warehouse</InputLabel>
          <Select
            label="Destination Warehouse"
            value={destinationWarehouse}
            onChange={(e) => setDestinationWarehouse(e.target.value)}
            error={error && !destinationWarehouse}
          >
            {allWarehouse.filter(w => !w.isSource).map(w => (
              <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {isAdmin && (
          <FormControl>
            <InputLabel>Source Warehouse</InputLabel>
            <Select
              label="Source Warehouse"
              value={sourceWarehouse}
              onChange={(e) => setSourceWarehouse(e.target.value)}
              error={error && !sourceWarehouse}
            >
              {allWarehouse.filter(w => w.isSource).map(w => (
                <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Box sx={{ marginTop: "30px" }}>
        <Typography
          variant="h6"
          sx={{
            marginBottom: "10px",
            textAlign: "center",
            color: "#25344e",
            fontWeight: "bold",
          }}
        >
          Items
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                Sl. No.
              </TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                Item Name
              </TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                Quantity
              </TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  <TextField
                    value={item.name}
                    onChange={(e) =>
                      handleInputChange(item.id, "name", e.target.value)
                    }
                    placeholder="Enter Item Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={error && !item.name}
                    helperText={error && !item.name ? "Required" : ""}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: "14px",
                        color: "#1b3655",
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="text"
                    value={item.quantity}
                    onChange={(e) =>
                      handleInputChange(item.id, "quantity", e.target.value)
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={error && !item.quantity}
                    helperText={error && !item.quantity ? "Required" : ""}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: "14px",
                        color: "#1b3655",
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleCopyRow(item.id)}
                  >
                    <FaCopy />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleRemoveRow(item.id)}
                  >
                    <FaTrash />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ textAlign: "right", marginTop: "10px" }}>
          <button className="button" onClick={handleAddRow}>
            <FaPlus style={{ marginRight: "8px" }} /> Add Item
          </button>
        </Box>
      </Box>

      <Box className="button-wrapper">
        <button className="button button-large" onClick={handleAddOrder} disabled={isLoading}>
          Add Order
          {isLoading && (
            <CircularProgress
              size={22}
              className="spinner"
              sx={{ color: "#fff", animation: "none !important" }}
            />
          )}
        </button>
      </Box>


    </Box>
  );
}
