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
  FormControlLabel,
  Checkbox,
  createFilterOptions,
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

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function EditOrderPage() {
  const { id } = useParams();
  const [oldItems, setOldItems] = useState([]);
  const [delItems, setDelItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [senderDetails, setSenderDetails] = useState({
    name: "",
    phoneNo: "",
    address: "",
    gst: "",
    role: "sender",
  });
  const [receiverDetails, setReceiverDetails] = useState({
    name: "",
    phoneNo: "",
    address: "",
    gst: "",
    role: "receiver",
  });
  const [freightOld, setFreightOld] = useState(0);
  const [hamaliOld, setHamaliOld] = useState(0);
  const [freight, setFreight] = useState(0);
  const [hamali, setHamali] = useState(0);
  const [isDoorDelivery, setIsDoorDelivery] = useState(false);
  const [payment, setPayemnt] = useState("To Pay");
  const [clients, setClients] = useState([]);
  const [regItems, setRegItems] = useState([]);
  const [regClientItems, setRegClientItems] = useState([]);
  const [status, setStatus] = useState("");
  const [counter, setCounter] = useState(1);
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [doorDeliveryCharge, setDoorDeliveryCharge] = useState(0);
  const [error, setError] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWarehouse();
    fetchData();
    fetchClients();
    fetchItems();
  }, []);

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
    setRegClientItems(data.body);
  };

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
    setRegItems(data.body);
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
    setFreightOld(data.freight || 0);
    setHamaliOld(data.hamali || 0);
    setIsDoorDelivery(data.isDoorDelivery);
    setDoorDeliveryCharge(data.doorDeliveryCharge || 0);
    setPayemnt(data.payment);
    setOldItems(data.items);
    setStatus(data.status);
    setIsPageLoading(false);
  };

  const handleSenderChange = (event, selectedOption) => {
    if (!selectedOption) {
      selectedOption = event.target.value.toUpperCase();
    } else {
      selectedOption = selectedOption.toUpperCase();
    }
    let client = clients.find((client) => client.name === selectedOption);
    if (!client) {
      setSenderDetails({
        ...senderDetails,
        name: selectedOption,
      });
      return;
    }
    setSenderDetails({
      ...senderDetails,
      name: client.name,
      phoneNo: client.phoneNo,
      address: client.address,
      gst: client.gst,
    });
  };

  const handleReceiverChange = (event, selectedOption) => {
    if (!selectedOption) {
      selectedOption = event.target.value.toUpperCase();
    } else {
      selectedOption = selectedOption.toUpperCase();
    }
    let client = clients.find((client) => client.name === selectedOption);
    if (!client) {
      setReceiverDetails({
        ...receiverDetails,
        name: selectedOption,
      });
      return;
    }
    fetchRegClientItems(client._id);
    setReceiverDetails({
      ...receiverDetails,
      name: client.name,
      phoneNo: client.phoneNo,
      address: client.address,
      gst: client.gst,
    });
  };

  const handleDelete = (item) => {
    delItems.push(item._id);
    setFreightOld((prev) => prev - item.quantity * item.freight);
    setHamaliOld((prev) => prev - item.quantity * item.hamali);
    setDelItems(delItems);
    setOldItems(oldItems.filter((element) => element._id !== item._id));
  };

  const handleAddRow = () => {
    setError(false);
    setNewItems([
      ...newItems,
      {
        itemId: counter,
        name: "",
        quantity: 0,
        freight: 0,
        hamali: 0,
        type: "C/B",
      },
    ]);
    setCounter(counter + 1);
  };

  const handleRemoveRow = (itemId) => {
    const updatedItems = newItems
      .filter((item) => item.itemId !== itemId)
      .map((item, index) => ({
        ...item,
        itemId: index + 1,
      }));
    fixCharges(itemId, 0, 0, 0);
    setNewItems(updatedItems);
    setCounter(updatedItems.length + 1);
  };

  const handleCopyRow = (itemId) => {
    const itemToCopy = newItems.find((item) => item.itemId === itemId);
    if (itemToCopy) {
      fixCharges(
        itemId,
        itemToCopy.quantity,
        itemToCopy.freight * 2,
        itemToCopy.hamali * 2
      );
      setNewItems([...newItems, { ...itemToCopy, itemId: counter }]);
      setCounter(counter + 1);
    }
  };

  const fixCharges = (id, quantity_new, freight_new, hamali_new) => {
    let ham = 0,
      frt = 0;
    newItems
      .filter((item) => item.itemId !== id)
      .map((item) => {
        ham += item.quantity * item.hamali;
        frt += item.quantity * item.freight;
      });
    ham += hamali_new * quantity_new;
    frt += freight_new * quantity_new;
    setHamali(ham);
    setFreight(frt);
  };

  const handleInputChange = (id, field, value, event) => {
    if (field === "autoComplete") {
      if (!value) {
        value = event?.target.value.toUpperCase();
      }
      value = value.toUpperCase();
      let item = regClientItems.find((item) => item.itemDetails.name === value);
      if (!item) {
        item = regItems.find((item) => item.name === value);
      }
      if (!item) {
        setNewItems((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.itemId === id ? { ...prevItem, name: value } : prevItem
          )
        );
        return;
      }
      item.quantity = 1;
      setNewItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.itemId === id
            ? { ...prevItem, ...item, name: value }
            : prevItem
        )
      );
      fixCharges(id, item.quantity, item.freight, item.hamali);
      return;
    }

    let idx = newItems.findIndex((item) => item.itemId === id);
    let item = newItems[idx];

    if (field === "quantity" || field === "freight" || field === "hamali") {
      value = parseInt(value) || 0;
      item[field] = value;
      fixCharges(id, item.quantity, item.freight, item.hamali);
    }
    item[field] = value;
    newItems[idx] = item;
    setNewItems([...newItems]);
  };

  const validateOrder = () => {
    if (senderDetails.name === "" || receiverDetails.name === "") {
      alert("Please fill all the required fields");
      return false;
    }
    if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) {
      alert("Please fill all the required fields");
      return false;
    }
    if (newItems.some((item) => !item.name)) {
      alert("Please fill all the required fields");
      return false;
    }
    if (oldItems.length === 0 && newItems.length === 0) {
      alert("Add items");
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

  const handleEmptyDetails = (details) => {
    if (!details.phoneNo || details.phoneNo == "") details.phoneNo = "NA";
    if (!details.address || details.address == "") details.address = "NA";
    if (!details.gst || details.gst == "") details.gst = "NA";
    return details;
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
        senderDetails: handleEmptyDetails(senderDetails),
        receiverDetails: handleEmptyDetails(receiverDetails),
        addItems: newItems,
        delItems: delItems,
        charges: hamali + hamaliOld,
        hamali: hamali + hamaliOld,
        freight: freight + freightOld,
        sourceWarehouse,
        destinationWarehouse,
        isDoorDelivery,
        payment,
        doorDeliveryCharge,
        ...(isAdmin ? { status } : {}),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
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
      {isPageLoading ? (
        <CircularProgress
          size={80}
          className="spinner"
          sx={{ color: "#1d3557", animation: "none !important", ml: 1 }}
        />
      ) : (
        <>
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
              gridTemplateColumns: "repeat(4, 1fr)",
            }}
          >
            {/* Sender Details */}
            <Autocomplete
              freeSolo
              value={senderDetails.name}
              options={clients.map((client) => client.name)}
              onChange={(event, newValue) =>
                handleSenderChange(event, newValue)
              }
              filterOptions={createFilterOptions({
                matchFrom: "start",
              })}
              onBlur={(event, newValue) => handleSenderChange(event, newValue)}
              getOptionLabel={(option) => option || senderDetails.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sender's Name"
                  error={error && !senderDetails.name}
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
            <TextField
              label="Sender's GST"
              value={senderDetails.gst}
              name="gst"
              onChange={(e) =>
                setSenderDetails({ ...senderDetails, gst: e.target.value })
              }
            />
            <Autocomplete
              freeSolo
              value={receiverDetails.name}
              options={clients.map((client) => client.name)}
              onChange={(event, newValue) =>
                handleReceiverChange(event, newValue)
              }
              onBlur={(event, newValue) =>
                handleReceiverChange(event, newValue)
              }
              filterOptions={createFilterOptions({
                matchFrom: "start",
              })}
              getOptionLabel={(option) => option || receiverDetails.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Receiver's Name"
                  error={error && !receiverDetails.name}
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
            <TextField
              label="Receiver's Phone No."
              value={receiverDetails.phoneNo}
              name="phoneNo"
              onChange={(e) =>
                setReceiverDetails({
                  ...receiverDetails,
                  phoneNo: e.target.value,
                })
              }
            />
            <TextField
              label="Receiver's Address"
              value={receiverDetails.address}
              name="address"
              onChange={(e) =>
                setReceiverDetails({
                  ...receiverDetails,
                  address: e.target.value,
                })
              }
            />
            <TextField
              label="Receiver's GST"
              value={receiverDetails.gst}
              name="gst"
              onChange={(e) =>
                setReceiverDetails({ ...receiverDetails, gst: e.target.value })
              }
            />
            <TextField
              label="Freight"
              type="text"
              value={freight + freightOld}
            />
            <TextField label="Hamali" type="text" value={hamali + hamaliOld} />
            <TextField
              label="Statistical Charges"
              type="text"
              value={hamali + hamaliOld}
            />

            {/* Warehouse Selection */}
            {isAdmin && (
              <FormControl>
                <InputLabel>Source Warehouse</InputLabel>
                <Select
                  label="Source Warehouse"
                  value={sourceWarehouse}
                  error={error && !sourceWarehouse}
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
                error={error && !destinationWarehouse}
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
            {isAdmin && (
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
            )}
            <FormControl>
              <InputLabel>Choose</InputLabel>
              <Select
                label="Choose"
                value={payment}
                onChange={(e) => setPayemnt(e.target.value)}
              >
                <MenuItem value="To Pay">To Pay</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDoorDelivery}
                  onChange={(e) => setIsDoorDelivery(e.target.checked)}
                />
              }
              style={{ justifyContent: "center" }}
              label="Door Delivery"
            />
            {isDoorDelivery && (
              <TextField
                label="Door Delivery Charge"
                value={doorDeliveryCharge}
                onChange={(e) =>
                  setDoorDeliveryCharge(parseInt(e.target.value) || 0)
                }
                type="text"
              />
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
              Old Items
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    No.
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Item Name
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Item Type
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Freight
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Hamali
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Statistical Charges
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Amount
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {oldItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.freight}</TableCell>
                    <TableCell>{item.hamali}</TableCell>
                    <TableCell>{item.hamali}</TableCell>
                    <TableCell>
                      {(item.freight + item.hamali * 2) * item.quantity}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(item)}
                      >
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
                    No.
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Item Name
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Item Type
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Freight
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Hamali
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Statistical Charges
                  </TableCell>
                  <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                    Amount
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
                        freeSolo
                        value={item.name.toUpperCase()}
                        options={regItems.map((item) => item.name)}
                        onChange={(event, newValue) => {
                          handleInputChange(
                            item.itemId,
                            "autoComplete",
                            newValue,
                            event
                          );
                        }}
                        filterOptions={createFilterOptions({
                          matchFrom: "start",
                        })}
                        onBlur={(event, newValue) =>
                          handleInputChange(
                            item.itemId,
                            "autoComplete",
                            newValue,
                            event
                          )
                        }
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
                      <FormControl fullWidth>
                        <Select
                          value={item.type}
                          onChange={(e) =>
                            handleInputChange(
                              item.itemId,
                              "type",
                              e.target.value
                            )
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
                      <TextField
                        type="text"
                        value={item.freight}
                        onChange={(e) =>
                          handleInputChange(
                            item.itemId,
                            "freight",
                            parseInt(e.target.value) || 0
                          )
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="text"
                        value={item.hamali}
                        onChange={(e) =>
                          handleInputChange(
                            item.itemId,
                            "hamali",
                            parseInt(e.target.value) || 0
                          )
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="text"
                        value={item.hamali}
                        onChange={(e) =>
                          handleInputChange(
                            item.itemId,
                            "hamali",
                            parseInt(e.target.value) || 0
                          )
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="text"
                        value={(item.freight + item.hamali * 2) * item.quantity}
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ display: "flex", gap: "10px" }}>
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
                  <FaExclamationTriangle style={{ marginRight: "8px" }} />{" "}
                  Confirm Save
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
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "16px",
                  }}
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
                    Confirm
                    {isLoading && (
                      <CircularProgress
                        size={15}
                        className="spinner"
                        sx={{
                          color: "#fff",
                          animation: "none !important",
                          ml: 1,
                        }}
                      />
                    )}
                  </Button>
                </Box>
              </Box>
            </Modal>
          </Box>
        </>
      )}
    </Box>
  );
}
