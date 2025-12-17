import React from "react";
import { Typography, Box, Container, useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaBuilding, FaUsers, FaTruck, FaAward, FaHandshake } from "react-icons/fa";
import founderImg from "../assets/founder.webp";
import office1 from "../assets/office1.webp";
import office2 from "../assets/office2.webp";
import office3 from "../assets/office3.webp";
import "../css/glassmorphism.css";

const GlassCard = ({ children, sx = {}, hover = true, ...props }) => (
  <Box sx={{ background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "24px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", ...(hover && { "&:hover": { transform: "translateY(-4px)", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)", borderColor: "rgba(255, 183, 77, 0.3)" } }), ...sx }} {...props}>{children}</Box>
);

const AboutPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const fadeIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };

  const bookingOffices = [
    { name: "Old Feelkhana (HYD-01)", phone: "040-24614381", mapUrl: "https://maps.app.goo.gl/Ep8ncVerzcffE34e7" },
    { name: "Goshamahal Road, Feelkhana (HYD-02)", phone: "040-24604381", mapUrl: "https://maps.app.goo.gl/Ep8ncVerzcffE34e7" },
    { name: "Bahadurpura (BDPURA)", phone: "9515409041", mapUrl: "https://maps.app.goo.gl/Ep8ncVerzcffE34e7" },
    { name: "Secunderabad (SECBAD)", phone: "040-29331533", mapUrl: "https://maps.app.goo.gl/6ytQH88X91XkjBda9" },
  ];

  const deliveryOffices = [
    { name: "Karimnagar (KNR)", phone: "9908690827", mapUrl: "https://maps.app.goo.gl/1VBYHHEqUBg6dAyM7" },
    { name: "Sultanabad (SBD)", phone: "9849701721", mapUrl: "https://maps.app.goo.gl/naRZdKJMTn9CUpNt6" },
    { name: "Peddapally (PDPL)", phone: "9030478492", mapUrl: "https://maps.app.goo.gl/ouFkftr4WGVQjnQo8" },
    { name: "Ramagundam NTPC (NTPC)", phone: "9866239010", mapUrl: "https://maps.app.goo.gl/13o1fVkFemGnsUdX6" },
    { name: "Godavarikhani (GDK)", phone: "9949121267", mapUrl: "https://maps.app.goo.gl/2XebAQNTnD5KxehDA" },
    { name: "Mancherial (MNCL)", phone: "8977185376", mapUrl: "https://maps.app.goo.gl/GJyr48PkKHUjd1yS8" },
  ];

  const stats = [
    { icon: <FaUsers />, value: "10,000+", label: "Happy Clients" },
    { icon: <FaTruck />, value: "12", label: "Branches" },
    { icon: <FaAward />, value: "28+", label: "Years" },
    { icon: <FaHandshake />, value: "100%", label: "Satisfaction" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a1628 0%, #1D3557 30%, #1E3A5F 60%, #1D3557 100%)", position: "relative", overflow: "hidden" }}>
      {/* Background Elements */}
      <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 20%, rgba(255, 183, 77, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(30, 58, 95, 0.3) 0%, transparent 50%)" }} />
      
      {/* Floating Particles */}
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {(isMobile ? [
          { left: "8%", size: 3, duration: 32, top: "22%" },
          { left: "18%", size: 2, duration: 25, top: "68%" },
          { left: "28%", size: 4, duration: 42, top: "12%" },
          { left: "38%", size: 2, duration: 28, top: "85%" },
          { left: "48%", size: 3, duration: 30, top: "45%" },
          { left: "58%", size: 5, duration: 40, top: "18%" },
          { left: "68%", size: 2, duration: 36, top: "75%" },
          { left: "78%", size: 3, duration: 31, top: "55%" },
          { left: "88%", size: 4, duration: 35, top: "32%" },
          { left: "98%", size: 2, duration: 29, top: "90%" },
          { left: "15%", size: 3, duration: 38, top: "62%" },
          { left: "45%", size: 2, duration: 27, top: "8%" },
          { left: "75%", size: 4, duration: 33, top: "42%" },
          { left: "95%", size: 2, duration: 34, top: "72%" },
        ] : [
          { left: "1%", size: 4, duration: 32, top: "22%" },
          { left: "4%", size: 7, duration: 46, top: "68%" },
          { left: "7%", size: 2, duration: 25, top: "12%" },
          { left: "10%", size: 5, duration: 42, top: "85%" },
          { left: "13%", size: 3, duration: 28, top: "45%" },
          { left: "16%", size: 8, duration: 51, top: "92%" },
          { left: "19%", size: 2, duration: 30, top: "18%" },
          { left: "22%", size: 4, duration: 40, top: "75%" },
          { left: "25%", size: 6, duration: 26, top: "55%" },
          { left: "28%", size: 3, duration: 36, top: "32%" },
          { left: "31%", size: 2, duration: 33, top: "78%" },
          { left: "34%", size: 7, duration: 48, top: "8%" },
          { left: "37%", size: 3, duration: 37, top: "62%" },
          { left: "40%", size: 5, duration: 31, top: "28%" },
          { left: "43%", size: 2, duration: 44, top: "88%" },
          { left: "46%", size: 4, duration: 29, top: "42%" },
          { left: "49%", size: 8, duration: 53, top: "5%" },
          { left: "52%", size: 3, duration: 35, top: "72%" },
          { left: "55%", size: 6, duration: 39, top: "38%" },
          { left: "58%", size: 2, duration: 27, top: "95%" },
          { left: "61%", size: 5, duration: 41, top: "15%" },
          { left: "64%", size: 3, duration: 34, top: "58%" },
          { left: "67%", size: 4, duration: 38, top: "82%" },
          { left: "70%", size: 2, duration: 30, top: "25%" },
          { left: "73%", size: 7, duration: 47, top: "65%" },
          { left: "76%", size: 3, duration: 32, top: "48%" },
          { left: "79%", size: 5, duration: 43, top: "10%" },
          { left: "82%", size: 2, duration: 26, top: "90%" },
          { left: "85%", size: 8, duration: 52, top: "35%" },
          { left: "88%", size: 4, duration: 29, top: "70%" },
          { left: "91%", size: 3, duration: 36, top: "2%" },
          { left: "94%", size: 6, duration: 45, top: "52%" },
          { left: "97%", size: 2, duration: 31, top: "80%" },
          { left: "3%", size: 5, duration: 40, top: "40%" },
          { left: "23%", size: 3, duration: 28, top: "98%" },
          { left: "33%", size: 4, duration: 35, top: "20%" },
          { left: "53%", size: 2, duration: 24, top: "50%" },
          { left: "63%", size: 6, duration: 42, top: "30%" },
          { left: "83%", size: 3, duration: 33, top: "60%" },
          { left: "93%", size: 5, duration: 38, top: "85%" },
        ]).map((p, i) => (
          <Box key={i} sx={{ position: "absolute", width: `${p.size}px`, height: `${p.size}px`, background: `rgba(255, 183, 77, ${0.1 + p.size * 0.02})`, borderRadius: "50%", left: p.left, top: p.top, opacity: 0.3 + p.size * 0.03, animation: `floatUp ${p.duration}s linear infinite`, "@keyframes floatUp": { "0%": { transform: "translateY(0)" }, "100%": { transform: "translateY(-200vh)" } } }} />
        ))}
      </Box>

      {/* Hero Header */}
      <Box sx={{ position: "relative", zIndex: 1, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 }, textAlign: "center" }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 3, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>
              🏢 ABOUT US
            </Typography>
            <Typography variant="h1" sx={{ color: "#ffffff", fontWeight: 800, fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" }, mb: 2, lineHeight: 1.1 }}>
              Friends Transport <Box component="span" sx={{ background: "linear-gradient(135deg, #FFB74D 0%, #fff 50%, #FFB74D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Company</Box>
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: { xs: "1.1rem", md: "1.25rem" }, maxWidth: "600px", mx: "auto" }}>
              Delivering Trust Since 1996 — Your Reliable Partner in Parcel & Goods Transportation
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)", mb: { xs: 6, md: 10 } }} />

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, mb: { xs: 6, md: 10 } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3 }}>
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}>
              <GlassCard sx={{ p: { xs: 2.5, md: 3 }, textAlign: "center" }}>
                <Box sx={{ width: 50, height: 50, mx: "auto", mb: 2, background: "linear-gradient(135deg, rgba(255, 183, 77, 0.2) 0%, rgba(255, 183, 77, 0.05) 100%)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB74D", fontSize: "1.25rem" }}>{stat.icon}</Box>
                <Typography sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" }, fontWeight: 800, color: "#FFB74D", lineHeight: 1, mb: 0.5 }}>{stat.value}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: 500 }}>{stat.label}</Typography>
              </GlassCard>
            </motion.div>
          ))}
        </Box>
      </Container>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)", mb: { xs: 6, md: 10 } }} />

      {/* Story & Founder Section */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, mb: { xs: 8, md: 12 } }}>
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
              <Box sx={{ width: 50, height: 4, background: "linear-gradient(90deg, #FFB74D, transparent)", mr: 2, borderRadius: 2 }} />
              <Typography sx={{ color: "#FFB74D", fontWeight: 700, letterSpacing: 2, fontSize: "0.85rem" }}>OUR STORY</Typography>
            </Box>
            <Typography variant="h3" sx={{ color: "#ffffff", fontWeight: 700, mb: 3, fontSize: { xs: "1.75rem", md: "2.25rem" }, lineHeight: 1.2 }}>
              A Legacy of <Box component="span" sx={{ color: "#FFB74D" }}>Trust & Excellence</Box>
            </Typography>
            <Typography sx={{ fontSize: { xs: "1rem", md: "1.05rem" }, lineHeight: 1.9, color: "rgba(255,255,255,0.8)", mb: 3 }}>
              Founded by the visionary <strong style={{ color: "#FFB74D" }}>Mr. Mohammed Ameer Ali</strong>, Friends Transport Company has been a pioneer in the parcel service industry for over two decades. With a legacy built on trust, dedication, and quality customer service, our company continues to set new standards in safe and fast delivery of goods.
            </Typography>
            <Typography sx={{ fontSize: { xs: "1rem", md: "1.05rem" }, lineHeight: 1.9, color: "rgba(255,255,255,0.8)" }}>
              The commitment to excellence established by Mr. Ameer Ali is carried forward by his sons and grandsons, who continue to drive the company's growth with the same passion and attention to detail.
            </Typography>
          </motion.div>
        </Box>
      </Container>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)", mb: { xs: 6, md: 10 } }} />

      {/* Mission & Commitment */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, mb: { xs: 8, md: 12 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
            <motion.div variants={fadeIn}>
              <GlassCard sx={{ p: { xs: 3, md: 4 }, height: "100%", borderLeft: "4px solid #FFB74D" }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#FFB74D", mb: 2, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>Our Mission</Typography>
                <Typography sx={{ lineHeight: 1.9, color: "rgba(255,255,255,0.8)" }}>
                  To provide high-quality customer service with every delivery — whether you're sending small parcels or large shipments, we ensure your goods reach their destination safely, securely, and on time. Our customer-first approach has made us a preferred choice for businesses and individuals alike.
                </Typography>
              </GlassCard>
            </motion.div>
            <motion.div variants={fadeIn}>
              <GlassCard sx={{ p: { xs: 3, md: 4 }, height: "100%", borderLeft: "4px solid #64C8FF" }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#64C8FF", mb: 2, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>Commitment to Excellence</Typography>
                <Typography sx={{ lineHeight: 1.9, color: "rgba(255,255,255,0.8)" }}>
                  We believe in building long-term relationships with our clients by delivering exceptional service consistently. Our core values of integrity, reliability, and quality have earned us the trust of our customers. No matter the size of the shipment, we ensure that every parcel receives the same level of care.
                </Typography>
              </GlassCard>
            </motion.div>
          </Box>
        </motion.div>
      </Container>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)", mb: { xs: 6, md: 10 } }} />

      {/* Locations Section */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, mb: { xs: 8, md: 12 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 2, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>OUR NETWORK</Typography>
            <Typography variant="h3" sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "1.75rem", md: "2.5rem" } }}>Our Locations</Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
            {/* Booking Offices */}
            <GlassCard hover={false} sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ width: 44, height: 44, background: "linear-gradient(135deg, rgba(255, 183, 77, 0.3) 0%, rgba(255, 183, 77, 0.1) 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB74D" }}><FaMapMarkerAlt size={20} /></Box>
                <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: "1.15rem" }}>Booking Offices</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {bookingOffices.map((office, index) => (
                  <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, py: 1.5, borderBottom: index < bookingOffices.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                    {office.mapUrl ? (
                      <a href={office.mapUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <Typography sx={{ color: "#ffffff", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s", "&:hover": { color: "#fff" } }}>{office.name}</Typography>
                      </a>
                    ) : (
                      <Typography sx={{ color: "#ffffff", fontWeight: 500, fontSize: "0.95rem" }}>{office.name}</Typography>
                    )}
                    <a href={`tel:${office.phone.replace(/-/g, "")}`} style={{ textDecoration: "none" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, transition: "all 0.2s", "&:hover p": { color: "#fff" } }}><FaPhoneAlt size={12} color="#FFB74D" /><Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#FFB74D", transition: "all 0.2s" }}>{office.phone}</Typography></Box>
                    </a>
                  </Box>
                ))}
              </Box>
            </GlassCard>

            {/* Delivery Offices */}
            <GlassCard hover={false} sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ width: 44, height: 44, background: "linear-gradient(135deg, rgba(100, 200, 255, 0.3) 0%, rgba(100, 200, 255, 0.1) 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64C8FF" }}><FaMapMarkerAlt size={20} /></Box>
                <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: "1.15rem" }}>Delivery Offices</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {deliveryOffices.map((office, index) => (
                  <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, py: 1.5, borderBottom: index < deliveryOffices.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                    {office.mapUrl ? (
                      <a href={office.mapUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <Typography sx={{ color: "#ffffff", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s", "&:hover": { color: "#fff" } }}>{office.name}</Typography>
                      </a>
                    ) : (
                      <Typography sx={{ color: "#ffffff", fontWeight: 500, fontSize: "0.95rem" }}>{office.name}</Typography>
                    )}
                    <a href={`tel:${office.phone.replace(/-/g, "")}`} style={{ textDecoration: "none" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, transition: "all 0.2s", "&:hover p": { color: "#fff" } }}><FaPhoneAlt size={12} color="#64C8FF" /><Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#64C8FF", transition: "all 0.2s" }}>{office.phone}</Typography></Box>
                    </a>
                  </Box>
                ))}
              </Box>
            </GlassCard>
          </Box>
        </motion.div>
      </Container>

      {/* Office Images Section - Clean Gallery */}
      <Box sx={{ position: "relative", zIndex: 1, py: { xs: 8, md: 12 }, background: "linear-gradient(180deg, rgba(10, 22, 40, 0.5) 0%, rgba(29, 53, 87, 0.8) 100%)" }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {/* Section Header */}
            <motion.div variants={fadeIn}>
              <Box sx={{ textAlign: "center", mb: { xs: 5, md: 6 } }}>
                <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 2, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>
                  📍 WHERE WE WORK
                </Typography>
                <Typography variant="h3" sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "2rem", md: "2.5rem" }, mb: 2 }}>
                  Our <Box component="span" sx={{ background: "linear-gradient(135deg, #FFB74D 0%, #fff 50%, #FFB74D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Office</Box>
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: { xs: "1rem", md: "1.1rem" }, maxWidth: "500px", mx: "auto" }}>
                  Take a glimpse into our professional workspace
                </Typography>
              </Box>
            </motion.div>

            {/* Gallery Grid - 3 equal images in a row */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: { xs: 3, md: 3 } }}>
              {/* Image 1 - Office Interior */}
              <motion.div variants={fadeIn}>
                <Box sx={{ 
                  position: "relative", 
                  height: { xs: "260px", md: "320px" }, 
                  borderRadius: "20px", 
                  overflow: "hidden",
                  boxShadow: "0 15px 40px rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  "&:hover img": { transform: "scale(1.05)" },
                }}>
                  <Box component="img" src={office1} alt="FTC Head Office Interior" sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                  <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)" }} />
                  <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 2.5, md: 3 } }}>
                    <Box sx={{ display: "inline-block", background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", px: 1.5, py: 0.4, borderRadius: "6px", mb: 1 }}>
                      <Typography sx={{ color: "#1D3557", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "1px" }}>HEAD OFFICE</Typography>
                    </Box>
                    <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "1rem", md: "1.15rem" } }}>Office Interior</Typography>
                  </Box>
                </Box>
              </motion.div>

              {/* Image 2 - Building Exterior */}
              <motion.div variants={fadeIn}>
                <Box sx={{ 
                  position: "relative", 
                  height: { xs: "260px", md: "320px" }, 
                  borderRadius: "20px", 
                  overflow: "hidden",
                  boxShadow: "0 15px 40px rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  "&:hover img": { transform: "scale(1.05)" },
                }}>
                  <Box component="img" src={office2} alt="FTC Building Exterior" sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                  <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)" }} />
                  <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 2.5, md: 3 } }}>
                    <Box sx={{ display: "inline-block", background: "rgba(100, 200, 255, 0.9)", px: 1.5, py: 0.4, borderRadius: "6px", mb: 1 }}>
                      <Typography sx={{ color: "#1D3557", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "1px" }}>BUILDING</Typography>
                    </Box>
                    <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "1rem", md: "1.15rem" } }}>Office Exterior</Typography>
                  </Box>
                </Box>
              </motion.div>

              {/* Image 3 - Logo Signage */}
              <motion.div variants={fadeIn}>
                <Box sx={{ 
                  position: "relative", 
                  height: { xs: "260px", md: "320px" }, 
                  borderRadius: "20px", 
                  overflow: "hidden",
                  boxShadow: "0 15px 40px rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  gridColumn: { xs: "auto", sm: "span 2", md: "auto" },
                  cursor: "pointer",
                  "&:hover img": { transform: "scale(1.05)" },
                }}>
                  <Box component="img" src={office3} alt="FTC Logo Signage" sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                  <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)" }} />
                  <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 2.5, md: 3 } }}>
                    <Box sx={{ display: "inline-block", background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", px: 1.5, py: 0.4, borderRadius: "6px", mb: 1 }}>
                      <Typography sx={{ color: "#1D3557", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "1px" }}>BRAND</Typography>
                    </Box>
                    <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "1rem", md: "1.15rem" } }}>FTC Logo & Signage</Typography>
                  </Box>
                </Box>
              </motion.div>
            </Box>

            {/* Bottom Info Bar */}
            <motion.div variants={fadeIn}>
              <Box sx={{ 
                mt: { xs: 4, md: 5 }, 
                display: "grid", 
                gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, 
                gap: 2,
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                p: { xs: 2, md: 2.5 },
              }}>
                {[
                  { icon: <FaBuilding />, label: "Head Office", value: "Hyderabad" },
                  { icon: <FaMapMarkerAlt />, label: "Branches", value: "12 Locations" },
                  { icon: <FaTruck />, label: "Fleet", value: "Own Trucks" },
                  { icon: <FaUsers />, label: "Staff", value: "50+ Members" },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: { xs: 1, md: 1.5 } }}>
                    <Box sx={{ width: 40, height: 40, background: "rgba(255, 183, 77, 0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB74D", fontSize: "0.9rem" }}>{item.icon}</Box>
                    <Box>
                      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</Typography>
                      <Typography sx={{ color: "#ffffff", fontWeight: 600, fontSize: { xs: "0.85rem", md: "0.95rem" } }}>{item.value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      {/* Footer Info */}
      <Box sx={{ position: "relative", zIndex: 1, py: { xs: 4, md: 6 }, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", mb: 1 }}>GST ID: 36AAFFF2744R1ZX</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
              Thank You for Choosing Friends Transport Company — Where Your Goods Are in Safe Hands!
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;
