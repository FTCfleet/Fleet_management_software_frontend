import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
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
  Paper,
} from "@mui/material";
import { FaCopy, FaTrash, FaPlus } from "react-icons/fa";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InventoryIcon from "@mui/icons-material/Inventory";
import "../css/main.css";
import { useAuth } from "../routes/AuthContext";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SectionCard = ({ title, icon, children, isDarkMode, colors }) => (
  <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "12px", background: isDarkMode ? colors?.bgCard : "#ffffff", border: isDarkMode ? `1px solid ${colors?.border}` : "1px solid #e5e7eb", mb: 2.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, pb: 1.5, borderBottom: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}>
      <Box sx={{ color: isDarkMode ? "#FFB74D" : "#1D3557", display: "flex" }}>{icon}</Box>
      <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: colors?.textPrimary }}>{title}</Typography>
    </Box>
    {children}
  </Paper>
);

export default function AddOrderPage({}) {
  const [items, setItems] = useState([]);
  const [counter, setCounter] = useState(1);
  const [senderDetails, setSenderDetails] = useState({ name: "", phoneNo: "", address: "", gst: "", role: "sender" });
  const [receiverDetails, setReceiverDetails] = useState({ name: "", phoneNo: "", address: "", gst: "", role: "receiver" });
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
  const { dialogState, hideDialog, showError, showSuccess } = useDialog();
  const { isDarkMode, colors } = useOutletContext();

  const normalizeName = (value = "") => value ? value.toString().toUpperCase() : "";

  const itemNameOptions = useMemo(() => {
    const names = new Set();
    regItems.forEach((item) => { const name = normalizeName(item.name); if (name) names.add(name); });
    return Array.from(names);
  }, [regItems]);

  const findRegItem = (name, type) => {
    const normalizedName = normalizeName(name);
    const normalizedType = type ? type.toString() : "";
    return regItems.find((item) => normalizeName(item.name) === normalizedName && item.itemType?.name === normalizedType);
  };

  useEffect(() => { fetchClients(); fetchWarehouse(); fetchItems(); fetchItemTypes(); }, []);

  const fetchRegClientItems = async (clientId) => {
    const token = localStorage.getItem("token");
    await fetch(`${BASE_URL}/api/admin/regular-client-items/${clientId}`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
  };

  const fetchClients = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/regular-clients`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRegClients(data.body);
  };

  const fetchItems = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/regular-items`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setregItems(data.body);
  };

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) { const data = await response.json(); setAllWarehouse(data.body); }
  };

  const fetchItemTypes = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/item-type`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setItemTypes(data.body);
  };

  const handleAddRow = () => { setItems([...items, { id: counter, name: "", quantity: 0, freight: 0, hamali: 0, type: "C/B" }]); setCounter(counter + 1); };

  const handleRemoveRow = (id) => {
    const updatedItems = items.filter((item) => item.id !== id).map((item, index) => ({ ...item, id: index + 1 }));
    fixCharges(id, 0, 0, 0, updatedItems); setItems(updatedItems); setCounter(updatedItems.length + 1);
  };

  const handleCopyRow = (id) => {
    const itemToCopy = items.find((item) => item.id === id);
    if (itemToCopy) { const copiedItem = { ...itemToCopy, id: counter }; const updatedItems = [...items, copiedItem]; fixCharges(copiedItem.id, copiedItem.quantity, copiedItem.freight, copiedItem.hamali, updatedItems); setItems(updatedItems); setCounter(counter + 1); }
  };

  const fixCharges = (id, quantity_new, freight_new, hamali_new, itemsList = items) => {
    let ham = 0, frt = 0;
    itemsList.filter((item) => item.id !== id).forEach((item) => { ham += item.quantity * item.hamali; frt += item.quantity * item.freight; });
    ham += hamali_new * quantity_new; frt += freight_new * quantity_new; setHamali(ham); setFreight(frt);
  };

  const handleInputChange = (id, field, value, event) => {
    if (field === "autoComplete") {
      const normalizedValue = normalizeName(value || event?.target.value);
      setItems((prevItems) => {
        let updatedItemForCharges = null;
        const updatedItems = prevItems.map((prevItem) => {
          if (prevItem.id !== id) return prevItem;
          const matchedItem = findRegItem(normalizedValue, prevItem.type);
          updatedItemForCharges = { ...prevItem, name: normalizedValue, freight: matchedItem ? matchedItem.freight || 0 : 0, hamali: matchedItem ? matchedItem.hamali || 0 : 0, quantity: prevItem.quantity || 1 };
          return updatedItemForCharges;
        });
        if (updatedItemForCharges) fixCharges(id, updatedItemForCharges.quantity, updatedItemForCharges.freight, updatedItemForCharges.hamali, updatedItems);
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
          updatedItemForCharges = { ...prevItem, type: value, freight: matchedItem ? matchedItem.freight || 0 : 0, hamali: matchedItem ? matchedItem.hamali || 0 : 0, quantity: prevItem.quantity || 1 };
          return updatedItemForCharges;
        });
        if (updatedItemForCharges) fixCharges(id, updatedItemForCharges.quantity, updatedItemForCharges.freight, updatedItemForCharges.hamali, updatedItems);
        return updatedItems;
      });
      return;
    }
    if (field === "quantity" || field === "freight" || field === "hamali") value = parseInt(value) || 0;
    setItems((prevItems) => {
      const updatedItems = prevItems.map((prevItem) => prevItem.id === id ? { ...prevItem, [field]: value } : prevItem);
      if (field === "quantity" || field === "freight" || field === "hamali") {
        const updatedItem = updatedItems.find((itm) => itm.id === id);
        if (updatedItem) fixCharges(id, updatedItem.quantity, updatedItem.freight, updatedItem.hamali, updatedItems);
      }
      return updatedItems;
    });
  };

  const validateOrder = () => {
    if (receiverDetails.name === "") { showError("Please fill all the receiver details", "Validation Error"); return false; }
    if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) { showError("Please fill all the stations", "Validation Error"); return false; }
    if (items.length === 0 || items.some((item) => !item.name)) { showError(items.length === 0 ? "Please add items to the order" : "Please fill all item details", "Validation Error"); return false; }
    return true;
  };

  const handleEmptyDetails = (details) => {
    if (!details.name || details.name == "") details.name = "NA";
    else details.name = details.name.toUpperCase();
    if (!details.phoneNo || details.phoneNo == "") details.phoneNo = "NA";
    if (!details.address || details.address == "") details.address = "NA";
    if (!details.gst || details.gst == "") details.gst = "NA";
    return details;
  };

  const handleAddOrder = async () => {
    if (!validateOrder()) { setError(true); return; }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/parcel/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ senderDetails: handleEmptyDetails(senderDetails), receiverDetails: handleEmptyDetails(receiverDetails), items, destinationWarehouse, charges: hamali, hamali, freight, payment, isDoorDelivery, doorDeliveryCharge, ...(isAdmin ? { sourceWarehouse } : {}) }),
      });
      const data = await response.json();
      if (!response.ok || !data.flag) { showError("Failed to create LR. Please try again.", "Error"); }
      else { showSuccess("LR Created Successfully!", "Success"); setTimeout(() => { navigate(`/user/view/order/${data.body}`, { state: {print: true} }); }, 1500); }
    } catch (error) { showError("Network error occurred. Please check your connection.", "Network Error"); }
    finally { setIsLoading(false); }
  };

  const handleSenderChange = (event, selectedOption) => {
    if (!selectedOption) return;
    selectedOption = selectedOption.toUpperCase();
    let client = regClients.find((client) => client.name === selectedOption && client.isSender);
    if (!client) { setSenderDetails({ ...senderDetails, name: selectedOption }); return; }
    setSenderDetails({ ...senderDetails, name: client.name, phoneNo: client.phoneNo, address: client.address, gst: client.gst });
  };

  const handleReceiverChange = (event, selectedOption) => {
    if (!selectedOption) return;
    selectedOption = selectedOption.toUpperCase();
    let client = regClients.find((client) => client.name === selectedOption && !client.isSender);
    if (!client) { setReceiverDetails({ ...receiverDetails, name: selectedOption }); return; }
    fetchRegClientItems(client._id);
    setReceiverDetails({ ...receiverDetails, name: client.name, phoneNo: client.phoneNo, address: client.address, gst: client.gst });
  };



  const autocompleteSlots = { paper: (props) => (<div {...props} style={{ overflowY: "auto", backgroundColor: isDarkMode ? colors?.bgCard : "#f7f9fc", color: colors?.textPrimary || "black", border: isDarkMode ? `1px solid ${colors?.border}` : "1px solid #d1d5db", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} />) };

  const accentColor = isDarkMode ? "#FFB74D" : "#1D3557";
  const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: isDarkMode ? colors?.bgPrimary : "#f9fafb", "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: accentColor }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accentColor, borderWidth: "2px" } }, "& .MuiInputLabel-root.Mui-focused": { color: accentColor } };

  return (
    <Box sx={{ padding: { xs: "16px", md: "24px" }, margin: "auto", backgroundColor: colors?.bgPrimary || "#f8fafc", color: colors?.textPrimary || "#1b3655", maxWidth: "1200px", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: colors?.textPrimary || "#1c3553", mb: 3, textAlign: "center", fontSize: { xs: "1.5rem", md: "1.75rem" } }}>Create New L.R.</Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>
        <SectionCard title="Sender Details" icon={<PersonIcon />} isDarkMode={isDarkMode} colors={colors}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Autocomplete freeSolo inputValue={senderDetails.name} onInputChange={(event, newValue) => { if (event) setSenderDetails({ ...senderDetails, name: newValue }); }} options={regClients.filter(client => client.isSender).map((client) => client.name)} onChange={(event, newValue) => handleSenderChange(event, newValue)} filterOptions={createFilterOptions({ matchFrom: "start" })} getOptionLabel={(option) => option || ""} renderInput={(params) => <TextField {...params} label="Name" error={error && !senderDetails.name} sx={{ ...textFieldSx, "& input": { textTransform: "uppercase" } }} size="small" />} disableClearable slots={autocompleteSlots} />
            <TextField label="Phone No." value={senderDetails.phoneNo} onChange={(e) => setSenderDetails({ ...senderDetails, phoneNo: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 2 }} />
            <TextField label="Address" value={senderDetails.address} onChange={(e) => setSenderDetails({ ...senderDetails, address: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 3 }} />
            <TextField label="GST No." value={senderDetails.gst} onChange={(e) => setSenderDetails({ ...senderDetails, gst: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 4 }} />
          </Box>
        </SectionCard>

        <SectionCard title="Receiver Details" icon={<PersonIcon />} isDarkMode={isDarkMode} colors={colors}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Autocomplete freeSolo inputValue={receiverDetails.name} onInputChange={(event, newValue) => { if (event) setReceiverDetails({ ...receiverDetails, name: newValue }); }} options={regClients.filter(client => !client.isSender).map((client) => client.name)} onChange={(event, newValue) => handleReceiverChange(event, newValue)} filterOptions={createFilterOptions({ matchFrom: "start" })} getOptionLabel={(option) => option || ""} renderInput={(params) => <TextField {...params} label="Name *" error={error && !receiverDetails.name} sx={{ ...textFieldSx, "& input": { textTransform: "uppercase" } }} size="small" />} disableClearable slots={autocompleteSlots} />
            <TextField label="Phone No." value={receiverDetails.phoneNo} onChange={(e) => setReceiverDetails({ ...receiverDetails, phoneNo: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 6 }} />
            <TextField label="Address" value={receiverDetails.address} onChange={(e) => setReceiverDetails({ ...receiverDetails, address: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 7 }} />
            <TextField label="GST No." value={receiverDetails.gst} onChange={(e) => setReceiverDetails({ ...receiverDetails, gst: e.target.value })} sx={textFieldSx} size="small" inputProps={{ tabIndex: 8 }} />
          </Box>
        </SectionCard>
      </Box>

      <SectionCard title="Shipment Details" icon={<LocalShippingIcon />} isDarkMode={isDarkMode} colors={colors}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          {isAdmin && (
            <FormControl size="small" sx={textFieldSx}>
              <InputLabel>Source Station *</InputLabel>
              <Select label="Source Station *" value={sourceWarehouse} onChange={(e) => setSourceWarehouse(e.target.value)} error={error && !sourceWarehouse} inputProps={{ tabIndex: 9 }}>
                {allWarehouse.filter((w) => w.isSource).map((w) => <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          <FormControl size="small" sx={textFieldSx}>
            <InputLabel>Destination Station *</InputLabel>
            <Select label="Destination Station *" value={destinationWarehouse} onChange={(e) => setDestinationWarehouse(e.target.value)} error={error && !destinationWarehouse} inputProps={{ tabIndex: isAdmin ? 10 : 9 }}>
              {allWarehouse.filter((w) => !w.isSource).map((w) => <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={textFieldSx}>
            <InputLabel>Payment Type</InputLabel>
            <Select label="Payment Type" value={payment} onChange={(e) => setPayemnt(e.target.value)} inputProps={{ tabIndex: isAdmin ? 11 : 10 }}>
              <MenuItem value="To Pay">To Pay</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel control={<Checkbox checked={isDoorDelivery} onChange={(e) => setIsDoorDelivery(e.target.checked)} sx={{ color: isDarkMode ? "#FFB74D" : "#1D3557", "&.Mui-checked": { color: isDarkMode ? "#FFB74D" : "#1D3557" } }} inputProps={{ tabIndex: isAdmin ? 12 : 11 }} />} label="Door Delivery" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.9rem" } }} />
          {isDoorDelivery && <TextField label="Delivery Charge" value={doorDeliveryCharge} onChange={(e) => setDoorDeliveryCharge(parseInt(e.target.value) || 0)} type="text" sx={textFieldSx} size="small" inputProps={{ tabIndex: isAdmin ? 13 : 12 }} />}
        </Box>
      </SectionCard>

      <SectionCard title="Items" icon={<InventoryIcon />} isDarkMode={isDarkMode} colors={colors}>
        <Box sx={{ overflowX: "auto", mb: 2 }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: isDarkMode ? colors?.bgPrimary : "#f8fafc", "& th": { fontWeight: 600, color: colors?.textPrimary, fontSize: "0.85rem", py: 1.5, borderBottom: `1px solid ${isDarkMode ? colors?.border : "#e2e8f0"}` } }}>
                <TableCell sx={{ width: 50 }}>#</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell sx={{ width: 120 }}>Type</TableCell>
                <TableCell sx={{ width: 80 }}>Qty</TableCell>
                <TableCell sx={{ width: 80 }}>Freight</TableCell>
                <TableCell sx={{ width: 80 }}>Hamali</TableCell>
                <TableCell sx={{ width: 90 }}>Amount</TableCell>
                <TableCell sx={{ width: 90 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: "center", py: 4, color: colors?.textSecondary }}><Typography>No items added. Click "Add Item" to start.</Typography></TableCell></TableRow>
              ) : (
                items.map((item, idx) => (
                  <TableRow key={item.id} sx={{ "&:hover": { backgroundColor: isDarkMode ? "rgba(255,183,77,0.03)" : "#fafafa" } }}>
                    <TableCell sx={{ color: colors?.textSecondary }}>{item.id}</TableCell>
                    <TableCell>
                      <Autocomplete freeSolo inputValue={item.name} onInputChange={(event, newValue) => { if (event) handleInputChange(item.id, "autoComplete", newValue, event); }} options={itemNameOptions} onChange={(event, newValue) => handleInputChange(item.id, "autoComplete", newValue, event)} filterOptions={createFilterOptions({ matchFrom: "start" })} getOptionLabel={(option) => option || ""} renderInput={(params) => <TextField {...params} placeholder="Item name" variant="outlined" size="small" error={error && !item.name} sx={{ ...textFieldSx, minWidth: 140 }} />} disableClearable slots={autocompleteSlots} />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small" sx={textFieldSx}>
                        <Select value={item.type} onChange={(e) => handleInputChange(item.id, "type", e.target.value)} MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }} inputProps={{ tabIndex: 101 + idx * 6 }}>
                          {itemTypes.map((type) => <MenuItem key={type._id} value={type.name}>{type.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell><TextField type="text" value={item.quantity} onChange={(e) => handleInputChange(item.id, "quantity", e.target.value)} variant="outlined" size="small" sx={textFieldSx} inputProps={{ tabIndex: 102 + idx * 6 }} /></TableCell>
                    <TableCell><TextField type="text" value={item.freight} onChange={(e) => handleInputChange(item.id, "freight", e.target.value)} variant="outlined" size="small" sx={textFieldSx} inputProps={{ tabIndex: 103 + idx * 6 }} /></TableCell>
                    <TableCell><TextField type="text" value={item.hamali} onChange={(e) => handleInputChange(item.id, "hamali", e.target.value)} variant="outlined" size="small" sx={textFieldSx} inputProps={{ tabIndex: 104 + idx * 6 }} /></TableCell>
                    <TableCell><Typography sx={{ fontWeight: 600, color: colors?.textPrimary }}>₹{(2 * item.hamali + item.freight) * item.quantity}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleCopyRow(item.id)} sx={{ color: colors?.textSecondary, "&:hover": { color: isDarkMode ? "#FFB74D" : "#1D3557" } }} tabIndex={105 + idx * 6}><FaCopy size={14} /></IconButton>
                        <IconButton size="small" onClick={() => handleRemoveRow(item.id)} sx={{ color: colors?.textSecondary, "&:hover": { color: "#EF4444" } }}><FaTrash size={14} /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}><button className="button" onClick={handleAddRow} style={{ display: "flex", alignItems: "center", gap: 8 }}><FaPlus /> Add Item</button></Box>
      </SectionCard>

      <SectionCard title="Charges Summary" icon={<ReceiptLongIcon />} isDarkMode={isDarkMode} colors={colors}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}>
            <Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Freight</Typography>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: colors?.textPrimary }}>₹{freight}</Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}>
            <Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Hamali</Typography>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: colors?.textPrimary }}>₹{hamali}</Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDarkMode ? colors?.border : "#e5e7eb"}` }}>
            <Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Statistical</Typography>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: colors?.textPrimary }}>₹{hamali}</Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: "10px", background: isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)", border: isDarkMode ? "1px solid rgba(255,183,77,0.3)" : "1px solid rgba(29,53,87,0.2)" }}>
            <Typography sx={{ fontSize: "0.8rem", color: colors?.textSecondary, mb: 0.5 }}>Total</Typography>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: isDarkMode ? "#FFB74D" : "#1D3557" }}>₹{freight + hamali * 2 + (isDoorDelivery ? doorDeliveryCharge : 0)}</Typography>
          </Box>
        </Box>
      </SectionCard>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
        <button className="button button-large" onClick={handleAddOrder} disabled={isLoading} style={{ minWidth: "260px", padding: "14px 32px", fontSize: "1rem", borderRadius: "10px" }}>
          {isLoading ? (<>Creating...<CircularProgress size={20} sx={{ color: "#fff", ml: 1 }} /></>) : "Save & Print"}
        </button>
      </Box>

      <CustomDialog open={dialogState.open} onClose={hideDialog} onConfirm={dialogState.onConfirm} title={dialogState.title} message={dialogState.message} type={dialogState.type} confirmText={dialogState.confirmText} cancelText={dialogState.cancelText} showCancel={dialogState.showCancel} />
    </Box>
  );
}
