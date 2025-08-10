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
  FormControlLabel,
  Checkbox,
  createFilterOptions,
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
  const [regClients, setRegClients] = useState([]);
  const [regClientItems, setRegClientItems] = useState([]);
  const [regItems, setregItems] = useState([]);
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [payment, setPayemnt] = useState("To Pay");
  const [isDoorDelivery, setIsDoorDelivery] = useState(false);
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
    fetchWarehouse();
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
    setRegClients(data.body);
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
    fixCharges(id, 0, 0, 0);
    setItems(updatedItems);
    setCounter(updatedItems.length + 1);
  };

  const handleCopyRow = (id) => {
    const itemToCopy = items.find((item) => item.id === id);
    if (itemToCopy) {
      fixCharges(
        id,
        itemToCopy.quantity,
        itemToCopy.freight * 2,
        itemToCopy.hamali * 2
      );
      setItems([...items, { ...itemToCopy, id: counter }]);
      setCounter(counter + 1);
    }
  };

  const fixCharges = (id, quantity_new, freight_new, hamali_new) => {
    let ham = 0,
      frt = 0;
    items
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
      if (!value) {
        value = event?.target.value.toUpperCase();
      }
      value = value.toUpperCase();
      let item = regClientItems.find((item) => item.itemDetails.name === value);
      if (!item) {
        item = regItems.find((item) => item.name === value);
      }
      if (!item) {
        setItems((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.id === id
        ? { ...prevItem, name: value}
              : prevItem
            )
        );
        return;
      }
      item.quantity = 1;
      setItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.id === id ? { ...prevItem, ...item, name: value } : prevItem
        )
      );
      fixCharges(id, item.quantity, item.freight, item.hamali);
      return;
    }

    let idx = items.findIndex((item) => item.id === id);
    let item = items[idx];

    if (field === "quantity" || field === "freight" || field === "hamali") {
      value = parseInt(value) || 0;
      item[field] = value;
      fixCharges(id, item.quantity, item.freight, item.hamali);
    }
    item[field] = value;
    items[idx] = item;
    setItems([...items]);
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
    if (items.length === 0 || items.some((item) => !item.name)) {
      if (items.length === 0) alert("Add items");
      alert("Please fill all the required fields");
      return false;
    }
    return true;
  };

  const handleEmptyDetails = (details) => {
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
          doorDelivery: isDoorDelivery,
          ...(isAdmin ? { sourceWarehouse } : {}),
        }),
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok || !data.flag) {
        alert("Error occurred");
      } else {
        alert("Order Added Successfully");
        navigate(`/user/view/order/${data.body}`);
      }
    } catch (error) {
      alert("Network error occurred");
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
    let client = regClients.find((client) => client.name === selectedOption);
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
    let client = regClients.find((client) => client.name === selectedOption);
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
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        <Autocomplete
          freeSolo
          value={senderDetails.name}
          options={regClients.map((client) => client.name)}
          onChange={(event, newValue) => handleSenderChange(event, newValue)}
          filterOptions={createFilterOptions({
            matchFrom: "start",
          })}
          onBlur={(event, newValue) => handleSenderChange(event, newValue)}
          getOptionLabel={(option) => option || senderDetails.name}
          
          renderInput={(params) => (
            <TextField {...params} label="Sender's Name" error={error && !senderDetails.name}/>
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
          options={regClients.map((client) => client.name)}
          onChange={(event, newValue) => handleReceiverChange(event, newValue)}
          onBlur={(event, newValue) => handleReceiverChange(event, newValue)}
          filterOptions={createFilterOptions({
            matchFrom: "start",
          })}
          getOptionLabel={(option) => option || receiverDetails.name}
          renderInput={(params) => (
            <TextField {...params} label="Receiver's Name" error={error && !receiverDetails.name} />
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
                    options={regItems.map((item) => item.name)}
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
                        handleInputChange(item.id, "type", e.target.value)
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
                      handleInputChange(item.id, "quantity", e.target.value)
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={error && !item.hamali}
                    helperText={error && !item.hamali ? "Required" : ""}
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
