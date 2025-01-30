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
  Modal,
  Button,
} from "@mui/material";
import { FaCopy, FaSave, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../routes/AuthContext";
import "../css/main.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function EditOrderPage() {
  const { id } = useParams();
  const [oldItems, setOldItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [senderDetails, setSenderDetails] = useState({});
  const [receiverDetails, setReceiverDetails] = useState({});
  const [charges, setCharges] = useState(0);
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [error, setError] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const cellStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowCellStyle = { color: "#25344E" };

  useEffect(() => {
    fetchWarehouse();
    fetchData();
  }, []);

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) {
      const data = await response.json();
      setAllWarehouse(data.body);
    }
  };

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
    setSenderDetails(data.sender);
    setReceiverDetails(data.receiver);
    setSourceWarehouse(data.sourceWarehouse.warehouseID);
    setDestinationWarehouse(data.destinationWarehouse.warehouseID);
    setCharges(data.charges);
    setOldItems(data.items);
  };

  const handleOldItemChange = (itemId, field, value) => {
    setOldItems(oldItems.map(item =>
      item.itemId === itemId ? { ...item, [field]: value } : item
    ));
  };


  const handleAddRow = () => {
    setNewItems([...newItems, { itemId: newItems.length + 1, name: "", quantity: "" }]);
  };

  const handleRemoveRow = (itemId) => {
    setNewItems(newItems.filter(item => item.itemId !== itemId));
  };

  const handleCopyRow = (itemId) => {
    const itemToCopy = newItems.find(item => item.itemId === itemId);
    if (itemToCopy) {
      setNewItems([...newItems, { ...itemToCopy, itemId: newItems.length + 1 }]);
    }
  };

  const handleInputChange = (itemId, field, value) => {
    setNewItems(newItems.map(item => (item.itemId === itemId ? { ...item, [field]: value } : item)));
  };

  const handleStatusChange = (itemId, status) => {
    setOldItems(oldItems.map(item => (item.itemId === itemId ? { ...item, status } : item)));
  };

  const validateOrder = () => {
    if (!senderDetails.name || !senderDetails.phoneNo ||
      !receiverDetails.name || !receiverDetails.phoneNo ||
      !receiverDetails.address || !destinationWarehouse || (isAdmin && !sourceWarehouse) || charges === 0) {
      return false;
    }
    if (newItems.some(item => !item.name || !item.quantity)) {
      return false;
    }
    return true;
  };

  const handleOpenSaveModal = () => {
    setSaveModalOpen(true);
  };

  const handleCloseSaveModal = () => {
    setSaveModalOpen(false);
  };

  const confirmSave = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/api/parcel/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderDetails,
        receiverDetails,
        items: [...oldItems, ...newItems],
        charges,
        sourceWarehouse,
        destinationWarehouse,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          alert("Error occurred");
        } else {
          alert("Order Updated Successfully");
          navigate(`/user/view/order/${itemId}`);
        }
      });// Replace with actual save logic
    handleCloseSaveModal();
  };

  const handleSaveChanges = () => {
    if (!validateOrder()) {
      setError(true);
      return;
    }

    handleOpenSaveModal();
  };

  return (
    <Box sx={{ padding: "20px", margin: "auto", backgroundColor: "#ffffff", color: "#1b3655" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", textAlign: "center", color: "#1c3553" }}>
        Edit Order
      </Typography>

      <Box sx={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {/* Sender Details */}
        <TextField
          label="Sender's Name"
          value={senderDetails.name || ""}
          onChange={(e) => setSenderDetails({ ...senderDetails, name: e.target.value })}
          error={error && !senderDetails.name}
          disabled={!isAdmin}
        />
        <TextField
          label="Sender's Phone No."
          value={senderDetails.phoneNo || ""}
          onChange={(e) => setSenderDetails({ ...senderDetails, phoneNo: e.target.value })}
          error={error && !senderDetails.phoneNo}
          disabled={!isAdmin}
        />
        <TextField
          label="Sender's Address (Optional)"
          value={senderDetails.address || ""}
          onChange={(e) => setSenderDetails({ ...senderDetails, address: e.target.value })}
          disabled={!isAdmin}
        />

        {/* Receiver Details */}
        <TextField
          label="Receiver's Name"
          value={receiverDetails.name || ""}
          onChange={(e) => setReceiverDetails({ ...receiverDetails, name: e.target.value })}
          error={error && !receiverDetails.name}
          disabled={!isAdmin}
        />
        <TextField
          label="Receiver's Phone No."
          value={receiverDetails.phoneNo || ""}
          onChange={(e) => setReceiverDetails({ ...receiverDetails, phoneNo: e.target.value })}
          error={error && !receiverDetails.phoneNo}
          disabled={!isAdmin}
        />
        <TextField
          label="Receiver's Address"
          value={receiverDetails.address || ""}
          onChange={(e) => setReceiverDetails({ ...receiverDetails, address: e.target.value })}
          error={error && !receiverDetails.address}
          disabled={!isAdmin}
        />

        <TextField
          label="Charges"
          type="number"
          value={charges}
          onChange={(e) => setCharges(parseInt(e.target.value) || 0)}
          error={error && charges === 0}
        />

        {/* Warehouse Selection */}
        {isAdmin && (
          <FormControl>
            <InputLabel>Source Warehouse</InputLabel>
            <Select
              value={sourceWarehouse}
              onChange={(e) => setSourceWarehouse(e.target.value)}
            >
              {allWarehouse.filter(w => w.isSource).map(w => (
                <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl>
          <InputLabel>Destination Warehouse</InputLabel>
          <Select
            value={destinationWarehouse}
            onChange={(e) => setDestinationWarehouse(e.target.value)}
            disabled={!isAdmin}
          >
            {allWarehouse.filter(w => !w.isSource).map(w => (
              <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ marginTop: "30px" }}>
        <Typography variant="h6" sx={{ marginBottom: "10px", textAlign: "center", color: "#25344e", fontWeight: "bold" }}>
          Old Items
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>Item ID</TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>Item Name</TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>Quantity</TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {oldItems.map((item) => (
              <TableRow key={item.itemId}>
                <TableCell>{item.itemId}</TableCell>
                <TableCell>
                  {isAdmin ? (
                    <TextField
                      value={item.name}
                      onChange={(e) => handleOldItemChange(item.itemId, "name", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ maxWidth: "150px" }}
                    />
                  ) : (
                    item.name
                  )}
                </TableCell>
                <TableCell>
                  {isAdmin ? (
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleOldItemChange(item.itemId, "quantity", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ maxWidth: "80px" }}
                    />
                  ) : (
                    item.quantity
                  )}
                </TableCell>
                <TableCell sx={{ rowCellStyle }}>
                  {isAdmin ? (
                    <FormControl sx={{ minWidth: "130px", maxWidth: "150px" }}>
                      <Select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.itemId, e.target.value)}
                        size="small"
                        displayEmpty
                      >
                        <MenuItem value="arrived">Arrived</MenuItem>
                        <MenuItem value="dispatched">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <span className={`table-status ${item.status}`}>
                      {item.status}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="h6" sx={{ marginTop: "20px", marginBottom: "10px", textAlign: "center", color: "#25344e", fontWeight: "bold" }}>
          Add New Items
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>Sl. No.</TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>Item Name</TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>Quantity</TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {newItems.map((item) => (
              <TableRow key={item.itemId}>
                <TableCell>{item.itemId}</TableCell>
                <TableCell>
                  <TextField
                    value={item.name}
                    onChange={(e) => handleInputChange(item.itemId, "name", e.target.value)}
                    placeholder="Enter Item Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(item.itemId, "quantity", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleCopyRow(item.itemId)}>
                    <FaCopy />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleRemoveRow(item.itemId)}>
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
        <button className="button button-large" onClick={handleSaveChanges}>
          <FaSave style={{ marginRight: "8px" }} />Save Changes
        </button>
        <Modal open={saveModalOpen} onClose={handleCloseSaveModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{ marginBottom: "16px", textAlign: "center", color: "#ffc107" }}
            >
              <FaExclamationTriangle style={{marginRight: "8px"  }} /> Confirm Save
            </Typography>
            <Typography sx={{ marginBottom: "16px", textAlign: "center", color: "#1E3A5F" }}>
              Are you sure you want to save the changes?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <Button variant="outlined" color="primary" onClick={handleCloseSaveModal}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" startIcon={<FaSave style={{ marginRight: "8px" }} />} onClick={confirmSave}>
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}
