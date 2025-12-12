import React from "react";
import { Typography, Box, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaBuilding } from "react-icons/fa";
import founderImg from "../assets/founder.jpg";
import office1 from "../assets/office1.jpg";
import office2 from "../assets/office2.jpg";
import office3 from "../assets/office3.jpg";
import "../css/about.css";

const AboutPage = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const bookingOffices = [
    { name: "Old Feelkhana (HYD-01)", phone: "040-24614381" },
    { name: "Goshamahal Road, Feelkhana (HYD-02)", phone: "040-24604381" },
    { name: "Bahadurpura (BDPURA)", phone: "9515409041" },
    { name: "Secunderabad (SECBAD)", phone: "040-29331533" },
  ];

  const deliveryOffices = [
    { name: "Karimnagar (KNR)", phone: "9908690827" },
    { name: "Sultanabad (SBD)", phone: "9849701721" },
    { name: "Peddapally (PDPL)", phone: "7036323006" },
    { name: "Ramagundam (NTPC), Godavarikhani (GDK)", phone: "9949121267" },
    { name: "Mancherial (MNCL)", phone: "8977185376" },
  ];

  return (
    <div className="about-page">
      {/* Header Section */}
      <div className="about-header">
        <div className="about-container">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mb: 1, fontSize: { xs: "1.75rem", md: "2.5rem" }, color: "#ffffff" }}
            >
              About Friends Transport Company
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: { xs: "1rem", md: "1.25rem" } }}>
              Delivering Trust Since 1996
            </Typography>
          </motion.div>
        </div>
      </div>

      {/* Story & Founder Section */}
      <div className="about-section">
        <div className="about-container">
          <div className="about-grid-story">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <img src={founderImg} alt="Mr. Mohammed Ameer Ali" className="founder-img" />
              <Typography
                sx={{ mt: 1.5, textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}
              >
                Founder: Mr. Mohammed Ameer Ali
              </Typography>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#003366", mb: 2, fontSize: { xs: "1.5rem", md: "2rem" } }}
              >
                Our Story
              </Typography>
              <Typography sx={{ fontSize: "1rem", lineHeight: 1.8, color: "#4a5568", mb: 2 }}>
                Founded by the visionary <strong>Mr. Mohammed Ameer Ali</strong>, Friends Transport
                Company has been a pioneer in the parcel service industry for over two decades. With
                a legacy built on trust, dedication, and quality customer service, our company
                continues to set new standards in safe and fast delivery of goods.
              </Typography>
              <Typography sx={{ fontSize: "1rem", lineHeight: 1.8, color: "#4a5568" }}>
                The commitment to excellence established by Mr. Ameer Ali is carried forward by his
                sons and grandsons, who continue to drive the company's growth with the same passion
                and attention to detail.
              </Typography>
            </motion.div>
          </div>
        </div>
      </div>

      <Divider />

      {/* Mission & Commitment */}
      <div className="about-section-white">
        <div className="about-container">
          <div className="about-grid-2">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <div className="mission-card mission-card-blue">
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#003366", mb: 1.5, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
                >
                  Our Mission
                </Typography>
                <Typography sx={{ lineHeight: 1.8, color: "#4a5568" }}>
                  To provide high-quality customer service with every delivery whether you're
                  sending small parcels or large shipments, we ensure your goods reach their
                  destination safely, securely, and on time. Our customer-first approach has made us
                  a preferred choice for businesses and individuals alike.
                </Typography>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <div className="mission-card mission-card-purple">
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#4a148c", mb: 1.5, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
                >
                  Commitment to Excellence
                </Typography>
                <Typography sx={{ lineHeight: 1.8, color: "#4a5568" }}>
                  We believe in building long-term relationships with our clients by delivering
                  exceptional service consistently. Our core values of integrity, reliability, and
                  quality have earned us the trust of our customers. No matter the size of the
                  shipment, we ensure that every parcel receives the same level of care.
                </Typography>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div className="about-section">
        <div className="about-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#003366",
                textAlign: "center",
                mb: 4,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Our Locations
            </Typography>

            <div className="about-grid-2">
              {/* Booking Offices */}
              <div className="location-card">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#003366",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <FaMapMarkerAlt /> Booking Offices
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {bookingOffices.map((office, index) => (
                  <div key={index} className="location-row">
                    <span className="location-name">{office.name}</span>
                    <span className="location-phone">
                      <FaPhoneAlt size={12} /> {office.phone}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Offices */}
              <div className="location-card">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#003366",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <FaMapMarkerAlt /> Delivery Offices
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {deliveryOffices.map((office, index) => (
                  <div key={index} className="location-row">
                    <span className="location-name">{office.name}</span>
                    <span className="location-phone">
                      <FaPhoneAlt size={12} /> {office.phone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Office Images Section */}
      <div className="about-section-white">
        <div className="about-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#003366",
                textAlign: "center",
                mb: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              <FaBuilding /> Our Offices
            </Typography>

            <div className="office-images-grid">
              <div className="office-col-left">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} style={{ height: "100%" }}>
                  <img src={office1} alt="Office Interior" className="office-img-full" />
                </motion.div>
              </div>
              <div className="office-col-right">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <img src={office2} alt="Office Exterior" className="office-img" />
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <img src={office3} alt="Office Signage" className="office-img" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="about-footer">
        <div className="about-container">
          <Typography sx={{ fontSize: "0.9rem", opacity: 0.9 }}>GST ID: 36AAFFF2744R1ZX</Typography>
          <Typography sx={{ mt: 1, fontSize: "0.9rem", opacity: 0.8 }}>
            Thank You for Choosing Friends Transport Company — Where Your Goods Are in Safe Hands!
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
