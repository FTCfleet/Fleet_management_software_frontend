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
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import {
  FaCopy,
  FaSave,
  FaPlus,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";
import { Delete } from "@mui/icons-material";
import { useAuth } from "../routes/AuthContext";
import "../css/main.css";
import Loading from "../components/Loading";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function EditOrderPage() {
  const { id } = useParams();
  const [oldItems, setOldItems] = useState([]);
  const [delItems, setDelItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [senderDetails, setSenderDetails] = useState({ name: "", phoneNo: "", address: "", role: "sender" });
  const [receiverDetails, setReceiverDetails] = useState({ name: "", phoneNo: "", address: "", role: "receiver" });
  const [charges, setCharges] = useState(0);
  const [freight, setFreight] = useState(0);
  const [hamali, setHamali] = useState(0);
  const [clients, setClients] = useState([]);
  const [regItems, setregItems] = useState([]);
  const [status, setStatus] = useState("");
  const [counter, setCounter] = useState(0);
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [error, setError] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const cellStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowCellStyle = { color: "#25344E" };

  useEffect(() => {
    fetchWarehouse();
    fetchData();
    fetchClients();
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
  }

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) {
      const data = await response.json();
      setAllWarehouse(data.body);
    }
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
  }

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
    setCharges(data.charges || 0);
    setFreight(data.freight || 0);
    setHamali(data.hamali || 0);
    setOldItems(data.items);
    setStatus(data.status);
  };

  const handleSenderChange = (event, selectedOption) => {
    console.log(senderDetails);
    if (selectedOption.name) {
      setSenderDetails({
        ...senderDetails,
        name: selectedOption.name,
        phoneNo: selectedOption.phoneNo,
        address: selectedOption.address,
      });
    } else {
      console.log(event.target.value);
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
      console.log(event.target.value);
      setReceiverDetails({
        ...receiverDetails,
        name: event.target.value,
      });
    }
  };

  const handleDelete = (item) => {
    delItems.push(item._id);
    setDelItems(delItems);
    setOldItems(oldItems.filter((element) => element._id !== item._id));
  };

  const handleAddRow = () => {
    setError(false);
    setCounter(counter + 1);
    setNewItems([...newItems, { itemId: counter + 1, name: "", quantity: 0 }]);
  };

  const handleRemoveRow = (itemId) => {
    setNewItems(newItems.filter((item) => item.itemId !== itemId));
  };

  const handleCopyRow = (itemId) => {
    const itemToCopy = newItems.find((item) => item.itemId === itemId);
    if (itemToCopy) {
      setNewItems([
        ...newItems,
        { ...itemToCopy, itemId: newItems.length + 1 },
      ]);
    }
  };

  const handleInputChange = (itemId, field, value) => {
    console.log(value);
    setNewItems(
      newItems.map((item) =>
        item.itemId === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const validateOrder = () => {
    if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) {
      return false;
    }
    if (newItems.some((item) => !item.name)) {
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
    setIsLoading(true);
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/api/parcel/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderDetails,
        receiverDetails,
        addItems: newItems,
        delItems: delItems,
        charges,
        hamali,
        freight,
        sourceWarehouse,
        destinationWarehouse,
        ...(isAdmin ? { status } : {}),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (!data.flag) {
          setIsLoading(false);
          alert("Error occurred");
        } else {
          setIsLoading(false);
          alert("Order Updated Successfully");
          navigate(`/user/view/order/${id}`);
        }
      });
    setIsLoading(false);
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
        Edit Order
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        {/* Sender Details */}
        <Autocomplete
          freeSolo
          options={clients} // Pass full client objects
          getOptionLabel={(option) => option.name || senderDetails.name} // Display only name
          value={clients.find((client) => client.name === senderDetails.name) || senderDetails.name} // Match full object
          onChange={(event, newValue) => handleSenderChange(event, newValue)} // Pass `newValue` (selectedOption)
          renderInput={(params) => <TextField {...params} label="Sender's Name" />}
          disableClearable // Disables the "x" (clear) button
          slots={{
            paper: (props) => (
              <div
                {...props}
                style={{
                  overflowY: 'auto',
                  backgroundColor: '#f7f9fc',
                  color: 'black',
                  border: "1px solid black"
                }}
              />
            ),
          }}
        />
        <TextField
          label="Sender's Phone No."
          value={senderDetails.phoneNo}
          name="phoneNo"
          onChange={(e) => setSenderDetails({ ...senderDetails, phoneNo: e.target.value })}
        />
        <TextField
          label="Sender's Address"
          value={senderDetails.address}
          name="address"
          onChange={(e) => setSenderDetails({ ...senderDetails, address: e.target.value })}
        />
        <Autocomplete
          freeSolo
          options={clients} // Pass full client objects
          getOptionLabel={(option) => option.name || receiverDetails.name} // Display only name
          value={clients.find((client) => client.name === receiverDetails.name) || receiverDetails.name} // Match full object
          onChange={(event, newValue) => handleReceiverChange(event, newValue)} // Pass `newValue` (selectedOption)
          renderInput={(params) => <TextField {...params} label="Receiver's Name" />}
          disableClearable // Disables the "x" (clear) button
          slots={{
            paper: (props) => (
              <div
                {...props}
                style={{
                  overflowY: 'auto',
                  backgroundColor: '#f7f9fc',
                  color: 'black',
                  border: "1px solid black"
                }}
              />
            ),
          }}
        />
        <TextField
          label="Receiver's Phone No."
          value={receiverDetails.phoneNo}
          name="phoneNo"
          onChange={(e) => setReceiverDetails({ ...receiverDetails, phoneNo: e.target.value })}
        />
        <TextField
          label="Receiver's Address"
          value={receiverDetails.address}
          name="address"
          onChange={(e) => setReceiverDetails({ ...receiverDetails, address: e.target.value })}
        />
        <TextField
          label="Charges"
          type="text"
          value={charges}
          onChange={(e) => setCharges(parseInt(e.target.value) || 0)}
        />

        {/* Warehouse Selection */}
        {isAdmin && (
          <FormControl>
            <InputLabel>Source Warehouse</InputLabel>
            <Select
              label="Source Warehouse"
              value={sourceWarehouse}
              onChange={(e) => setSourceWarehouse(e.target.value)}
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
        {isAdmin ? (
          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem key="arrived" value="arrived">
                Arrived
              </MenuItem>
              <MenuItem key="dispatched" value="dispatched">
                Dispatched
              </MenuItem>
              <MenuItem key="delivered" value="delivered">
                Delivered
              </MenuItem>
            </Select>
          </FormControl>
        ) : null}
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
          Old Items
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                Item No
              </TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                Item Name
              </TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                Quantity
              </TableCell>
              <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {oldItems.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(item)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography
          variant="h6"
          sx={{
            marginTop: "20px",
            marginBottom: "10px",
            textAlign: "center",
            color: "#25344e",
            fontWeight: "bold",
          }}
        >
          Add New Items
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
            {newItems.map((item, idx) => (
              <TableRow key={item.itemId}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <Autocomplete
                    value={item.name} // Set the value to item.name
                    options={regItems.map((item) => item.name)} // Populate options from regItems' names
                    onChange={(event, newValue) => {
                      handleInputChange(item.itemId, "name", newValue); // Directly update item.name on selection
                    }}
                    onInputChange={(event, newValue) => {
                      handleInputChange(item.itemId, "name", newValue); // Directly update item.name on selection
                    }}
                    getOptionLabel={(option) => option || item.name} // Use option as is (name)
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
                    disableClearable // Disable the clear button
                    slots={{
                      paper: (props) => (
                        <div
                          {...props}
                          style={{
                            overflowY: 'auto',
                            backgroundColor: '#f7f9fc',
                            color: 'black',
                            border: "1px solid black"
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
                      handleInputChange(
                        item.itemId,
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
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
        <button className="button button-large" onClick={handleSaveChanges}>
          <FaSave style={{ marginRight: "8px" }} />
          Save Changes
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
              sx={{
                marginBottom: "16px",
                textAlign: "center",
                color: "#ffc107",
              }}
            >
              <FaExclamationTriangle style={{ marginRight: "8px" }} /> Confirm
              Save
            </Typography>
            <Typography
              sx={{
                marginBottom: "16px",
                textAlign: "center",
                color: "#1E3A5F",
              }}
            >
              Are you sure you want to save the changes?
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: "16px" }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCloseSaveModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaSave style={{ marginRight: "8px" }} />}
                onClick={confirmSave}
              >
                Confirm{" "}
                {isLoading && (
                  <CircularProgress
                    size={15}
                    className="spinner"
                    sx={{ color: "#fff", animation: "none !important" }}
                  />
                )}
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}
