import { useState } from "react";
import { Typography, Box, Container, useTheme, useMediaQuery, TextField, MenuItem, Select, FormControl, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { FaBox, FaTruck, FaMapMarkerAlt, FaFileAlt, FaMoneyBillWave, FaHome, FaTruckMoving, FaCalendarAlt, FaRoute, FaBuilding, FaStore, FaIndustry, FaUser, FaPhone, FaEnvelope, FaClipboardList, FaShieldAlt, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import trucksImg from "../assets/trucks.webp";
import "../css/glassmorphism.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const GlassCard = ({ children, sx = {}, hover = true, ...props }) => (
  <Box sx={{ background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "24px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", ...(hover && { "&:hover": { transform: "translateY(-4px)", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)", borderColor: "rgba(255, 183, 77, 0.3)" } }), ...sx }} {...props}>{children}</Box>
);

const ServicesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const fadeIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const [formData, setFormData] = useState({ name: "", phone: "", serviceType: "", pickupLocation: "", deliveryLocation: "", goodsDescription: "" });
  const [highlightDropdown, setHighlightDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const [phoneError, setPhoneError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // Only allow digits and max 10 characters
      let numericValue = value.replace(/\D/g, "").slice(0, 10);
      // Check if starts with zero
      if (numericValue.startsWith("0")) {
        numericValue = numericValue.slice(1);
        setPhoneError("Phone number can't start with zero");
      } else {
        setPhoneError("");
      }
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number", { position: "top-center" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/api/service-enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          serviceType: formData.serviceType === "parcel" ? "Parcel" : formData.serviceType === "ftl" ? "Full Load" : formData.serviceType,
          pickupLocation: formData.pickupLocation,
          deliveryLocation: formData.deliveryLocation,
          description: formData.goodsDescription,
        }),
      });
      const data = await response.json();
      if (response.status === 429) {
        toast.error(data.message || "Too many enquiries. Please try again after 15 minutes.", { position: "top-center" });
      } else if (response.ok && data.success) {
        toast.success("Enquiry submitted! We'll contact you soon.", { position: "top-center" });
        setFormData({ name: "", phone: "", serviceType: "", pickupLocation: "", deliveryLocation: "", goodsDescription: "" });
      } else {
        toast.error(data.message || "Failed to submit enquiry. Please try again.", { position: "top-center" });
      }
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.", { position: "top-center" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const scrollToEnquiry = (serviceType = null) => {
    if (serviceType) {
      setFormData((prev) => ({ ...prev, serviceType }));
      setHighlightDropdown(true);
      setTimeout(() => setHighlightDropdown(false), 1500);
    }
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const parcelFeatures = [
    { icon: <FaCalendarAlt />, text: "Daily scheduled dispatch from Hyderabad markets" },
    { icon: <FaBox />, text: "Part-load / parcel consignments accepted" },
    { icon: <FaMapMarkerAlt />, text: "Serving 8+ district towns across Telangana" },
    { icon: <FaFileAlt />, text: "LR documentation for every shipment" },
    { icon: <FaMoneyBillWave />, text: "Freight payable at destination" },
  ];
  const parcelAddons = [{ icon: <FaHome />, text: "Door Pickup" }, { icon: <FaTruckMoving />, text: "Door Delivery" }, { icon: <FaShieldAlt />, text: "Transit Insurance" }];
  const ftlFeatures = [
    { icon: <FaTruck />, text: "Dedicated truck (no sharing)" },
    { icon: <FaCalendarAlt />, text: "Flexible pickup scheduling" },
    { icon: <FaRoute />, text: "Direct delivery to destination" },
    { icon: <FaBuilding />, text: "Suitable for home, office, or business relocations" },
  ];
  const collectionPoints = [
    { name: "FTC Head Office", area: "Old Feelkhana, Hyderabad", code: "HYD-01" },
    { name: "FTC Branch Office", area: "Goshamahal Road, Feelkhana", code: "HYD-02" },
    { name: "FTC Bahadurpura", area: "Bahadurpura, Hyderabad", code: "BDPURA" },
    { name: "FTC Secunderabad", area: "Secunderabad", code: "SECBAD" },
  ];
  const whoWeServe = [{ icon: <FaStore />, title: "Traders & Wholesalers" }, { icon: <FaBuilding />, title: "Retailers & Suppliers" }, { icon: <FaIndustry />, title: "Manufacturers & Companies" }, { icon: <FaUser />, title: "Individuals" }];

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      background: "linear-gradient(180deg, rgba(100,200,255,0.06), rgba(20,40,60,0.06))",
      border: "1px solid rgba(100,200,255,0.10)",
      boxShadow: "inset 0 1px 0 rgba(100,200,255,0.03)",
      color: "#fff",
      outline: "none",
      "& fieldset": { borderColor: "rgba(100,200,255,0.14)" },
      "&:hover fieldset": { borderColor: "rgba(100,200,255,0.22)" },
      "&.Mui-focused fieldset": { borderColor: "#6FB3FF", borderWidth: "2px", boxShadow: "0 0 0 8px rgba(111,179,255,0.07)" },
    },
    "& .MuiOutlinedInput-input": { color: "#fff", caretColor: "#6FB3FF", outline: "none", "&::placeholder": { color: "rgba(255,255,255,0.8)", opacity: 1 } },
    "& .MuiOutlinedInput-inputMultiline": { color: "#fff", caretColor: "#6FB3FF", outline: "none", "&::placeholder": { color: "rgba(255,255,255,0.8)", opacity: 1 } },
    "& textarea": { outline: "none !important" },
    "& input": { outline: "none !important" },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.85)" }, "& .MuiInputLabel-root.Mui-focused": { color: "#6FB3FF" }, "& .MuiSelect-icon": { color: "rgba(255,255,255,0.85)" },
  };

  const particles = isMobile
    ? [{ left: "5%", size: 2, duration: 28, top: "15%" }, { left: "15%", size: 4, duration: 35, top: "62%" }, { left: "25%", size: 2, duration: 30, top: "38%" }, { left: "35%", size: 5, duration: 42, top: "85%" }, { left: "45%", size: 3, duration: 32, top: "22%" }, { left: "55%", size: 2, duration: 26, top: "52%" }, { left: "65%", size: 4, duration: 38, top: "75%" }, { left: "75%", size: 2, duration: 29, top: "8%" }, { left: "85%", size: 3, duration: 34, top: "45%" }, { left: "95%", size: 5, duration: 40, top: "68%" }]
    : [{ left: "2%", size: 3, duration: 28, top: "15%" }, { left: "8%", size: 5, duration: 35, top: "62%" }, { left: "14%", size: 2, duration: 22, top: "38%" }, { left: "20%", size: 7, duration: 45, top: "85%" }, { left: "26%", size: 3, duration: 30, top: "8%" }, { left: "32%", size: 4, duration: 26, top: "52%" }, { left: "38%", size: 8, duration: 50, top: "72%" }, { left: "44%", size: 3, duration: 24, top: "45%" }, { left: "50%", size: 6, duration: 42, top: "35%" }, { left: "56%", size: 2, duration: 27, top: "92%" }, { left: "62%", size: 5, duration: 33, top: "22%" }, { left: "68%", size: 3, duration: 38, top: "78%" }, { left: "74%", size: 7, duration: 46, top: "58%" }, { left: "80%", size: 4, duration: 30, top: "25%" }, { left: "86%", size: 2, duration: 26, top: "38%" }, { left: "92%", size: 5, duration: 39, top: "10%" }, { left: "98%", size: 6, duration: 44, top: "50%" }];

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a1628 0%, #1D3557 30%, #1E3A5F 60%, #1D3557 100%)", position: "relative", overflow: "hidden" }}>
      <ToastContainer 
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{ width: "auto", maxWidth: "550px" }}
        toastStyle={{
          background: "rgba(10, 22, 40, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 183, 77, 0.25)",
          borderRadius: "14px",
          color: "#fff",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          minWidth: "400px",
          overflow: "hidden",
        }}
        progressStyle={{
          background: "linear-gradient(90deg, #FFB74D, #FF9800)",
          height: "4px",
          borderRadius: "0 0 14px 14px",
        }}
      />
      <style>{`
        .Toastify__progress-bar { 
          height: 4px !important; 
          bottom: 0 !important;
          border-radius: 0 0 14px 14px !important;
        }
        .Toastify__toast { 
          overflow: hidden !important; 
          padding-bottom: 8px !important;
        }
        .Toastify__toast-body {
          font-size: 0.95rem !important;
          line-height: 1.4 !important;
        }
      `}</style>
      <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 20%, rgba(255, 183, 77, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(30, 58, 95, 0.3) 0%, transparent 50%)" }} />
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {particles.map((p, i) => (<Box key={i} sx={{ position: "absolute", width: `${p.size}px`, height: `${p.size}px`, background: `rgba(255, 183, 77, ${0.1 + p.size * 0.02})`, borderRadius: "50%", left: p.left, top: p.top, opacity: 0.3 + p.size * 0.03, animation: `floatUp ${p.duration}s linear infinite`, "@keyframes floatUp": { "0%": { transform: "translateY(0)" }, "100%": { transform: "translateY(-200vh)" } } }} />))}
      </Box>

      {/* Hero Section */}
      <Box sx={{ position: "relative", minHeight: { xs: "60vh", md: "70vh" }, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, background: `url(${trucksImg})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.2 }} />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10, 22, 40, 0.7) 0%, rgba(29, 53, 87, 0.9) 100%)" }} />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, textAlign: "center", py: { xs: 8, md: 0 } }}>
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 3, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}> SERVING SINCE 1996</Typography>
            <Typography variant="h1" sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" }, mb: 2, lineHeight: 1.2 }}>Daily Parcel & Full Truck Transport<Box component="span" sx={{ display: "block", background: "linear-gradient(135deg, #FFB74D 0%, #fff 50%, #FFB74D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Services Across Telangana</Box></Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: { xs: "1rem", md: "1.2rem" }, maxWidth: "700px", mx: "auto", mb: 4 }}>Trusted logistics from Hyderabad markets to district towns, backed by 28+ years of experience</Typography>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={scrollToEnquiry} style={{ background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", border: "none", borderRadius: "14px", padding: "16px 32px", color: "#1D3557", fontWeight: 700, fontSize: "1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 25px rgba(255, 183, 77, 0.35)" }}>Request Service <FaArrowRight /></motion.button>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Daily Parcel Service Section */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 10 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 2, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>📦 DAILY SERVICE</Typography>
            <Typography variant="h2" sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.5rem" }, mb: 2 }}>Daily Parcel Service</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", maxWidth: "600px", mx: "auto" }}>Reliable daily dispatch from Hyderabad markets to district towns across Telangana</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
            <motion.div variants={fadeIn}>
              <GlassCard sx={{ p: { xs: 3, md: 4 }, height: "100%" }}>
                <Typography sx={{ color: "#FFB74D", fontWeight: 700, fontSize: "1.2rem", mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}><FaCheckCircle /> Key Features</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {parcelFeatures.map((f, i) => (<Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}><Box sx={{ width: 40, height: 40, background: "rgba(255, 183, 77, 0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB74D", fontSize: "1rem", flexShrink: 0 }}>{f.icon}</Box><Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>{f.text}</Typography></Box>))}
                </Box>
              </GlassCard>
            </motion.div>
            <motion.div variants={fadeIn}>
              <GlassCard sx={{ p: { xs: 3, md: 4 }, height: "100%" }}>
                <Typography sx={{ color: "#FFB74D", fontWeight: 700, fontSize: "1.2rem", mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}><FaBox /> Optional Add-ons</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {parcelAddons.map((a, i) => (<Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}><Box sx={{ width: 44, height: 44, background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#1D3557", fontSize: "1.1rem" }}>{a.icon}</Box><Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>{a.text}</Typography></Box>))}
                </Box>
                <Box sx={{ mt: 4, p: 3, background: "rgba(255, 183, 77, 0.1)", borderRadius: "12px", border: "1px solid rgba(255, 183, 77, 0.2)" }}>
                  <Typography sx={{ color: "#FFB74D", fontWeight: 600, fontSize: "0.9rem", mb: 1 }}>💡 Pro Tip</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", mb: 3 }}>Combine door pickup with door delivery for a complete hassle-free experience!</Typography>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => scrollToEnquiry("parcel")} style={{ background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", border: "none", borderRadius: "12px", padding: "12px 24px", color: "#1D3557", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 25px rgba(255, 183, 77, 0.35)", width: "100%" }}>Request Parcel Service <FaArrowRight /></motion.button>
                </Box>
              </GlassCard>
            </motion.div>
          </Box>
        </motion.div>
      </Container>


      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Full Truck Load Section */}
      <Box sx={{ background: "rgba(0,0,0,0.2)", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4, alignItems: "center" }}>
              <motion.div variants={fadeIn}>
                <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 2, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>🚛 DEDICATED TRUCKS</Typography>
                <Typography variant="h2" sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.5rem" }, mb: 2 }}>Full Truck Load (FTL)</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>Need an entire truck? Book a dedicated vehicle for large shipments, relocations, or bulk goods transport within Telangana.</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {ftlFeatures.map((f, i) => (<Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}><Box sx={{ color: "#FFB74D", fontSize: "1.2rem" }}>{f.icon}</Box><Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{f.text}</Typography></Box>))}
                </Box>
              </motion.div>
              <motion.div variants={fadeIn}>
                <GlassCard sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
                  <Box sx={{ width: 80, height: 80, background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}><FaTruckMoving size={36} color="#1D3557" /></Box>
                  <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.3rem", mb: 2 }}>Book Your Truck</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>Get a quote for your full truck load requirement. We offer competitive rates and reliable service.</Typography>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => scrollToEnquiry("ftl")} style={{ background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", border: "none", borderRadius: "12px", padding: "14px 28px", color: "#1D3557", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 25px rgba(255, 183, 77, 0.35)" }}>Request FTL Transport <FaArrowRight /></motion.button>
                </GlassCard>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Collection Points Section */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 10 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 2, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>📍 DROP POINTS</Typography>
            <Typography variant="h2" sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.5rem" }, mb: 2 }}>Hyderabad Collection Points</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", maxWidth: "600px", mx: "auto" }}>Drop your parcels at any of our convenient collection points in Hyderabad</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 3 }}>
            {collectionPoints.map((p, i) => (
              <motion.div key={i} variants={fadeIn}>
                <GlassCard sx={{ p: 3, textAlign: "center", height: "100%" }}>
                  <Box sx={{ width: 50, height: 50, background: "rgba(255, 183, 77, 0.15)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, color: "#FFB74D" }}><FaMapMarkerAlt size={22} /></Box>
                  <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem", mb: 0.5 }}>{p.name}</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", mb: 1.5 }}>{p.area}</Typography>
                  <Box sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", borderRadius: "6px", px: 2, py: 0.5 }}><Typography sx={{ color: "#FFB74D", fontSize: "0.75rem", fontWeight: 600 }}>{p.code}</Typography></Box>
                </GlassCard>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Who We Serve Section */}
      <Box sx={{ background: "rgba(0,0,0,0.2)", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Typography variant="h2" sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" }, mb: 1 }}>Who We Serve</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Trusted by businesses and individuals across Telangana</Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3 }}>
              {whoWeServe.map((w, i) => (
                <motion.div key={i} variants={fadeIn}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Box sx={{ width: 60, height: 60, background: "rgba(255, 183, 77, 0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, color: "#FFB74D", fontSize: "1.5rem" }}>{w.icon}</Box>
                    <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>{w.title}</Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Enquiry Form Section */}
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 10 } }} id="enquiry-form">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
          <GlassCard sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box sx={{ width: 60, height: 60, background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}><FaEnvelope size={26} color="#1D3557" /></Box>
              <Typography variant="h2" sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" }, mb: 1 }}>Service Enquiry</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Fill out the form and our team will get back to you shortly</Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <TextField name="name" label="Your Name" value={formData.name} onChange={handleInputChange} required fullWidth InputProps={{ startAdornment: <FaUser style={{ marginRight: 10, color: "rgba(255,255,255,0.4)" }} /> }} sx={inputStyle} />
                <TextField name="phone" label="Phone Number" value={formData.phone} onChange={handleInputChange} onBlur={() => setPhoneTouched(true)} required fullWidth inputProps={{ maxLength: 10, inputMode: "numeric", pattern: "[0-9]*" }} InputProps={{ startAdornment: <FaPhone style={{ marginRight: 10, color: "rgba(255,255,255,0.4)" }} /> }} error={phoneError || (phoneTouched && formData.phone.length > 0 && formData.phone.length < 10)} helperText={phoneError || (phoneTouched && formData.phone.length > 0 && formData.phone.length < 10 ? "Phone number must be 10 digits" : "")} sx={{ ...inputStyle, "& .MuiFormHelperText-root": { color: "#FF6B6B", fontWeight: 600, fontSize: "0.85rem", mt: 1 } }} />
              </Box>
              <FormControl fullWidth sx={{ ...inputStyle, ...(highlightDropdown && { "& .MuiOutlinedInput-root": { ...inputStyle["& .MuiOutlinedInput-root"], animation: "highlightPulse 1.5s ease-out" }, "@keyframes highlightPulse": { "0%": { boxShadow: "0 0 0 0 rgba(111, 179, 255, 0.8)" }, "50%": { boxShadow: "0 0 20px 5px rgba(111, 179, 255, 0.45)" }, "100%": { boxShadow: "0 0 0 0 rgba(111, 179, 255, 0)" } } }) }} required>
                <Select name="serviceType" value={formData.serviceType} onChange={handleInputChange} displayEmpty required sx={{ borderRadius: "12px", background: "linear-gradient(180deg, rgba(100,200,255,0.04), rgba(20,40,60,0.04))", "& .MuiSelect-select": { color: formData.serviceType ? "#fff" : "rgba(255,255,255,0.5)" } }} MenuProps={{ PaperProps: { sx: { background: "rgba(20,40,60,0.95)", backdropFilter: "blur(10px)", border: "1px solid rgba(100,200,255,0.08)", "& .MuiMenuItem-root": { color: "#fff", "&:hover": { background: "rgba(100,200,255,0.12)" }, "&.Mui-selected": { background: "rgba(100,200,255,0.18)" } } } } }}>
                  <MenuItem value="" disabled>Select Service Type</MenuItem>
                  <MenuItem value="parcel">Parcel</MenuItem>
                  <MenuItem value="ftl">FTL</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <TextField name="pickupLocation" label="Pickup Location" value={formData.pickupLocation} onChange={handleInputChange} required fullWidth InputProps={{ startAdornment: <FaMapMarkerAlt style={{ marginRight: 10, color: "rgba(255,255,255,0.4)" }} /> }} sx={inputStyle} />
                <TextField name="deliveryLocation" label="Delivery Location" value={formData.deliveryLocation} onChange={handleInputChange} required fullWidth InputProps={{ startAdornment: <FaMapMarkerAlt style={{ marginRight: 10, color: "rgba(255,255,255,0.4)" }} /> }} sx={inputStyle} />
              </Box>
              <TextField name="goodsDescription" label="Goods Description (Optional)" value={formData.goodsDescription} onChange={handleInputChange} multiline rows={3} fullWidth InputProps={{ startAdornment: <FaClipboardList style={{ marginRight: 10, marginTop: 8, color: "rgba(255,255,255,0.4)", alignSelf: "flex-start" }} /> }} sx={inputStyle} />
              <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }} style={{ background: isSubmitting ? "rgba(255, 183, 77, 0.6)" : "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", border: "none", borderRadius: "14px", padding: "16px 32px", color: "#1D3557", fontWeight: 700, fontSize: "1rem", cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 25px rgba(255, 183, 77, 0.35)", width: "100%", opacity: isSubmitting ? 0.8 : 1 }}>{isSubmitting ? <><CircularProgress size={20} sx={{ color: "#1D3557" }} /> Submitting...</> : <>Submit Enquiry <FaArrowRight /></>}</motion.button>
            </Box>
          </GlassCard>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ServicesPage;
