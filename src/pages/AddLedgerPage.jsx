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
  TableContainer,
  Paper,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Button,
  createFilterOptions,
} from "@mui/material";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import "../css/main.css";
import { useAuth } from "../routes/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AddOrderPage({}) {
  const [truckDetails, setTruckDetails] = useState({
    vehicleNo: "",
    phoneNo: "",
    name: "",
  });
  const [allTruckDetails, setAllTruckDetails] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [error, setError] = useState(false);
  const [lorryFreight, setLorryFreight] = useState(0);
  const [hamali, setHamali] = useState(0);
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [orders, setOrders] = useState([]);
  //   const [regClients, setRegClients] = useState([]);
  //   const [regClientItems, setRegClientItems] = useState([]);
  //   const [regItems, setregItems] = useState([]);
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  //   const [payment, setPayemnt] = useState("To Pay");
  //   const [isDoorDelivery, setIsDoorDelivery] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const cellStyle = {
    color: "#1E3A5F",
    fontWeight: "bold",
    textAlign: "center",
  };
  const rowCellStyle = {
    color: "#25344E",
    textAlign: "center",
    justifyContent: "center",
  };

  useEffect(() => {
    fetchTrucks();
    fetchWarehouse();
    // fetchItems();
  }, []);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const fetchTrucks = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/get-all-drivers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setAllTruckDetails(data.body);
  };

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) {
      const data = await response.json();
      setAllWarehouse(data.body);
    }
  };

  const validateOrder = () => {
    if (
      truckDetails.name === "" ||
      truckDetails.vehicleNo === "" ||
      truckDetails.phoneNo === ""
    ) {
      alert("Please fill all the truck details");
      return false;
    }
    if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) {
      alert("Please fill all the required fields");
      return false;
    }
    if (selectedOrders.length === 0) {
      alert("Add orders to the truck");
      return false;
    }
    return true;
  };

  const handleAddLedger = async () => {
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

  const handleTruckChange = (event, selectedOption) => {
    if (!selectedOption) {
      selectedOption = event.target.value.toUpperCase();
    } else {
      selectedOption = selectedOption.toUpperCase();
    }
    let truck = allTruckDetails.find(
      (truck) => truck.vehicleNo === selectedOption
    );
    if (!truck) {
      setTruckDetails({
        ...truckDetails,
        vehicleNo: selectedOption,
      });
      return;
    }
    setTruckDetails({
      ...truckDetails,
      vehicleNo: selectedOption,
      name: truck.name,
      phoneNo: truck.phoneNo,
    });
  };

  const fetchOrders = async (date) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/parcel/all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: date,
          sourceWarehouse: sourceWarehouse,
          destinationWarehouse: destinationWarehouse,
        }),
      });

      if (!response.ok) {
        alert("Failed to fetch orders");
        throw new Error("Failed to fetch orders");
      }
      
      const data = await response.json();
      if (!data.flag) {
        throw new Error("Please login first");
      }
      setOrders(data.body);
      setIsLoading(false);
    } catch (error) {
      alert("Error fetching orders:", error);
    }
  };

  const applyFilter = () => {
    if (nameFilter) {
      filtered = filteredOrders.filter(
        (order) =>
          order.sender.name.toLowerCase().startsWith(nameFilter.toLowerCase()) ||
          order.receiver.name.toLowerCase().startsWith(nameFilter.toLowerCase()) ||
          order.trackingId.toLowerCase().startsWith(nameFilter.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

  const clearFilter = () => {
    setNameFilter("");
    setFilteredOrders(orders);
  };

  const handleDateChange = (event) => {
    setIsLoading(true);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const newDate = new Date(event.target.value);
    if (newDate <= today) {
      const date = newDate.toISOString().split("T")[0];
      setSelectedDate(date);
      fetchOrders(date);
    }
    // setIsLoading(false);
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
        Add Ledger
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
          value={truckDetails.vehicleNo}
          options={allTruckDetails.map((truck) => truck.vehicleNo)}
          onChange={(event, newValue) => handleTruckChange(event, newValue)}
          filterOptions={createFilterOptions({
            matchFrom: "start",
          })}
          onBlur={(event, newValue) => handleTruckChange(event, newValue)}
          getOptionLabel={(option) => option || truckDetails.vehicleNo}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Truck No."
              error={error && !truckDetails.vehicleNo}
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
          label="Driver Name"
          value={truckDetails.name}
          name="address"
          onChange={(e) =>
            setTruckDetails({ ...truckDetails, address: e.target.value })
          }
        />
        <TextField
          label="Driver's Phone No."
          value={truckDetails.phoneNo}
          name="phoneNo"
          onChange={(e) =>
            setTruckDetails({ ...truckDetails, phoneNo: e.target.value })
          }
        />
        <TextField
          label="Lorry Freight"
          type="text"
          value={lorryFreight}
          onChange={(event) =>
            setLorryFreight(parseInt(event.target.value) || 0)
          }
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
          Orders ({selectedOrders.length} selected)
        </Typography>

          {/* Filters: Date and Search */}
          <Box
            sx={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              alignItems: "center",
            }}
          >
            <Box className="calendar-input">
              <input
                type="date"
                onClick={(e) => e.target.showPicker()}
                onKeyDown={(e) => e.preventDefault()}
                value={selectedDate}
                onChange={handleDateChange}
              />
            </Box>
            {/* <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}> */}
              <TextField
                label="Search by Order-ID / Customer Name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                variant="outlined"
                size="small"
                style={{ minWidth: "300px" }}
              />
              <Button variant="contained" color="primary" onClick={applyFilter}>
                Apply
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={clearFilter}
              >
                Clear
              </Button>
            {/* </Box> */}
          </Box>

          {/* Orders Table */}
          <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={cellStyle}></TableCell>
                  <TableCell sx={cellStyle}>Order ID</TableCell>
                  <TableCell sx={cellStyle}>{"Sender's\nName"}</TableCell>
                  <TableCell sx={cellStyle}>{"Receiver's Name"}</TableCell>
                  {isAdmin ? (
                    <>
                      <TableCell sx={cellStyle}>
                        {"Source" + "\n" + "Warehouse"}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {"Destination" + "\n" + "Warehouse"}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell sx={cellStyle}>
                      {(isSource ? "Destination" : "Source") +
                        "\n" +
                        "Warehouse"}
                    </TableCell>
                  )}
                  <TableCell sx={cellStyle}>View Order</TableCell>
                </TableRow>
              </TableHead>
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
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order, idx) => (
                    <TableRow key={order.trackingId}>
                      <TableCell sx={rowCellStyle}>
                        <Checkbox
                          checked={selectedOrders.includes(order.trackingId)}
                          onChange={() => {
                            if (selectedOrders.includes(order.trackingId)) {
                              setSelectedOrders(
                                selectedOrders.filter(
                                  (id) => id !== order.trackingId
                                )
                              );
                            } else {
                              setSelectedOrders([
                                ...selectedOrders,
                                order.trackingId,
                              ]);
                            }
                          }}>

                          </Checkbox>
                        </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {order.trackingId}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {order.sender.name}
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        {order.receiver.name}
                      </TableCell>

                      {isAdmin ? (
                        <>
                          <TableCell sx={rowCellStyle}>
                            {order.sourceWarehouse.name}
                          </TableCell>
                          <TableCell sx={rowCellStyle}>
                            {order.destinationWarehouse.name}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell sx={rowCellStyle}>
                          {isSource
                            ? order.destinationWarehouse.name
                            : order.sourceWarehouse.name}
                        </TableCell>
                      )}
                      <TableCell sx={rowCellStyle}>
                        <IconButton
                          color="primary"
                          target="_blank"
                          href={`/user/view/order/${order.trackingId}`}
                        >
                          <IoArrowForwardCircleOutline size={24} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ color: "#7D8695" }}
                    >
                      No orders found for the selected date.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

      <Box className="button-wrapper">
        <button
          className="button button-large"
          onClick={handleAddLedger}
          disabled={isLoading}
        >
          Create Ledger
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
