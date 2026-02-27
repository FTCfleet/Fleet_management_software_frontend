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
      {/* Hero Section - Journey Timeline */}
      <Box sx={{ position: "relative", minHeight: { xs: "100vh", md: "100vh" }, background: "linear-gradient(135deg, #0a1628 0%, #1D3557 50%, #1E3A5F 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {/* Trucks Background Image - Backmost Layer */}
        <Box sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("/trucks-BLbpdzQC.webp")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.06,
          filter: "grayscale(100%) blur(1px)",
          pointerEvents: "none"
        }} />

        {/* Concrete Wall Texture */}
        <Box sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.08,
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='concrete'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' seed='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23concrete)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          pointerEvents: "none"
        }} />

        {/* India Map Outline Background - Using Actual Image */}
        <Box sx={{ 
          position: "absolute", 
          inset: 0, 
          opacity: { xs: 0.25, md: 0.2 },
          backgroundImage: `url("/India-Map-Outline.webp")`,
          backgroundSize: { xs: "100%", md: "50%" },
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: { 
            xs: "brightness(3) contrast(2.5) drop-shadow(0 0 20px rgba(255,183,77,1)) drop-shadow(0 0 40px rgba(255,183,77,0.8))",
            md: "brightness(2.5) contrast(2) drop-shadow(0 0 15px rgba(255,183,77,1)) drop-shadow(0 0 30px rgba(255,183,77,0.9)) drop-shadow(0 0 50px rgba(255,183,77,0.7)) drop-shadow(0 0 80px rgba(255,183,77,0.5))"
          }
        }} />

        {/* Subtle Grain Overlay */}
        <Box sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          background: `radial-gradient(circle, rgba(255,183,77,0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none"
        }} />

        {/* White Dot Pattern Texture */}
        <Box sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.15,
          background: `radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          pointerEvents: "none"
        }} />

        {/* Animated Golden Circle Effects */}
        <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {/* Large Golden Circles */}
          {[
            { size: 400, left: "10%", top: "20%", duration: 25, delay: 0 },
            { size: 350, right: "15%", top: "60%", duration: 30, delay: 5 },
            { size: 300, left: "70%", bottom: "15%", duration: 28, delay: 10 },
            { size: 250, left: "25%", bottom: "25%", duration: 22, delay: 3 }
          ].map((circle, i) => (
            <Box key={`circle-${i}`} sx={{
              position: "absolute",
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,183,77,0.15) 0%, rgba(255,183,77,0.05) 40%, transparent 70%)",
              ...(circle.left && { left: circle.left }),
              ...(circle.right && { right: circle.right }),
              ...(circle.top && { top: circle.top }),
              ...(circle.bottom && { bottom: circle.bottom }),
              animation: `pulse ${circle.duration}s ease-in-out infinite`,
              animationDelay: `${circle.delay}s`,
              "@keyframes pulse": {
                "0%, 100%": { 
                  transform: "scale(1)",
                  opacity: 0.3
                },
                "50%": { 
                  transform: "scale(1.2)",
                  opacity: 0.6
                }
              }
            }} />
          ))}
        </Box>

        {/* Animated White Dot Particles */}
        <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[...Array(30)].map((_, i) => (
            <Box key={`particle-${i}`} sx={{ 
              position: "absolute", 
              width: `${1.5 + Math.random() * 3}px`, 
              height: `${1.5 + Math.random() * 3}px`, 
              background: `rgba(255, 255, 255, ${0.4 + Math.random() * 0.6})`, 
              borderRadius: "50%",
              boxShadow: "0 0 4px rgba(255,255,255,0.5)",
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`, 
              animation: `floatParticle ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`,
              "@keyframes floatParticle": { 
                "0%": { 
                  transform: "translate(0, 0) scale(1)", 
                  opacity: 0 
                }, 
                "10%": { opacity: 1 },
                "90%": { opacity: 1 },
                "100%": { 
                  transform: `translate(${-50 + Math.random() * 100}px, -100vh) scale(${0.5 + Math.random() * 0.5})`, 
                  opacity: 0 
                } 
              } 
            }} />
          ))}
        </Box>

        {/* Golden Sparkle Effects */}
        <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[...Array(15)].map((_, i) => (
            <Box key={`sparkle-${i}`} sx={{ 
              position: "absolute", 
              width: `${2 + Math.random() * 4}px`, 
              height: `${2 + Math.random() * 4}px`, 
              background: `rgba(255, 183, 77, ${0.6 + Math.random() * 0.4})`, 
              borderRadius: "50%",
              boxShadow: "0 0 8px rgba(255,183,77,0.8)",
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`, 
              animation: `sparkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              "@keyframes sparkle": { 
                "0%, 100%": { 
                  transform: "scale(0)",
                  opacity: 0 
                }, 
                "50%": { 
                  transform: "scale(1.5)",
                  opacity: 1 
                }
              } 
            }} />
          ))}
        </Box>

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {/* Title */}
            <motion.div variants={fadeIn}>
              <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
                <Typography variant="h1" sx={{ 
                  color: "#ffffff", 
                  fontSize: { xs: "2rem", sm: "3rem", md: "4rem" }, 
                  fontWeight: 800, 
                  lineHeight: 1.1, 
                  mb: 1,
                  textShadow: "0 4px 30px rgba(0,0,0,0.5)" 
                }}>
                  FRIENDS TRANSPORT CO.
                </Typography>
                <Typography sx={{ 
                  color: "#FFB74D", 
                  fontSize: { xs: "1rem", sm: "1.5rem", md: "2rem" }, 
                  fontWeight: 600,
                  letterSpacing: "2px",
                  textShadow: "0 2px 20px rgba(255,183,77,0.5)" 
                }}>
                   1970 to 2026 & accelerating
                </Typography>
                
                {/* Handshake Logo */}
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  // mt: 2 
                }}>
                  <Box 
                    component="img" 
                    src="/handshake.webp" 
                    alt="Handshake" 
                    sx={{ 
                      width: { xs: "100px", md: "130px" },
                      height: "auto",
                      opacity: 0.9,
                      filter: "drop-shadow(0 4px 12px rgba(255, 171, 45, 0.55))"
                    }} 
                  />
                </Box>
              </Box>
            </motion.div>

            {/* Timeline Container */}
            <motion.div variants={fadeIn}>
              <Box sx={{ 
                position: "relative",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
                gap: { xs: 3, md: 4 },
                alignItems: "center",
                maxWidth: "1400px",
                mx: "auto",
                py: { xs: 3, md: 4 }
              }}>
                
                {/* 1970s - Left Side */}
                <Box sx={{ 
                  position: "relative",
                  order: { xs: 1, md: 1 }
                }}>
                  <Box sx={{
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    border: "3px solid rgba(139,69,19,0.5)",
                    transform: { xs: "none", md: "rotate(-2deg)" },
                    transition: "all 0.4s ease",
                    "&:hover": {
                      transform: { xs: "scale(1.02)", md: "rotate(-2deg) scale(1.05)" },
                      boxShadow: "0 25px 80px rgba(139,69,19,0.4)"
                    }
                  }}>
                    <Box 
                      component="img" 
                      src="/black&white.jpeg" 
                      alt="1970 Fleet" 
                      sx={{ 
                        width: "100%", 
                        height: { xs: "250px", md: "350px" },
                        objectFit: "cover",
                        filter: "grayscale(100%) contrast(1.15) sepia(0.3) brightness(0.95)",
                        display: "block"
                      }} 
                    />
                    {/* Simple Vintage Overlay */}
                    <Box sx={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(255,248,220,0.12) 0%, rgba(139,69,19,0.18) 100%)",
                      mixBlendMode: "multiply",
                      pointerEvents: "none"
                    }} />
                    {/* Year Badge */}
                    <Box sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      background: "linear-gradient(135deg, #8B4513 0%, #654321 100%)",
                      px: 3,
                      py: 1.5,
                      borderRadius: "12px",
                      border: "2px solid rgba(255,248,220,0.4)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
                    }}>
                      <Typography sx={{ 
                        color: "#FFF8DC", 
                        fontWeight: 800, 
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                      }}>
                        1970
                      </Typography>
                    </Box>
                    {/* Info Overlay */}
                    <Box sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)",
                      p: { xs: 2, md: 3 }
                    }}>
                      <Typography sx={{ 
                        color: "#FFF8DC", 
                        fontWeight: 700, 
                        fontSize: { xs: "1rem", md: "1.25rem" },
                        mb: 0.5
                      }}>
                        The Beginning
                      </Typography>
                      <Typography sx={{ 
                        color: "rgba(255,248,220,0.9)", 
                        fontSize: { xs: "0.85rem", md: "0.95rem" },
                        lineHeight: 1.5
                      }}>
                        Full load transport services established
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Center - India Map with Hyderabad Pin & Curved Dotted Lines */}
                <Box sx={{ 
                  position: "relative",
                  display: { xs: "none", md: "flex" },
                  flexDirection: "column",
                  alignItems: "center",
                  order: 2,
                  px: 4
                }}>
                  {/* Left Curved Dotted Line */}
                  <Box sx={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    width: "42%",
                    height: "80px",
                    transform: "translateY(-50%)"
                  }}>
                    <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                      <defs>
                        <filter id="leftGlow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Curved path from left to center */}
                      <path 
                        d="M 0 40 Q 75 20, 150 40 Q 225 60, 300 40" 
                        fill="none" 
                        stroke="#FFB74D" 
                        strokeWidth="3"
                        strokeDasharray="15,10"
                        filter="url(#leftGlow)"
                      />
                      {/* Arrow at the end */}
                      <polygon 
                        points="300,40 290,35 290,45" 
                        fill="#FFB74D"
                        filter="url(#leftGlow)"
                      />
                    </svg>
                  </Box>

                  {/* Right Curved Dotted Line */}
                  <Box sx={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    width: "42%",
                    height: "80px",
                    transform: "translateY(-50%)"
                  }}>
                    <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                      <defs>
                        <filter id="rightGlow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Curved path from center to right */}
                      <path 
                        d="M 0 40 Q 75 60, 150 40 Q 225 20, 300 40" 
                        fill="none" 
                        stroke="#FFB74D" 
                        strokeWidth="3"
                        strokeDasharray="15,10"
                        filter="url(#rightGlow)"
                      />
                      {/* Arrow at the start */}
                      <polygon 
                        points="0,40 10,35 10,45" 
                        fill="#FFB74D"
                        filter="url(#rightGlow)"
                      />
                    </svg>
                  </Box>

                  {/* Static Hyderabad Pin (No Animation) */}
                  <Box sx={{
                    position: "relative",
                    width: "80px",
                    height: "90px",
                    filter: "drop-shadow(0 8px 16px rgba(255,183,77,0.4))"
                  }}>
                    {/* Modern Pin Design */}
                    <svg width="80" height="90" viewBox="0 0 80 90">
                      <defs>
                        <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: "#FFB74D", stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: "#FF9800", stopOpacity: 1 }} />
                        </linearGradient>
                        <filter id="pinShadow">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                          <feOffset dx="0" dy="4" result="offsetblur"/>
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.5"/>
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Pin Shape */}
                      <path 
                        d="M40 5 C25 5 13 17 13 32 C13 50 40 85 40 85 C40 85 67 50 67 32 C67 17 55 5 40 5 Z" 
                        fill="url(#pinGradient)"
                        stroke="#FF9800"
                        strokeWidth="2.5"
                        filter="url(#pinShadow)"
                      />
                      {/* Inner Circle */}
                      <circle cx="40" cy="32" r="14" fill="#1D3557" stroke="#0a1628" strokeWidth="2"/>
                      {/* Highlight */}
                      <ellipse cx="35" cy="28" rx="6" ry="8" fill="rgba(255,255,255,0.3)"/>
                    </svg>
                    
                    {/* Hyderabad Label with Better Styling */}
                    <Typography sx={{
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      color: "#FFB74D",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      whiteSpace: "nowrap",
                      mt: 1.5,
                      textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(255,183,77,0.6)",
                      letterSpacing: "0.5px"
                    }}>
                      Hyderabad
                    </Typography>
                  </Box>

                  {/* Stylish Years Badge */}
                  <Box sx={{
                    mt: 6,
                    background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)",
                    px: 5,
                    py: 2.5,
                    borderRadius: "60px",
                    border: "4px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 10px 40px rgba(255,183,77,0.6), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    transform: "rotate(-2deg)",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: -8,
                      borderRadius: "60px",
                      background: "linear-gradient(135deg, rgba(255,183,77,0.4), transparent)",
                      filter: "blur(12px)",
                      zIndex: -1
                    }
                  }}>
                    <Typography sx={{
                      color: "#1D3557",
                      fontWeight: 900,
                      fontSize: "2.25rem",
                      textAlign: "center",
                      lineHeight: 1,
                      textShadow: "0 2px 4px rgba(0,0,0,0.15)",
                      letterSpacing: "-0.5px"
                    }}>
                      50+ Years
                    </Typography>
                    <Typography sx={{
                      color: "#1D3557",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      textAlign: "center",
                      letterSpacing: "2px",
                      mt: 0.5,
                      opacity: 0.9
                    }}>
                      OF EXCELLENCE
                    </Typography>
                  </Box>
                </Box>

                {/* 2026 - Right Side */}
                <Box sx={{ 
                  position: "relative",
                  order: { xs: 3, md: 3 }
                }}>
                  <Box sx={{
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    border: "3px solid rgba(255,183,77,0.5)",
                    transform: { xs: "none", md: "rotate(2deg)" },
                    transition: "all 0.4s ease",
                    "&:hover": {
                      transform: { xs: "scale(1.02)", md: "rotate(2deg) scale(1.05)" },
                      boxShadow: "0 25px 80px rgba(255,183,77,0.6)"
                    }
                  }}>
                    <Box 
                      component="img" 
                      src="/newPic.jpeg" 
                      alt="2026 Modern Fleet" 
                      sx={{ 
                        width: "100%", 
                        height: { xs: "250px", md: "350px" },
                        objectFit: "cover",
                        display: "block"
                      }} 
                    />
                    {/* Year Badge */}
                    <Box sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)",
                      px: 3,
                      py: 1.5,
                      borderRadius: "12px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      boxShadow: "0 4px 20px rgba(255,183,77,0.6)"
                    }}>
                      <Typography sx={{ 
                        color: "#1D3557", 
                        fontWeight: 800, 
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}>
                        2026
                      </Typography>
                    </Box>
                    {/* Info Overlay */}
                    <Box sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)",
                      p: { xs: 2, md: 3 }
                    }}>
                      <Typography sx={{ 
                        color: "#FFB74D", 
                        fontWeight: 700, 
                        fontSize: { xs: "1rem", md: "1.25rem" },
                        mb: 0.5
                      }}>
                        Modern Excellence
                      </Typography>
                      <Typography sx={{ 
                        color: "rgba(255,255,255,0.9)", 
                        fontSize: { xs: "0.85rem", md: "0.95rem" },
                        lineHeight: 1.5
                      }}>
                        Daily parcel service since 1996 • 30+ years of trust
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Mobile Timeline Connector - Between Images */}
                <Box sx={{
                  display: { xs: "flex", md: "none" },
                  flexDirection: "column",
                  alignItems: "center",
                  order: 2,
                  py: 2,
                  position: "relative",
                  minHeight: "200px"
                }}>
                  {/* Curved Path with SVG */}
                  <Box sx={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute" }}>
                      <defs>
                        <filter id="mobileGlow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Curved dotted path */}
                      <path 
                        d="M 100 20 Q 70 60, 100 100 Q 130 140, 100 180" 
                        fill="none" 
                        stroke="#FFB74D" 
                        strokeWidth="4"
                        strokeDasharray="12,8"
                        filter="url(#mobileGlow)"
                      />
                      {/* Arrow at bottom */}
                      <polygon 
                        points="100,180 95,170 105,170" 
                        fill="#FFB74D"
                        filter="url(#mobileGlow)"
                      />
                    </svg>
                  </Box>
                  
                  {/* Pin in Center */}
                  <Box sx={{
                    position: "relative",
                    zIndex: 2,
                    mt: 3,
                    mb: 2,
                    filter: "drop-shadow(0 8px 20px rgba(255,183,77,0.6))"
                  }}>
                    <svg width="70" height="80" viewBox="0 0 70 80">
                      <defs>
                        <linearGradient id="mobilePinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: "#FFB74D", stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: "#FF9800", stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M35 5 C20 5 8 17 8 32 C8 48 35 75 35 75 C35 75 62 48 62 32 C62 17 50 5 35 5 Z" 
                        fill="url(#mobilePinGradient)"
                        stroke="#FF9800"
                        strokeWidth="2.5"
                      />
                      <circle cx="35" cy="32" r="13" fill="#1D3557" stroke="#0a1628" strokeWidth="2"/>
                      <ellipse cx="30" cy="28" rx="5" ry="7" fill="rgba(255,255,255,0.3)"/>
                    </svg>
                    
                    {/* Hyderabad Label */}
                    <Typography sx={{
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      color: "#FFB74D",
                      fontWeight: 800,
                      fontSize: "1rem",
                      whiteSpace: "nowrap",
                      mt: 0.5,
                      textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(255,183,77,0.7)",
                      letterSpacing: "0.5px"
                    }}>
                      Hyderabad
                    </Typography>
                  </Box>

                  {/* 50+ Years Badge - In Center */}
                  <Box sx={{
                    position: "relative",
                    zIndex: 2,
                    mt: 3
                  }}>
                    <Box sx={{
                      background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)",
                      px: 4,
                      py: 2,
                      borderRadius: "50px",
                      border: "3px solid rgba(255,255,255,0.3)",
                      boxShadow: "0 10px 40px rgba(255,183,77,0.8), inset 0 2px 0 rgba(255,255,255,0.4)",
                      transform: "rotate(-2deg)"
                    }}>
                      <Typography sx={{
                        color: "#1D3557",
                        fontWeight: 900,
                        fontSize: "1.5rem",
                        textAlign: "center",
                        lineHeight: 1,
                        textShadow: "0 2px 4px rgba(0,0,0,0.15)"
                      }}>
                        50+ Years
                      </Typography>
                      <Typography sx={{
                        color: "#1D3557",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        textAlign: "center",
                        letterSpacing: "1.5px",
                        mt: 0.5
                      }}>
                        OF EXCELLENCE
                      </Typography>
                    </Box>
                  </Box>
                </Box>

              </Box>
            </motion.div>

            {/* Bottom Tagline */}
            <motion.div variants={fadeIn}>
              <Box sx={{ textAlign: "center", mt: { xs: 4, md: 6 } }}>
                <Typography sx={{ 
                  color: "#ffffff", 
                  fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.25rem" }, 
                  fontWeight: 700,
                  mb: 2,
                  textShadow: "0 2px 20px rgba(0,0,0,0.5)"
                }}>
                  Quality Customer Service and trust build through decades of dedication
                </Typography>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", mt: 3 }}>
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
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, justifyContent: "center", alignItems: "center", mb: 5 }}>
              <GlassCard sx={{ px: 3, py: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
                <FaPhoneAlt color="#FFB74D" size={18} />
                <Typography sx={{ color: "#ffffff", fontWeight: 600 }}>040-24614381</Typography>
                <a href="tel:04024614381" style={{ textDecoration: "none" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", borderRadius: "8px", px: 2, py: 0.75, cursor: "pointer", transition: "all 0.2s", "&:hover": { transform: "scale(1.03)" } }}>
                    <FaPhoneAlt size={12} color="#1D3557" />
                    <Box component="span" sx={{ color: "#1D3557", fontSize: "0.85rem", fontWeight: 700 }}>Call Now</Box>
                  </Box>
                </a>
              </GlassCard>
              <a href="mailto:ftchydindia@gmail.com" style={{ textDecoration: "none" }}>
                <GlassCard sx={{ px: 3, py: 1.5, display: "flex", alignItems: "center", gap: 2, cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: "rgba(255, 183, 77, 0.5)" } }}><FaEnvelope color="#FFB74D" size={18} /><Typography sx={{ color: "#ffffff", fontWeight: 600 }}>ftchydindia@gmail.com</Typography></GlassCard>
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
