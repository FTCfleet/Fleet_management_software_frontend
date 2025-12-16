import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
  Box, TextField, Typography, IconButton, Table, TableBody, TableCell, TableHead, TableRow, MenuItem, Select, FormControl, InputLabel, Modal, Button, CircularProgress, Autocomplete, FormControlLabel, Checkbox, createFilterOptions, Paper,
} from "@mui/material";
import { FaCopy, FaSave, FaPlus, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { Delete } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InventoryIcon from "@mui/icons-material/Inventory";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../routes/AuthContext";
import "../css/main.css";

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

export default function EditOrderPage() {
  const { id } = useParams();
  const [oldItems, setOldItems] = useState([]);
  const [delItems, setDelItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [senderDetails, setSenderDetails] = useState({ name: "", phoneNo: "", address: "", gst: "", role: "sender" });
  const [receiverDetails, setReceiverDetails] = useState({ name: "", phoneNo: "", address: "", gst: "", role: "receiver" });
  const [freightOld, setFreightOld] = useState(0);
  const [hamaliOld, setHamaliOld] = useState(0);
  const [freight, setFreight] = useState(0);
  const [hamali, setHamali] = useState(0);
  const [isDoorDelivery, setIsDoorDelivery] = useState(false);
  const [payment, setPayemnt] = useState("To Pay");
  const [clients, setClients] = useState([]);
  const [regItems, setRegItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
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
  const { isDarkMode, colors } = useOutletContext();

  const normalizeName = (value = "") => value ? value.toString().toUpperCase() : "";
  const itemNameOptions = useMemo(() => { const names = new Set(); regItems.forEach((item) => { const name = normalizeName(item.name); if (name) names.add(name); }); return Array.from(names); }, [regItems]);
  const findRegItem = (name, type) => { const normalizedName = normalizeName(name); const normalizedType = type ? type.toString() : ""; return regItems.find((item) => normalizeName(item.name) === normalizedName && item.itemType?.name === normalizedType); };

  useEffect(() => { fetchWarehouse(); fetchData(); fetchClients(); fetchItems(); fetchItemTypes(); }, []);

  const fetchRegClientItems = async (clientId) => { const token = localStorage.getItem("token"); await fetch(`${BASE_URL}/api/admin/regular-client-items/${clientId}`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }); };
  const fetchClients = async () => { const token = localStorage.getItem("token"); const res = await fetch(`${BASE_URL}/api/admin/regular-clients`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }); const data = await res.json(); setClients(data.body); };
  const fetchWarehouse = async () => { const response = await fetch(`${BASE_URL}/api/warehouse/get-all`); if (response.ok) { const data = await response.json(); setAllWarehouse(data.body); } };
  const fetchItems = async () => { const token = localStorage.getItem("token"); const res = await fetch(`${BASE_URL}/api/admin/regular-items`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }); const data = await res.json(); setRegItems(data.body); };
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/parcel/track/${id}`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
    if (!response.ok) { alert("Error occurred"); return; }
    if (response.status === 201) { alert("No such LR"); return; }
    const data = (await response.json()).body;
    setSenderDetails(data.sender); setReceiverDetails(data.receiver); setSourceWarehouse(data.sourceWarehouse.warehouseID); setDestinationWarehouse(data.destinationWarehouse.warehouseID);
    setFreightOld(data.freight || 0); setHamaliOld(data.hamali || 0); setIsDoorDelivery(data.isDoorDelivery); setDoorDeliveryCharge(data.doorDeliveryCharge || 0); setPayemnt(data.payment); setOldItems(data.items); setStatus(data.status); setIsPageLoading(false);
  };
  const fetchItemTypes = async () => { const token = localStorage.getItem("token"); const res = await fetch(`${BASE_URL}/api/admin/manage/item-type`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }); const data = await res.json(); setItemTypes(data.body); };

  const handleSenderChange = (event, selectedOption) => { if (!selectedOption) return; selectedOption = selectedOption.toUpperCase(); let client = clients.find((client) => client.name === selectedOption && client.isSender); if (!client) { setSenderDetails({ ...senderDetails, name: selectedOption }); return; } setSenderDetails({ ...senderDetails, name: client.name, phoneNo: client.phoneNo, address: client.address, gst: client.gst }); };
  const handleReceiverChange = (event, selectedOption) => { if (!selectedOption) return; selectedOption = selectedOption.toUpperCase(); let client = clients.find((client) => client.name === selectedOption && !client.isSender); if (!client) { setReceiverDetails({ ...receiverDetails, name: selectedOption }); return; } fetchRegClientItems(client._id); setReceiverDetails({ ...receiverDetails, name: client.name, phoneNo: client.phoneNo, address: client.address, gst: client.gst }); };
  const handleDelete = (item) => { delItems.push(item._id); setFreightOld((prev) => prev - item.quantity * item.freight); setHamaliOld((prev) => prev - item.quantity * item.hamali); setDelItems(delItems); setOldItems(oldItems.filter((element) => element._id !== item._id)); };
  const handleAddRow = () => { setError(false); setNewItems([...newItems, { itemId: counter, name: "", quantity: 0, freight: 0, hamali: 0, type: "C/B" }]); setCounter(counter + 1); };
  const handleRemoveRow = (itemId) => { const updatedItems = newItems.filter((item) => item.itemId !== itemId).map((item, index) => ({ ...item, itemId: index + 1 })); fixCharges(itemId, 0, 0, 0, updatedItems); setNewItems(updatedItems); setCounter(updatedItems.length + 1); };
  const handleCopyRow = (itemId) => { const itemToCopy = newItems.find((item) => item.itemId === itemId); if (itemToCopy) { const copiedItem = { ...itemToCopy, itemId: counter }; const updatedItems = [...newItems, copiedItem]; fixCharges(copiedItem.itemId, copiedItem.quantity, copiedItem.freight, copiedItem.hamali, updatedItems); setNewItems(updatedItems); setCounter(counter + 1); } };
  const fixCharges = (id, quantity_new, freight_new, hamali_new, itemsList = newItems) => { let ham = 0, frt = 0; itemsList.filter((item) => item.itemId !== id).forEach((item) => { ham += item.quantity * item.hamali; frt += item.quantity * item.freight; }); ham += hamali_new * quantity_new; frt += freight_new * quantity_new; setHamali(ham); setFreight(frt); };

  const handleInputChange = (id, field, value, event) => {
    if (field === "autoComplete") { const normalizedValue = normalizeName(value || event?.target.value); setNewItems((prevItems) => { let updatedItemForCharges = null; const updatedItems = prevItems.map((prevItem) => { if (prevItem.itemId !== id) return prevItem; const matchedItem = findRegItem(normalizedValue, prevItem.type); updatedItemForCharges = { ...prevItem, name: normalizedValue, freight: matchedItem ? matchedItem.freight || 0 : 0, hamali: matchedItem ? matchedItem.hamali || 0 : 0, quantity: prevItem.quantity || 1 }; return updatedItemForCharges; }); if (updatedItemForCharges) fixCharges(id, updatedItemForCharges.quantity, updatedItemForCharges.freight, updatedItemForCharges.hamali, updatedItems); return updatedItems; }); return; }
    if (field === "type") { setNewItems((prevItems) => { let updatedItemForCharges = null; const updatedItems = prevItems.map((prevItem) => { if (prevItem.itemId !== id) return prevItem; const matchedItem = findRegItem(prevItem.name, value); updatedItemForCharges = { ...prevItem, type: value, freight: matchedItem ? matchedItem.freight || 0 : 0, hamali: matchedItem ? matchedItem.hamali || 0 : 0, quantity: prevItem.quantity || 1 }; return updatedItemForCharges; }); if (updatedItemForCharges) fixCharges(id, updatedItemForCharges.quantity, updatedItemForCharges.freight, updatedItemForCharges.hamali, updatedItems); return updatedItems; }); return; }
    if (field === "quantity" || field === "freight" || field === "hamali") value = parseInt(value) || 0;
    setNewItems((prevItems) => { const updatedItems = prevItems.map((prevItem) => prevItem.itemId === id ? { ...prevItem, [field]: value } : prevItem); if (field === "quantity" || field === "freight" || field === "hamali") { const updatedItem = updatedItems.find((itm) => itm.itemId === id); if (updatedItem) fixCharges(id, updatedItem.quantity, updatedItem.freight, updatedItem.hamali, updatedItems); } return updatedItems; });
  };

  const validateOrder = () => { if (senderDetails.name === "" || receiverDetails.name === "") { alert("Please fill all the required fields"); return false; } if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) { alert("Please fill all the required fields"); return false; } if (newItems.some((item) => !item.name)) { alert("Please fill all the required fields"); return false; } if (oldItems.length === 0 && newItems.length === 0) { alert("Add items"); return false; } return true; };
  const handleOpenSaveModal = () => setSaveModalOpen(true);
  const handleCloseSaveModal = () => setSaveModalOpen(false);
  const handleEmptyDetails = (details) => { if (details.name) details.name = details.name.toUpperCase(); if (!details.phoneNo || details.phoneNo == "") details.phoneNo = "NA"; if (!details.address || details.address == "") details.address = "NA"; if (!details.gst || details.gst == "") details.gst = "NA"; return details; };
  const confirmSave = async () => { setIsLoading(true); const token = localStorage.getItem("token"); await fetch(`${BASE_URL}/api/parcel/edit/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ senderDetails: handleEmptyDetails(senderDetails), receiverDetails: handleEmptyDetails(receiverDetails), addItems: newItems, delItems: delItems, charges: hamali + hamaliOld, hamali: hamali + hamaliOld, freight: freight + freightOld, sourceWarehouse, destinationWarehouse, isDoorDelivery, payment, doorDeliveryCharge, ...(isAdmin ? { status } : {}) }) }).then((response) => response.json()).then((data) => { if (!data.flag) { setIsLoading(false); alert("Error occurred"); } else { setIsLoading(false); alert("LR Updated Successfully"); navigate(`/user/view/order/${id}`); } }); setIsLoading(false); handleCloseSaveModal(); };
  const handleSaveChanges = () => { if (!validateOrder()) { setError(true); return; } handleOpenSaveModal(); };

  const accentColor = isDarkMode ? "#FFB74D" : "#1D3557";
  const autocompleteSlots = { paper: (props) => (<div {...props} style={{ overflowY: "auto", backgroundColor: isDarkMode ? colors?.bgCard : "#f7f9fc", color: colors?.textPrimary || "black", border: isDarkMode ? `1px solid ${colors?.border}` : "1px solid #d1d5db", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} />) };
  const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: isDarkMode ? colors?.bgPrimary : "#f9fafb", "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: accentColor }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accentColor, borderWidth: "2px" } }, "& .MuiInputLabel-root.Mui-focused": { color: accentColor } };

  if (isPageLoading) return (<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><CircularProgress size={60} sx={{ color: isDarkMode ? "#FFB74D" : "#1D3557" }} /><Typography sx={{ color: colors?.textPrimary, fontSize: "1.1rem", mt: 2 }}>Loading...</Typography></Box>);

  return (
    <Box sx={{ padding: { xs: "16px", md: "24px" }, margin: "auto", backgroundColor: colors?.bgPrimary || "#f8fafc", color: colors?.textPrimary || "#1b3655", maxWidth: "1200px", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 3 }}>
        <EditIcon sx={{ fontSize: "1.75rem", color: isDarkMode ? "#FFB74D" : "#1D3557" }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors?.textPrimary, fontSize: { xs: "1.5rem", md: "1.75rem" } }}>Edit L.R.</Typography>
        <Typography sx={{ color: colors?.textSecondary, fontSize: "0.9rem", ml: 1 }}>({id})</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>
        <SectionCard title="Sender Details" icon={<PersonIcon />} isDarkMode={isDarkMode} colors={colors} accentColor={accentColor}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Autocomplete freeSolo inputValue={senderDetails.name} onInputChange={(event, newValue) => { if (event) setSenderDetails({ ...senderDetails, name: newValue }); }} options={clients.filter(client => client.isSender).map((client) => client.name)} onChange={(event, newValue) => handleSenderChange(event, newValue)} filterOptions={createFilterOptions({ matchFrom: "start" })} getOptionLabel={(option) => option || ""} renderInput={(params) => <TextField {...params} label="Name *" error={error && !senderDetails.name} sx={{ ...textFieldSx, "& input": { textTransform: "uppercase" } }} size="small" />} disableClearable slots={autocompleteSlots} />
            <TextField label="Phone No." value={senderDetails.phoneNo} onChange={(e) => setSenderDetails({ ...senderDetails, phoneNo: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 2 }} />
            <TextField label="Address" value={senderDetails.address} onChange={(e) => setSenderDetails({ ...senderDetails, address: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 3 }} />
            <TextField label="GST No." value={senderDetails.gst} onChange={(e) => setSenderDetails({ ...senderDetails, gst: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 4 }} />
          </Box>
        </SectionCard>
        <SectionCard title="Receiver Details" icon={<PersonIcon />} isDarkMode={isDarkMode} colors={colors} accentColor={accentColor}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Autocomplete freeSolo inputValue={receiverDetails.name} onInputChange={(event, newValue) => { if (event) setReceiverDetails({ ...receiverDetails, name: newValue }); }} options={clients.filter(client => !client.isSender).map((client) => client.name)} onChange={(event, newValue) => handleReceiverChange(event, newValue)} filterOptions={createFilterOptions({ matchFrom: "start" })} getOptionLabel={(option) => option || ""} renderInput={(params) => <TextField {...params} label="Name *" error={error && !receiverDetails.name} sx={{ ...textFieldSx, "& input": { textTransform: "uppercase" } }} size="small" />} disableClearable slots={autocompleteSlots} />
            <TextField label="Phone No." value={receiverDetails.phoneNo} onChange={(e) => setReceiverDetails({ ...receiverDetails, phoneNo: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 6 }} />
            <TextField label="Address" value={receiverDetails.address} onChange={(e) => setReceiverDetails({ ...receiverDetails, address: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 7 }} />
            <TextField label="GST No." value={receiverDetails.gst} onChange={(e) => setReceiverDetails({ ...receiverDetails, gst: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 8 }} />
          </Box>
        </SectionCard>
      </Box>

      <SectionCard title="Shipment Details" icon={<LocalShippingIcon />} isDarkMode={isDarkMode} colors={colors} accentColor={accentColor}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          {isAdmin && <FormControl size="small" sx={textFieldSx}><InputLabel>Source Station *</InputLabel><Select label="Source Station *" value={sourceWarehouse} onChange={(e) => setSourceWarehouse(e.target.value)} error={error && !sourceWarehouse} inputProps={{ tabIndex: 9 }}>{allWarehouse.filter((w) => w.isSource).map((w) => <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>)}</Select></FormControl>}
          <FormControl size="small" sx={textFieldSx}><InputLabel>Destination Station *</InputLabel><Select label="Destination Station *" value={destinationWarehouse} onChange={(e) => setDestinationWarehouse(e.target.value)} error={error && !destinationWarehouse} inputProps={{ tabIndex: isAdmin ? 10 : 9 }}>{allWarehouse.filter((w) => !w.isSource).map((w) => <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>)}</Select></FormControl>
          {isAdmin && <FormControl size="small" sx={textFieldSx}><InputLabel>Status</InputLabel><Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} inputProps={{ tabIndex: 11 }}><MenuItem value="arrived">Arrived</MenuItem><MenuItem value="dispatched">Dispatched</MenuItem><MenuItem value="delivered">Delivered</MenuItem></Select></FormControl>}
          <FormControl size="small" sx={textFieldSx}><InputLabel>Payment Type</InputLabel><Select label="Payment Type" value={payment} onChange={(e) => setPayemnt(e.target.value)} inputProps={{ tabIndex: isAdmin ? 12 : 10 }}><MenuItem value="To Pay">To Pay</MenuItem><MenuItem value="Paid">Paid</MenuItem></Select></FormControl>
          <FormControlLabel control={<Checkbox checked={isDoorDelivery} onChange={(e) => setIsDoorDelivery(e.target.checked)} sx={{ color: isDarkMode ? "#FFB74D" : "#1D3557", "&.Mui-checked": { color: isDarkMode ? "#FFB74D" : "#1D3557" } }} />} label="Door Delivery" />
          {isDoorDelivery && <TextField label="Delivery Charge" value={doorDeliveryCharge} onChange={(e) => setDoorDeliveryCharge(parseInt(e.target.value) || 0)} type="text" sx={textFieldSx} size="small" />}
        </Box>
      </SectionCard>

      <SectionCard title="Existing Items" icon={<InventoryIcon />} isDarkMode={isDarkMode} colors={colors} accentColor={accentColor}>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead><TableRow sx={{ backgroundColor: isDarkMode ? colors?.bgPrimary : "#f8fafc", "& th": { fontWeight: 600, color: colors?.textPrimary, fontSize: "0.85rem", py: 1.5, borderBottom: `1px solid ${isDarkMode ? colors?.border : "#e2e8f0"}` } }}><TableCell>#</TableCell><TableCell>Item Name</TableCell><TableCell>Type</TableCell><TableCell>Qty</TableCell><TableCell>Freight</TableCell><TableCell>Hamali</TableCell><TableCell>Amount</TableCell><TableCell>Remove</TableCell></TableRow></TableHead>
            <TableBody>
              {oldItems.length > 0 ? oldItems.map((item, idx) => (
                <TableRow key={idx} sx={{ "&:hover": { backgroundColor: isDarkMode ? "rgba(255,183,77,0.03)" : "#fafafa" } }}>
                  <TableCell sx={{ color: colors?.textSecondary }}>{idx + 1}</TableCell>
                  <TableCell sx={{ color: colors?.textPrimary, fontWeight: 500 }}>{item.name}</TableCell>
                  <TableCell sx={{ color: colors?.textSecondary }}>{item.itemType.name}</TableCell>
                  <TableCell sx={{ color: colors?.textSecondary }}>{item.quantity}</TableCell>
                  <TableCell sx={{ color: colors?.textSecondary }}>₹{item.freight}</TableCell>
                  <TableCell sx={{ color: colors?.textSecondary }}>₹{item.hamali}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors?.textPrimary }}>₹{(item.freight + item.hamali * 2) * item.quantity}</TableCell>
                  <TableCell><IconButton size="small" onClick={() => handleDelete(item)} sx={{ color: colors?.textSecondary, "&:hover": { color: "#EF4444" } }}><Delete /></IconButton></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={8} sx={{ textAlign: "center", py: 3, color: colors?.textSecondary }}>No existing items</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Box>
      </SectionCard>

      <SectionCard title="Add New Items" icon={<FaPlus />} isDarkMode={isDarkMode} colors={colors} accentColor={accentColor}>
        <Box sx={{ overflowX: "auto", mb: 2 }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead><TableRow sx={{ backgroundColor: isDarkMode ? colors?.bgPrimary : "#f8fafc", "& th": { fontWeight: 600, color: colors?.textPrimary, fontSize: "0.85rem", py: 1.5, borderBottom: `1px solid ${isDarkMode ? colors?.border : "#e2e8f0"}` } }}><TableCell>#</TableCell><TableCell>Item Name</TableCell><TableCell>Type</TableCell><TableCell>Qty</TableCell><TableCell>Freight</TableCell><TableCell>Hamali</TableCell><TableCell>Amount</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {newItems.length === 0 ? (<TableRow><TableCell colSpan={8} sx={{ textAlign: "center", py: 4, color: colors?.textSecondary }}>Click "Add Item" to add new items</TableCell></TableRow>) : (
                newItems.map((item, idx) => (
                  <TableRow key={item.itemId} sx={{ "&:hover": { backgroundColor: isDarkMode ? "rgba(255,183,77,0.03)" : "#fafafa" } }}>
                    <TableCell sx={{ color: colors?.textSecondary }}>{idx + 1}</TableCell>
                    <TableCell><Autocomplete freeSolo inputValue={item.name} onInputChange={(event, newValue) => { if (event) handleInputChange(item.itemId, "autoComplete", newValue, event); }} options={itemNameOptions} onChange={(event, newValue) => handleInputChange(item.itemId, "autoComplete", newValue, event)} filterOptions={createFilterOptions({ matchFrom: "start" })} getOptionLabel={(option) => option || ""} renderInput={(params) => <TextField {...params} placeholder="Item name" variant="outlined" size="small" error={error && !item.name} sx={{ ...textFieldSx, minWidth: 140 }} />} disableClearable slots={autocompleteSlots} /></TableCell>
                    <TableCell><FormControl fullWidth size="small" sx={textFieldSx}><Select value={item.type} onChange={(e) => handleInputChange(item.itemId, "type", e.target.value)} MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }} inputProps={{ tabIndex: 101 + idx * 6 }}>{itemTypes.map((type) => <MenuItem key={type._id} value={type.name}>{type.name}</MenuItem>)}</Select></FormControl></TableCell>
                    <TableCell><TextField type="text" value={item.quantity} onChange={(e) => handleInputChange(item.itemId, "quantity", e.target.value)} variant="outlined" size="small" sx={textFieldSx} inputProps={{ tabIndex: 102 + idx * 6 }} /></TableCell>
                    <TableCell><TextField type="text" value={item.freight} onChange={(e) => handleInputChange(item.itemId, "freight", e.target.value)} variant="outlined" size="small" sx={textFieldSx} inputProps={{ tabIndex: 103 + idx * 6 }} /></TableCell>
                    <TableCell><TextField type="text" value={item.hamali} onChange={(e) => handleInputChange(item.itemId, "hamali", e.target.value)} variant="outlined" size="small" sx={textFieldSx} inputProps={{ tabIndex: 104 + idx * 6 }} /></TableCell>
                    <TableCell><Typography sx={{ fontWeight: 600, color: colors?.textPrimary }}>₹{(item.freight + item.hamali * 2) * item.quantity}</Typography></TableCell>
                    <TableCell><Box sx={{ display: "flex", gap: 0.5 }}><IconButton size="small" onClick={() => handleCopyRow(item.itemId)} sx={{ color: colors?.textSecondary, "&:hover": { color: isDarkMode ? "#FFB74D" : "#1D3557" } }} tabIndex={105 + idx * 6}><FaCopy size={14} /></IconButton><IconButton size="small" onClick={() => handleRemoveRow(item.itemId)} sx={{ color: colors?.textSecondary, "&:hover": { color: "#EF4444" } }}><FaTrash size={14} /></IconButton></Box></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}><button className="button" onClick={handleAddRow} style={{ display: "flex", alignItems: "center", gap: 8 }}><FaPlus /> Add Item</button></Box>
      </SectionCard>

      <SectionCard title="Charges Summary" icon={<ReceiptLongIcon />} isDarkMode={isDarkMode} colors={colors} accentColor={accentColor}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}><Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Freight</Typography><Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: colors?.textPrimary }}>₹{freight + freightOld}</Typography></Box>
          <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}><Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Hamali</Typography><Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: colors?.textPrimary }}>₹{hamali + hamaliOld}</Typography></Box>
          <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}><Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Door Delivery</Typography><Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: colors?.textPrimary }}>₹{isDoorDelivery ? doorDeliveryCharge : 0}</Typography></Box>
          <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)", border: isDarkMode ? "1px solid rgba(255,183,77,0.3)" : "1px solid rgba(29,53,87,0.2)" }}><Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Total</Typography><Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: isDarkMode ? "#FFB74D" : "#1D3557" }}>₹{freight + freightOld + (hamali + hamaliOld) * 2 + (isDoorDelivery ? doorDeliveryCharge : 0)}</Typography></Box>
        </Box>
      </SectionCard>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}><button className="button button-large" onClick={handleSaveChanges} style={{ minWidth: "260px", padding: "14px 32px", fontSize: "1rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: 8 }}><FaSave /> Save Changes</button></Box>

      <Modal open={saveModalOpen} onClose={handleCloseSaveModal}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: { xs: 280, sm: 340 }, bgcolor: colors?.bgCard || "background.paper", borderRadius: "12px", boxShadow: 24, p: 3, border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <FaExclamationTriangle style={{ fontSize: 32, color: isDarkMode ? "#FFB74D" : "#1D3557", marginBottom: 12 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors?.textPrimary, mb: 1 }}>Confirm Save</Typography>
            <Typography sx={{ color: colors?.textSecondary, fontSize: "0.9rem" }}>Are you sure you want to save the changes?</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button variant="outlined" onClick={handleCloseSaveModal} sx={{ borderColor: isDarkMode ? "#FFB74D" : "#1E3A5F", color: isDarkMode ? "#FFB74D" : "#1E3A5F", borderRadius: "8px", px: 3 }}>Cancel</Button>
            <Button variant="contained" onClick={confirmSave} disabled={isLoading} sx={{ background: isDarkMode ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)", color: isDarkMode ? "#1D3557" : "#fff", borderRadius: "8px", px: 3, fontWeight: 600 }}>{isLoading ? <CircularProgress size={20} sx={{ color: isDarkMode ? "#1D3557" : "#fff" }} /> : "Confirm"}</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
