import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
} from "@mui/material";
import { FaCopy, FaTrash, FaPlus } from "react-icons/fa";
import "../css/main.css";
import { useAuth } from "../routes/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AddOrderPage({ edit }) {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [oldItems, setOldItems] = useState([]);
  const [counter, setCounter] = useState(1);
  const [senderDetails, setSenderDetails] = useState({ role: "sender" });
  const [receiverDetails, setReceiverDetails] = useState({ role: "receiver" });
  const [error, setError] = useState(false);
  const [charges, setCharges] = useState(0);
  const [status, setStatus] = useState(0);
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestWarehouse] = useState("");
  const [initialitems, setInitialItems] = useState(0);
  const { isAdmin, isSource } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (edit) fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/parcel/track/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      alert("Error occurred");
      return;
    }
    if (response.status === 201) {
      alert("No such Order");
      return;
    }
    const data = (await response.json()).body;
    console.log(data);
    setSenderDetails(data.sender);
    setReceiverDetails(data.receiver);
    setSourceWarehouse(data.sourceWarehouse.warehouseID);
    setDestWarehouse(data.destinationWarehouse.warehouseID);
    setOldItems(data.items);
    setInitialItems(data.items.length);
  };

  const handleAddRow = () => {
    setItems([...items, { itemId: counter, name: "", quantity: "" }]);
    setCounter(counter + 1);
  };

  const handleRemoveRow = (itemId) => {
    const updatedItems = items
      .filter((item) => item.itemId !== itemId)
      .map((item, index) => ({
        ...item,
        itemId: index + 1,
      }));
    setItems(updatedItems);
    setCounter(updatedItems.length + 1);
  };

  const handleCopyRow = (itemId) => {
    const itemToCopy = items.find((item) => item.itemId === itemId);
    if (itemToCopy) {
      setItems([...items, { ...itemToCopy, itemId: counter }]);
      setCounter(counter + 1);
    }
  };

  const handleInputChange = (itemId, field, value) => {
    if (field === "quantity") {
      value = parseInt(value);
    }
    const updatedItems = items.map((item) =>
      item.itemId === itemId ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const handleDetailsChange = (e, type) => {
    const { name, value } = e.target;
    if (type === "sender") {
      setSenderDetails({ ...senderDetails, [name]: value });
    } else {
      setReceiverDetails({ ...receiverDetails, [name]: value });
    }
  };

  const validateOrder = () => {
    if (
      !senderDetails.name ||
      !senderDetails.phoneNo ||
      !receiverDetails.name ||
      !receiverDetails.phoneNo ||
      !receiverDetails.address
    ) {
      return false;
    }

    if (
      oldItems.length === 0 &&
      (items.length === 0 || items.some((item) => !item.name || !item.quantity))
    ) {
      return false;
    }

    return true;
  };

  const handleAddOrder = async () => {
    if (!validateOrder()) {
      setError(true);
      return;
    }
    const token = localStorage.getItem("token");
    await fetch(`${BASE_URL}/api/parcel/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderDetails: senderDetails,
        receiverDetails: receiverDetails,
        items: items,
        destinationWarehouse: "MNC",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          alert("Error occurred");
        } else {
          alert("Order Added Successfully");
          return response.json();
        }
      })
      .then((data) => {
        navigate(`/user/view/order/${data.body.trackingId}`);
      });
  };

  const renderTextField = ({ label, name, isOptional, isSender, value }) => (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      disabled={edit && !isAdmin}
      name={name}
      value={value}
      onChange={(e) => handleDetailsChange(e, isSender ? "sender" : "receiver")}
      error={
        error &&
        !isOptional &&
        !(isSender ? senderDetails[name] : receiverDetails[name])
      }
      helperText={
        error &&
        !isOptional &&
        !(isSender ? senderDetails[name] : receiverDetails[name])
          ? "This field is required"
          : ""
      }
      sx={{
        "& .MuiInputBase-root": { fontSize: "14px", color: "#1b3655" },
        "& .MuiInputLabel-root": { fontSize: "14px", color: "#7d8695" },
      }}
    />
  );

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
        {edit ? "Edit " : "Add "}
        Order
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        }}
      >
        {renderTextField({
          label: "Sender's Name",
          name: "name",
          isSender: true,
          value: senderDetails.name,
        })}
        {renderTextField({
          label: "Receiver's Name",
          name: "name",
          isSender: false,
          value: receiverDetails.name,
        })}
        {renderTextField({
          label: "Sender's Phone No.",
          name: "phoneNo",
          isSender: true,
          value: senderDetails.phoneNo,
        })}
        {renderTextField({
          label: "Receiver's Phone No.",
          name: "phoneNo",
          isSender: false,
          value: receiverDetails.phoneNo,
        })}
        {renderTextField({
          label: "Sender's Address (Optional)",
          name: "address",
          isSender: true,
          isOptional: true,
          value: senderDetails.address,
        })}
        {renderTextField({
          label: "Receiver's Address",
          name: "address",
          isSender: false,
          value: receiverDetails.address,
        })}

        <TextField
          label="Charges"
          variant="outlined"
          fullWidth
          value={charges}
          onChange={(e) => setCharges(parseInt(e.target.value) || charges)}
          sx={{
            "& .MuiInputBase-root": { fontSize: "14px", color: "#1b3655" },
            "& .MuiInputLabel-root": { fontSize: "14px", color: "#7d8695" },
          }}
        />
        {isAdmin ? (
          <Select
          id="sourceWarehouse-select"
          variant="outlined"
          value={sourceWarehouse}
          onChange={(event) => setSourceWarehouse(event.target.value)}
          fullWidth
          style={{
            textAlign: "left",
            background: "#f9f9f9",
            borderRadius: "8px",
            display: !isAdmin ? "none" : "initial",
          }}
          sx={{
            "& .MuiInputBase-root": { fontSize: "14px", color: "#1b3655" },
            "& .MuiInputLabel-root": { fontSize: "14px", color: "#7d8695" },
          }}
        >
          <MenuItem value={0}>{"BHP"}</MenuItem>
          <MenuItem value={1}>{"Two"}</MenuItem>
          <MenuItem value={2}>{"Three"}</MenuItem>
        </Select>
        ) : null}
        <Select
          id="destWarehouse-select"
          variant="outlined"
          value={destinationWarehouse}
          onChange={(event) => setDestWarehouse(event.target.value)}
          fullWidth
          style={{
            textAlign: "left",
            background: "#f9f9f9",
            borderRadius: "8px",
          }}
          sx={{
            "& .MuiInputBase-root": { fontSize: "14px", color: "#1b3655" },
            "& .MuiInputLabel-root": { fontSize: "14px", color: "#7d8695" },
          }}
        >
          <MenuItem value={0}>{"MNC"}</MenuItem>
          <MenuItem value={1}>{"Two"}</MenuItem>
          <MenuItem value={2}>{"Three"}</MenuItem>
        </Select>
        <Select
          id="warehouse-select"
          variant="outlined"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          fullWidth
          style={{
            textAlign: "left",
            background: "#f9f9f9",
            borderRadius: "8px",
            display: !edit || !isAdmin ? "none" : "",
          }}
          sx={{
            "& .MuiInputBase-root": { fontSize: "14px", color: "#1b3655" },
            "& .MuiInputLabel-root": { fontSize: "14px", color: "#7d8695" },
          }}
        >
          <MenuItem value={0}>{"Arrived"}</MenuItem>
          <MenuItem value={1}>{"Partial"}</MenuItem>
          <MenuItem value={2}>{"Delivered"}</MenuItem>
        </Select>
      </Box>

      {edit ? (
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
            Old Items
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
                {isAdmin ? (
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Status
                  </TableCell>
                ) : null}
                <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {oldItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.itemId}</TableCell>
                  <TableCell>
                    <TextField
                      value={item.name}
                      onChange={(e) =>
                        handleInputChange(item.itemId, "name", e.target.value)
                      }
                      disabled={!isAdmin}
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
                      type="number"
                      disabled={!isAdmin}
                      value={item.quantity}
                      onChange={(e) =>
                        handleInputChange(
                          item.itemId,
                          "quantity",
                          e.target.value
                        )
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
                  {isAdmin ? (
                    <TableCell>
                      <Select
                        id="warehouse-select"
                        variant="outlined"
                        value={item.status}
                        onChange={(event) => setStatus(event.target.value)}
                        fullWidth
                        style={{
                          textAlign: "left",
                          background: "#f9f9f9",
                          borderRadius: "8px",
                        }}
                        sx={{
                          "& .MuiInputBase-root": {
                            fontSize: "14px",
                            color: "#1b3655",
                          },
                          "& .MuiInputLabel-root": {
                            fontSize: "14px",
                            color: "#7d8695",
                          },
                        }}
                      >
                        <MenuItem value={0}>{"Arrived"}</MenuItem>
                        <MenuItem value={1}>{"Partial"}</MenuItem>
                        <MenuItem value={2}>{"Delivered"}</MenuItem>
                      </Select>
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <IconButton
                      color="secondary"
                      onClick={() => handleRemoveRow(item.itemId)}
                    >
                      <FaTrash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : null}

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
                      handleInputChange(item.itemId, "name", e.target.value)
                    }
                    disabled={index < initialitems}
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
                    type="number"
                    disabled={index < initialitems}
                    value={item.quantity}
                    onChange={(e) =>
                      handleInputChange(item.itemId, "quantity", e.target.value)
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
                    onClick={() => handleCopyRow(item.itemId)}
                  >
                    <FaCopy />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleRemoveRow(item.itemId)}
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

      <Box sx={{ textAlign: "center", marginTop: "30px" }}>
        <button className="button button-large" onClick={handleAddOrder}>
          {edit ? "Save " : "Add "}
          Order
        </button>
      </Box>
    </Box>
  );
}
