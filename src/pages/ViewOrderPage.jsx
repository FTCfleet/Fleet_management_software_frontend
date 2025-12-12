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
import { FaEdit, FaTrash, FaPrint, FaExclamationTriangle } from "react-icons/fa";
import { dateFormatter } from "../utils/dateFormatter";
import { useAuth } from "../routes/AuthContext";
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
  const [qrCount, setQrCount] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const { setIsScreenLoading, setIsScreenLoadingText } = useOutletContext();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const hasTriggered = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchData();
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
      handleLRPrint();
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
      window.location.href = pdfURL;
    } catch (error) {
      alert("Failed to load or print the PDF.");
    }
    setIsScreenLoadingText("");
    setIsScreenLoading(false);
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
    <Box sx={{ minHeight: "100%", backgroundColor: "#f8fafc" }}>
      {/* Order Details Card */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F" }}>
                LR Details
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>#{id}</Typography>
            </Box>
            <Chip
              label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              sx={{ backgroundColor: statusColor.bg, color: statusColor.color, fontWeight: 600 }}
            />
          </Box>

          {isLoading1 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#1E3A5F" }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Sender Info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1E3A5F", mb: 1.5, fontSize: "0.9rem" }}>
                    SENDER DETAILS
                  </Typography>
                  <DetailRow label="Name" value={order.sender?.name} />
                  <DetailRow label="Phone" value={order.sender?.phoneNo} />
                  <DetailRow label="Address" value={order.sender?.address} />
                  <DetailRow label="GST" value={order.sender?.gst || "N/A"} />
                  <DetailRow label="Station" value={order.sourceWarehouse?.name} />
                </Box>
              </Grid>

              {/* Receiver Info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1E3A5F", mb: 1.5, fontSize: "0.9rem" }}>
                    RECEIVER DETAILS
                  </Typography>
                  <DetailRow label="Name" value={order.receiver?.name} />
                  <DetailRow label="Phone" value={order.receiver?.phoneNo} />
                  <DetailRow label="Address" value={order.receiver?.address} />
                  <DetailRow label="GST" value={order.receiver?.gst || "N/A"} />
                  <DetailRow label="Station" value={order.destinationWarehouse?.name} />
                </Box>
              </Grid>

              {/* Order Info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1E3A5F", mb: 1.5, fontSize: "0.9rem" }}>
                    ORDER INFO
                  </Typography>
                  <DetailRow label="Payment" value={order.payment} />
                  <DetailRow label="Total" value={`₹${order.freight + order.hamali * 2}`} highlight />
                  <DetailRow label="Freight" value={`₹${order.freight}`} />
                  <DetailRow label="Hamali" value={`₹${order.hamali}`} />
                  <DetailRow label="Packages" value={order.items?.reduce((sum, x) => sum + x.quantity, 0)} />
                  <DetailRow label="Door Delivery" value={order.isDoorDelivery ? `₹${order.doorDeliveryCharge}` : "No"} />
                </Box>
              </Grid>

              {/* Meta Info */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                    gap: 2,
                    pt: 2, 
                    mt: 1,
                    borderTop: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <MetaItem label="Added by" value={order.addedBy?.name} />
                  <MetaItem label="Created" value={dateFormatter(order.placedAt)} />
                  <MetaItem label="Modified by" value={order.lastModifiedBy?.name} />
                  <MetaItem label="Modified" value={dateFormatter(order.lastModifiedAt)} />
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography sx={{ fontWeight: 700, color: "#1E3A5F", mb: 2 }}>Items in Package</Typography>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }} align="center">Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }} align="right">Freight</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }} align="right">Hamali</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }} align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading1 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} sx={{ color: "#1E3A5F" }} />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {order.items.map((item, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ color: "#64748b" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ color: "#1E3A5F", fontWeight: 500 }}>{item.name}</TableCell>
                        <TableCell sx={{ color: "#64748b" }}>{item.itemType?.name}</TableCell>
                        <TableCell align="center" sx={{ color: "#64748b" }}>{item.quantity}</TableCell>
                        <TableCell align="right" sx={{ color: "#64748b" }}>₹{item.freight}</TableCell>
                        <TableCell align="right" sx={{ color: "#64748b" }}>₹{item.hamali}</TableCell>
                        <TableCell align="right" sx={{ color: "#1E3A5F", fontWeight: 500 }}>
                          ₹{(item.freight + 2 * item.hamali) * item.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 600, color: "#1E3A5F" }}>Total</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: "#1E3A5F" }}>
                        {order.items?.reduce((prev, item) => prev + item.quantity, 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: "#1E3A5F" }}>₹{order.freight}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: "#1E3A5F" }}>₹{order.hamali}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1E3A5F" }}>
                        ₹{order.freight + order.hamali * 2}
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
          <FaPrint /> Download Receipt
        </button>
        <Link to={`/user/edit/order/${id}`} style={{ textDecoration: "none", flex: isMobile ? "1 1 45%" : "0 0 auto" }}>
          <button className="button" style={{ width: "100%" }}>
            <FaEdit /> Edit LR
          </button>
        </Link>
        {isAdmin && (
          <button
            className="button button-danger"
            onClick={() => setDeleteModalOpen(true)}
            style={{ flex: isMobile ? "1 1 45%" : "0 0 auto", backgroundColor: "#dc2626" }}
          >
            <FaTrash /> Delete
          </button>
        )}
      </Box>

      {/* Delete Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box sx={modalStyle}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <FaExclamationTriangle style={{ color: "#dc2626", fontSize: "2.5rem" }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#dc2626", textAlign: "center", mb: 1 }}>
            Delete LR
          </Typography>
          <Typography sx={{ color: "#64748b", textAlign: "center", mb: 3 }}>
            This action cannot be undone. Are you sure?
          </Typography>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            <Button variant="outlined" onClick={() => setDeleteModalOpen(false)}>
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
    </Box>
  );
}

// Helper Components
const DetailRow = ({ label, value, highlight }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
    <Typography sx={{ color: "#64748b", fontSize: "0.85rem" }}>{label}</Typography>
    <Typography sx={{ color: highlight ? "#1E3A5F" : "#1a1a2e", fontWeight: highlight ? 700 : 500, fontSize: "0.85rem" }}>
      {value || "—"}
    </Typography>
  </Box>
);

const MetaItem = ({ label, value }) => (
  <Box>
    <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>{label}</Typography>
    <Typography sx={{ color: "#1E3A5F", fontSize: "0.85rem", fontWeight: 500 }}>{value || "—"}</Typography>
  </Box>
);

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 380,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
};
