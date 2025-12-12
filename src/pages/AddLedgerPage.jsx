import React, { useState, useEffect, useRef } from "react";
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
  Checkbox,
  Button,
  createFilterOptions,
} from "@mui/material";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import "../css/main.css";
import { getDate } from "../utils/dateFormatter";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AddLedgerPage({}) {
  const [truckNo, setTruckNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [allTruckDetails, setAllTruckDetails] = useState([]);
  const [error, setError] = useState(false);
  const [lorryFreight, setLorryFreight] = useState(0);
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [orders, setOrders] = useState([]);
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [,setRender] = useState(false);
  const forceRender = () => setRender((prev) => !prev);

  const selectedOrders = useRef(new Set());

  const [selectedDate, setSelectedDate] = useState(getDate());
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { dialogState, hideDialog, showAlert, showError, showSuccess } = useDialog();
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
  }, []);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  useEffect(() => {
    setIsAllSelected(false);
  }, [filteredOrders]);

  const fetchTrucks = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/driver/all-truck-no`, {
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
    if (truckNo.trim() === "") {
      showError("Please enter the truck number", "Validation Error");
      return false;
    }
    if (!destinationWarehouse || (!sourceWarehouse)) {
      showError("Please select both source and destination stations", "Validation Error");
      return false;
    }
    if (selectedOrders.current.size === 0) {
      showError("Please select at least one order for the memo", "Validation Error");
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
      const response = await fetch(`${BASE_URL}/api/ledger/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: Array.from(selectedOrders.current),
          destinationWarehouse,
          lorryFreight: lorryFreight,
          vehicleNo: truckNo,
          driverName: driverName,
          driverPhone: driverPhone,
          ...(sourceWarehouse !== 'all' ? {sourceWarehouse} : {}),
        }),
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok || !data.flag) {
        showError("Failed to create memo. Please try again.", "Error");
      } else {
        showSuccess("Memo created successfully!", "Success");
        setTimeout(() => {
          navigate(`/user/view/ledger/${data.body}`);
        }, 1500);
      }
    } catch (error) {
      showError("Network error occurred. Please check your connection.", "Network Error");
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
    let truck = allTruckDetails.find((truck) => truck.vehicleNo === selectedOption);
    if (truck){
      setDriverName(truck.name);
      setDriverPhone(truck.phoneNo);
    }
    setTruckNo(selectedOption);
  };

  const fetchOrders = async (
    date,
    selectedSourceWarehouse,
    selectedDestinationWarehouse
  ) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/parcel/all?src=${selectedSourceWarehouse}&dest=${selectedDestinationWarehouse}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: date,
          }),
        }
      );

      if (!response.ok) {
        showError("Failed to fetch orders. Please try again.", "Error");
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      if (!data.flag) {
        showError("Please login first to continue.", "Authentication Required");
        throw new Error("Please login first");
      }
      // console.log(selectedSourceWarehouse, selectedDestinationWarehouse);
      // console.log(data.body);
      setOrders(data.body);
      setIsLoading(false);
    } catch (error) {
      // Error already shown in the catch blocks above
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    if (nameFilter) {
      let filtered = orders.filter(
        (order) =>
          order.sender.name
            .toLowerCase()
            .startsWith(nameFilter.toLowerCase()) ||
          order.receiver.name
            .toLowerCase()
            .startsWith(nameFilter.toLowerCase()) ||
          order.trackingId.toLowerCase().startsWith(nameFilter.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else setFilteredOrders(orders);
  };

  const clearFilter = () => {
    setNameFilter("");
    setFilteredOrders(orders);
  };

  const handleDateChange = (event) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const newDate = new Date(event.target.value);
    if (newDate <= today) {
      const date = newDate.toISOString().split("T")[0];
      setSelectedDate(date);
      fetchOrders(date, sourceWarehouse, destinationWarehouse);
    }
  };

  const handleWarehouseChange = (value, type) => {
    if (type === "destination") {
      setDestinationWarehouse(value);
      fetchOrders(selectedDate, sourceWarehouse, value);
      return;
    }
    else {
      setSourceWarehouse(value);
      if (destinationWarehouse)
        fetchOrders(selectedDate, value, destinationWarehouse);
    }
  };

  const handleChange = (e, trackingId) => {
    if (e.target.checked) {
      selectedOrders.current.add(trackingId);
    } else {
      selectedOrders.current.delete(trackingId);
    }
    forceRender(); 
  };

  const handleAllSelect = (event) => {  
    if (event.target.checked) {
      filteredOrders.forEach((order) => selectedOrders.current.add(order.trackingId));
    }
    else {
      filteredOrders.forEach(order => selectedOrders.current.delete(order.trackingId));
    }
    setIsAllSelected((prev) => !prev);
  };
  
  const handleRemoveAll = () => {
    selectedOrders.current.clear();
    setIsAllSelected(false);
    forceRender();
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
        Add Memo
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
          value={truckNo}
          options={allTruckDetails.map((truck) => truck.vehicleNo)}
          onChange={(event, newValue) => handleTruckChange(event, newValue)}
          filterOptions={createFilterOptions({
            matchFrom: "start",
          })}
          onBlur={(event, newValue) => handleTruckChange(event, newValue)}
          getOptionLabel={(option) => option || truckNo}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Truck No."
              error={error && !truckNo}
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
          type="text"
          value={driverName}
          onChange={(event) =>
            setDriverName(event.target.value)
          }
        />
        <TextField
          label="Driver Phone"
          type="text"
          value={driverPhone}
          onChange={(event) =>
            setDriverPhone(event.target.value)
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
        <FormControl>
          <InputLabel>Source Station</InputLabel>
          <Select
            label="Source Station"
            value={sourceWarehouse}
            onChange={(e) => handleWarehouseChange(e.target.value, "source")}
            error={error && !sourceWarehouse}
          >
            {allWarehouse
              .filter((w) => w.isSource)
              .map((w) => (
                <MenuItem key={w.warehouseID} value={w.warehouseID}>
                  {w.name}
                </MenuItem>
              ))}
              <MenuItem value="all">All Stations</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Destination Station</InputLabel>
          <Select
            label="Destination Station"
            value={destinationWarehouse}
            onChange={(e) =>
              handleWarehouseChange(e.target.value, "destination")
            }
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
          Orders ({selectedOrders.current.size} selected)
        </Typography>
        {sourceWarehouse &&
          truckNo &&
          destinationWarehouse && (
            <div>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 1.5, md: 1 },
                  marginBottom: "20px",
                  alignItems: { xs: "stretch", md: "center" },
                }}
              >
                <Box className="calendar-input">
                  <input
                    type="date"
                    onClick={(e) => e.target.showPicker()}
                    onKeyDown={(e) => e.preventDefault()}
                    value={selectedDate}
                    onChange={handleDateChange}
                    disabled={isLoading}
                  />
                </Box>
                <TextField
                  label="Search by Ledger-ID / Customer Name"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: { xs: "100%", md: "300px" } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={applyFilter}
                  disabled={isLoading}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={clearFilter}
                  disabled={isLoading}
                >
                  Clear
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleRemoveAll}
                >
                  Remove All items
                </Button>
              </Box>

              <TableContainer
                component={Paper}
                sx={{ 
                  backgroundColor: "#ffffff",
                  overflowX: "auto"
                }}
              >
                <Table sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={cellStyle}>
                        <Checkbox
                          checked={isAllSelected}
                          onChange={handleAllSelect}
                        />
                      </TableCell>
                      <TableCell sx={cellStyle}>LR ID</TableCell>
                      <TableCell sx={cellStyle}>{"Sender's\nName"}</TableCell>
                      <TableCell sx={cellStyle}>{"Receiver's Name"}</TableCell>
                      <TableCell sx={cellStyle}>
                        {"Source" + "\n" + "Station"}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {"Destination" + "\n" + "Station"}
                      </TableCell>
                      <TableCell sx={cellStyle}>View LR</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <CircularProgress
                            size={22}
                            className="spinner"
                            sx={{
                              color: "#1E3A5F",
                              animation: "none !important",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ) : filteredOrders.length > 0 ? (
                      filteredOrders.map((order, idx) => (
                        <TableRow key={order.trackingId}>
                          <TableCell sx={rowCellStyle}>
                            <Checkbox checked={selectedOrders.current.has(order.trackingId)} onChange={(e) => handleChange(e,order.trackingId)}/>
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
                          <TableCell sx={rowCellStyle}>
                            {order.sourceWarehouse.name}
                          </TableCell>
                          <TableCell sx={rowCellStyle}>
                            {order.destinationWarehouse.name}
                          </TableCell>
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
            </div>
          )}
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
          onClick={handleAddLedger}
          disabled={isLoading}
          style={{ 
            width: "100%",
            maxWidth: "300px",
            padding: "12px 24px"
          }}
        >
          Create Memo
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
