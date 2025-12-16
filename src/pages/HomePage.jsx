import React from "react";
import { Typography, Box, Button, Container, useTheme, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import { motion, animate } from "framer-motion";
import { FaShippingFast, FaWarehouse, FaCheckCircle, FaPhoneAlt, FaEnvelope, FaArrowRight, FaClock, FaShieldAlt, FaHandshake } from "react-icons/fa";
import trucksImg from "../assets/trucks.webp";
import founderImg from "../assets/founder.webp";
import "../css/glassmorphism.css";


const AnimatedCounter = ({ from, to, duration, suffix = "+" }) => {
  const nodeRef = React.useRef();
  const [hasStarted, setHasStarted] = React.useState(false);

  // Start animation only when element is visible
  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Run animation when visible
  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node || !hasStarted) return;

    const controls = animate(from, to, {
      duration: duration,
      ease: "linear",
      onUpdate(value) { node.textContent = Math.round(value).toLocaleString() + suffix; },
    });
    return () => controls.stop();
  }, [hasStarted, from, to, duration, suffix]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
};

const GlassCard = ({ children, sx = {}, ...props }) => (
  <Box sx={{ background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "24px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)", borderColor: "rgba(255, 183, 77, 0.3)" }, ...sx }} {...props}>{children}</Box>
);

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fadeIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };

  const stats = [
    { label: "Happy Clients", value: 10000 },
    { label: "Branches", value: 12 },
    { label: "Staff", value: 50 },
    { label: "Years of Trust", value: 28 },
  ];

  const services = [
    { title: "Safe & Fast Delivery", icon: <FaShippingFast size={36} />, description: "We ensure that all shipments are handled with utmost care and delivered promptly." },
    { title: "Own Fleet of Trucks", icon: <FaCheckCircle size={36} />, description: "We operate a fleet of well-maintained trucks, allowing us to control every aspect of the delivery process." },
    { title: "State-of-the-Art Workshop", icon: <FaWarehouse size={36} />, description: "Our fully-equipped automobile workshop ensures our fleet stays in top condition, minimizing downtime." },
  ];

  const features = [
    { icon: <FaShieldAlt />, title: "Secure Handling", desc: "Your goods are insured and handled with care" },
    { icon: <FaClock />, title: "On-Time Delivery", desc: "We value your time with punctual deliveries" },
    { icon: <FaHandshake />, title: "Trusted Partner", desc: "28+ years of reliable service" },
  ];

  return (
    <Box sx={{ overflowX: "hidden" }}>
      {/* Hero Section */}
      <Box sx={{ position: "relative", minHeight: { xs: "100vh", md: "100vh" }, background: "linear-gradient(135deg, #0a1628 0%, #1D3557 50%, #1E3A5F 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, background: `url(${trucksImg})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.35, filter: "blur(0.4px)" }} />
        <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(255, 183, 77, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(30, 58, 95, 0.15) 0%, transparent 50%)" }} />
        
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

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, textAlign: "center", px: { xs: 2, md: 4 }, py: { xs: 8, md: 0 } }}>
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeIn}>
              <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.25)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 183, 77, 0.5)", borderRadius: "50px", px: 3, py: 1, mb: 3, color: "#FFB74D", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "1px", textShadow: "0 2px 4px rgba(0,0,0,0.5)", boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                TRUSTED SINCE 1996
              </Typography>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Typography variant="h1" sx={{ color: "#ffffff", fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem", lg: "5rem" }, fontWeight: 800, lineHeight: 1.1, mb: 2, textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
                Friends Transport
                <Box component="span" sx={{ display: "block", background: "linear-gradient(135deg, #FFB74D 0%, #fff 50%, #FFB74D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Company</Box>
              </Typography>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Typography sx={{ color: "rgba(255,255,255,0.9)", mb: 5, fontWeight: 400, fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.4rem" }, maxWidth: "700px", mx: "auto", lineHeight: 1.7, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                Your trusted partner in parcel and goods transportation. Delivering excellence across Telangana for over 28 years.
              </Typography>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/track" style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="contained" size="large" endIcon={<FaArrowRight />} sx={{ background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", color: "#1D3557", px: { xs: 4, md: 5 }, py: 1.8, fontSize: { xs: "1rem", md: "1.1rem" }, fontWeight: 700, borderRadius: "14px", boxShadow: "0 8px 30px rgba(255, 183, 77, 0.4)", textTransform: "none", "&:hover": { background: "linear-gradient(135deg, #FFC107 0%, #FFB74D 100%)", boxShadow: "0 12px 40px rgba(255, 183, 77, 0.5)" } }}>
                      Track Shipment
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/about" style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outlined" size="large" sx={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.4)", borderWidth: "2px", px: { xs: 4, md: 5 }, py: 1.7, fontSize: { xs: "1rem", md: "1.1rem" }, fontWeight: 600, borderRadius: "14px", backdropFilter: "blur(10px)", textTransform: "none", "&:hover": { borderColor: "#ffffff", background: "rgba(255,255,255,0.1)", borderWidth: "2px" } }}>
                      Learn More
                    </Button>
                  </motion.div>
                </Link>
              </Box>
            </motion.div>
          </motion.div>
        </Container>

      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Statistics Section */}
      <Box sx={{ background: "linear-gradient(180deg, #1E3A5F 0%, #1D3557 100%)", py: { xs: 3, sm: 4, md: 6 }, position: "relative" }}>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ 
            background: "rgba(255, 255, 255, 0.05)", 
            backdropFilter: "blur(10px)", 
            borderRadius: { xs: "16px", md: "24px" }, 
            py: { xs: 3, sm: 4, md: 5 }, 
            px: { xs: 2, sm: 3, md: 4 }, 
            overflow: "hidden", 
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              padding: "1px",
              background: "linear-gradient(135deg, rgba(255, 183, 77, 0.15) 0%, rgba(255, 183, 77, 0.5) 50%, rgba(255, 183, 77, 0.15) 100%)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none"
            }
          }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: { xs: 2, sm: 3, md: 4 } }}>
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}>
                <Box sx={{ textAlign: "center", p: { xs: 1.5, sm: 2, md: 3 } }}>
                  <Typography sx={{ fontSize: { xs: "1.5rem", sm: "2.25rem", md: "3rem" }, fontWeight: 800, background: "linear-gradient(135deg, #FFB74D 0%, #fff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1, mb: 0.5 }}>
                    <AnimatedCounter from={0} to={stat.value} duration={1.5} />
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: { xs: "0.6rem", sm: "0.75rem", md: "0.9rem" }, textTransform: "uppercase", letterSpacing: { xs: "0.5px", sm: "1px", md: "2px" }, fontWeight: 500, lineHeight: 1.2 }}>{stat.label}</Typography>
                </Box>
              </motion.div>
            ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Mission Section */}
      <Box sx={{ background: "linear-gradient(180deg, #1D3557 0%, #1D3557 100%)", py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <Box sx={{ textAlign: "center", maxWidth: "900px", mx: "auto" }}>
              <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 3, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>OUR PURPOSE</Typography>
              <Typography variant="h2" sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "2rem", md: "3rem" }, mb: 3 }}>Our Mission</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: { xs: "1.05rem", md: "1.2rem" }, lineHeight: 1.9, maxWidth: "800px", mx: "auto" }}>
                To provide high-quality customer service with every delivery. Whether you&apos;re sending small parcels or large shipments, we ensure your goods reach their destination safely, securely, and on time.
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Legacy / Founder Section */}
      <Box sx={{ background: "linear-gradient(180deg, #1D3557 0%, #0a1628 100%)", py: { xs: 8, md: 12 }, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", top: "50%", right: { xs: "50%", md: "-5%" }, transform: { xs: "translate(50%, -50%)", md: "translateY(-50%)" }, fontSize: { xs: "10rem", md: "25rem" }, fontWeight: 900, color: "rgba(255, 183, 77, 0.03)", zIndex: 0, pointerEvents: "none", whiteSpace: "nowrap" }}>1996</Box>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" }, gap: { xs: 4, md: 8 }, alignItems: "center" }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Box sx={{ position: "relative", maxWidth: { xs: "280px", md: "100%" }, mx: "auto" }}>
                {/* Main image container */}
                <Box sx={{ position: "relative", borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)", border: "1px solid rgba(255, 255, 255, 0.1)", cursor: "pointer", "&:hover img": { transform: "scale(1.05)" } }}>
                  <Box component="img" src={founderImg} alt="Mr. Mohammed Ameer Ali" sx={{ width: "100%", display: "block", maxHeight: "450px", objectFit: "contain", background: "linear-gradient(180deg, #1D3557 0%, #0a1628 100%)", transition: "transform 0.5s ease" }} />
                  {/* Bottom gradient overlay */}
                  <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)" }} />
                  {/* Founder info overlay */}
                  <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 2.5, md: 3 } }}>
                    <Box sx={{ display: "inline-block", background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", px: 2, py: 0.5, borderRadius: "8px", mb: 1 }}>
                      <Typography sx={{ color: "#1D3557", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px" }}>FOUNDER</Typography>
                    </Box>
                    <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "1.1rem", md: "1.25rem" }, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>Mr. Mohammed Ameer Ali</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.85rem", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>Established 1996</Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ width: { xs: 40, md: 60 }, height: 4, background: "linear-gradient(90deg, #FFB74D, transparent)", mr: 2, borderRadius: 2 }} />
                <Typography sx={{ color: "#FFB74D", fontWeight: 700, letterSpacing: 2, fontSize: { xs: "0.8rem", md: "0.9rem" } }}>OUR LEGACY</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: "#ffffff", fontWeight: 700, mb: 3, fontSize: { xs: "1.75rem", md: "2.5rem" }, lineHeight: 1.2 }}>
                A Journey Started in <Box component="span" sx={{ color: "#FFB74D" }}>1996</Box>
              </Typography>
              <Typography sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.9, color: "rgba(255,255,255,0.85)", mb: 3 }}>
                Founded by the visionary <strong style={{ color: "#FFB74D" }}>Mr. Mohammed Ameer Ali</strong>, Friends Transport Company began as a humble endeavor to connect people through reliable service. Over the decades, it has blossomed into a symbol of trust in the parcel service industry.
              </Typography>
              <Typography sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.9, color: "rgba(255,255,255,0.85)", mb: 4 }}>
                The legacy of Mr. Ameer Ali lives on through his sons and grandsons, who drive the company&apos;s growth with the same passion and integrity that built this trusted name.
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                {[{ value: "28+", label: "Years of Service", color: "#FFB74D" }, { value: "100%", label: "Customer Satisfaction", color: "#64C8FF" }].map((item, i) => (
                  <GlassCard key={i} sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" }, fontWeight: 800, color: item.color, lineHeight: 1, mb: 0.5 }}>{item.value}</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>{item.label}</Typography>
                  </GlassCard>
                ))}
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Services Section */}
      <Box sx={{ background: "linear-gradient(180deg, #0a1628 0%, #1D3557 100%)", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeIn}>
              <Box sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}>
                <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 2, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>WHAT WE OFFER</Typography>
                <Typography variant="h2" sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "2rem", md: "2.75rem" }, mb: 2 }}>Our Services</Typography>
              </Box>
            </motion.div>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 3 }}>
              {services.map((service, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <GlassCard sx={{ height: "100%", textAlign: "center", p: { xs: 3, md: 4 } }}>
                    <Box sx={{ width: 80, height: 80, mx: "auto", mb: 3, background: "linear-gradient(135deg, rgba(255, 183, 77, 0.2) 0%, rgba(255, 183, 77, 0.05) 100%)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB74D" }}>{service.icon}</Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#ffffff", mb: 1.5, fontSize: { xs: "1.1rem", md: "1.25rem" } }}>{service.title}</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.7 }}>{service.description}</Typography>
                  </GlassCard>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* Features Section */}
      <Box sx={{ background: "linear-gradient(180deg, #1D3557 0%, #1D3557 100%)", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 3, background: "rgba(255, 255, 255, 0.03)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <Box sx={{ width: 50, height: 50, background: "rgba(255, 183, 77, 0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB74D", fontSize: "1.25rem" }}>{feature.icon}</Box>
                  <Box>
                    <Typography sx={{ color: "#ffffff", fontWeight: 600, mb: 0.25 }}>{feature.title}</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem" }}>{feature.desc}</Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />

      {/* CTA Section */}
      <Box sx={{ background: "linear-gradient(180deg, #1D3557 0%, #0a1628 100%)", py: { xs: 8, md: 10 }, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255, 183, 77, 0.1) 0%, transparent 60%)" }} />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, textAlign: "center", px: { xs: 2, md: 4 } }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <Typography variant="h3" sx={{ color: "#ffffff", fontWeight: 700, mb: 2, fontSize: { xs: "1.75rem", md: "2.5rem" } }}>Ready to Ship?</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", mb: 4, fontSize: { xs: "1rem", md: "1.15rem" } }}>Contact us today and experience reliable shipping services</Typography>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, justifyContent: "center", mb: 5 }}>
              <a href="tel:04024614381" style={{ textDecoration: "none" }}>
                <GlassCard sx={{ px: 4, py: 2, display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}><FaPhoneAlt color="#FFB74D" size={20} /><Typography sx={{ color: "#ffffff", fontWeight: 600 }}>040-24614381</Typography></GlassCard>
              </a>
              <a href="mailto:ftchydindia@gmail.com" style={{ textDecoration: "none" }}>
                <GlassCard sx={{ px: 4, py: 2, display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}><FaEnvelope color="#FFB74D" size={20} /><Typography sx={{ color: "#ffffff", fontWeight: 600 }}>ftchydindia@gmail.com</Typography></GlassCard>
              </a>
            </Box>
            <Link to="/track" style={{ textDecoration: "none" }}>
              <Button variant="contained" size="large" endIcon={<FaArrowRight />} sx={{ background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", color: "#1D3557", px: 5, py: 1.8, fontSize: "1.1rem", fontWeight: 700, borderRadius: "14px", boxShadow: "0 8px 30px rgba(255, 183, 77, 0.4)", textTransform: "none", "&:hover": { background: "linear-gradient(135deg, #FFC107 0%, #FFB74D 100%)", boxShadow: "0 12px 40px rgba(255, 183, 77, 0.5)" } }}>Track Your Shipment</Button>
            </Link>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
