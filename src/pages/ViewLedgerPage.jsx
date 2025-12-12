import React, { useState, useEffect, useRef } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  CircularProgress,
  Checkbox,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
  Fab,
  Tooltip,
  Zoom,
} from "@mui/material";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";
import {
  useParams,
  useNavigate,
  Link,
  useOutletContext,
} from "react-router-dom";
import ledger from "../assets/ledger.jpg";
import { useAuth } from "../routes/AuthContext";
import {
  FaTrash,
  FaExclamationTriangle,
  FaTruckLoading,
  FaPrint,
} from "react-icons/fa";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { dateFormatter } from "../utils/dateFormatter";
// import { Delete } from "react-feather";
// import { Memory } from "@mui/icons-material";

const BASE_URL = import.meta.env.VITE_BASE_URL;
let delOrders = [];

export default function ViewLedgerPage() {
  const { id } = useParams();
  const [ledgerData, setLedgerData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totals, setTotals] = useState({ freight: 0, hamali: 0, charges: 0 });
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  // const [allWarehouse, setAllWarehouse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [counter, setCounter] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
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
  const { setIsScreenLoading, setIsScreenLoadingText } = useOutletContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { dialogState, hideDialog, showAlert, showError, showSuccess } = useDialog();

  const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: "#25344E" };

  useEffect(() => {
    // fetchWarehouse();
    fetchData();
  }, []);

  useEffect(() => {
    let totalfreight = 0;
    let totalhamali = 0;
    let totalcharges = 0;
    orders.forEach((element) => {
      totalfreight += element.freight;
      totalhamali += element.hamali;
      totalcharges += element.charges;
    });

    setTotals({
      freight: totalfreight,
      hamali: totalhamali,
      charges: totalcharges,
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
    console.log(data.body);
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
    let hamali_freight = orders.map((item) => {
      return {
        trackingId: item.trackingId,
        hamali: item.hamali,
        freight: item.freight,
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
    } catch (error) {
      showError("Failed to load or print the PDF. Please try again.", "Error");
    }
    setIsScreenLoadingText("");
    setIsScreenLoading(false);
  };

  const handleCheckboxChange = (value) => {
    // console.log(value);
    if (value) {
      // counter++;
      setCounter((prev) => prev + 1);
    } else {
      setCounter((prev) => prev - 1);
      // counter--;
    }
  };

  const handleOrderValueChange = (index, field, value) => {
    const updatedOrders = [...orders];
    updatedOrders[index][field] = parseInt(value) || 0;
    setOrders(updatedOrders);
  };

  return (
    <Box
      sx={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Top Section: Memo Details + Image */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "flex-start",
          alignItems: { xs: "stretch", md: "flex-start" },
          backgroundColor: "#ffffff",
          padding: { xs: "16px", md: "20px" },
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {/* Left Section - Text Content */}
        <Box sx={{ flex: 1, textAlign: "left" }}>
          <Typography
            variant="h5"
            sx={{ marginBottom: "16px", fontSize: { xs: "1.25rem", md: "1.5rem" }, ...headerStyle }}
          >
            Memo Details
          </Typography>

          {/* Conditional Loader for Data */}
          {isLoading1 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: "grid", 
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
                gap: { xs: 2, md: 3 },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Memo No</Typography>
                  <Typography sx={{ ...rowStyle, fontWeight: 600 }}>{ledgerData.ledgerId}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Source Station</Typography>
                  <Typography sx={rowStyle}>{ledgerData.sourceWarehouse?.name || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Destination Station</Typography>
                  <Typography sx={rowStyle}>{ledgerData.destinationWarehouse?.name || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Status</Typography>
                  <Chip 
                    label={ledgerData.status?.charAt(0).toUpperCase() + ledgerData.status?.slice(1)} 
                    size="small"
                    sx={{ 
                      width: "fit-content",
                      backgroundColor: ledgerData.status === "completed" ? "#dcfce7" : ledgerData.status === "dispatched" ? "#fef3c7" : "#fee2e2",
                      color: ledgerData.status === "completed" ? "#166534" : ledgerData.status === "dispatched" ? "#92400e" : "#991b1b",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Lorry Freight</Typography>
                  <Typography sx={rowStyle}>{ledgerData.lorryFreight || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Created On</Typography>
                  <Typography sx={rowStyle}>{dateFormatter(ledgerData.dispatchedAt) || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Delivered On</Typography>
                  <Typography sx={rowStyle}>{dateFormatter(ledgerData.deliveredAt) || "N/A"}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Truck No</Typography>
                  <Typography sx={{ ...rowStyle, fontWeight: 600 }}>{ledgerData.vehicleNo || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Driver Name</Typography>
                  <Typography sx={rowStyle}>{ledgerData.driverName || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>Driver Phone</Typography>
                  <Typography sx={rowStyle}>{ledgerData.driverPhone || "N/A"}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Section - Image (hidden on mobile) */}
        <Box sx={{ display: { xs: "none", lg: "block" }, flex: "0 0 120px", marginLeft: "20px" }}>
          <img
            src={ledger}
            alt="Memo"
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
        </Box>
      </Box>

      {/* Action Buttons Above Table */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, justifyContent: "center" }}>
        <button className="button button-large" onClick={handlePrint}>
          <FaPrint style={{ marginRight: "8px" }} />
          Download Memo
        </button>

        {isAdmin && (
          <button
            className="button button-large"
            onClick={() =>
              handleModalOpen(
                "Delete Memo",
                "Are you sure you want to delete this?",
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
      <Box sx={{ backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <Typography variant="h6" sx={{ padding: "16px", ...headerStyle }}>
          Memo orders ({counter}/{orders.length})
        </Typography>
        
        {/* Mobile Card View */}
        {isMobile ? (
          <Box sx={{ p: 2, pt: 0 }}>
            {isLoading1 ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress sx={{ color: "#1E3A5F" }} />
              </Box>
            ) : orders.length !== 0 ? (
              <>
                {orders.map((order, index) => (
                  <Card key={order.trackingId} sx={{ mb: 1.5, borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Checkbox
                            size="small"
                            onChange={(e) => handleCheckboxChange(e.target.checked)}
                          />
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem" }}>
                              {index + 1}. {order.trackingId}
                            </Typography>
                            <Typography sx={{ color: "#64748b", fontSize: "0.75rem" }}>
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
                          <Typography sx={{ color: "#64748b", fontSize: "0.7rem" }}>Sender</Typography>
                          <Typography sx={{ color: "#1E3A5F", fontWeight: 500, fontSize: "0.85rem" }}>{order.sender.name}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ color: "#64748b", fontSize: "0.7rem" }}>Receiver</Typography>
                          <Typography sx={{ color: "#1E3A5F", fontWeight: 500, fontSize: "0.85rem" }}>{order.receiver.name}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2, mt: 1.5, pt: 1.5, borderTop: "1px solid #f1f5f9" }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: "#64748b", fontSize: "0.7rem", mb: 0.5 }}>Freight</Typography>
                          <TextField
                            type="number"
                            size="small"
                            value={order.freight}
                            onChange={(e) => handleOrderValueChange(index, 'freight', e.target.value)}
                            sx={{ 
                              width: "100%",
                              "& .MuiInputBase-input": { 
                                fontSize: "0.85rem", 
                                fontWeight: 600, 
                                color: "#1E3A5F",
                                padding: "6px 8px"
                              }
                            }}
                            InputProps={{
                              startAdornment: <Typography sx={{ color: "#64748b", fontSize: "0.85rem", mr: 0.5 }}>₹</Typography>
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: "#64748b", fontSize: "0.7rem", mb: 0.5 }}>Hamali</Typography>
                          <TextField
                            type="number"
                            size="small"
                            value={order.hamali}
                            onChange={(e) => handleOrderValueChange(index, 'hamali', e.target.value)}
                            sx={{ 
                              width: "100%",
                              "& .MuiInputBase-input": { 
                                fontSize: "0.85rem", 
                                fontWeight: 600, 
                                color: "#1E3A5F",
                                padding: "6px 8px"
                              }
                            }}
                            InputProps={{
                              startAdornment: <Typography sx={{ color: "#64748b", fontSize: "0.85rem", mr: 0.5 }}>₹</Typography>
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: "#64748b", fontSize: "0.7rem", mb: 0.5 }}>Charges</Typography>
                          <TextField
                            type="number"
                            size="small"
                            value={order.charges}
                            onChange={(e) => handleOrderValueChange(index, 'charges', e.target.value)}
                            sx={{ 
                              width: "100%",
                              "& .MuiInputBase-input": { 
                                fontSize: "0.85rem", 
                                fontWeight: 600, 
                                color: "#1E3A5F",
                                padding: "6px 8px"
                              }
                            }}
                            InputProps={{
                              startAdornment: <Typography sx={{ color: "#64748b", fontSize: "0.85rem", mr: 0.5 }}>₹</Typography>
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                {/* Mobile Totals */}
                <Card sx={{ mt: 2, borderRadius: 2, backgroundColor: "#f8fafc" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography sx={{ fontWeight: 700, color: "#1E3A5F", mb: 1 }}>Totals</Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#64748b", fontSize: "0.7rem" }}>Freight</Typography>
                        <Typography sx={{ color: "#1E3A5F", fontWeight: 700 }}>₹{totals.freight}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#64748b", fontSize: "0.7rem" }}>Hamali</Typography>
                        <Typography sx={{ color: "#1E3A5F", fontWeight: 700 }}>₹{totals.hamali}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#64748b", fontSize: "0.7rem" }}>Charges</Typography>
                        <Typography sx={{ color: "#1E3A5F", fontWeight: 700 }}>₹{totals.charges}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, color: "#64748b" }}>No orders in this memo.</Box>
            )}
          </Box>
        ) : (
          /* Desktop Table View */
          <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
            <Table>
              <TableHead>
                <TableRow>
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
                    <TableCell colSpan={11} align="center">
                      <CircularProgress
                        size={22}
                        className="spinner"
                        sx={{ color: "#1E3A5F", animation: "none !important" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.length !== 0 &&
                  orders.map((order, index) => (
                    <TableRow key={order.trackingId}>
                      <TableCell sx={rowStyle}>
                        <Checkbox
                          onChange={(e) => handleCheckboxChange(e.target.checked)}
                        />
                      </TableCell>
                      <TableCell sx={rowStyle}>{index + 1}.</TableCell>
                      <TableCell sx={rowStyle}>{order.trackingId}</TableCell>
                      <TableCell sx={rowStyle}>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                      <TableCell sx={rowStyle}>{order.sender.name}</TableCell>
                      <TableCell sx={rowStyle}>{order.receiver.name}</TableCell>
                      <TableCell sx={rowStyle}>
                        <TextField 
                          type="number" 
                          size="small" 
                          value={order.freight} 
                          onChange={(e) => handleOrderValueChange(index, 'freight', e.target.value)}
                          sx={{ width: 80 }} 
                        />
                      </TableCell>
                      <TableCell sx={rowStyle}>
                        <TextField 
                          type="number" 
                          size="small" 
                          value={order.hamali} 
                          onChange={(e) => handleOrderValueChange(index, 'hamali', e.target.value)}
                          sx={{ width: 80 }} 
                        />
                      </TableCell>
                      <TableCell sx={rowStyle}>
                        <TextField 
                          type="number" 
                          size="small" 
                          value={order.charges} 
                          onChange={(e) => handleOrderValueChange(index, 'charges', e.target.value)}
                          sx={{ width: 80 }} 
                        />
                      </TableCell>
                      {ledgerData.status === "pending" && (
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={(e) => handleDelete(index)}
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
                    {totals.charges}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Desktop Action Buttons */}
      <Box sx={{ display: { xs: "none", md: "flex" }, flexWrap: "wrap", gap: 1, mt: 2 }}>
        {(isSource || isAdmin) && ledgerData.status === "pending" && (
          <button
            className="button button-large"
            onClick={() =>
              handleModalOpen(
                "Dispatch Truck",
                "",
                "Confirm",
                "#25344e",
                handleDispatch
              )
            }
          >
            <FaTruckLoading style={{ marginRight: "8px" }} />
            Dispatch Truck
          </button>
        )}
        {(isSource || isAdmin) && ledgerData.status === "dispatched" && (
          <button
            className="button button-large"
            onClick={() =>
              handleModalOpen(
                "Deliver Truck",
                "",
                "Confirm",
                "#25344e",
                handleVerify
              )
            }
          >
            <TbTruckDelivery size="19" style={{ marginRight: "8px" }} />
            Deliver Truck
          </button>
        )}
      </Box>

      {/* Mobile Action Buttons */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexWrap: "wrap", gap: 1, mt: 2 }}>
        {(isSource || isAdmin) && ledgerData.status === "pending" && (
          <button
            className="button button-large"
            onClick={() =>
              handleModalOpen(
                "Dispatch Truck",
                "",
                "Confirm",
                "#25344e",
                handleDispatch
              )
            }
          >
            <FaTruckLoading style={{ marginRight: "8px" }} />
            Dispatch Truck
          </button>
        )}
        {(isSource || isAdmin) && ledgerData.status === "dispatched" && (
          <button
            className="button button-large"
            onClick={() =>
              handleModalOpen(
                "Deliver Truck",
                "",
                "Confirm",
                "#25344e",
                handleVerify
              )
            }
          >
            <TbTruckDelivery size="19" style={{ marginRight: "8px" }} />
            Deliver Truck
          </button>
        )}
      </Box>

      {/* Confirmation Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 350,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <FaExclamationTriangle
            style={{
              color: modalData.current.textColor,
              fontSize: "36px",
              marginBottom: "12px",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              marginBottom: "12px",
              color: modalData.current.textColor,
            }}
          >
            {modalData.current.headingText}
          </Typography>
          <Typography
            sx={{
              marginBottom: "20px",
              color: "#374151",
              fontSize: "15px",
            }}
          >
            {modalData.current.text}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Button
              variant="outlined"
              sx={{ borderColor: "#1E3A5F", color: "#1E3A5F" }}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: modalData.current.textColor,
                display: "flex",
                gap: "8px",
              }}
              onClick={modalData.current.func}
            >
              {modalData.current.buttonText}
              {isLoading && (
                <CircularProgress
                  size={15}
                  className="spinner"
                  sx={{ color: "#fff", animation: "none !important", ml: 1 }}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
      
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
