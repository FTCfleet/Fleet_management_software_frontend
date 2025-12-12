import React, { useState, useEffect, useMemo } from "react";
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
  FormControlLabel,
  Checkbox,
  createFilterOptions,
} from "@mui/material";
import { FaCopy, FaTrash, FaPlus } from "react-icons/fa";
import "../css/main.css";
import { useAuth } from "../routes/AuthContext";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AddOrderPage({}) {
  const [items, setItems] = useState([]);
  const [counter, setCounter] = useState(1);
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
  const [error, setError] = useState(false);
  const [freight, setFreight] = useState(0);
  const [hamali, setHamali] = useState(0);
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [regClients, setRegClients] = useState([]);
  const [regItems, setregItems] = useState([]);
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [payment, setPayemnt] = useState("To Pay");
  const [isDoorDelivery, setIsDoorDelivery] = useState(false);
  const [doorDeliveryCharge, setDoorDeliveryCharge] = useState(0);
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { dialogState, hideDialog, showAlert, showError, showSuccess } = useDialog();

  const normalizeName = (value = "") =>
    value ? value.toString().toUpperCase() : "";

  const itemNameOptions = useMemo(() => {
    const names = new Set();
    regItems.forEach((item) => {
      const name = normalizeName(item.name);
      if (name) names.add(name);
    });
    return Array.from(names);
  }, [regItems]);

  const findRegItem = (name, type) => {
    const normalizedName = normalizeName(name);
    const normalizedType = type ? type.toString() : "";
    return regItems.find(
      (item) =>
        normalizeName(item.name) === normalizedName &&
        item.itemType?.name === normalizedType
    );
  };

  useEffect(() => {
    fetchClients();
    fetchWarehouse();
    fetchItems();
    fetchItemTypes();
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
  };

  const fetchClients = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/regular-clients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setRegClients(data.body);
  };

  const fetchItems = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/regular-items`, {
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

  const fetchItemTypes = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/item-type`,{
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setItemTypes(data.body);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        id: counter,
        name: "",
        quantity: 0,
        freight: 0,
        hamali: 0,
        type: "C/B",
      },
    ]);
    setCounter(counter + 1);
  };

  const handleRemoveRow = (id) => {
    const updatedItems = items
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        id: index + 1,
      }));
    fixCharges(id, 0, 0, 0, updatedItems);
    setItems(updatedItems);
    setCounter(updatedItems.length + 1);
  };

  const handleCopyRow = (id) => {
    const itemToCopy = items.find((item) => item.id === id);
    if (itemToCopy) {
      const copiedItem = { ...itemToCopy, id: counter };
      const updatedItems = [...items, copiedItem];
      fixCharges(
        copiedItem.id,
        copiedItem.quantity,
        copiedItem.freight,
        copiedItem.hamali,
        updatedItems
      );
      setItems(updatedItems);
      setCounter(counter + 1);
    }
  };

  const fixCharges = (
    id,
    quantity_new,
    freight_new,
    hamali_new,
    itemsList = items
  ) => {
    let ham = 0,
      frt = 0;
    itemsList
      .filter((item) => item.id !== id)
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
      const normalizedValue = normalizeName(value || event?.target.value);
      setItems((prevItems) => {
        let updatedItemForCharges = null;
        const updatedItems = prevItems.map((prevItem) => {
          if (prevItem.id !== id) return prevItem;
          const matchedItem = findRegItem(normalizedValue, prevItem.type);
          updatedItemForCharges = {
            ...prevItem,
            name: normalizedValue,
            freight: matchedItem ? matchedItem.freight || 0 : 0,
            hamali: matchedItem ? matchedItem.hamali || 0 : 0,
            quantity: prevItem.quantity || 1,
          };
          return updatedItemForCharges;
        });
        if (updatedItemForCharges) {
          fixCharges(
            id,
            updatedItemForCharges.quantity,
            updatedItemForCharges.freight,
            updatedItemForCharges.hamali,
            updatedItems
          );
        }
        return updatedItems;
      });
      return;
    }

    if (field === "type") {
      setItems((prevItems) => {
        let updatedItemForCharges = null;
        const updatedItems = prevItems.map((prevItem) => {
          if (prevItem.id !== id) return prevItem;
          const matchedItem = findRegItem(prevItem.name, value);
          updatedItemForCharges = {
            ...prevItem,
            type: value,
            freight: matchedItem ? matchedItem.freight || 0 : 0,
            hamali: matchedItem ? matchedItem.hamali || 0 : 0,
            quantity: prevItem.quantity || 1,
          };
          return updatedItemForCharges;
        });
        if (updatedItemForCharges) {
          fixCharges(
            id,
            updatedItemForCharges.quantity,
            updatedItemForCharges.freight,
            updatedItemForCharges.hamali,
            updatedItems
          );
        }
        return updatedItems;
      });
      return;
    }

    if (field === "quantity" || field === "freight" || field === "hamali") {
      value = parseInt(value) || 0;
    }
    setItems((prevItems) => {
      const updatedItems = prevItems.map((prevItem) =>
        prevItem.id === id ? { ...prevItem, [field]: value } : prevItem
      );
      if (field === "quantity" || field === "freight" || field === "hamali") {
        const updatedItem = updatedItems.find((itm) => itm.id === id);
        if (updatedItem) {
          fixCharges(
            id,
            updatedItem.quantity,
            updatedItem.freight,
            updatedItem.hamali,
            updatedItems
          );
        }
      }
      return updatedItems;
    });
  };

  const validateOrder = () => {
    if (receiverDetails.name === "") {
      showError("Please fill all the receiver details", "Validation Error");
      return false;
    }
    if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) {
      showError("Please fill all the stations", "Validation Error");
      return false;
    }
    if (items.length === 0 || items.some((item) => !item.name)) {
      if (items.length === 0) {
        showError("Please add items to the order", "Validation Error");
      } else {
        showError("Please fill all item details", "Validation Error");
      }
      return false;
    }
    return true;
  };

  const handleEmptyDetails = (details) => {
    if (!details.name || details.name == "") details.name = "NA";
    if (!details.phoneNo || details.phoneNo == "") details.phoneNo = "NA";
    if (!details.address || details.address == "") details.address = "NA";
    if (!details.gst || details.gst == "") details.gst = "NA";
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
          charges: hamali,
          hamali,
          freight,
          payment,
          isDoorDelivery,
          doorDeliveryCharge,
          ...(isAdmin ? { sourceWarehouse } : {}),
        }),
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok || !data.flag) {
        showError("Failed to create LR. Please try again.", "Error");
      } else {
        showSuccess("LR Created Successfully!", "Success");
        setTimeout(() => {
          navigate(`/user/view/order/${data.body}`, {
            state: {print: true},
          });
        }, 1500);
      }
    } catch (error) {
      showError("Network error occurred. Please check your connection.", "Network Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSenderChange = (event, selectedOption) => {
    if (!selectedOption) {
      selectedOption = event.target.value.toUpperCase();
    } else {
      selectedOption = selectedOption.toUpperCase();
    }
    let client = regClients.find((client) => client.name === selectedOption && client.isSender);
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
    let client = regClients.find((client) => client.name === selectedOption && !client.isSender);
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

  return (
    <Box
      sx={{
        padding: { xs: "16px", md: "20px" },
        margin: "auto",
        backgroundColor: "#ffffff",
        color: "#1b3655",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Typography
        variant="h4"
        sx={{ marginBottom: "20px", textAlign: "center", color: "#1c3553" }}
      >
        Create L.R.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, md: 1.5 },
          gridTemplateColumns: { 
            xs: "1fr", 
            sm: "1fr 1fr", 
            md: "repeat(3, 1fr)", 
            lg: "repeat(4, 1fr)" 
          },
          mb: 3,
        }}
      >
        <Autocomplete
          freeSolo
          value={senderDetails.name}
          options={regClients.filter(client => client.isSender).map((client) => client.name)}
          onChange={(event, newValue) => handleSenderChange(event, newValue)}
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
          options={regClients.filter(client => !client.isSender).map((client) => client.name)}
          onChange={(event, newValue) => handleReceiverChange(event, newValue)}
          onBlur={(event, newValue) => handleReceiverChange(event, newValue)}
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
          label="Receiver's GST"
          value={receiverDetails.gst}
          name="gst"
          onChange={(e) =>
            setReceiverDetails({ ...receiverDetails, gst: e.target.value })
          }
        />
        <TextField label="Freight" type="text" value={freight} />
        <TextField label="Hamali" type="text" value={hamali} />
        <TextField label="Statistical Charges" type="text" value={hamali} />
        {isAdmin && (
          <FormControl>
            <InputLabel>Source Station</InputLabel>
            <Select
              label="Source Station"
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
          <InputLabel>Destination Station</InputLabel>
          <Select
            label="Destination Station"
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
          Items
        </Typography>
        <Box sx={{ overflowX: "auto", mb: 2 }}>
        <Table sx={{ minWidth: 800 }}>
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
                Amount
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
                    freeSolo
                    value={item.name}
                    options={itemNameOptions}
                    onChange={(event, newValue) => {
                      handleInputChange(
                        item.id,
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
                        item.id,
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
                        // helperText={error && !item.name ? "Required" : ""}
                        sx={{
                          "& .MuiInputBase-root": {
                            fontSize: "14px",
                            color: "#1b3655",
                          },
                          minWidth: { xs: "150px", md: "180px" },
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
                        handleInputChange(item.id, "type", e.target.value)
                      }
                      size="small"
                      MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200
                        },
                      },
                    }}
                    >
                      {itemTypes.map((type) => (
                        <MenuItem key={type._id} value={type.name}>{type.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                    error={error && !item.hamali}
                    // helperText={error && !item.hamali ? "Required" : ""}
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
                    value={item.freight}
                    onChange={(e) =>
                      handleInputChange(item.id, "freight", e.target.value)
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
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
                    value={item.hamali}
                    onChange={(e) =>
                      handleInputChange(item.id, "hamali", e.target.value)
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
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
                    value={(2 * item.hamali + item.freight) * item.quantity}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: "14px",
                        color: "#1b3655",
                      },
                    }}
                  />
                </TableCell>
                <TableCell style={{ alignContent: "center", display: "flex" }}>
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
        </Box>
        <Box sx={{ textAlign: "right", marginTop: "10px" }}>
          <button className="button" onClick={handleAddRow}>
            <FaPlus style={{ marginRight: "8px" }} /> Add Item
          </button>
        </Box>
      </Box>

      <Box 
        className="button-wrapper"
        sx={{ 
          mt: 3,
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, md: 0 }
        }}
      >
        <button
          className="button button-large"
          onClick={handleAddOrder}
          disabled={isLoading}
          style={{ 
            width: "100%",
            maxWidth: "300px",
            padding: "12px 24px"
          }}
        >
          Save & Print
          {isLoading && (
            <CircularProgress
              size={22}
              className="spinner"
              sx={{ color: "#fff", animation: "none !important" }}
            />
          )}
        </button>
      </Box>
      
      <CustomDialog
        open={dialogState.open}
        onClose={hideDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
      />
    </Box>
  );
}
