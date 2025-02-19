import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Autocomplete,
} from "@mui/material";
import { FaCopy, FaTrash, FaPlus } from "react-icons/fa";
import "../css/main.css";
import { useAuth } from "../routes/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AddOrderPage({}) {
  const [items, setItems] = useState([]);
  const [counter, setCounter] = useState(1);
  const [senderDetails, setSenderDetails] = useState({
    name: "",
    phoneNo: "",
    address: "",
    role: "sender",
  });
  const [receiverDetails, setReceiverDetails] = useState({
    name: "",
    phoneNo: "",
    address: "",
    role: "receiver",
  });
  const [error, setError] = useState(false);
  const [charges, setCharges] = useState(0);
  const [freight, setFreight] = useState(0);
  const [hamali, setHamali] = useState(0);
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [clients, setClients] = useState([]);
  const [regItems, setregItems] = useState([]);
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
    fetchWarehouse();
    fetchItems();
  }, []);

  const fetchClients = async () => {
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
    setregItems(data.body);
  };

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) {
      const data = await response.json();
      setAllWarehouse(data.body);
    }
  };

  const handleAddRow = () => {
    setItems([...items, { id: counter, name: "", quantity: 0 }]);
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
    if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) {
      return false;
    }
    if (
      items.length === 0 ||
      items.some((item) => !item.name)
    ) {
      if (items.length === 0) alert("Add items");
      return false;
    }
    return true;
  };

  const handleEmptyDetails = (details) => {
    if (!details.name || details.name == "") details.name = "NA";
    if (!details.phoneNo || details.phoneNo == "") details.phoneNo = "NA";
    if (!details.address || details.address == "") details.address = "NA";
    return details;
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
          senderDetails: handleEmptyDetails(senderDetails),
          receiverDetails: handleEmptyDetails(receiverDetails),
          items,
          destinationWarehouse,
          charges,
          hamali,
          freight,
          ...(isAdmin ? { sourceWarehouse } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.flag) {
        alert("Error occurred");
      } else {
        alert("Order Added Successfully");
        navigate(`/user/view/order/${data.body}`);
      }
    } catch (error) {
      console.error("Error adding order:", error);
      alert("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSenderChange = (event, selectedOption) => {
    if (selectedOption.name) {
      setSenderDetails({
        ...senderDetails,
        name: selectedOption.name,
        phoneNo: selectedOption.phoneNo,
        address: selectedOption.address,
      });
    } else {
      setSenderDetails({
        ...senderDetails,
        name: event.target.value,
      });
    }
  };

  const handleReceiverChange = (event, selectedOption) => {
    if (selectedOption.name) {
      setReceiverDetails({
        ...receiverDetails,
        name: selectedOption.name,
        phoneNo: selectedOption.phoneNo,
        address: selectedOption.address,
      });
    } else {
      setReceiverDetails({
        ...receiverDetails,
        name: event.target.value,
      });
    }
  };

  return (
    <Box
      sx={{
        padding: "20px",
        margin: "auto",
        backgroundColor: "#ffffff",
        color: "#1b3655",
      }}
    >
      <Typography
        variant="h4"
        sx={{ marginBottom: "20px", textAlign: "center", color: "#1c3553" }}
      >
        Add Order
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        <Autocomplete
          freeSolo
          options={clients}
          getOptionLabel={(option) => option.name || senderDetails.name}
          value={
            clients.find((client) => client.name === senderDetails.name) ||
            senderDetails.name
          }
          onChange={(event, newValue) => handleSenderChange(event, newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Sender's Name" />
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
        <TextField
          label="Sender's Phone No."
          value={senderDetails.phoneNo}
          name="phoneNo"
          onChange={(e) =>
            setSenderDetails({ ...senderDetails, phoneNo: e.target.value })
          }
        />
        <TextField
          label="Sender's Address"
          value={senderDetails.address}
          name="address"
          onChange={(e) =>
            setSenderDetails({ ...senderDetails, address: e.target.value })
          }
        />
        <Autocomplete
          freeSolo
          options={clients}
          getOptionLabel={(option) => option.name || receiverDetails.name}
          value={
            clients.find((client) => client.name === receiverDetails.name) ||
            receiverDetails.name
          }
          onChange={(event, newValue) => handleReceiverChange(event, newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Receiver's Name" />
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
        <TextField
          label="Receiver's Phone No."
          value={receiverDetails.phoneNo}
          name="phoneNo"
          onChange={(e) =>
            setReceiverDetails({ ...receiverDetails, phoneNo: e.target.value })
          }
        />
        <TextField
          label="Receiver's Address"
          value={receiverDetails.address}
          name="address"
          onChange={(e) =>
            setReceiverDetails({ ...receiverDetails, address: e.target.value })
          }
        />
        <TextField
          label="Freight"
          type="text"
          value={freight}
          onChange={(e) => setFreight(parseInt(e.target.value) || 0)}
        />
        <TextField
          label="Hamali"
          type="text"
          value={hamali}
          onChange={(e) => setHamali(parseInt(e.target.value) || 0)}
        />
        <TextField
          label="Statistical Charges"
          type="text"
          value={charges}
          onChange={(e) => setCharges(parseInt(e.target.value) || 0)}
        />
        {isAdmin && (
          <FormControl>
            <InputLabel>Source Warehouse</InputLabel>
            <Select
              label="Source Warehouse"
              value={sourceWarehouse}
              onChange={(e) => setSourceWarehouse(e.target.value)}
              error={error && !sourceWarehouse}
            >
              {allWarehouse
                .filter((w) => w.isSource)
                .map((w) => (
                  <MenuItem key={w.warehouseID} value={w.warehouseID}>
                    {w.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}
        <FormControl>
          <InputLabel>Destination Warehouse</InputLabel>
          <Select
            label="Destination Warehouse"
            value={destinationWarehouse}
            onChange={(e) => setDestinationWarehouse(e.target.value)}
            error={error && !destinationWarehouse}
          >
            {allWarehouse
              .filter((w) => !w.isSource)
              .map((w) => (
                <MenuItem key={w.warehouseID} value={w.warehouseID}>
                  {w.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
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
                  <Autocomplete
                    value={item.name}
                    options={regItems.map((item) => item.name)}
                    onChange={(event, newValue) => {
                      handleInputChange(item.id, "name", newValue);
                    }}
                    onInputChange={(event, newValue) => {
                      handleInputChange(item.id, "name", newValue);
                    }}
                    getOptionLabel={(option) => option || item.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Enter Item Name"
                        variant="outlined"
                        size="small"
                        error={error && !item.name}
                        helperText={error && !item.name ? "Required" : ""}
                        sx={{
                          "& .MuiInputBase-root": {
                            fontSize: "14px",
                            color: "#1b3655",
                          },
                          width: "300px",
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
        <button
          className="button button-large"
          onClick={handleAddOrder}
          disabled={isLoading}
        >
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
