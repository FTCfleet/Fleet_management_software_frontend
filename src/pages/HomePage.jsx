import React from "react";
import backImg from "../assets/back2.jpg";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaWarehouse,
  FaCheckCircle,
  FaTasks,
  FaHeadset,
  FaShippingFast,
  FaQrcode,
  FaBox,
  FaBoxOpen,
  FaSearchLocation,
} from "react-icons/fa";
import { useTheme, useMediaQuery } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "../css/main.css";

const HomePage = () => {
  const services = [
    {
      title: "End-to-End Goods Transport",
      icon: <FaShippingFast size={40} style={{ color: "#ffffff" }} />,
      description: "Safe and reliable transport services",
      bgColor: "#ffffff",
      textColor: "#003366",
    },
    {
      title: "Real-Time Tracking",
      icon: <FaMapMarkerAlt size={40} style={{ color: "#003366" }} />,
      description: "Track your goods effortlessly anytime and anywhere",
      bgColor: "#cce7ff",
      textColor: "#003366",
    },
    {
      title: "Secure Warehousing",
      icon: <FaWarehouse size={40} style={{ color: "#ffffff" }} />,
      description: "Secure and reliable storage for your goods",
      bgColor: "#ffffff",
      textColor: "#003366",
    },
    {
      title: "Hassle-Free Delivery Confirmation",
      icon: <FaCheckCircle size={40} style={{ color: "#003366" }} />,
      description: "Get notified on successful delivery",
      bgColor: "#cce7ff",
      textColor: "#003366",
    },
    {
      title: "Fleet Management",
      icon: <FaTasks size={40} style={{ color: "#ffffff" }} />,
      description: "Efficient management of delivery vehicles",
      bgColor: "#ffffff",
      textColor: "#003366",
    },
    {
      title: "Customer Support",
      icon: <FaHeadset size={40} style={{ color: "#003366" }} />,
      description: "24/7 dedicated assistance available for all your queries",
      bgColor: "#cce7ff",
      textColor: "#003366",
    },
  ];

  const steps = [
    {
      step: "Step 1",
      description: "Book your shipment online",
      icon: <FaBox size={30} style={{ color: "#003366" }} />,
    },
    {
      step: "Step 2",
      description: "Generate a QR Code for your parcel",
      icon: <FaQrcode size={30} style={{ color: "#003366" }} />,
    },
    {
      step: "Step 3",
      description: "Track your goods in real-time",
      icon: <FaSearchLocation size={30} style={{ color: "#003366" }} />,
    },
    {
      step: "Step 4",
      description: "Confirmation at the destination",
      icon: <FaBoxOpen size={30} style={{ color: "#003366" }} />,
    },
  ];

  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down(470));

  return (
    <div className="app">
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Background Image */}
        <img
          src={backImg}
          alt="Background"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />

        {/* Overlay Content - Left Aligned */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "5%", // Aligns text to the left
            transform: "translateY(-50%)",
            color: "white",
            textAlign: "left", // Ensures text stays left-aligned
            width: "55%", // Ensures text doesn't stretch too much
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: "clamp(24px, 5vw, 60px)", // Responsive font size
              fontWeight: "bold",
            }}
          >
            We Transport anything
            <br />
            anywhere!
          </Typography>
          <Link to="/about">
            <button className="button button-large">Know More</button>
          </Link>
        </div>
      </div>

      <div style={{ backgroundColor: "#efefef", padding: "5vw" }}>
        <h1 style={{ textAlign: "center", fontSize: "clamp(20px, 4vw, 40px)" }}>
          Our Services
        </h1>
        {mobileView ? (
          // Swiper.js for mobile horizontal scrolling
          <Swiper
            modules={[Navigation]}
            // navigation={{ nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }}
            navigation
            spaceBetween={20}
            slidesPerView={1}
            style={{ padding: "20px 0", width: "90%", margin: "auto" }}
          >
            {services.map((service, index) => (
              <SwiperSlide key={index}>
                <div
                  className="card"
                  style={{
                    backgroundColor: service.bgColor,
                    color: service.textColor,
                    padding: "2vw",
                    borderRadius: "10px",
                    textAlign: "center",
                    width: "60%",
                    height: "auto",
                    margin: "auto",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "200px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor:
                        service.bgColor === "#ffffff" ? "#003366" : "#ffffff",
                      borderRadius: "50%",
                      width: "clamp(50px, 6vw, 80px)",
                      height: "clamp(50px, 6vw, 80px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    {service.icon}
                  </div>
                  <h2
                    style={{
                      fontSize: "clamp(16px, 2vw, 24px)",
                      margin: "10px 0",
                    }}
                  >
                    {service.title}
                  </h2>
                  <p style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}>
                    {service.description}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div
            className="card-container"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "3vw", // Responsive gap
            }}
          >
            {services.map((service, index) => (
              <div
                key={index}
                className="card"
                style={{
                  backgroundColor: service.bgColor,
                  color: service.textColor,
                  padding: "2vw",
                  borderRadius: "10px",
                  textAlign: "center",
                  width: "clamp(200px, 30%, 400px)", // Responsive width
                  boxSizing: "border-box",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",

                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",  // Centers content vertically
                  alignItems: "center",      // Centers content horizontally
                  minHeight: "10px",
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      service.bgColor === "#ffffff" ? "#003366" : "#ffffff",
                    borderRadius: "50%",
                    width: "clamp(50px, 6vw, 80px)",
                    height: "clamp(50px, 6vw, 80px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  {service.icon}
                </div>
                <h2
                  style={{ fontSize: "clamp(16px, 2vw, 24px)", margin: "10px 0" }}
                >
                  {service.title}
                </h2>
                <p style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div style={{ padding: "5vw 0" }}>
        <h1 style={{ textAlign: "center", fontSize: "clamp(20px, 4vw, 40px)" }}>
          HOW DOES IT WORK
        </h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "5vw",
            width: "90%",
            margin: "0 auto",
          }}
        >
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                position: "relative",
                flex: "1",
                maxWidth: "clamp(150px, 20%, 250px)", // Responsive width
                minWidth: "150px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "10px auto",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#cce7ff",
                    borderRadius: "50%",
                    width: "clamp(60px, 8vw, 100px)",
                    height: "clamp(60px, 8vw, 100px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {step.icon}
                </div>
              </div>

              <p
                style={{
                  margin: "10px 0",
                  fontWeight: "bold",
                  fontSize: "clamp(14px, 2vw, 18px)",
                  maxWidth: "100%",
                }}
              >
                {step.step}
              </p>
              <p
                style={{
                  fontSize: "clamp(12px, 1.5vw, 16px)",
                  maxWidth: "100%",
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
