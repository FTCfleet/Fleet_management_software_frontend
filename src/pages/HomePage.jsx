import React from "react";
import { Typography, Box, Button, Container, Grid, Card, CardContent, useTheme, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import { motion, animate } from "framer-motion";
import {
  FaShippingFast,
  FaMapMarkerAlt,
  FaWarehouse,
  FaCheckCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";
import trucksImg from "../assets/trucks.jpg";
import founderImg from "../assets/founder.jpg";

const AnimatedCounter = ({ from, to, duration }) => {
  const nodeRef = React.useRef();

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(from, to, {
      duration: duration,
      onUpdate(value) {
        node.textContent = Math.round(value).toLocaleString() + "+";
      },
    });

    return () => controls.stop();
  }, [from, to, duration]);

  return <span ref={nodeRef} />;
};

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const services = [
    {
      title: "Safe & Fast Delivery",
      icon: <FaShippingFast size={40} />,
      description: "We ensure that all shipments are handled with utmost care and delivered promptly.",
    },
    {
      title: "Own Fleet of Trucks",
      icon: <FaCheckCircle size={40} />,
      description: "We operate a fleet of well-maintained trucks, allowing us to control every aspect of the delivery process.",
    },
    {
      title: "State-of-the-Art Workshop",
      icon: <FaWarehouse size={40} />,
      description: "Our fully-equipped automobile workshop ensures our fleet stays in top condition, minimizing downtime.",
    },
  ];

  const stats = [
    { label: "Clients", value: 10000 },
    { label: "Branches", value: 12 },
    { label: "Staff", value: 50 },
  ];

  return (
    <Box sx={{ overflowX: "hidden", bgcolor: "#f5f7fa" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: "90vh",
          backgroundImage: `url(${trucksImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)", // Reverted to darker overlay
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, textAlign: "center", color: "white" }}>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}>
              Welcome to Friends Transport Company
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 300, textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}>
              Your Trusted Partner in Parcel and Goods Transportation
            </Typography>
            <Link to="/about" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<FaArrowRight />}
                  sx={{
                    bgcolor: "#003366",
                    color: "white",
                    px: 5,
                    py: 1.5,
                    fontSize: "1.1rem",
                    "&:hover": { bgcolor: "#002244" },
                  }}
                >
                  Learn More
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box sx={{ bgcolor: "#003366", color: "white", py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center" alignItems="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ textAlign: "center" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: index * 0.2 }}
                >
                  <Typography variant="h2" fontWeight="bold" sx={{ color: "#ffcc00" }}>
                    <AnimatedCounter from={0} to={stat.value} duration={3} />
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, letterSpacing: 1 }}>
                    {stat.label.toUpperCase()}
                  </Typography>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h3" fontWeight="bold" color="#003366" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: "800px", mx: "auto", lineHeight: 1.8 }}>
              To provide high-quality customer service with every delivery. Whether you're sending small parcels or large shipments, we ensure your goods reach their destination safely, securely, and on time.
            </Typography>
          </Box>
        </motion.div>
      </Container>

      {/* Legacy / Founder Section */}
      <Box sx={{ bgcolor: "white", py: 10, position: "relative", overflow: "hidden" }}>
        {/* Decorative Background Element for "Since 1996" */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: { xs: "50%", md: "-5%" },
            transform: { xs: "translate(50%, -50%)", md: "translateY(-50%)" },
            fontSize: { xs: "15rem", md: "25rem" },
            fontWeight: "bold",
            color: "rgba(0, 51, 102, 0.03)",
            zIndex: 0,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontFamily: "'Playfair Display', serif", // Assuming a serif font is available or fallback
          }}
        >
          1996
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={5}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <Box sx={{ position: "relative" }}>
                  <Box
                    component="img"
                    src={founderImg}
                    alt="Mr. Mohammed Ameer Ali"
                    sx={{
                      width: "min(83%, max(48vw, 260px))",
                      borderRadius: "4px",
                      boxShadow: "20px 20px 0px #003366",
                      maxHeight: "500px",
                      objectFit: "contain",
                      transition: "all 0.4s ease",
                      transform: "scale(1)",
                      "&:hover": {
                        transform: "scale(1.01)"   // <— slight enlargement
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -30,
                      left: -30,
                      bgcolor: "#ffcc00",
                      color: "#003366",
                      p: 3,
                      borderRadius: "2px",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                      display: { xs: "none", md: "block" }
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">Est. 1996</Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={7}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box sx={{ width: 60, height: 4, bgcolor: "#ffcc00", mr: 2 }}></Box>
                  <Typography variant="h6" color="#003366" fontWeight="bold" letterSpacing={2}>
                    OUR LEGACY
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" color="#003366" gutterBottom sx={{ fontFamily: "'Playfair Display', serif" }}>
                  A Journey Started in <span style={{ color: "#ffcc00" }}>1996</span>
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: "1.1rem", lineHeight: 1.8, color: "text.secondary", mb: 3 }}>
                  Founded by the visionary <strong>Mr. Mohammed Ameer Ali</strong>, Friends Transport Company began as a humble endeavor to connect people through reliable service. Over the decades, it has blossomed into a symbol of trust in the parcel service industry.
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: "1.1rem", lineHeight: 1.8, color: "text.secondary" }}>
                  What started in 1996 as a commitment to excellence has been carried forward by generations. Today, the legacy of Mr. Ameer Ali lives on through his sons and grandsons, who drive the company's growth with the same passion and integrity that started it all.
                </Typography>

                <Box mt={4}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Box sx={{ borderLeft: "4px solid #003366", pl: 2 }}>
                        <Typography variant="h4" fontWeight="bold" color="#003366">25+</Typography>
                        <Typography variant="body2" color="text.secondary">Years of Service</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ borderLeft: "4px solid #ffcc00", pl: 2 }}>
                        <Typography variant="h4" fontWeight="bold" color="#003366">100%</Typography>
                        <Typography variant="body2" color="text.secondary">Customer Satisfaction</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <Typography variant="h3" fontWeight="bold" color="#003366" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Our Services
          </Typography>
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ display: 'flex' }}>
                <motion.div variants={fadeInUp} style={{ width: '100%' }}>
                  <Card
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      p: 3,
                      borderRadius: "16px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "translateY(-10px)" },
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ color: "#003366", mb: 2 }}>{service.icon}</Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {service.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {service.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Contact/Locations Preview */}
      <Box sx={{ bgcolor: "#003366", color: "white", py: 8 }}>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Ready to Ship?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              We have convenient offices throughout Hyderabad and beyond.
            </Typography>
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
              <Grid item>
                <Box display="flex" alignItems="center" gap={1}>
                  <FaPhoneAlt /> <Typography>040-24614381</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box display="flex" alignItems="center" gap={1}>
                  <FaEnvelope /> <Typography>ftchydindia@gmail.com</Typography>
                </Box>
              </Grid>
            </Grid>
            <Link to="/about" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: "white",
                  borderColor: "white",
                  px: 5,
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                View All Locations
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
