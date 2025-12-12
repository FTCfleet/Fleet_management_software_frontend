import React from "react";
import { Typography, Box, Button, Container, Card, CardContent, useTheme, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import { motion, animate } from "framer-motion";
import { FaShippingFast, FaWarehouse, FaCheckCircle, FaPhoneAlt, FaEnvelope, FaArrowRight } from "react-icons/fa";
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
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const services = [
    {
      title: "Safe & Fast Delivery",
      icon: <FaShippingFast size={36} />,
      description: "We ensure that all shipments are handled with utmost care and delivered promptly.",
    },
    {
      title: "Own Fleet of Trucks",
      icon: <FaCheckCircle size={36} />,
      description: "We operate a fleet of well-maintained trucks, allowing us to control every aspect of the delivery process.",
    },
    {
      title: "State-of-the-Art Workshop",
      icon: <FaWarehouse size={36} />,
      description: "Our fully-equipped automobile workshop ensures our fleet stays in top condition, minimizing downtime.",
    },
  ];

  const stats = [
    { label: "Clients", value: 10000 },
    { label: "Branches", value: 12 },
    { label: "Staff", value: 50 },
  ];

  return (
    <Box sx={{ overflowX: "hidden", bgcolor: "#f8fafc" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "80vh", md: "90vh" },
          backgroundImage: `url(${trucksImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, textAlign: "center", px: { xs: 2, md: 4 } }}>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <Typography
              variant="h2"
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{
                color: "#ffffff",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
                textShadow: "2px 4px 8px rgba(0,0,0,0.8)",
                lineHeight: 1.2,
              }}
            >
              Welcome to Friends Transport Company
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "rgba(255,255,255,0.95)",
                mb: 4,
                fontWeight: 400,
                textShadow: "1px 2px 4px rgba(0,0,0,0.8)",
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                maxWidth: "800px",
                mx: "auto",
              }}
            >
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
                    px: { xs: 3, md: 5 },
                    py: 1.5,
                    fontSize: { xs: "0.95rem", md: "1.1rem" },
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
      <Box sx={{ bgcolor: "#003366", color: "white", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(3, 1fr)" },
              gap: { xs: 2, md: 4 },
              textAlign: "center",
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Typography
                  variant="h2"
                  fontWeight="bold"
                  sx={{ color: "#ffcc00", fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3.5rem" } }}
                >
                  <AnimatedCounter from={0} to={stat.value} duration={3} />
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ opacity: 0.9, letterSpacing: 1, fontSize: { xs: "0.75rem", sm: "0.9rem", md: "1rem" } }}
                >
                  {stat.label.toUpperCase()}
                </Typography>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, px: { xs: 2, md: 4 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              fontWeight="bold"
              color="#003366"
              gutterBottom
              sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" } }}
            >
              Our Mission
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "800px", mx: "auto", lineHeight: 1.8, fontSize: { xs: "0.95rem", md: "1.1rem" } }}
            >
              To provide high-quality customer service with every delivery. Whether you're sending small parcels or large shipments, we ensure your goods reach their destination safely, securely, and on time.
            </Typography>
          </Box>
        </motion.div>
      </Container>

      {/* Legacy / Founder Section */}
      <Box sx={{ bgcolor: "white", py: { xs: 6, md: 10 }, position: "relative", overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: { xs: "50%", md: "-5%" },
            transform: { xs: "translate(50%, -50%)", md: "translateY(-50%)" },
            fontSize: { xs: "8rem", md: "20rem" },
            fontWeight: "bold",
            color: "rgba(0, 51, 102, 0.03)",
            zIndex: 0,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          1996
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, px: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
              gap: { xs: 4, md: 8 },
              alignItems: "center",
            }}
          >
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <Box sx={{ position: "relative", maxWidth: { xs: "280px", md: "100%" }, mx: "auto" }}>
                <Box
                  component="img"
                  src={founderImg}
                  alt="Mr. Mohammed Ameer Ali"
                  sx={{
                    width: "100%",
                    borderRadius: "8px",
                    boxShadow: { xs: "10px 10px 0px #003366", md: "20px 20px 0px #003366" },
                    maxHeight: "450px",
                    objectFit: "contain",
                    transition: "transform 0.4s ease",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: { xs: -20, md: -30 },
                    left: { xs: -15, md: -30 },
                    bgcolor: "#ffcc00",
                    color: "#003366",
                    p: { xs: 1.5, md: 3 },
                    borderRadius: "4px",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "0.9rem", md: "1.25rem" } }}>
                    Est. 1996
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ width: { xs: 40, md: 60 }, height: 4, bgcolor: "#ffcc00", mr: 2 }} />
                <Typography variant="h6" color="#003366" fontWeight="bold" letterSpacing={2} sx={{ fontSize: { xs: "0.8rem", md: "1rem" } }}>
                  OUR LEGACY
                </Typography>
              </Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                color="#003366"
                gutterBottom
                sx={{ fontSize: { xs: "1.5rem", md: "2.25rem" } }}
              >
                A Journey Started in <span style={{ color: "#ffcc00" }}>1996</span>
              </Typography>
              <Typography
                paragraph
                sx={{ fontSize: { xs: "0.95rem", md: "1.1rem" }, lineHeight: 1.8, color: "text.secondary", mb: 3 }}
              >
                Founded by the visionary <strong>Mr. Mohammed Ameer Ali</strong>, Friends Transport Company began as a humble endeavor to connect people through reliable service. Over the decades, it has blossomed into a symbol of trust in the parcel service industry.
              </Typography>
              <Typography
                paragraph
                sx={{ fontSize: { xs: "0.95rem", md: "1.1rem" }, lineHeight: 1.8, color: "text.secondary" }}
              >
                What started in 1996 as a commitment to excellence has been carried forward by generations. Today, the legacy of Mr. Ameer Ali lives on through his sons and grandsons, who drive the company's growth with the same passion and integrity.
              </Typography>

              <Box mt={4}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                  <Box sx={{ borderLeft: "4px solid #003366", pl: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="#003366" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
                      25+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Years of Service</Typography>
                  </Box>
                  <Box sx={{ borderLeft: "4px solid #ffcc00", pl: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="#003366" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
                      100%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Customer Satisfaction</Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 4 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <Typography
            variant="h3"
            fontWeight="bold"
            color="#003366"
            textAlign="center"
            gutterBottom
            sx={{ mb: { xs: 4, md: 6 }, fontSize: { xs: "1.75rem", md: "2.5rem" } }}
          >
            Our Services
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {services.map((service, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    p: { xs: 2, md: 3 },
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "translateY(-8px)" },
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ color: "#003366", mb: 2 }}>{service.icon}</Box>
                  <CardContent sx={{ flexGrow: 1, p: 0 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>

      {/* Contact Section */}
      <Box sx={{ bgcolor: "#003366", py: { xs: 5, md: 8 } }}>
        <Container maxWidth="lg" sx={{ textAlign: "center", px: { xs: 2, md: 4 } }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#ffffff", fontSize: { xs: "1.5rem", md: "2rem" } }}>
              Ready to Ship?
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)", mb: 4, fontSize: { xs: "0.95rem", md: "1.1rem" } }}>
              We have convenient offices throughout Hyderabad and beyond.
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 4 },
                justifyContent: "center",
                mb: 4,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} sx={{ color: "rgba(255,255,255,0.95)" }}>
                <FaPhoneAlt color="#FFB74D" /> <Typography sx={{ color: "rgba(255,255,255,0.95)" }}>040-24614381</Typography>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} sx={{ color: "rgba(255,255,255,0.95)" }}>
                <FaEnvelope color="#FFB74D" /> <Typography sx={{ color: "rgba(255,255,255,0.95)" }}>ftchydindia@gmail.com</Typography>
              </Box>
            </Box>
            <Link to="/about" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.8)",
                  px: { xs: 3, md: 5 },
                  "&:hover": { borderColor: "#ffffff", bgcolor: "rgba(255,255,255,0.1)" },
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
