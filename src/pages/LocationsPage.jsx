import "react";
import { Typography, Box, Container, useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaBuilding } from "react-icons/fa";
import "../css/glassmorphism.css";

const GlassCard = ({ children, sx = {}, hover = true, ...props }) => (
  <Box sx={{ background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "24px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", ...(hover && { "&:hover": { transform: "translateY(-4px)", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)", borderColor: "rgba(255, 183, 77, 0.3)" } }), ...sx }} {...props}>{children}</Box>
);

const LocationsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const fadeIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

  const bookingOffices = [
    { badge: "FTC-1", name: "Head Office", location: "Old Feelkhana, Hyderabad", phone: "040-24614381", note: "Drop off point for Karimnagar, Sultanabad, Pedapally", mapUrl: "https://maps.app.goo.gl/gtTf3cu4dfDgRJL16" },
    { badge: "FTC-2", name: "Goshamahal Road", location: "Feelkhana, Hyderabad", phone: "040-24604381", mapUrl: "https://maps.app.goo.gl/Ep8ncVerzcffE34e7" },
    { badge: "FTC-3", name: "Bahadurpura", location: "Hyderabad", phone: "9515409041", mapUrl: "https://maps.app.goo.gl/auxyAkJLFrkrGikZ9" },
    { badge: "FTC-4", name: "Secunderabad", location: "Secunderabad", phone: "040-29331533", mapUrl: "https://maps.app.goo.gl/CmwMjbafZeMJZiXz8" },
  ];

  const deliveryOffices = [
    { name: "Karimnagar", code: "KNR", phone: "9908690827", mapUrl: "https://maps.app.goo.gl/1VBYHHEqUBg6dAyM7" },
    { name: "Sultanabad", code: "SBD", phone: "9849701721", mapUrl: "https://maps.app.goo.gl/naRZdKJMTn9CUpNt6" },
    { name: "Peddapally", code: "PDPL", phone: "9030478492", mapUrl: "https://maps.app.goo.gl/ouFkftr4WGVQjnQo8" },
    { name: "Ramagundam NTPC", code: "NTPC", phone: "9866239010", mapUrl: "https://maps.app.goo.gl/13o1fVkFemGnsUdX6" },
    { name: "Godavarikhani", code: "GDK", phone: "9949121267", mapUrl: "https://maps.app.goo.gl/2XebAQNTnD5KxehDA" },
    { name: "Mancherial", code: "MNCL", phone: "8977185376", mapUrl: "https://maps.app.goo.gl/GJyr48PkKHUjd1yS8" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a1628 0%, #1D3557 30%, #1E3A5F 60%, #1D3557 100%)", position: "relative", overflow: "hidden" }}>
      {/* Background Elements */}
      <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 20%, rgba(255, 183, 77, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(30, 58, 95, 0.3) 0%, transparent 50%)" }} />
      
      {/* Floating Particles */}
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {(isMobile ? [
          { left: "5%", size: 3, duration: 34, top: "35%" },
          { left: "15%", size: 2, duration: 28, top: "12%" },
          { left: "25%", size: 4, duration: 30, top: "78%" },
          { left: "35%", size: 2, duration: 37, top: "55%" },
          { left: "45%", size: 3, duration: 26, top: "22%" },
          { left: "55%", size: 5, duration: 32, top: "88%" },
          { left: "65%", size: 2, duration: 29, top: "45%" },
          { left: "75%", size: 4, duration: 38, top: "8%" },
          { left: "85%", size: 2, duration: 35, top: "68%" },
          { left: "95%", size: 3, duration: 40, top: "92%" },
          { left: "10%", size: 2, duration: 33, top: "62%" },
          { left: "40%", size: 4, duration: 31, top: "15%" },
          { left: "70%", size: 2, duration: 27, top: "82%" },
          { left: "90%", size: 3, duration: 36, top: "48%" },
        ] : [
          { left: "1%", size: 5, duration: 34, top: "35%" },
          { left: "4%", size: 2, duration: 28, top: "12%" },
          { left: "7%", size: 7, duration: 47, top: "78%" },
          { left: "10%", size: 3, duration: 30, top: "55%" },
          { left: "13%", size: 6, duration: 37, top: "22%" },
          { left: "16%", size: 2, duration: 26, top: "88%" },
          { left: "19%", size: 8, duration: 52, top: "45%" },
          { left: "22%", size: 4, duration: 32, top: "8%" },
          { left: "25%", size: 3, duration: 29, top: "68%" },
          { left: "28%", size: 5, duration: 38, top: "92%" },
          { left: "31%", size: 2, duration: 35, top: "28%" },
          { left: "34%", size: 7, duration: 49, top: "62%" },
          { left: "37%", size: 4, duration: 40, top: "15%" },
          { left: "40%", size: 3, duration: 33, top: "82%" },
          { left: "43%", size: 6, duration: 31, top: "48%" },
          { left: "46%", size: 2, duration: 27, top: "5%" },
          { left: "49%", size: 8, duration: 54, top: "72%" },
          { left: "52%", size: 4, duration: 36, top: "38%" },
          { left: "55%", size: 3, duration: 42, top: "95%" },
          { left: "58%", size: 5, duration: 30, top: "18%" },
          { left: "61%", size: 3, duration: 39, top: "58%" },
          { left: "64%", size: 2, duration: 34, top: "85%" },
          { left: "67%", size: 6, duration: 44, top: "32%" },
          { left: "70%", size: 4, duration: 28, top: "75%" },
          { left: "73%", size: 2, duration: 41, top: "2%" },
          { left: "76%", size: 7, duration: 48, top: "52%" },
          { left: "79%", size: 3, duration: 31, top: "25%" },
          { left: "82%", size: 5, duration: 37, top: "90%" },
          { left: "85%", size: 2, duration: 25, top: "42%" },
          { left: "88%", size: 8, duration: 53, top: "65%" },
          { left: "91%", size: 4, duration: 33, top: "10%" },
          { left: "94%", size: 3, duration: 29, top: "80%" },
          { left: "97%", size: 6, duration: 45, top: "50%" },
          { left: "3%", size: 4, duration: 35, top: "70%" },
          { left: "23%", size: 2, duration: 27, top: "98%" },
          { left: "33%", size: 5, duration: 40, top: "40%" },
          { left: "53%", size: 3, duration: 32, top: "20%" },
          { left: "63%", size: 7, duration: 46, top: "60%" },
          { left: "83%", size: 2, duration: 26, top: "30%" },
          { left: "93%", size: 4, duration: 38, top: "88%" },
        ]).map((p, i) => (
          <Box key={i} sx={{ position: "absolute", width: `${p.size}px`, height: `${p.size}px`, background: `rgba(255, 183, 77, ${0.1 + p.size * 0.02})`, borderRadius: "50%", left: p.left, top: p.top, opacity: 0.3 + p.size * 0.03, animation: `floatUp ${p.duration}s linear infinite`, "@keyframes floatUp": { "0%": { transform: "translateY(0)" }, "100%": { transform: "translateY(-200vh)" } } }} />
        ))}
      </Box>

      {/* Hero Header */}
      <Box sx={{ position: "relative", zIndex: 1, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 }, textAlign: "center" }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Typography component="span" sx={{ display: "inline-block", background: "rgba(255, 183, 77, 0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 183, 77, 0.3)", borderRadius: "50px", px: 3, py: 0.75, mb: 3, color: "#FFB74D", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px" }}>
              📍 OUR NETWORK
            </Typography>
            <Typography variant="h1" sx={{ color: "#ffffff", fontWeight: 800, fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" }, mb: 2, lineHeight: 1.1 }}>
              Our <Box component="span" sx={{ background: "linear-gradient(135deg, #FFB74D 0%, #fff 50%, #FFB74D 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Locations</Box>
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: { xs: "1.1rem", md: "1.25rem" }, maxWidth: "600px", mx: "auto" }}>
              Strategically located offices across Telangana for your convenience
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)", mb: { xs: 6, md: 8 } }} />

      {/* Booking Offices Section */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, mb: { xs: 6, md: 8 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <motion.div variants={fadeIn}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <Box sx={{ width: 50, height: 50, background: "linear-gradient(135deg, rgba(255, 183, 77, 0.3) 0%, rgba(255, 183, 77, 0.1) 100%)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB74D" }}><FaBuilding size={22} /></Box>
              <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "1.5rem", md: "2rem" } }}>Booking Offices</Typography>
            </Box>
          </motion.div>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 3 }}>
            {bookingOffices.map((office, index) => (
              <motion.div key={index} variants={fadeIn}>
                <GlassCard sx={{ p: { xs: 3, md: 4 }, height: "100%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {/* FTC Badge with shine effect - golden bg, blue text */}
                  <Box sx={{ 
                    position: "absolute", top: 16, right: 16, 
                    background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", 
                    borderRadius: "8px", px: 1.5, py: 0.5, 
                    boxShadow: "0 4px 12px rgba(255, 183, 77, 0.3)",
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0, left: "-100%",
                      width: "100%", height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                      transition: "left 0.5s ease",
                    },
                    "&:hover": {
                      transform: "scale(1.05)",
                      "&::before": { left: "100%" },
                    },
                  }}>
                    <Box component="span" sx={{ color: "#404269 !important", textShadow: "1px 1px 1px white", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "1px", fontFamily: "'Segoe UI', sans-serif", position: "relative", zIndex: 1, lineHeight: 2, display: "block", textAlign: "center" }}>{office.badge}</Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, flex: 1 }}>
                    <Box sx={{ width: 56, height: 56, flexShrink: 0, background: "linear-gradient(135deg, rgba(255, 183, 77, 0.25) 0%, rgba(255, 183, 77, 0.08) 100%)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB74D" }}><FaMapMarkerAlt size={24} /></Box>
                    <Box sx={{ flex: 1, pr: 6, display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: "1.15rem", mb: 0.25 }}>{office.name}</Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", mb: 1 }}>{office.location}</Typography>
                      {office.note && (
                        <Box sx={{ background: "rgba(255, 183, 77, 0.1)", border: "1px solid rgba(255, 183, 77, 0.2)", borderRadius: "8px", px: 1.5, py: 0.75, mb: 1.5, display: "inline-block", maxWidth: "fit-content" }}>
                          <Typography sx={{ color: "#FFB74D", fontSize: "0.8rem", fontWeight: 500 }}>{office.note}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {/* Phone + Call Now together like homepage, and See on Map */}
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: "auto", pt: 1, alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, background: "rgba(255, 255, 255, 0.05)", borderRadius: "12px", px: 2, py: 1, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                      <FaPhoneAlt size={14} color="#FFB74D" />
                      <Typography sx={{ color: "#ffffff", fontSize: "0.95rem", fontWeight: 600 }}>{office.phone}</Typography>
                      <a href={`tel:${office.phone.replace(/-/g, "")}`} style={{ textDecoration: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", borderRadius: "8px", px: 2, py: 0.75, cursor: "pointer", transition: "all 0.2s", "&:hover": { transform: "scale(1.03)" } }}>
                          <FaPhoneAlt size={12} color="#1D3557" />
                          <Box component="span" sx={{ color: "#1D3557", fontSize: "0.85rem", fontWeight: 700 }}>Call Now</Box>
                        </Box>
                      </a>
                    </Box>
                    {office.mapUrl && (
                      <a href={office.mapUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: "linear-gradient(135deg, rgba(255, 183, 77, 0.2) 0%, rgba(255, 183, 77, 0.1) 100%)", border: "2px solid #FFB74D", borderRadius: "10px", px: 2.5, py: 1.15, cursor: "pointer", transition: "all 0.2s", "& svg": { transition: "all 0.2s" }, "&:hover": { background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", "& p": { color: "#1D3557" }, "& svg": { color: "#1D3557 !important" } } }}>
                          <FaMapMarkerAlt size={14} color="#FFB74D" style={{ transition: "all 0.2s" }} />
                          <Typography sx={{ color: "#FFB74D", fontSize: "0.9rem", fontWeight: 600, transition: "all 0.2s" }}>See on Map</Typography>
                        </Box>
                      </a>
                    )}
                  </Box>
                </GlassCard>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>

      {/* Golden Divider */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)", mb: { xs: 6, md: 8 } }} />

      {/* Delivery Offices Section */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, mb: { xs: 8, md: 12 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <motion.div variants={fadeIn}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <Box sx={{ width: 50, height: 50, background: "linear-gradient(135deg, rgba(100, 200, 255, 0.3) 0%, rgba(100, 200, 255, 0.1) 100%)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64C8FF" }}><FaBuilding size={22} /></Box>
              <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 700, fontSize: { xs: "1.5rem", md: "2rem" } }}>Delivery Offices</Typography>
            </Box>
          </motion.div>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
            {deliveryOffices.map((office, index) => (
              <motion.div key={index} variants={fadeIn}>
                <GlassCard sx={{ p: { xs: 2.5, md: 3 }, height: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                      <Box sx={{ width: 44, height: 44, flexShrink: 0, background: "linear-gradient(135deg, rgba(100, 200, 255, 0.25) 0%, rgba(100, 200, 255, 0.08) 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64C8FF" }}><FaMapMarkerAlt size={18} /></Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: "#ffffff", fontWeight: 700, fontSize: "1rem", mb: 0.25 }}>{office.name}</Typography>
                        <Typography sx={{ color: "#64C8FF", fontWeight: 600, fontSize: "0.8rem", mb: 0.5 }}>({office.code})</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaPhoneAlt size={11} color="rgba(255,255,255,0.5)" />
                          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{office.phone}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                      <a href={`tel:${office.phone.replace(/-/g, "")}`} style={{ textDecoration: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "linear-gradient(135deg, #64C8FF 0%, #4BA8DF 100%)", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", "&:hover": { transform: "scale(1.05)", boxShadow: "0 4px 15px rgba(100, 200, 255, 0.4)" } }}>
                          <FaPhoneAlt size={14} color="#1D3557" />
                        </Box>
                      </a>
                      {office.mapUrl && (
                        <a href={office.mapUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "rgba(100, 200, 255, 0.15)", border: "1px solid rgba(100, 200, 255, 0.3)", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", "&:hover": { background: "rgba(100, 200, 255, 0.25)", borderColor: "rgba(100, 200, 255, 0.5)" } }}>
                            <FaMapMarkerAlt size={14} color="#64C8FF" />
                          </Box>
                        </a>
                      )}
                    </Box>
                  </Box>
                </GlassCard>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>

      {/* Contact CTA */}
      <Box sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 8 }, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Container maxWidth="md">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 700, mb: 2, fontSize: { xs: "1.5rem", md: "2rem" } }}>Need Help Finding Us?</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3, fontSize: "1.05rem" }}>Contact our main office for directions and assistance</Typography>
              <GlassCard hover={false} sx={{ display: "inline-flex", alignItems: "center", gap: 2, px: 3, py: 1.5 }}>
                <FaPhoneAlt color="#FFB74D" size={18} />
                <Typography sx={{ color: "#ffffff", fontWeight: 600 }}>040-24614381</Typography>
                <a href="tel:04024614381" style={{ textDecoration: "none" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", borderRadius: "8px", px: 2, py: 0.75, cursor: "pointer", transition: "all 0.2s", "&:hover": { transform: "scale(1.03)" } }}>
                    <FaPhoneAlt size={12} color="#1D3557" />
                    <Box component="span" sx={{ color: "#1D3557", fontSize: "0.85rem", fontWeight: 700 }}>Call Now</Box>
                  </Box>
                </a>
              </GlassCard>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default LocationsPage;
