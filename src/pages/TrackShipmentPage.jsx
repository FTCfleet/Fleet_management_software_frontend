import React, { useState } from "react";
import { Typography, TextField, Table, TableContainer, TableHead, TableBody, TableRow, TableCell, CircularProgress, Box, useTheme, useMediaQuery } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FaSearch, FaBox, FaTruck, FaCheckCircle, FaMapMarkerAlt, FaUser, FaCubes } from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";
import backImg from "../assets/back2.webp";
import "../css/glassmorphism.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const GlassCard = ({ children, sx = {}, hover = true, ...props }) => (
  <Box sx={{ background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "24px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", ...(hover && { "&:hover": { transform: "translateY(-4px)", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)", borderColor: "rgba(255, 183, 77, 0.3)" } }), ...sx }} {...props}>{children}</Box>
);

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

  const steps = [
    { label: "Order Placed", icon: <FaBox /> },
    { label: "Dispatched", icon: <FaTruck /> },
    { label: "Delivered", icon: <FaCheckCircle /> }
  ];
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fadeIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } } };

  const handleTrack = async () => {
    const trackingId = shipmentIdInput.trim().toUpperCase();
    if (!trackingId) {
      toast.warn("Please enter a tracking ID", { position: "bottom-right" });
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`${BASE_URL}/api/parcel/track/${trackingId}`);
      if (!response.ok) { toast.error("Error occurred", { position: "bottom-right" }); setIsLoading(false); return; }
      if (response.status === 201) { toast.warn("Invalid Tracking ID", { position: "bottom-right" }); setShipmentIdInput(""); setIsLoading(false); return; }
      const data = await response.json();
      if (Object.keys(data.body).length) {
        const orderData = data.body;
        if (orderData.completed) { setStatus(steps[2].label); setCurrentStep(3); }
        else {
          if (orderData.status === "arrived") { setStatus(steps[0].label); setCurrentStep(1); }
          else if (orderData.status === "dispatched") { setStatus(steps[1].label); setCurrentStep(2); }
          else { setStatus(steps[2].label); setCurrentStep(3); }
        }
        setShipmentId(trackingId);
        setShipper(orderData.sender.name);
        setConsignee(orderData.receiver.name);
        setService(orderData.items.length);
        setItems(orderData.items);
      }
    } catch (error) { toast.error("Failed to track shipment", { position: "bottom-right" }); }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleTrack(); };

  const DetailItem = ({ icon, label, value, highlight }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
      <Box sx={{ width: 40, height: 40, background: highlight ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" : "rgba(255, 183, 77, 0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: highlight ? "#1D3557" : "#FFB74D", fontSize: "1rem", flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px", mb: 0.25 }}>{label}</Typography>
        <Typography sx={{ color: highlight ? "#FFB74D" : "#ffffff", fontWeight: highlight ? 700 : 600, fontSize: highlight ? "1.15rem" : "1rem" }}>{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1628 0%, #1D3557 50%, #1E3A5F 100%)", position: "relative", overflow: "hidden" }}>
      <ToastContainer />
      
      {/* Background Elements */}
      <Box sx={{ position: "absolute", inset: 0, background: `url(${backImg})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.08 }} />
      <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 30%, rgba(255, 183, 77, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(30, 58, 95, 0.3) 0%, transparent 50%)" }} />
      
      {/* Floating Particles */}
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {(isMobile ? [
          { left: "5%", size: 2, duration: 28, top: "15%" },
          { left: "15%", size: 4, duration: 35, top: "62%" },
          { left: "25%", size: 2, duration: 30, top: "38%" },
          { left: "35%", size: 5, duration: 42, top: "85%" },
          { left: "45%", size: 3, duration: 32, top: "22%" },
          { left: "55%", size: 2, duration: 26, top: "52%" },
          { left: "65%", size: 4, duration: 38, top: "75%" },
          { left: "75%", size: 2, duration: 29, top: "8%" },
          { left: "85%", size: 3, duration: 34, top: "45%" },
          { left: "95%", size: 5, duration: 40, top: "68%" },
          { left: "10%", size: 2, duration: 31, top: "90%" },
          { left: "40%", size: 3, duration: 36, top: "30%" },
          { left: "70%", size: 2, duration: 27, top: "58%" },
          { left: "90%", size: 4, duration: 33, top: "12%" },
        ] : [
          { left: "2%", size: 3, duration: 28, top: "15%" },
          { left: "5%", size: 5, duration: 35, top: "62%" },
          { left: "8%", size: 2, duration: 22, top: "38%" },
          { left: "11%", size: 7, duration: 45, top: "85%" },
          { left: "14%", size: 3, duration: 30, top: "8%" },
          { left: "17%", size: 4, duration: 26, top: "52%" },
          { left: "20%", size: 2, duration: 32, top: "28%" },
          { left: "23%", size: 8, duration: 50, top: "72%" },
          { left: "26%", size: 3, duration: 24, top: "45%" },
          { left: "29%", size: 4, duration: 34, top: "18%" },
          { left: "32%", size: 2, duration: 29, top: "88%" },
          { left: "35%", size: 6, duration: 42, top: "35%" },
          { left: "38%", size: 4, duration: 36, top: "68%" },
          { left: "41%", size: 3, duration: 31, top: "5%" },
          { left: "44%", size: 7, duration: 48, top: "55%" },
          { left: "47%", size: 2, duration: 27, top: "92%" },
          { left: "50%", size: 5, duration: 33, top: "22%" },
          { left: "53%", size: 3, duration: 38, top: "78%" },
          { left: "56%", size: 8, duration: 52, top: "42%" },
          { left: "59%", size: 4, duration: 29, top: "12%" },
          { left: "62%", size: 2, duration: 25, top: "65%" },
          { left: "65%", size: 6, duration: 40, top: "32%" },
          { left: "68%", size: 3, duration: 28, top: "82%" },
          { left: "71%", size: 5, duration: 37, top: "48%" },
          { left: "74%", size: 2, duration: 31, top: "2%" },
          { left: "77%", size: 7, duration: 46, top: "58%" },
          { left: "80%", size: 4, duration: 30, top: "25%" },
          { left: "83%", size: 3, duration: 34, top: "75%" },
          { left: "86%", size: 8, duration: 54, top: "95%" },
          { left: "89%", size: 2, duration: 26, top: "38%" },
          { left: "92%", size: 5, duration: 39, top: "10%" },
          { left: "95%", size: 3, duration: 32, top: "68%" },
          { left: "98%", size: 6, duration: 44, top: "50%" },
          { left: "3%", size: 4, duration: 33, top: "80%" },
          { left: "13%", size: 2, duration: 27, top: "30%" },
          { left: "33%", size: 5, duration: 41, top: "60%" },
          { left: "43%", size: 3, duration: 29, top: "90%" },
          { left: "63%", size: 4, duration: 35, top: "20%" },
          { left: "73%", size: 2, duration: 24, top: "70%" },
          { left: "93%", size: 6, duration: 43, top: "40%" },
        ]).map((p, i) => (
          <Box key={i} sx={{ position: "absolute", width: `${p.size}px`, height: `${p.size}px`, background: `rgba(255, 183, 77, ${0.1 + p.size * 0.02})`, borderRadius: "50%", left: p.left, top: p.top, opacity: 0.3 + p.size * 0.03, animation: `floatUp ${p.duration}s linear infinite`, "@keyframes floatUp": { "0%": { transform: "translateY(0)" }, "100%": { transform: "translateY(-200vh)" } } }} />
        ))}
      </Box>

      {/* Hero Search Section */}
      <Box sx={{ position: "relative", zIndex: 1, pt: { xs: 6, md: 10 }, pb: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Box sx={{ maxWidth: "800px", mx: "auto", textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 3, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>
              📦 REAL-TIME TRACKING
            </Typography>
            <Typography variant="h2" sx={{ color: "#ffffff", fontWeight: 800, fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" }, mb: 2, lineHeight: 1.1 }}>
              Track Your <Box component="span" sx={{ background: "linear-gradient(135deg, #FFB74D 0%, #fff 50%, #FFB74D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Shipment</Box>
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: { xs: "1rem", md: "1.15rem" }, maxWidth: "500px", mx: "auto" }}>
              Enter your tracking ID to get real-time updates on your package location
            </Typography>
          </Box>

          {/* Search Box */}
          <GlassCard hover={false} sx={{ maxWidth: "700px", mx: "auto", p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <Box sx={{ flex: 1, position: "relative" }}>
                <Box sx={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", zIndex: 1 }}><FaSearch /></Box>
                <TextField
                  variant="outlined"
                  placeholder="Enter Tracking ID (e.g., LR-1234)"
                  value={shipmentIdInput}
                  onChange={(e) => setShipmentIdInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  inputProps={{ style: { textTransform: "uppercase" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      backgroundColor: "rgba(255, 255, 255, 0.18)",
                      color: "#ffffff",
                      pl: 4,
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                      "&.Mui-focused fieldset": { borderColor: "#FFB74D", borderWidth: "2px" },
                    },
                    "& .MuiOutlinedInput-input": { color: "#ffffff", caretColor: "#FFB74D", outline: "none", "&::placeholder": { color: "rgba(255,255,255,0.6)", opacity: 1, textTransform: "none" } },
                  }}
                />
              </Box>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTrack}
                disabled={isLoading}
                style={{
                  background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)",
                  border: "none",
                  borderRadius: "14px",
                  padding: "16px 32px",
                  color: "#1D3557",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  minWidth: "140px",
                  boxShadow: "0 8px 25px rgba(255, 183, 77, 0.35)",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? <CircularProgress size={22} sx={{ color: "#1D3557" }} /> : <><MdLocalShipping size={20} /> Track</>}
              </motion.button>
            </Box>
          </GlassCard>
        </motion.div>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)", mb: { xs: 4, md: 6 } }} />

      {/* Results Section */}
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: "1100px", mx: "auto", px: { xs: 2, md: 4 }, pb: { xs: 6, md: 10 } }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          
          {/* Shipment Details Card */}
          <GlassCard hover={false} sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <Box sx={{ width: 50, height: 50, background: "linear-gradient(135deg, rgba(255, 183, 77, 0.2) 0%, rgba(255, 183, 77, 0.05) 100%)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB74D" }}><FaBox size={22} /></Box>
              <Box>
                <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>Shipment Details</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{hasSearched ? "Your package information" : "Enter tracking ID to view details"}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
              <DetailItem icon={<FaBox />} label="Tracking ID" value={shipmentId} highlight />
              <DetailItem icon={<FaTruck />} label="Status" value={status} />
              <DetailItem icon={<FaUser />} label="Shipper" value={shipper} />
              <DetailItem icon={<FaMapMarkerAlt />} label="Consignee" value={consignee} />
              <DetailItem icon={<FaCubes />} label="Packages" value={service} />
            </Box>

            {/* Progress Tracker */}
            <Box sx={{ pt: 4, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", mb: 3 }}>Tracking Progress</Typography>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 2, sm: 0 } }}>
                {steps.map((step, index) => (
                  <React.Fragment key={index}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        transition: "all 0.3s ease",
                        background: currentStep >= index + 1 
                          ? index + 1 === currentStep 
                            ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" 
                            : "rgba(255, 183, 77, 0.3)"
                          : "rgba(255,255,255,0.05)",
                        color: currentStep >= index + 1 
                          ? index + 1 === currentStep ? "#1D3557" : "#FFB74D"
                          : "rgba(255,255,255,0.3)",
                        boxShadow: currentStep >= index + 1 && index + 1 === currentStep ? "0 8px 25px rgba(255, 183, 77, 0.4)" : "none",
                      }}>
                        {step.icon}
                      </Box>
                      <Typography sx={{
                        fontWeight: currentStep >= index + 1 ? 600 : 400,
                        color: currentStep >= index + 1 
                          ? index + 1 === currentStep ? "#FFB74D" : "rgba(255,255,255,0.8)"
                          : "rgba(255,255,255,0.3)",
                        fontSize: "0.95rem",
                      }}>
                        {step.label}
                      </Typography>
                    </Box>
                    {index < steps.length - 1 && (
                      <Box sx={{
                        display: { xs: "none", sm: "block" },
                        flex: 1,
                        height: 3,
                        mx: 2,
                        borderRadius: 2,
                        background: currentStep > index + 1 
                          ? "linear-gradient(90deg, rgba(255, 183, 77, 0.5), rgba(255, 183, 77, 0.2))"
                          : "rgba(255,255,255,0.08)",
                        transition: "all 0.3s ease",
                      }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </GlassCard>

          {/* Items Table */}
          <GlassCard hover={false} sx={{ p: { xs: 3, md: 4 }, overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box sx={{ width: 44, height: 44, background: "linear-gradient(135deg, rgba(100, 200, 255, 0.2) 0%, rgba(100, 200, 255, 0.05) 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64C8FF" }}><FaCubes size={20} /></Box>
              <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: "1.15rem" }}>Items in Package</Typography>
            </Box>
            <TableContainer sx={{ background: "rgba(255, 255, 255, 0.15)", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.25)" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "rgba(255,255,255,0.12)" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#FFB74D", borderBottom: "1px solid rgba(255,255,255,0.15)", py: 2 }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#FFB74D", borderBottom: "1px solid rgba(255,255,255,0.15)", py: 2 }}>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <TableRow key={item._id} sx={{ "&:hover": { background: "rgba(255,255,255,0.05)" } }}>
                        <TableCell sx={{ color: "rgba(255,255,255,0.9)", borderBottom: "1px solid rgba(255,255,255,0.1)", py: 2 }}>{item.name}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.9)", borderBottom: "1px solid rgba(255,255,255,0.1)", py: 2 }}>{item.quantity}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} sx={{ textAlign: "center", py: 5, color: "rgba(255,255,255,0.7)", borderBottom: "none" }}>
                        <FaCubes size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                        <Typography sx={{ fontSize: "0.95rem" }}>{hasSearched ? "No items found" : "Enter a tracking ID to view package items"}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </motion.div>
      </Box>
    </Box>
  );
};

export default TrackShipmentPage;
