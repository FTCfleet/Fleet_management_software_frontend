import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Container } from "@mui/material";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaTruck, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: "/", text: "Home" },
    { to: "/track", text: "Track Shipment" },
    { to: "/about", text: "About Us" },
  ];

  const contactInfo = [
    { icon: <FaPhone size={14} />, text: "040-24614381", isPhone: true },
    { icon: <FaEnvelope size={14} />, text: "ftchydindia@gmail.com", isEmail: true },
    { icon: <FaMapMarkerAlt size={14} />, text: "Hyderabad, India" },
  ];

  return (
    <>
      {/* Golden Divider above Footer */}
      <Box sx={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255, 183, 77, 0.5) 20%, rgba(255, 183, 77, 0.8) 50%, rgba(255, 183, 77, 0.5) 80%, transparent 100%)" }} />
      
      <Box
        component="footer"
        sx={{
          background: "linear-gradient(180deg, #0a1628 0%, #0d1a2d 100%)",
          position: "relative",
          overflow: "hidden",
          pt: { xs: 6, md: 8 },
          pb: { xs: 3, md: 4 },
        }}
      >
      {/* Background Elements */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 20% 100%, rgba(255, 183, 77, 0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 0%, rgba(30, 58, 95, 0.2) 0%, transparent 50%)",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Main Footer Content */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "2fr 1fr 1fr 1.5fr" },
            gap: { xs: 4, md: 6 },
            mb: { xs: 4, md: 6 },
          }}
        >
          {/* Brand Section */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  background: "linear-gradient(135deg, rgba(255, 183, 77, 0.2) 0%, rgba(255, 183, 77, 0.05) 100%)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFB74D",
                }}
              >
                <FaTruck size={22} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                Friends Transport
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.95rem",
                lineHeight: 1.8,
                maxWidth: "300px",
              }}
            >
              Your trusted partner in parcel and goods transportation since 1996. Delivering excellence across Telangana.
            </Typography>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography
              sx={{
                color: "#FFB74D",
                fontWeight: 600,
                fontSize: "1rem",
                mb: 2.5,
                letterSpacing: "0.5px",
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.95rem",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        color: "#FFB74D",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    {link.text}
                  </Typography>
                </Link>
              ))}
            </Box>
          </Box>

          {/* Business Hours */}
          <Box>
            <Typography
              sx={{
                color: "#FFB74D",
                fontWeight: 600,
                fontSize: "1rem",
                mb: 2.5,
                letterSpacing: "0.5px",
              }}
            >
              Business Hours
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>
                Monday - Saturday
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>
                11:00 AM - 9:00 PM
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", mt: 1 }}>
                Sunday: Closed
              </Typography>
            </Box>
          </Box>

          {/* Contact Info */}
          <Box>
            <Typography
              sx={{
                color: "#FFB74D",
                fontWeight: 600,
                fontSize: "1rem",
                mb: 2.5,
                letterSpacing: "0.5px",
              }}
            >
              Contact Us
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {contactInfo.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ color: "#FFB74D", display: "flex", alignItems: "center" }}>
                    {item.icon}
                  </Box>
                  {item.isEmail ? (
                    <a
                      href={`mailto:${item.text}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.95rem",
                          transition: "color 0.2s ease",
                          "&:hover": { color: "#FFB74D" },
                        }}
                      >
                        {item.text}
                      </Typography>
                    </a>
                  ) : item.isPhone ? (
                    <a
                      href={`tel:${item.text.replace(/-/g, "")}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.95rem",
                          transition: "color 0.2s ease",
                          "&:hover": { color: "#FFB74D" },
                        }}
                      >
                        {item.text}
                      </Typography>
                    </a>
                  ) : (
                    <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>
                      {item.text}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255, 183, 77, 0.3), transparent)",
            mb: { xs: 3, md: 4 },
          }}
        />

        {/* Bottom Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", textAlign: { xs: "center", sm: "left" } }}>
            © {currentYear} Friends Transport Company. All rights reserved.
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            GST: 36AAFFF2744R1ZX
          </Typography>
        </Box>
      </Container>
    </Box>
    </>
  );
};

export default Footer;
