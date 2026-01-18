import { useState, useEffect, useRef } from "react";
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
  TextField,
  IconButton,
  Checkbox,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ModernSpinner from "../components/ModernSpinner";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";
import {
  useParams,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import { useAuth } from "../routes/AuthContext";
import {
  FaTrash,
  FaExclamationTriangle,
  FaTruckLoading,
  FaPrint,
  FaTruck,
  FaMapMarkerAlt,
  FaFileAlt,
} from "react-icons/fa";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { dateFormatter } from "../utils/dateFormatter";
import { fromDbValue, toDbValue, formatCurrency } from "../utils/currencyUtils";
// import { Delete } from "react-feather";
// import { Memory } from "@mui/icons-material";

const BASE_URL = import.meta.env.VITE_BASE_URL;
let delOrders = [];

export default function ViewLedgerPage() {
  const { id } = useParams();
  const [ledgerData, setLedgerData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totals, setTotals] = useState({ freight: "0.00", hamali: "0.00" });
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  // const [allWarehouse, setAllWarehouse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [counter, setCounter] = useState(0);
  const [allChecked, setAllChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const parcelsList = useRef(new Set());
  const modalData = useRef({
    headingText: "",
    text: "",
    textColor: "",
    icon: "",
    buttonText: "",
    func: () => {},
  });
  const { isAdmin, isSource } = useAuth();
  const navigate = useNavigate();
  const { setIsScreenLoading, setIsScreenLoadingText, isDarkMode, colors } = useOutletContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { dialogState, hideDialog, showError, showSuccess } = useDialog();

  const headerStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: colors?.textSecondary || "#25344E" };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let totalfreight = 0;
    let totalhamali = 0;
    orders.forEach((element) => {
      totalfreight += Number(element.freight) || 0;
      totalhamali += Number(element.hamali) || 0;
    });

    setTotals({
      freight: fromDbValue(totalfreight),
      hamali: fromDbValue(totalhamali),
    });
  }, [orders]);

  const fetchData = async () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/ledger/track/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      showError("Error occurred while fetching memo details", "Error");
      setIsLoading1(false);
      return;
    }
    if (!data.flag) {
      showError("No memo found with this ID", "Memo Not Found");
      setIsLoading1(false);
      return;
    }
    setLedgerData(data.body);
    if (data.body.sourceWarehouse)
      setSourceWarehouse(data.body.sourceWarehouse.warehouseID);
    if (data.body.destinationWarehouse)
      setDestinationWarehouse(data.body.destinationWarehouse.warehouseID);
    setOrders(data.body.parcels);
    setIsLoading1(false);
  };

  // const fetchWarehouse = async () => {
  //   const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
  //   if (response.ok) {
  //     const data = await response.json();
  //     setAllWarehouse(data.body);
  //   }
  // };

  const handleDelete = (index) => {
    delOrders.push(orders[index]._id);
    orders.splice(index, 1);
    setOrders([...orders]);
  };

  const handleModalOpen = (headingText, text, buttonText, textColor, func) => {
    modalData.current.headingText = headingText;
    modalData.current.text = text;
    modalData.current.textColor = textColor;
    modalData.current.buttonText = buttonText;
    modalData.current.func = func;
    setModalOpen(true);
    // setIsScreenLoading(true);
    // setIsScreenLoadingText("Dispatching Memo...");
  };

  const handleDispatch = async () => {
    // Send display values - backend will multiply by 100
    let hamali_freight = orders.map((item) => {
      return {
        trackingId: item.trackingId,
        hamali: parseFloat(fromDbValue(item.hamali)) || 0,
        freight: parseFloat(fromDbValue(item.freight)) || 0,
      };
    });

    if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) {
      showError("Please select station location", "Validation Error");
      return;
    }
    setIsScreenLoading(true);
    setIsScreenLoadingText("Loading Please wait...");
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/ledger/edit/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        parcels: { del: delOrders },
        destinationWarehouse: destinationWarehouse,
        hamali_freight: hamali_freight,
        status: "dispatched",
        ...(isAdmin ? { sourceWarehouse: sourceWarehouse } : {}),
      }),
    });
    setIsScreenLoadingText("");
    setIsScreenLoading(false);
    if (response.ok) {
      showSuccess("Orders dispatched successfully!", "Success");
    } else {
      showError("Error occurred while dispatching orders", "Error");
    }
    setModalOpen(false);
    fetchData();
    setCounter(0);
    // window.location.reload();
  };

  const handleVerify = async () => {
    setIsScreenLoading(true);
    setIsScreenLoadingText("Loading Please Wait...");
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/api/ledger/verify-deliver/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parcels: [...parcelsList.current],
        }),
      }
    );
    if (!response.ok) {
      showError("Error occurred while verifying delivery", "Error");
      setIsScreenLoadingText("");
      setIsScreenLoading(false);
      return;
    }
    const data = await response.json();
    setIsScreenLoadingText("");
    setIsScreenLoading(false);
    if (!data.flag) {
      showError("Error occurred: " + data.message, "Error");
    } else {
      showSuccess("Orders delivered successfully!", "Success");
      setModalOpen(false);
      parcelsList.current.clear();
      setCounter(0);
      fetchData();
    }
  };

  const handleDeleteLedger = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/ledger`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "DELETE",
      body: JSON.stringify({
        ledgerId: id,
      }),
    });

    const data = await res.json();
    setIsLoading(false);
    setModalOpen(false);
    if (data.flag) {
      showSuccess("Memo deleted successfully!", "Success");
      setTimeout(() => {
        navigate("/user/ledgers/all");
      }, 1500);
    } else {
      showError("Error occurred: " + data.message, "Error");
    }
  };

  const handlePrint = async () => {
    try {
      setIsScreenLoading(true);
      setIsScreenLoadingText("Generating Memo Receipt...");
      const response = await fetch(
        `${BASE_URL}/api/ledger/generate-ledger-receipt/${id}`
      );
      const blob = await response.blob();
      const pdfURL = URL.createObjectURL(blob);
      // window.open(pdfURL, "_blank");
      window.location.href = pdfURL;
      // const iframe = document.createElement("iframe");
      // iframe.style.display = "none";
      // iframe.src = pdfURL;

      
      // iframe.addEventListener("load", () => {
      //   iframe.contentWindow?.focus();
      //   iframe.contentWindow?.print();
      // });
      // document.body.appendChild(iframe);
    } catch {
      showError("Failed to load or print the PDF. Please try again.", "Error");
    }
    setIsScreenLoadingText("");
    setIsScreenLoading(false);
  };

  const handleCheckboxChange = (value, isChecked) => {
    if (isChecked) {
      // counter++;
      parcelsList.current.add(value);
      setCounter((prev) => prev + 1);
    } else {
      setCounter((prev) => prev - 1);
      parcelsList.current.delete(value);
      setAllChecked(false);
      // counter--;
    }
  };

  const handleCheckboxAllChange = (isChecked) => {
    if (isChecked) {
      orders.map((order) => parcelsList.current.add(order._id));
      setCounter(orders.length);
      setAllChecked(true);
    } else {
      setCounter(0);
      parcelsList.current.clear();
      setAllChecked(false);
    }
  };

  const handleOrderValueChange = (index, field, value) => {
    const updatedOrders = [...orders];
    // Store as DB value for internal calculations (multiply by 100)
    updatedOrders[index][field] = toDbValue(value);
    setOrders(updatedOrders);
  };

  return (
    <Box
      sx={{
        padding: "20px",
        backgroundColor: colors?.bgPrimary || "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Memo Details Section */}
      <Box
        sx={{
          backgroundColor: colors?.bgCard || "#ffffff",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e0e5eb",
          overflow: "hidden",
        }}
      >
        {isLoading1 ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
            <ModernSpinner size={40} />
          </Box>
        ) : (
          <Box sx={{ padding: { xs: "16px", md: "24px" } }}>
            {/* Top Row: Memo ID, Status, Lorry Freight */}
            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                gap: 2,
                mb: 3,
                pb: 3,
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "14px",
                    background: isDarkMode 
                      ? "linear-gradient(135deg, rgba(255,183,77,0.2) 0%, rgba(255,183,77,0.1) 100%)"
                      : "linear-gradient(135deg, #1E3A5F 0%, #2d4a6f 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaFileAlt size={24} color={isDarkMode ? colors?.accent : "#fff"} />
                </Box>
                <Box>
                  <Typography sx={{ color: colors?.textSecondary, fontSize: "0.75rem", fontWeight: 500, mb: 0.25 }}>
                    Memo Number
                  </Typography>
                  <Typography sx={{ color: colors?.textPrimary, fontSize: "1.4rem", fontWeight: 700 }}>
                    {ledgerData.ledgerId || "N/A"}
                  </Typography>
                </Box>
              </Box>
              
              <Chip 
                label={ledgerData.status?.charAt(0).toUpperCase() + ledgerData.status?.slice(1) || "Loading"} 
                sx={{ 
                  backgroundColor: ledgerData.status === "completed" ? "#22c55e" : ledgerData.status === "dispatched" ? "#f59e0b" : "#ef4444",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  padding: "6px 12px",
                  height: "auto",
                }}
              />
            </Box>

            {/* Route Section - Full Width with Visual Timeline */}
            <Box 
              sx={{ 
                mb: 3,
                pb: 3,
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <FaMapMarkerAlt size={16} color={isDarkMode ? colors?.accent : "#1E3A5F"} />
                <Typography sx={{ color: colors?.textPrimary, fontSize: "0.9rem", fontWeight: 600 }}>
                  Route
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  gap: { xs: 2, md: 4 },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                {/* Source */}
                <Box 
                  sx={{ 
                    flex: 1,
                    backgroundColor: isDarkMode ? "rgba(34, 197, 94, 0.1)" : "#f0fdf4",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    border: isDarkMode ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>A</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: isDarkMode ? "#86efac" : "#166534", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      From
                    </Typography>
                    <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                      {ledgerData.sourceWarehouse?.name || "N/A"}
                    </Typography>
                  </Box>
                </Box>

                {/* Arrow/Line */}
                <Box 
                  sx={{ 
                    display: { xs: "none", sm: "flex" },
                    alignItems: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <Box sx={{ width: 40, height: 2, backgroundColor: isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1" }} />
                  <FaTruck size={20} color={isDarkMode ? colors?.accent : "#1E3A5F"} style={{ margin: "0 8px" }} />
                  <Box sx={{ width: 40, height: 2, backgroundColor: isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1" }} />
                </Box>
                
                {/* Mobile Arrow */}
                <Box sx={{ display: { xs: "block", sm: "none" } }}>
                  <Typography sx={{ color: colors?.textSecondary, fontSize: "1.2rem" }}>↓</Typography>
                </Box>

                {/* Destination */}
                <Box 
                  sx={{ 
                    flex: 1,
                    backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#fef2f2",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    border: isDarkMode ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>B</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: isDarkMode ? "#fca5a5" : "#991b1b", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      To
                    </Typography>
                    <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                      {ledgerData.destinationWarehouse?.name || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Bottom Row: Info Cards Grid */}
            <Box 
              sx={{ 
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" },
                gap: 2,
              }}
            >
              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Truck No
                </Typography>
                <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                  {ledgerData.vehicleNo || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Driver Name
                </Typography>
                <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                  {ledgerData.driverName || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Driver Phone
                </Typography>
                <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                  {ledgerData.driverPhone || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Created On
                </Typography>
                <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                  {dateFormatter(ledgerData.dispatchedAt) || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Delivered On
                </Typography>
                <Typography sx={{ color: ledgerData.deliveredAt ? (isDarkMode ? "#86efac" : "#166534") : colors?.textSecondary, fontWeight: 600, fontSize: "0.95rem" }}>
                  {dateFormatter(ledgerData.deliveredAt) || "Pending"}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,183,77,0.1)" : "#fffbeb", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,183,77,0.2)" : "1px solid #fde68a" }}>
                <Typography sx={{ color: isDarkMode ? colors?.accent : "#92400e", fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Lorry Freight
                </Typography>
                <Typography sx={{ color: isDarkMode ? colors?.accent : "#1E3A5F", fontWeight: 700, fontSize: "1.05rem" }}>
                  {formatCurrency(ledgerData.lorryFreight || 0)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Action Buttons Above Table */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, justifyContent: "center" }}>
        <button className="button button-large" onClick={handlePrint}>
          <FaPrint style={{ marginRight: "8px" }} />
          Download Memo
        </button>

        {(isSource || isAdmin) && ledgerData.status === "pending" && (
          <button
            className="button button-large"
            onClick={() =>
              handleModalOpen(
                "Dispatch Truck",
                "Are you sure you want to dispatch this truck?",
                "Dispatch",
                "#25344e",
                handleDispatch
              )
            }
          >
            <FaTruckLoading style={{ marginRight: "8px" }} />
            Dispatch Truck
          </button>
        )}

        {(!isSource || isAdmin) && (
          <button
            className="button button-large"
            onClick={() =>
              handleModalOpen(
                "Deliver Truck",
                "Are you sure you want to mark this truck as delivered?",
                "Deliver",
                "#25344e",
                handleVerify
              )
            }
          >
            <TbTruckDelivery size="19" style={{ marginRight: "8px" }} />
            Deliver Truck
          </button>
        )}

        {isAdmin && (
          <button
            className="button button-large"
            onClick={() =>
              handleModalOpen(
                "Delete Memo",
                "Are you sure you want to delete this memo? This action cannot be undone.",
                "Delete",
                "#d32f2f",
                handleDeleteLedger
              )
            }
          >
            <FaTrash style={{ marginRight: "8px" }} /> Delete Memo
          </button>
        )}
      </Box>

      {/* Memo Table */}
      <Box sx={{ backgroundColor: colors?.bgCard || "#ffffff", borderRadius: "12px", boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden", border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb" }}>
        <Typography variant="h6" sx={{ padding: "16px", ...headerStyle }}>
          <Checkbox
            size="small"
            onChange={(e) => handleCheckboxAllChange(e.target.checked)}
          />
          Memo orders ({counter}/{orders.length})
        </Typography>
        
        {/* Mobile Card View */}
        {isMobile ? (
          <Box sx={{ p: 2, pt: 0 }}>
            {isLoading1 ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <ModernSpinner size={36} />
              </Box>
            ) : orders.length !== 0 ? (
              <>
                {orders.map((order, index) => (
                  <Card key={order.trackingId} sx={{ mb: 1.5, borderRadius: 2, boxShadow: isDarkMode ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.06)", backgroundColor: colors?.bgCard || "#ffffff", border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb" }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Checkbox
                            size="small"
                            checked={parcelsList.current.has(order._id)}
                            onChange={(e) => handleCheckboxChange(order._id, e.target.checked)}
                          />
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", fontSize: "0.95rem" }}>
                              {index + 1}. {order.trackingId}
                            </Typography>
                            <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem" }}>
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} packages
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {ledgerData.status === "pending" && (
                            <IconButton size="small" color="error" onClick={() => handleDelete(index)}>
                              <FaTrash size={16} />
                            </IconButton>
                          )}
                          <IconButton size="small" color="primary" target="_blank" href={`/user/view/order/${order.trackingId}`}>
                            <IoArrowForwardCircleOutline size={20} />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, fontSize: "0.85rem" }}>
                        <Box>
                          <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.7rem" }}>Sender</Typography>
                          <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500, fontSize: "0.85rem" }}>{order.sender.name}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.7rem" }}>Receiver</Typography>
                          <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 500, fontSize: "0.85rem" }}>{order.receiver.name}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2, mt: 1.5, pt: 1.5, borderTop: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f1f5f9" }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.7rem", mb: 0.5 }}>Freight</Typography>
                          <TextField
                            type="text"
                            size="small"
                            value={fromDbValue(order.freight)}
                            onChange={(e) => handleOrderValueChange(index, "freight", e.target.value)}
                            InputProps={{ readOnly: ledgerData.status !== "pending" }}
                            sx={{ 
                              width: "100%",
                              "& .MuiInputBase-input": { 
                                fontSize: "0.85rem", 
                                fontWeight: 600, 
                                color: colors?.textPrimary || "#1E3A5F",
                                padding: "6px 8px",
                                backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.02)",
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.7rem", mb: 0.5 }}>Hamali</Typography>
                          <TextField
                            type="text"
                            size="small"
                            value={fromDbValue(order.hamali)}
                            onChange={(e) => handleOrderValueChange(index, "hamali", e.target.value)}
                            InputProps={{ readOnly: ledgerData.status !== "pending" }}
                            sx={{ 
                              width: "100%",
                              "& .MuiInputBase-input": { 
                                fontSize: "0.85rem", 
                                fontWeight: 600, 
                                color: colors?.textPrimary || "#1E3A5F",
                                padding: "6px 8px",
                                backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.02)",
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.7rem", mb: 0.5 }}>Statistical Charges</Typography>
                          <TextField
                            type="text"
                            size="small"
                            value={fromDbValue(order.hamali)}
                            InputProps={{ readOnly: true }}
                            sx={{ 
                              width: "100%",
                              "& .MuiInputBase-input": { 
                                fontSize: "0.85rem", 
                                fontWeight: 600, 
                                color: colors?.textPrimary || "#1E3A5F",
                                padding: "6px 8px",
                                backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                {/* Mobile Totals */}
                <Card sx={{ mt: 2, borderRadius: 2, backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", mb: 1 }}>Totals</Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.7rem" }}>Freight</Typography>
                        <Typography sx={{ color: isDarkMode ? colors?.accent : colors?.textPrimary || "#1E3A5F", fontWeight: 700 }}>₹{totals.freight}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.7rem" }}>Hamali</Typography>
                        <Typography sx={{ color: isDarkMode ? colors?.accent : colors?.textPrimary || "#1E3A5F", fontWeight: 700 }}>₹{totals.hamali}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.7rem" }}>Statistical Charges</Typography>
                        <Typography sx={{ color: isDarkMode ? colors?.accent : colors?.textPrimary || "#1E3A5F", fontWeight: 700 }}>₹{totals.hamali}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, color: colors?.textSecondary || "#64748b" }}>No orders in this memo.</Box>
            )}
          </Box>
        ) : (
          /* Desktop Table View */
          <TableContainer component={Paper} sx={{ boxShadow: "none", backgroundColor: colors?.bgCard || "#ffffff" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
                  <TableCell sx={headerStyle}></TableCell>
                  <TableCell sx={headerStyle}>Sl No.</TableCell>
                  <TableCell sx={headerStyle}>LR No.</TableCell>
                  <TableCell sx={headerStyle}>Packages</TableCell>
                  <TableCell sx={headerStyle}>Sender</TableCell>
                  <TableCell sx={headerStyle}>Receiver</TableCell>
                  <TableCell sx={headerStyle}>Freight</TableCell>
                  <TableCell sx={headerStyle}>Hamali</TableCell>
                  <TableCell sx={headerStyle}>Statistical Charges</TableCell>
                  {ledgerData.status === "pending" && (
                    <TableCell sx={headerStyle}>Actions</TableCell>
                  )}
                  <TableCell sx={headerStyle}>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading1 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                      <ModernSpinner size={28} />
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.length !== 0 &&
                  orders.map((order, index) => (
                    <TableRow key={order.trackingId}>
                      <TableCell sx={rowStyle}>
                        <Checkbox
                          checked={parcelsList.current.has(order._id)}
                          onChange={(e) => handleCheckboxChange(order._id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell sx={rowStyle}>{index + 1}.</TableCell>
                      <TableCell sx={rowStyle}>{order.trackingId}</TableCell>
                      <TableCell sx={rowStyle}>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                      <TableCell sx={rowStyle}>{order.sender.name}</TableCell>
                      <TableCell sx={rowStyle}>{order.receiver.name}</TableCell>
                      <TableCell sx={rowStyle}>
                        <TextField 
                          type="text" 
                          size="small" 
                          value={fromDbValue(order.freight)}
                          onChange={(e) => handleOrderValueChange(index, "freight", e.target.value)}
                          InputProps={{ readOnly: ledgerData.status !== "pending" }}
                          sx={{ 
                            width: 80,
                            "& .MuiInputBase-input": { 
                              color: colors?.textPrimary || "#1E3A5F",
                              backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.02)",
                            }
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={rowStyle}>
                        <TextField 
                          type="text" 
                          size="small" 
                          value={fromDbValue(order.hamali)}
                          onChange={(e) => handleOrderValueChange(index, "hamali", e.target.value)}
                          InputProps={{ readOnly: ledgerData.status !== "pending" }}
                          sx={{ 
                            width: 80,
                            "& .MuiInputBase-input": { 
                              color: colors?.textPrimary || "#1E3A5F",
                              backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.02)",
                            }
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={rowStyle}>
                        <TextField 
                          type="text" 
                          size="small" 
                          value={fromDbValue(order.hamali)}
                          InputProps={{ readOnly: true }}
                          sx={{ 
                            width: 80,
                            "& .MuiInputBase-input": { 
                              color: colors?.textPrimary || "#1E3A5F",
                              backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                            }
                          }} 
                        />
                      </TableCell>
                      {ledgerData.status === "pending" && (
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(index)}
                          >
                            <FaTrash size={20} />
                          </IconButton>
                        </TableCell>
                      )}
                      <TableCell>
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
                )}

                {/* Totals Row */}
                <TableRow>
                  <TableCell sx={rowStyle}></TableCell>
                  <TableCell colSpan={2} sx={{ ...headerStyle }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                    {orders.reduce((sum, order) => sum + order.items.length, 0)}
                  </TableCell>
                  <TableCell sx={rowStyle}></TableCell>
                  <TableCell sx={rowStyle}></TableCell>
                  <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                    {totals.freight}
                  </TableCell>
                  <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                    {totals.hamali}
                  </TableCell>
                  <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                    {totals.hamali}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Deliver Truck Button at bottom of table if more than 10 entries */}
        {orders.length > 10 && (isSource || isAdmin) && ledgerData.status === "dispatched" && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <button
              className="button button-large"
              onClick={() =>
                handleModalOpen(
                  "Deliver Truck",
                  "Are you sure you want to mark this truck as delivered?",
                  "Deliver",
                  "#25344e",
                  handleVerify
                )
              }
            >
              <TbTruckDelivery size="19" style={{ marginRight: "8px" }} />
              Deliver Truck
            </button>
          </Box>
        )}
      </Box>

      {/* Modern Glass Confirmation Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1300,
              padding: "16px",
            }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "420px",
                background: isDarkMode
                  ? "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: isDarkMode
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: modalData.current.textColor === "#d32f2f" 
                    ? "rgba(211, 47, 47, 0.1)" 
                    : isDarkMode ? "rgba(255, 183, 77, 0.15)" : "rgba(30, 58, 95, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <FaExclamationTriangle
                  style={{
                    color: modalData.current.textColor === "#d32f2f" 
                      ? "#d32f2f" 
                      : isDarkMode ? colors?.accent : "#1E3A5F",
                    fontSize: "28px",
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: colors?.textPrimary || "#1E3A5F",
                  fontSize: "1.25rem",
                }}
              >
                {modalData.current.headingText}
              </Typography>
              <Typography
                sx={{
                  marginBottom: "28px",
                  color: colors?.textSecondary || "#64748b",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                }}
              >
                {modalData.current.text}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                    color: colors?.textPrimary || "#1E3A5F",
                    borderRadius: "12px",
                    padding: "10px 24px",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    },
                  }}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: modalData.current.textColor === "#d32f2f" 
                      ? "#d32f2f" 
                      : isDarkMode ? colors?.accent : "#1E3A5F",
                    color: modalData.current.textColor === "#d32f2f" || !isDarkMode ? "#fff" : "#1E3A5F",
                    borderRadius: "12px",
                    padding: "10px 24px",
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: modalData.current.textColor === "#d32f2f" 
                        ? "#b71c1c" 
                        : isDarkMode ? colors?.accentHover : "#152a45",
                      boxShadow: "none",
                    },
                  }}
                  onClick={modalData.current.func}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ModernSpinner size={20} />
                  ) : (
                    modalData.current.buttonText
                  )}
                </Button>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
