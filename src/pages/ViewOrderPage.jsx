import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  CircularProgress,
  TextField,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link, useNavigate, useOutletContext, useParams, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaPrint, FaExclamationTriangle, FaBluetooth, FaBluetoothB } from "react-icons/fa";
import { MdBluetoothConnected, MdBluetoothDisabled } from "react-icons/md";
import { dateFormatter } from "../utils/dateFormatter";
import { fromDbValue, formatCurrency } from "../utils/currencyUtils";
import { printThermalLRWithAutoCut, getQZTrayErrorMessage } from "../utils/qzTrayUtils";
import { generateThreeCopies } from "../utils/escPosGenerator";
import { webBluetoothPrinter, connectBluetoothPrinter, printViaWebBluetooth, isWebBluetoothSupported } from "../utils/webBluetoothPrint";
import { useAuth } from "../routes/AuthContext";
import ModernSpinner from "../components/ModernSpinner";
import InstallAppButton from "../components/InstallAppButton";
import "../css/table.css";
import "../css/main.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ViewOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState({
    sender: {},
    receiver: {},
    sourceWarehouse: {},
    destinationWarehouse: {},
    items: [],
    hamali: 0,
    freight: 0,
    status: "",
    isDoorDelivery: false,
    isPaid: false,
    addedBy: {},
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const savedPrinter = webBluetoothPrinter.getSavedPrinter();
  const [bluetoothConnected, setBluetoothConnected] = useState(webBluetoothPrinter.isConnected);
  const [bluetoothPrinterName, setBluetoothPrinterName] = useState(savedPrinter?.name || '');
  const [hasSavedPrinter, setHasSavedPrinter] = useState(!!savedPrinter);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const { setIsScreenLoading, setIsScreenLoadingText, isDarkMode, colors } = useOutletContext();
  const location = useLocation();
  const { isAdmin, isSource, stationCode } = useAuth();
  const hasTriggered = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchData();
    
    // Check for saved Bluetooth printer and try to reconnect
    const checkBluetoothPrinter = async () => {
      const savedPrinter = webBluetoothPrinter.getSavedPrinter();
      if (savedPrinter) {
        setBluetoothPrinterName(savedPrinter.name);
        // Try to reconnect
        const result = await webBluetoothPrinter.reconnect();
        if (result.success) {
          setBluetoothConnected(true);
          setToast({
            open: true,
            message: `Reconnected to ${result.deviceName}`,
            severity: 'success'
          });
        }
      }
    };
    
    if (isWebBluetoothSupported()) {
      checkBluetoothPrinter();
    }
  }, []);
  // console.log(isMobile);
  const fetchData = async () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/parcel/track/${id}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      alert("Error occurred");
      setIsLoading1(false);
      return;
    }
    if (response.status === 201) {
      alert("No such LR");
      setIsLoading1(false);
      return;
    }
    const data = await response.json();
    setOrder(data.body);
    setIsLoading1(false);
    if (location.state?.print && !hasTriggered.current) {
      navigate(location.pathname, { replace: true, state: null });
      hasTriggered.current = true;
      if (location.state?.isThermal){
        if (!isMobile){
          handleLRPrintThermal();
        }
      }
      else handleLRPrint();
    }
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/parcel`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      method: "DELETE",
      body: JSON.stringify({ trackingId: id }),
    });
    const data = await res.json();
    if (data.flag) {
      setIsLoading(false);
      setDeleteModalOpen(false);
      navigate("/user/order/all");
    } else {
      setIsLoading(false);
      alert("Error occurred");
    }
  };

  const handleLRPrint = async () => {
    try {
      setIsScreenLoadingText("Generating LR Receipt...");
      setIsScreenLoading(true);
      const response = await fetch(`${BASE_URL}/api/parcel/generate-lr-receipt/${id}`);
      const blob = await response.blob();
      const pdfURL = URL.createObjectURL(blob);
      
      // Create iframe to show print dialog
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = pdfURL;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };
    } catch (error) {
      alert("Failed to load or print the PDF.");
    } finally {
      setIsScreenLoadingText("");
      setIsScreenLoading(false);
    }
  };

  const handleLRPrintThermal = async () => {
    try {
      setIsScreenLoadingText("Printing Thermal LR...");
      setIsScreenLoading(true);
      
      // Get printer name from localStorage or use default
      const savedPrinterName = localStorage.getItem('thermalPrinterName');
      const printerName = savedPrinterName || 'TVS-E RP 3230';
      
      // Use the utility function for QZ Tray printing
      const result = await printThermalLRWithAutoCut(id, BASE_URL, printerName);
      
      alert(`${result.message}\n\nTracking ID: ${id}\nPrinter: ${printerName}`);
      
    } catch (error) {
      console.error("Print error:", error);
      
      // Get user-friendly error message
      const errorMessage = getQZTrayErrorMessage(error);
      alert(errorMessage);
      
    } finally {
      setIsScreenLoadingText("");
      setIsScreenLoading(false);
    }
  };

  // Bluetooth Print Handlers
  const handleConnectBluetooth = async () => {
    try {
      setIsLoading(true);
      const result = await connectBluetoothPrinter();
      
      if (result.success) {
        setBluetoothConnected(true);
        setBluetoothPrinterName(result.deviceName);
        setHasSavedPrinter(true);
        setToast({
          open: true,
          message: `Connected to ${result.deviceName}`,
          severity: 'success'
        });
      } else {
        setToast({
          open: true,
          message: result.error || 'Failed to connect to printer',
          severity: 'error'
        });
      }
    } catch (error) {
      setToast({
        open: true,
        message: error.message || 'Failed to connect',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgetBluetooth = async () => {
    webBluetoothPrinter.forgetDevice();
    setBluetoothConnected(false);
    setBluetoothPrinterName('');
    setHasSavedPrinter(false);
    setToast({
      open: true,
      message: 'Printer forgotten. You can pair a new one.',
      severity: 'info'
    });
  };

  const handleBluetoothPrint = async () => {
    try {
      setIsLoading(true);
      setIsScreenLoadingText("Printing via Bluetooth...");
      setIsScreenLoading(true);

      // Auto-reconnect if not currently connected but we have a saved printer
      if (!webBluetoothPrinter.isConnected) {
        setIsScreenLoadingText("Reconnecting to printer...");
        const reconnectResult = await webBluetoothPrinter.reconnect();
        if (reconnectResult.success) {
          setBluetoothConnected(true);
          setBluetoothPrinterName(reconnectResult.deviceName);
        } else {
          // Reconnect failed — prompt user to scan for a new device
          setIsScreenLoading(false);
          setToast({
            open: true,
            message: `Could not reconnect to ${bluetoothPrinterName || 'saved printer'}. Please pair again.`,
            severity: 'warning'
          });
          // Attempt fresh connect (opens Bluetooth scan dialog)
          const connectResult = await connectBluetoothPrinter();
          if (!connectResult.success) {
            setToast({
              open: true,
              message: connectResult.error || 'Failed to connect to printer',
              severity: 'error'
            });
            return;
          }
          setBluetoothConnected(true);
          setBluetoothPrinterName(connectResult.deviceName);
          setHasSavedPrinter(true);
          setIsScreenLoadingText("Printing via Bluetooth...");
          setIsScreenLoading(true);
        }
      }

      // Generate ESC/POS commands
      const escPosCommands = generateThreeCopies(order);

      // Print via Bluetooth
      const result = await printViaWebBluetooth(escPosCommands);

      if (result.success) {
        setToast({
          open: true,
          message: 'Print job sent successfully!',
          severity: 'success'
        });
      } else {
        setToast({
          open: true,
          message: result.error || 'Failed to print',
          severity: 'error'
        });
      }
    } catch (error) {
      setToast({
        open: true,
        message: error.message || 'Print failed',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
      setIsScreenLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: { bg: "#dcfce7", color: "#166534" },
      dispatched: { bg: "#fef3c7", color: "#92400e" },
      arrived: { bg: "#dbeafe", color: "#1e40af" },
      pending: { bg: "#fee2e2", color: "#991b1b" },
    };
    return colors[status] || { bg: "#f1f5f9", color: "#475569" };
  };

  const statusColor = getStatusColor(order.status);

  return (
    <Box sx={{ minHeight: "100%", backgroundColor: colors?.bgPrimary || "#f8fafc" }}>
      {/* Order Details Card */}
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: isDarkMode ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04)", 
        mb: 2.5,
        backgroundColor: colors?.bgCard || "#ffffff",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F" }}>
                LR Details
              </Typography>
              <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.9rem" }}>#{id}</Typography>
            </Box>
            <Chip
              label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              sx={{ backgroundColor: statusColor.bg, color: statusColor.color, fontWeight: 600 }}
            />
          </Box>

          {isLoading1 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <ModernSpinner size={36} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Sender Info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2.5, backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#fafbfc", borderRadius: 2.5, border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e8ecf0", height: "100%" }}>
                  <Typography sx={{ fontWeight: 700, color: isDarkMode ? colors?.accent : "#1E3A5F", mb: 2, fontSize: "0.8rem", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Sender Details
                  </Typography>
                  <DetailRow label="Name" value={order.sender?.name} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Phone" value={order.sender?.phoneNo} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Address" value={order.sender?.address} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="GST" value={order.sender?.gst || "N/A"} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Station" value={order.sourceWarehouse?.name} colors={colors} isDarkMode={isDarkMode} />
                </Box>
              </Grid>

              {/* Receiver Info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2.5, backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#fafbfc", borderRadius: 2.5, border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e8ecf0", height: "100%" }}>
                  <Typography sx={{ fontWeight: 700, color: isDarkMode ? colors?.accent : "#1E3A5F", mb: 2, fontSize: "0.8rem", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Receiver Details
                  </Typography>
                  <DetailRow label="Name" value={order.receiver?.name} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Phone" value={order.receiver?.phoneNo} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Address" value={order.receiver?.address} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="GST" value={order.receiver?.gst || "N/A"} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Station" value={order.destinationWarehouse?.name} colors={colors} isDarkMode={isDarkMode} />
                </Box>
              </Grid>

              {/* Order Info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2.5, backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#fafbfc", borderRadius: 2.5, border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e8ecf0", height: "100%" }}>
                  <Typography sx={{ fontWeight: 700, color: isDarkMode ? colors?.accent : "#1E3A5F", mb: 2, fontSize: "0.8rem", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Order Info
                  </Typography>
                  <DetailRow label="Payment" value={order.payment} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Total" value={`₹${fromDbValue((order.freight || 0) + (order.hamali || 0) * 2, true)}`} highlight colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Freight" value={formatCurrency(order.freight, "₹", true)} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Hamali" value={formatCurrency(order.hamali, "₹", true)} colors={colors} isDarkMode={isDarkMode} />
                  <DetailRow label="Door Delivery" value={order.isDoorDelivery ? formatCurrency(order.doorDeliveryCharge, "₹", true) : "No"} colors={colors} isDarkMode={isDarkMode} />
                </Box>
              </Grid>

              {/* Meta Info */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                    gap: 2.5,
                    pt: 2.5, 
                    mt: 1,
                    borderTop: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e8ecf0",
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#fafbfc",
                    p: 2.5,
                    borderRadius: 2.5,
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e8ecf0",
                  }}
                >
                  <MetaItem label="Added by" value={order.addedBy?.name} colors={colors} isDarkMode={isDarkMode} />
                  <MetaItem label="Created" value={dateFormatter(order.placedAt)} colors={colors} isDarkMode={isDarkMode} />
                  <MetaItem label="Modified by" value={order.lastModifiedBy?.name} colors={colors} isDarkMode={isDarkMode} />
                  <MetaItem label="Modified" value={dateFormatter(order.lastModifiedAt)} colors={colors} isDarkMode={isDarkMode} />
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: isDarkMode ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04)", 
        mb: 2.5,
        backgroundColor: colors?.bgCard || "#ffffff",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", mb: 2, fontSize: "1.1rem" }}>Items in Package</Typography>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }} align="center">Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }} align="right">Freight</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }} align="right">Hamali</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }} align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading1 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <ModernSpinner size={28} />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {order.items.map((item, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ color: colors?.textSecondary || "#64748b" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500 }}>{item.name}</TableCell>
                        <TableCell sx={{ color: colors?.textSecondary || "#64748b" }}>{item.itemType?.name}</TableCell>
                        <TableCell align="center" sx={{ color: colors?.textSecondary || "#64748b" }}>{item.quantity}</TableCell>
                        <TableCell align="right" sx={{ color: colors?.textSecondary || "#64748b" }}>{formatCurrency(item.freight, "₹", true)}</TableCell>
                        <TableCell align="right" sx={{ color: colors?.textSecondary || "#64748b" }}>{formatCurrency(item.hamali, "₹", true)}</TableCell>
                        <TableCell align="right" sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500 }}>
                          {formatCurrency(((item.freight || 0) + 2 * (item.hamali || 0)) * (item.quantity || 1), "₹", true)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }}>Total</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }}>
                        {order.items?.reduce((prev, item) => prev + item.quantity, 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }}>{formatCurrency(order.freight, "₹", true)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: colors?.textPrimary || "#1E3A5F" }}>{formatCurrency(order.hamali, "₹", true)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: isDarkMode ? colors?.accent : colors?.textPrimary || "#1E3A5F" }}>
                        {formatCurrency((order.freight || 0) + (order.hamali || 0) * 2, "₹", true)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", alignItems: "center" }}>
        <button className="button" onClick={handleLRPrint} style={{ minWidth: "160px" }}>
          <FaPrint /> Print A4 LR
        </button>
        {!isMobile && (
        <button className="button" onClick={handleLRPrintThermal} style={{ minWidth: "180px" }}>
          <FaPrint /> Print via QZ Tray
        </button>
        )}
        
        {/* Web Bluetooth Printing (All Screens) - Always show if browser supports it */}
        {isMobile && (!hasSavedPrinter ? (
          <button 
            className="button" 
            onClick={handleConnectBluetooth}
            disabled={isLoading || !isWebBluetoothSupported()}
            style={{ 
              minWidth: "220px",
              background: !isWebBluetoothSupported() 
                ? (isDarkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb")
                : (isDarkMode ? "linear-gradient(180deg, #42A5F5 0%, #1E88E5 100%)" : "linear-gradient(180deg, #64B5F6 0%, #42A5F5 100%)"),
              opacity: !isWebBluetoothSupported() ? 0.5 : 1,
              cursor: !isWebBluetoothSupported() ? "not-allowed" : "pointer",
            }}
            title={!isWebBluetoothSupported() ? "Web Bluetooth not supported in this browser. Use Chrome/Edge on Android." : "Connect to Bluetooth printer"}
          >
            {isLoading ? <CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} /> : <FaBluetooth />} 
            {isLoading ? "Connecting..." : "Connect Bluetooth"}
          </button>
        ) : (
          <>
            <button 
              className="button" 
              onClick={handleBluetoothPrint}
              disabled={isLoading}
              style={{ 
                minWidth: "200px",
                background: isDarkMode ? "linear-gradient(180deg, #66BB6A 0%, #4CAF50 100%)" : "linear-gradient(180deg, #81C784 0%, #66BB6A 100%)",
              }}
              title={bluetoothConnected ? `Connected: ${bluetoothPrinterName}` : `Saved: ${bluetoothPrinterName} (will auto-reconnect)`}
            >
              {isLoading ? <CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} /> : (bluetoothConnected ? <MdBluetoothConnected /> : <FaBluetooth />)} 
              {isLoading ? "Printing..." : `Print via BT`}
            </button>
            <button 
              className="button" 
              onClick={handleForgetBluetooth}
              style={{ 
                minWidth: "140px",
                background: isDarkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                color: isDarkMode ? colors?.textPrimary : "#374151",
              }}
              title="Forget this printer and pair a new one"
            >
              <MdBluetoothDisabled /> Forget Printer
            </button>
          </>
        ))}
        
        {/* Install App Button */}
        <InstallAppButton isDarkMode={isDarkMode} colors={colors} />
        
        {
          /* Show Edit LR button only for:
             1. Admin (can edit any LR regardless of status)
             2. Source warehouse staff (can edit LRs from their warehouse ONLY when status is "arrived")
             NOT for destination warehouse staff */
          (isAdmin || (isSource && order.sourceWarehouse?.warehouseID === stationCode && order.status === "arrived")) &&
          <Link to={`/user/edit/order/${id}`} style={{ textDecoration: "none" }}>
          <button 
            className="button" 
            style={{ 
              minWidth: "120px",
              background: isDarkMode ? colors?.accent : "linear-gradient(180deg, #FFB74D 0%, #FFA726 100%)",
              color: isDarkMode ? "#0a1628" : "#1E3A5F",
              boxShadow: isDarkMode 
                ? "0 4px 15px rgba(255, 183, 77, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)"
                : "0 4px 15px rgba(255, 183, 77, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)"
            }}
          >
            <FaEdit /> Edit LR
          </button>
        </Link>
        }
        {isAdmin && (
          <button
            className="button"
            onClick={() => setDeleteModalOpen(true)}
            style={{ 
              minWidth: "120px",
              background: "linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)"
            }}
          >
            <FaTrash /> Delete
          </button>
        )}
      </Box>

      {/* Delete Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box sx={getModalStyle(colors, isDarkMode)}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <FaExclamationTriangle style={{ color: "#dc2626", fontSize: "2.5rem" }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#dc2626", textAlign: "center", mb: 1 }}>
            Delete LR
          </Typography>
          <Typography sx={{ color: colors?.textSecondary || "#64748b", textAlign: "center", mb: 3 }}>
            This action cannot be undone. Are you sure?
          </Typography>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            <Button 
              variant="outlined" 
              onClick={() => setDeleteModalOpen(false)}
              sx={{
                borderColor: isDarkMode ? colors?.accent : "#1E3A5F",
                color: isDarkMode ? colors?.accent : "#1E3A5F",
                "&:hover": {
                  borderColor: isDarkMode ? colors?.accentHover : "#1E3A5F",
                  backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.04)",
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#dc2626", "&:hover": { backgroundColor: "#b91c1c" } }}
              onClick={confirmDelete}
              disabled={isLoading}
            >
              Delete {isLoading && <CircularProgress size={16} sx={{ color: "#fff", ml: 1 }} />}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Network Printer Dialog */}
      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: '100%',
            fontSize: '0.95rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Helper Components
const DetailRow = ({ label, value, highlight, colors, isDarkMode }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
    <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.85rem" }}>{label}</Typography>
    <Typography sx={{ color: highlight ? (isDarkMode ? colors?.accent : colors?.textPrimary) : colors?.textPrimary || "#1a1a2e", fontWeight: highlight ? 700 : 500, fontSize: "0.85rem" }}>
      {value || "—"}
    </Typography>
  </Box>
);

const MetaItem = ({ label, value, colors, isDarkMode }) => (
  <Box>
    <Typography sx={{ color: colors?.textSecondary || "#94a3b8", fontSize: "0.75rem" }}>{label}</Typography>
    <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontSize: "0.85rem", fontWeight: 500 }}>{value || "—"}</Typography>
  </Box>
);

// Modal style is now a function to support dark mode
const getModalStyle = (colors, isDarkMode) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 380,
  bgcolor: colors?.bgCard || "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
  border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "none",
});
