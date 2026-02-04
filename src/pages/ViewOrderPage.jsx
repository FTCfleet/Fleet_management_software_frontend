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
} from "@mui/material";
import { Link, useNavigate, useOutletContext, useParams, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaPrint, FaExclamationTriangle, FaEye } from "react-icons/fa";
import { dateFormatter } from "../utils/dateFormatter";
import { fromDbValue, formatCurrency } from "../utils/currencyUtils";
import { printThermalLRWithAutoCut, getQZTrayErrorMessage } from "../utils/qzTrayUtils";
import { printThermalLRNetwork, getNetworkPrintErrorMessage, discoverNetworkPrinters } from "../utils/networkPrintUtils";
import { generateCopiesArray } from "../utils/escPosGenerator";
import { useAuth } from "../routes/AuthContext";
import ModernSpinner from "../components/ModernSpinner";
import ThermalReceiptPreview from "../components/ThermalReceiptPreview";
import { useThermalPreview } from "../hooks/useThermalPreview";
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
  const [qrCode, setQrCode] = useState(0);
  const { previewData, isPreviewOpen, showPreview, closePreview } = useThermalPreview();
  const [qrCount, setQrCount] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [printerNameDialogOpen, setPrinterNameDialogOpen] = useState(false);
  const [networkPrinterDialogOpen, setNetworkPrinterDialogOpen] = useState(false);
  const [printerName, setPrinterName] = useState("TVS-E RP 3230");
  const [printerIP, setPrinterIP] = useState("192.168.1.100");
  const [printerPort, setPrinterPort] = useState("9100");
  const [discoveredPrinters, setDiscoveredPrinters] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
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
    
    // Load saved network printer settings
    const savedIP = localStorage.getItem('networkPrinterIP');
    const savedPort = localStorage.getItem('networkPrinterPort');
    if (savedIP) setPrinterIP(savedIP);
    if (savedPort) setPrinterPort(savedPort);
  }, []);

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
    setQrCode(data.qrCode);
    setIsLoading1(false);
    if (location.state?.print && !hasTriggered.current) {
      navigate(location.pathname, { replace: true, state: null });
      hasTriggered.current = true;
      handleLRPrintThermal();
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

  const handleThermalPreview = async () => {
    try {
      setIsScreenLoadingText("Generating Preview...");
      setIsScreenLoading(true);
      
      // Fetch parcel data
      const response = await fetch(`${BASE_URL}/api/parcel/track/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch parcel data");
      }
      
      const data = await response.json();
      
      if (!data.flag) {
        throw new Error(data.message || "Failed to fetch parcel data");
      }

      // Generate ESC/POS commands for first copy (preview)
      const escPosReceipts = generateCopiesArray(data.body);
      
      // Show preview of first copy
      showPreview(escPosReceipts[0]);
      
    } catch (error) {
      console.error("Preview error:", error);
      alert(`Failed to generate preview: ${error.message}`);
    } finally {
      setIsScreenLoadingText("");
      setIsScreenLoading(false);
    }
  };

  const handleReloadPreview = async () => {
    closePreview();
    await handleThermalPreview();
  };

  const handlePrintFromPreview = async () => {
    closePreview();
    handleLRPrintThermal();
  };

  const handleNetworkPrint = () => {
    // Open network printer dialog
    setNetworkPrinterDialogOpen(true);
  };

  const handleNetworkPrintConfirm = async () => {
    // Close dialog
    setNetworkPrinterDialogOpen(false);
    
    // Validate inputs
    if (!printerIP || printerIP.trim() === "") {
      alert("Please enter printer IP address");
      return;
    }
    
    const port = parseInt(printerPort);
    if (isNaN(port) || port < 1 || port > 65535) {
      alert("Please enter a valid port number (1-65535)");
      return;
    }
    
    try {
      setIsScreenLoadingText("Printing via Network...");
      setIsScreenLoading(true);
      
      // Save printer settings to localStorage
      localStorage.setItem('networkPrinterIP', printerIP.trim());
      localStorage.setItem('networkPrinterPort', port.toString());
      
      // Print via network
      const result = await printThermalLRNetwork(id, BASE_URL, printerIP.trim(), port);
      
      if (result.success) {
        alert(`✅ ${result.message}\n\nTracking ID: ${id}\nPrinter: ${printerIP}:${port}`);
      } else {
        const errorMessage = getNetworkPrintErrorMessage(result.error);
        alert(errorMessage);
      }
      
    } catch (error) {
      console.error("Network print error:", error);
      const errorMessage = getNetworkPrintErrorMessage(error);
      alert(errorMessage);
    } finally {
      setIsScreenLoadingText("");
      setIsScreenLoading(false);
    }
  };

  const handleNetworkPrintCancel = () => {
    setNetworkPrinterDialogOpen(false);
  };

  const handleScanNetwork = async () => {
    setIsScanning(true);
    
    try {
      const result = await discoverNetworkPrinters(BASE_URL);
      
      if (result.success && result.printers.length > 0) {
        setDiscoveredPrinters(result.printers);
        // Auto-select first printer
        setPrinterIP(result.printers[0].ip);
        setPrinterPort(result.printers[0].port.toString());
        alert(`✅ Found ${result.printers.length} printer(s)!\n\nFirst printer selected: ${result.printers[0].ip}:${result.printers[0].port}`);
      } else if (result.success && result.printers.length === 0) {
        alert('⚠️ No printers found on network\n\nMake sure:\n• Printer is powered on\n• Printer is connected to WiFi\n• Printer and server are on same network');
      } else {
        alert(`❌ Scan failed\n\n${result.message}`);
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert('❌ Failed to scan network\n\nPlease enter printer IP manually');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePreviewThermalLR = async () => {
    try {
      setIsScreenLoadingText("Generating Thermal LR Preview...");
      setIsScreenLoading(true);
      
      // Fetch thermal LR preview (PDF with print menu)
      const response = await fetch(
        `${BASE_URL}/api/parcel/preview-lr-thermal/${id}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to generate thermal LR preview");
      }
      
      const blob = await response.blob();
      const pdfURL = URL.createObjectURL(blob);

      // Create iframe to show print menu
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = pdfURL;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };
      
    } catch (error) {
      console.error("Preview error:", error);
      alert("Failed to generate thermal LR preview. Please try again.");
    } finally {
      setIsScreenLoadingText("");
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
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: { xs: "stretch", sm: "center" } }}>
        <button className="button" onClick={handleLRPrint} style={{ flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
          <FaPrint /> Print A4 LR
        </button>
        <button className="button" onClick={handleThermalPreview} style={{ flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
          <FaEye /> Preview Thermal
        </button>
        <button className="button" onClick={handleLRPrintThermal} style={{ flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
          <FaPrint /> Print via QZ Tray
        </button>
        <button className="button" onClick={handleNetworkPrint} style={{ flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
          <FaPrint /> Print via Network
        </button>
        {
          /* Show Edit LR button only for:
             1. Admin (can edit any LR regardless of status)
             2. Source warehouse staff (can edit LRs from their warehouse ONLY when status is "arrived")
             NOT for destination warehouse staff */
          (isAdmin || (isSource && order.sourceWarehouse?.warehouseID === stationCode && order.status === "arrived")) &&
          <Link to={`/user/edit/order/${id}`} style={{ textDecoration: "none", flex: isMobile ? "1 1 45%" : "0 0 auto" }}>
          <button 
            className="button" 
            style={{ 
              width: "100%",
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
              flex: isMobile ? "1 1 45%" : "0 0 auto", 
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
      <Modal open={networkPrinterDialogOpen} onClose={handleNetworkPrintCancel}>
        <Box sx={getModalStyle(colors, isDarkMode)}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <FaPrint style={{ color: isDarkMode ? colors?.accent : "#1E3A5F", fontSize: "2.5rem" }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", textAlign: "center", mb: 1 }}>
            Network Printer Setup
          </Typography>
          <Typography sx={{ color: colors?.textSecondary || "#64748b", textAlign: "center", mb: 2, fontSize: "0.9rem" }}>
            Enter your thermal printer's network details
          </Typography>
          
          {/* Scan Network Button */}
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Button
              variant="outlined"
              onClick={handleScanNetwork}
              disabled={isScanning}
              sx={{
                borderColor: isDarkMode ? colors?.accent : "#1E3A5F",
                color: isDarkMode ? colors?.accent : "#1E3A5F",
                "&:hover": {
                  borderColor: isDarkMode ? colors?.accentHover : "#2d5a87",
                  backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.04)",
                },
                "&:disabled": {
                  borderColor: "#ccc",
                  color: "#999",
                }
              }}
            >
              {isScanning ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Scanning Network...
                </>
              ) : (
                '🔍 Auto-Detect Printer'
              )}
            </Button>
            {discoveredPrinters.length > 0 && (
              <Typography sx={{ color: colors?.accent || "#FFB74D", fontSize: "0.75rem", mt: 1 }}>
                ✓ Found {discoveredPrinters.length} printer(s)
              </Typography>
            )}
          </Box>
          
          <TextField
            fullWidth
            label="Printer IP Address"
            value={printerIP}
            onChange={(e) => setPrinterIP(e.target.value)}
            placeholder="192.168.1.100"
            autoFocus
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                "& fieldset": {
                  borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e0e5eb",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode ? colors?.accent : "#1E3A5F",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? colors?.accent : "#1E3A5F",
                },
              },
              "& .MuiInputLabel-root": {
                color: colors?.textSecondary,
              },
              "& .MuiInputBase-input": {
                color: colors?.textPrimary,
              },
            }}
            helperText="Example: 192.168.1.100 or 10.0.0.50"
          />
          <TextField
            fullWidth
            label="Printer Port"
            value={printerPort}
            onChange={(e) => setPrinterPort(e.target.value)}
            placeholder="9100"
            type="number"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleNetworkPrintConfirm();
              }
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                "& fieldset": {
                  borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e0e5eb",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode ? colors?.accent : "#1E3A5F",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? colors?.accent : "#1E3A5F",
                },
              },
              "& .MuiInputLabel-root": {
                color: colors?.textSecondary,
              },
              "& .MuiInputBase-input": {
                color: colors?.textPrimary,
              },
            }}
            helperText="Default ESC/POS port is 9100"
          />
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            <Button 
              variant="outlined" 
              onClick={handleNetworkPrintCancel}
              sx={{
                borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : "#d1d5db",
                color: colors?.textSecondary,
                "&:hover": {
                  borderColor: isDarkMode ? colors?.accent : "#1E3A5F",
                  backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.04)",
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleNetworkPrintConfirm}
              sx={{ 
                backgroundColor: isDarkMode ? colors?.accent : "#1E3A5F",
                color: isDarkMode ? "#0a1628" : "#fff",
                "&:hover": { 
                  backgroundColor: isDarkMode ? colors?.accentHover : "#2d5a87" 
                } 
              }}
            >
              Print via Network
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Thermal Receipt Preview */}
      {isPreviewOpen && previewData && (
        <ThermalReceiptPreview
          escPosData={previewData}
          onClose={closePreview}
          onPrint={handlePrintFromPreview}
          onReload={handleReloadPreview}
        />
      )}
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
