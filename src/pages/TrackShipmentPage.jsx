import React, { useState } from "react";
import {
  Typography,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Box,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import backImg from "../assets/back2.jpg";
import "../css/main.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TrackShipmentPage = () => {
  const [shipmentIdInput, setShipmentIdInput] = useState("");
  const [shipmentId, setShipmentId] = useState("NA");
  const [status, setStatus] = useState("NA");
  const [shipper, setShipper] = useState("NA");
  const [consignee, setConsignee] = useState("NA");
  const [service, setService] = useState("NA");
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const steps = ["Order Placed", "Shipment Dispatched", "Delivered"];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const getStepColor = (index) => {
    if (currentStep >= index + 1) {
      return index + 1 === currentStep ? "#1E3A5F" : "#82acc2";
    }
    return "#cbd5e1";
  };

  const handleTrack = async () => {
    if (!shipmentIdInput.trim()) {
      toast.warn("Please enter a tracking ID", { position: "bottom-right" });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`${BASE_URL}/api/parcel/track/${shipmentIdInput}`);

      if (!response.ok) {
        toast.error("Error occurred", { position: "bottom-right" });
        setIsLoading(false);
        return;
      }

      if (response.status === 201) {
        toast.warn("Invalid Tracking ID", { position: "bottom-right" });
        setShipmentIdInput("");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (Object.keys(data.body).length) {
        const orderData = data.body;

        if (orderData.completed) {
          setStatus(steps[2]);
          setCurrentStep(3);
        } else {
          if (orderData.status === "arrived") {
            setStatus(steps[0]);
            setCurrentStep(1);
          } else if (orderData.status === "dispatched") {
            setStatus(steps[1]);
            setCurrentStep(2);
          } else {
            setStatus(steps[2]);
            setCurrentStep(3);
          }
        }

        setShipmentId(shipmentIdInput);
        setShipper(orderData.sender.name);
        setConsignee(orderData.receiver.name);
        setService(orderData.items.length);
        setItems(orderData.items);
      }
    } catch (error) {
      toast.error("Failed to track shipment", { position: "bottom-right" });
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleTrack();
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <ToastContainer />

      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 3, md: 5 },
          }}
        >
          {/* Search Card */}
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              overflow: "visible",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography
                variant="h4"
                sx={{
                  color: "#1E3A5F",
                  fontWeight: 700,
                  mb: 1.5,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                Track Your Shipment
              </Typography>
              <Typography sx={{ color: "#64748b", mb: 3, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                Enter your tracking ID to get real-time updates on your package
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                }}
              >
                <TextField
                  variant="outlined"
                  placeholder="Enter Tracking ID (e.g., LR-1234)"
                  value={shipmentIdInput}
                  onChange={(e) => setShipmentIdInput(e.target.value.trim())}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#f8fafc",
                    },
                  }}
                />
                <button
                  className="button button-large"
                  onClick={handleTrack}
                  disabled={isLoading}
                  style={{ minWidth: isSmall ? "100%" : "120px", whiteSpace: "nowrap" }}
                >
                  {isLoading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Track"}
                </button>
              </Box>
            </CardContent>
          </Card>

          {/* Image */}
          {!isMobile && (
            <Box sx={{ flex: 0.8 }}>
              <img
                src={backImg}
                alt="Tracking"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "16px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Results Section */}
      {hasSearched && (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ color: "#1E3A5F", fontWeight: 700, mb: 3 }}>
            Shipment Details
          </Typography>

          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                  gap: 3,
                }}
              >
                <DetailItem label="Tracking ID" value={shipmentId} highlight />
                <DetailItem label="Status" value={status} />
                <DetailItem label="Shipper" value={shipper} />
                <DetailItem label="Consignee" value={consignee} />
                <DetailItem label="Packages" value={service} />
              </Box>

              {/* Progress Tracker */}
              <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e2e8f0" }}>
                <Typography sx={{ color: "#64748b", fontSize: "0.85rem", mb: 2, fontWeight: 600 }}>
                  TRACKING PROGRESS
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: { xs: 2, sm: 0 },
                  }}
                >
                  {steps.map((step, index) => (
                    <React.Fragment key={index}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: getStepColor(index),
                            transition: "all 0.3s ease",
                          }}
                        />
                        <Typography
                          sx={{
                            fontWeight: currentStep >= index + 1 ? 600 : 400,
                            color: getStepColor(index),
                            fontSize: "0.9rem",
                          }}
                        >
                          {step}
                        </Typography>
                      </Box>
                      {index < steps.length - 1 && (
                        <Box
                          sx={{
                            display: { xs: "none", sm: "block" },
                            flex: 1,
                            height: 2,
                            mx: 2,
                            backgroundColor: currentStep > index + 1 ? "#82acc2" : "#e2e8f0",
                            transition: "all 0.3s ease",
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Items Table */}
          {items.length > 0 && (
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography sx={{ color: "#1E3A5F", fontWeight: 700, mb: 2 }}>
                  Items in Package
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }}>Item Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#1E3A5F" }}>Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item._id} hover>
                          <TableCell sx={{ color: "#4a5568" }}>{item.name}</TableCell>
                          <TableCell sx={{ color: "#4a5568" }}>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

// Helper Component
const DetailItem = ({ label, value, highlight }) => (
  <Box>
    <Typography sx={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 500, mb: 0.5 }}>
      {label}
    </Typography>
    <Typography
      sx={{
        color: highlight ? "#1E3A5F" : "#1a1a2e",
        fontWeight: highlight ? 700 : 600,
        fontSize: highlight ? "1.1rem" : "1rem",
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default TrackShipmentPage;
