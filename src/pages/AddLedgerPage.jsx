import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Box, TextField, Typography, IconButton, Table, TableBody, TableCell, TableHead, TableContainer, Paper, TableRow, MenuItem, Select, FormControl, InputLabel, CircularProgress, Autocomplete, Checkbox, Button, createFilterOptions,
} from "@mui/material";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ListAltIcon from "@mui/icons-material/ListAlt";
import "../css/main.css";
import { getDate } from "../utils/dateFormatter";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";
import CustomDatePicker from "../components/CustomDatePicker";
import { fromDbValue, toDbValue } from "../utils/currencyUtils";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SectionCard = ({ title, icon, children, isDarkMode, colors, accentColor }) => (
  <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "12px", background: isDarkMode ? colors?.bgCard : "#ffffff", border: isDarkMode ? `1px solid ${colors?.border}` : "1px solid #e5e7eb", mb: 2.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, pb: 1.5, borderBottom: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}>
      <Box sx={{ color: accentColor, display: "flex" }}>{icon}</Box>
      <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: colors?.textPrimary }}>{title}</Typography>
    </Box>
    {children}
  </Paper>
);

export default function AddLedgerPage({}) {
  const [truckNo, setTruckNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [allTruckDetails, setAllTruckDetails] = useState([]);
  const [error, setError] = useState(false);
  // Store lorryFreight as display value (decimal string)
  const [lorryFreight, setLorryFreight] = useState("");
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
  const { dialogState, hideDialog, showError, showSuccess } = useDialog();
  const { isDarkMode, colors } = useOutletContext();

  useEffect(() => { fetchTrucks(); fetchWarehouse(); }, []);
  useEffect(() => { setFilteredOrders(orders); }, [orders]);
  useEffect(() => { setIsAllSelected(false); }, [filteredOrders]);

  const fetchTrucks = async () => { const token = localStorage.getItem("token"); const res = await fetch(`${BASE_URL}/api/driver/all-truck-no`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }); const data = await res.json(); setAllTruckDetails(data.body); };
  const fetchWarehouse = async () => { const response = await fetch(`${BASE_URL}/api/warehouse/get-all`); if (response.ok) { const data = await response.json(); setAllWarehouse(data.body); } };

  const validateOrder = () => {
    if (truckNo.trim() === "") { showError("Please enter the truck number", "Validation Error"); return false; }
    if (!destinationWarehouse || !sourceWarehouse) { showError("Please select both source and destination stations", "Validation Error"); return false; }
    if (selectedOrders.current.size === 0) { showError("Please select at least one order for the memo", "Validation Error"); return false; }
    return true;
  };

  const handleAddLedger = async () => {
    if (!validateOrder()) { setError(true); return; }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/ledger/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          ids: Array.from(selectedOrders.current), 
          destinationWarehouse, 
          lorryFreight: parseFloat(lorryFreight) || 0, // Send display value - backend will multiply by 100
          vehicleNo: truckNo.toUpperCase(), 
          driverName: driverName, 
          driverPhone: driverPhone, 
          ...(sourceWarehouse !== 'all' ? {sourceWarehouse} : {}) 
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.flag) { showError("Failed to create memo. Please try again.", "Error"); }
      else { showSuccess("Memo created successfully!", "Success"); setTimeout(() => { navigate(`/user/view/ledger/${data.body}`); }, 1500); }
    } catch (error) { showError("Network error occurred. Please check your connection.", "Network Error"); }
    finally { setIsLoading(false); }
  };

  const handleTruckChange = (event, selectedOption) => {
    if (!selectedOption) return;
    selectedOption = selectedOption.toUpperCase();
    let truck = allTruckDetails.find((truck) => truck.vehicleNo === selectedOption);
    if (truck) { setDriverName(truck.name); setDriverPhone(truck.phoneNo); }
    setTruckNo(selectedOption);
  };

  const fetchOrders = async (date, selectedSourceWarehouse, selectedDestinationWarehouse) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/parcel/all?src=${selectedSourceWarehouse}&dest=${selectedDestinationWarehouse}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ date: date }) });
      if (!response.ok) { showError("Failed to fetch orders. Please try again.", "Error"); throw new Error("Failed to fetch orders"); }
      const data = await response.json();
      if (!data.flag) { showError("Please login first to continue.", "Authentication Required"); throw new Error("Please login first"); }
      setOrders(data.body);
    } catch (error) { /* Error already shown */ }
    finally { setIsLoading(false); }
  };

  const applyFilter = () => { if (nameFilter) { let filtered = orders.filter((order) => order.sender.name.toLowerCase().startsWith(nameFilter.toLowerCase()) || order.receiver.name.toLowerCase().startsWith(nameFilter.toLowerCase()) || order.trackingId.toLowerCase().startsWith(nameFilter.toLowerCase())); setFilteredOrders(filtered); } else setFilteredOrders(orders); };
  const clearFilter = () => { setNameFilter(""); setFilteredOrders(orders); };
  const handleDateChangeNew = (newDate) => { setSelectedDate(newDate); fetchOrders(newDate, sourceWarehouse, destinationWarehouse); };
  const handleWarehouseChange = (value, type) => { if (type === "destination") { setDestinationWarehouse(value); fetchOrders(selectedDate, sourceWarehouse, value); } else { setSourceWarehouse(value); if (destinationWarehouse) fetchOrders(selectedDate, value, destinationWarehouse); } };
  const handleChange = (e, trackingId) => { if (e.target.checked) selectedOrders.current.add(trackingId); else selectedOrders.current.delete(trackingId); forceRender(); };
  const handleAllSelect = (event) => { if (event.target.checked) filteredOrders.forEach((order) => selectedOrders.current.add(order.trackingId)); else filteredOrders.forEach(order => selectedOrders.current.delete(order.trackingId)); setIsAllSelected((prev) => !prev); };
  const handleRemoveAll = () => { selectedOrders.current.clear(); setIsAllSelected(false); forceRender(); };

  const accentColor = isDarkMode ? "#FFB74D" : "#1D3557";
  const autocompleteSlots = { paper: (props) => (<div {...props} style={{ overflowY: "auto", backgroundColor: isDarkMode ? colors?.bgCard : "#f7f9fc", color: colors?.textPrimary || "black", border: isDarkMode ? `1px solid ${colors?.border}` : "1px solid #d1d5db", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} />) };
  const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: isDarkMode ? colors?.bgPrimary : "#f9fafb", "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: accentColor }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accentColor, borderWidth: "2px" } }, "& .MuiInputLabel-root.Mui-focused": { color: accentColor } };

  return (
    <Box sx={{ padding: { xs: "16px", md: "24px" }, margin: "auto", backgroundColor: colors?.bgPrimary || "#f8fafc", color: colors?.textPrimary || "#1b3655", maxWidth: "1200px", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: colors?.textPrimary || "#1c3553", mb: 3, textAlign: "center", fontSize: { xs: "1.5rem", md: "1.75rem" } }}>Create New Memo</Typography>

      <SectionCard title="Vehicle & Route Details" icon={<LocalShippingIcon />} isDarkMode={isDarkMode} colors={colors} accentColor={accentColor}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
          <Autocomplete freeSolo inputValue={truckNo} onInputChange={(event, newValue) => { if (event) setTruckNo(newValue); }} options={allTruckDetails.map((truck) => truck.vehicleNo)} onChange={(event, newValue) => handleTruckChange(event, newValue)} filterOptions={createFilterOptions({ matchFrom: "start" })} getOptionLabel={(option) => option || ""} renderInput={(params) => <TextField {...params} label="Truck No. *" error={error && !truckNo} sx={{ ...textFieldSx, "& input": { textTransform: "uppercase" } }} size="small" />} disableClearable slots={autocompleteSlots} />
          <TextField label="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} sx={textFieldSx} size="small" inputProps={{ tabIndex: 2 }} />
          <TextField label="Driver Phone" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} sx={textFieldSx} size="small" inputProps={{ tabIndex: 3 }} />
          <TextField label="Lorry Freight" type="text" value={lorryFreight} onChange={(e) => setLorryFreight(e.target.value)} sx={textFieldSx} size="small" inputProps={{ tabIndex: 4 }} />
          <FormControl size="small" sx={textFieldSx}>
            <InputLabel>Source Station *</InputLabel>
            <Select label="Source Station *" value={sourceWarehouse} onChange={(e) => handleWarehouseChange(e.target.value, "source")} error={error && !sourceWarehouse} inputProps={{ tabIndex: 5 }}>
              {allWarehouse.filter((w) => w.isSource).map((w) => <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>)}
              <MenuItem value="all">All Stations</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={textFieldSx}>
            <InputLabel>Destination Station *</InputLabel>
            <Select label="Destination Station *" value={destinationWarehouse} onChange={(e) => handleWarehouseChange(e.target.value, "destination")} error={error && !destinationWarehouse} inputProps={{ tabIndex: 6 }}>
              {allWarehouse.filter((w) => !w.isSource).map((w) => <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </SectionCard>

      {sourceWarehouse && truckNo && destinationWarehouse && (
        <SectionCard title={`Select Orders (${selectedOrders.current.size} selected)`} icon={<ListAltIcon />} isDarkMode={isDarkMode} colors={colors} accentColor={accentColor}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mb: 2.5, alignItems: { xs: "stretch", md: "center" }, flexWrap: "wrap" }}>
            <CustomDatePicker
              value={selectedDate}
              onChange={handleDateChangeNew}
              disabled={isLoading}
              isDarkMode={isDarkMode}
              colors={colors}
            />
            <TextField label="Search by LR-ID / Customer Name" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} variant="outlined" size="small" sx={{ ...textFieldSx, minWidth: { xs: "100%", md: "280px" } }} />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={applyFilter} disabled={isLoading} sx={{ background: isDarkMode ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)", color: isDarkMode ? "#1D3557" : "#fff", fontWeight: 600, borderRadius: "8px", textTransform: "none" }}>Apply</Button>
              <Button variant="outlined" onClick={clearFilter} disabled={isLoading} sx={{ borderColor: colors?.textSecondary, color: colors?.textSecondary, borderRadius: "8px", textTransform: "none" }}>Clear</Button>
              <Button variant="outlined" onClick={handleRemoveAll} sx={{ borderColor: "#EF4444", color: "#EF4444", borderRadius: "8px", textTransform: "none", "&:hover": { borderColor: "#DC2626", backgroundColor: "rgba(239,68,68,0.05)" } }}>Remove All</Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ backgroundColor: colors?.bgCard || "#ffffff", borderRadius: "10px", border: isDarkMode ? `1px solid ${colors?.border}` : "1px solid #e5e7eb" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: isDarkMode ? colors?.bgPrimary : "#f8fafc", "& th": { fontWeight: 600, color: colors?.textPrimary, fontSize: "0.85rem", py: 1.5, borderBottom: `1px solid ${isDarkMode ? colors?.border : "#e2e8f0"}`, textAlign: "center" } }}>
                  <TableCell><Checkbox checked={isAllSelected} onChange={handleAllSelect} sx={{ color: isDarkMode ? "#FFB74D" : "#1D3557", "&.Mui-checked": { color: isDarkMode ? "#FFB74D" : "#1D3557" } }} /></TableCell>
                  <TableCell>LR ID</TableCell>
                  <TableCell>Sender</TableCell>
                  <TableCell>Receiver</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={30} sx={{ color: isDarkMode ? "#FFB74D" : "#1D3557" }} /></TableCell></TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.trackingId} sx={{ "&:hover": { backgroundColor: isDarkMode ? "rgba(255,183,77,0.03)" : "#fafafa" } }}>
                      <TableCell sx={{ textAlign: "center" }}><Checkbox checked={selectedOrders.current.has(order.trackingId)} onChange={(e) => handleChange(e, order.trackingId)} sx={{ color: isDarkMode ? "#FFB74D" : "#1D3557", "&.Mui-checked": { color: isDarkMode ? "#FFB74D" : "#1D3557" } }} /></TableCell>
                      <TableCell sx={{ textAlign: "center", color: colors?.textPrimary, fontWeight: 500 }}>{order.trackingId}</TableCell>
                      <TableCell sx={{ textAlign: "center", color: colors?.textSecondary }}>{order.sender.name}</TableCell>
                      <TableCell sx={{ textAlign: "center", color: colors?.textSecondary }}>{order.receiver.name}</TableCell>
                      <TableCell sx={{ textAlign: "center", color: colors?.textSecondary }}>{order.sourceWarehouse.name}</TableCell>
                      <TableCell sx={{ textAlign: "center", color: colors?.textSecondary }}>{order.destinationWarehouse.name}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}><IconButton size="small" target="_blank" href={`/user/view/order/${order.trackingId}`} sx={{ color: isDarkMode ? "#FFB74D" : "#1D3557" }}><IoArrowForwardCircleOutline size={22} /></IconButton></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: colors?.textSecondary }}>No orders found for the selected date.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      )}

      {selectedOrders.current.size > 0 && (
        <SectionCard title="Summary" icon={<ReceiptLongIcon />} isDarkMode={isDarkMode} colors={colors} accentColor={accentColor}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}>
              <Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Selected Orders</Typography>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: colors?.textPrimary }}>{selectedOrders.current.size}</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}>
              <Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Lorry Freight</Typography>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: colors?.textPrimary }}>₹{parseFloat(lorryFreight || 0).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)", border: isDarkMode ? "1px solid rgba(255,183,77,0.3)" : "1px solid rgba(29,53,87,0.2)" }}>
              <Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Vehicle</Typography>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: isDarkMode ? "#FFB74D" : "#1D3557" }}>{truckNo}</Typography>
            </Box>
          </Box>
        </SectionCard>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
        <button className="button button-large" onClick={handleAddLedger} disabled={isLoading} style={{ minWidth: "260px", padding: "14px 32px", fontSize: "1rem", borderRadius: "10px" }}>
          {isLoading ? (<>Creating...<CircularProgress size={20} sx={{ color: "#fff", ml: 1 }} /></>) : "Create Memo"}
        </button>
      </Box>

      <CustomDialog open={dialogState.open} onClose={hideDialog} onConfirm={dialogState.onConfirm} title={dialogState.title} message={dialogState.message} type={dialogState.type} confirmText={dialogState.confirmText} cancelText={dialogState.cancelText} showCancel={dialogState.showCancel} />
    </Box>
  );
}
