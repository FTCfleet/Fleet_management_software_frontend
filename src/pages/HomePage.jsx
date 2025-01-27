import React, { useState } from "react";
import backImg from '../assets/back2.jpg'
import cardImg from '../assets/card.jpg'
import workImg from '../assets/workflow.jpg'
import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { FaTruck, FaMapMarkerAlt, FaWarehouse, FaCheckCircle, FaTasks, FaHeadset, FaShippingFast, FaQrcode, FaMobileAlt, FaBox, FaBoxOpen, FaSearchLocation, FaArrowRight } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
// import { FaArrowRightLong } from "react-icons/fa";
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
      description: "Track your goods anytime, anywhere",
      bgColor: "#cce7ff",
      textColor: "#003366",
    },
    {
      title: "Secure Warehousing",
      icon: <FaWarehouse size={40} style={{ color: "#ffffff" }} />,
      description: "Safe storage for your goods",
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
      description: "24/7 assistance for your queries",
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

  return (
    <div className='app' >
      <div style={{
        background: `url(${backImg})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '100vh',
        textAlign: 'left',
        alignItems: 'left'
      }}>
        <div style={{ margin: '20px', padding: '10vw' }}>
          <Typography variant='h2'
            sx={{
              marginTop: '-40px',
              color: 'white',
            }}
          >We Transport anything<br />anywhere!</Typography>
          <Link to='/about'>
            <button className="button button-large" style={{ width: '10%' }}>Know More</button>
          </Link>
        </div>
      </div>
      <div style={{ backgroundColor: '#efefef', padding: '100px' }}>
        <h1><center>Our Services</center></h1>
        <div>
          <div
            className="card-container"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-around",
              gap: "20px", // Space between cards
            }}
          >
            {services.map((service, index) => (
              <div
                key={index}
                className="card"
                style={{
                  backgroundColor: service.bgColor,
                  color: service.textColor,
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "center",
                  width: "calc(30% - 20px)", // Adjust card width
                  boxSizing: "border-box",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  style={{
                    backgroundColor: (service.bgColor === '#ffffff' ? '#003366' : '#ffffff'),
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  {service.icon}
                </div>
                <h2 style={{ fontSize: "20px", margin: "10px 0" }}>{service.title}</h2>
                <p style={{ fontSize: "14px" }}>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ paddingTop: "50px", paddingBottom: "150px" }}>
        <h1>
          <center>HOW DOES IT WORK</center>
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Ensures equal space between steps
            gap: "20px",
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
                flex: "1", // Ensures each step takes up equal space
                maxWidth: "200px", // Optional: limits the maximum width of each step
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
                    width: "100px",
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {step.icon}
                </div>

                {index < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "125%",
                      transform: "translateY(-150%)",
                    }}
                  >
                    <FaArrowRightLong size={20} style={{ color: "#003366" }} />
                  </div>
                )}
              </div>
              <p
                style={{
                  margin: "10px 0",
                  fontWeight: "bold",
                  wordWrap: "break-word", // Ensures the text wraps to the next line if it overflows
                  whiteSpace: "normal", // Allows text to wrap normally
                  maxWidth: "100%", // Prevents text from exceeding container width
                }}
              >
                {step.step}
              </p>
              <p
                style={{
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "100%",
                }}
              >
                {step.description}
              </p>
              {index < steps.length && (
                <div
                  style={{
                    width: "40px",
                    height: "2px",
                    backgroundColor: "#003366",
                    margin: "10px auto",
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
