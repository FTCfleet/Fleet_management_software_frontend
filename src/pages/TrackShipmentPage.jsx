import React, { useState } from "react";
import { Typography, Button, TextField } from "@mui/material";
import backImg from "../assets/back2.jpg";

const TrackShipmentPage = () => {
    const [shipmentIdInput, setShipmentIdInput] = useState("");
    const [shipmentId, setShipmentId] = useState("NA");
    const [status, setStatus] = useState("NA");
    const [shipper, setShipper] = useState("NA");
    const [consignee, setConsignee] = useState("NA");
    const [service, setService] = useState("NA");
    const [currentStep, setCurrentStep] = useState(3);
    const steps = [
        "Order Placed",
        "Shipment Dispatched",
        "Out for Delivery",
        "Delivered"
    ];

    const getStepColor = (index) => {
        if (currentStep >= index + 1) {
            return index + 1 === currentStep ? "#1E3A5F" : "#82acc2"; // Dark blue for current step, light blue for past
        }
        return "#9da8bb"; // Grey for future steps
    };


    const handleTrack = () => {
        if (shipmentIdInput.trim() !== "") {
            setShipmentId(shipmentIdInput);
            setStatus("On Delivery");
            setShipper("Outfit Co");
            setConsignee("Suraj Kashyap");
            setService("Regular Shipping");
        } else {
            alert("Please enter a valid Shipment ID");
        }
    };

    return (
        <div className="app">
            {/* Header Section */}
            <div
                style={{
                    backgroundColor: "#eaf7ff",
                    padding: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "20px",
                }}
            >
                <div style={{ flex: "60%" }}>
                    <Typography variant="h4" sx={{ color: "#1b3655", marginBottom: "20px" }}>
                        Wondering where your package is?
                    </Typography>
                    <Typography sx={{ color: "#82a7c1", marginBottom: "30px" }}>
                        Keep track of your shipment by inputting shipment ID or AWB number
                    </Typography>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "10px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)", // Shadow added
                            padding: "10px", // Padding for input bar
                            borderRadius: "8px", // Rounded corners
                        }}
                    >
                        <TextField
                            variant="outlined"
                            placeholder="Enter Shipment ID"
                            value={shipmentIdInput}
                            onChange={(e) => setShipmentIdInput(e.target.value)}
                            sx={{ width: "300px", backgroundColor: "white" }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleTrack}
                            sx={{ backgroundColor: "#003366", color: "white" }}
                        >
                            Track
                        </Button>
                    </div>
                </div>

                <div style={{ flex: "40%" }}>
                    <img
                        src={backImg}
                        alt="Tracking Illustration"
                        style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "10px",
                            boxShadow: "0 6px 15px rgba(0,0,0,0.3)", // Increased shadow
                        }}
                    />
                </div>
            </div>

            {/* Main Content Section */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    padding: "50px",
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        marginBottom: "20px",
                        color: "#1c3553",
                        fontWeight: "bold",
                        textAlign: "left",
                    }}
                >
                    Shipment Details
                </Typography>

                <div
                    style={{
                        display: "flex",
                        gap: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "40px",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.3)", // Increased shadow
                        width: "90%",
                        margin: "0 auto",
                        position: "relative",
                    }}
                >
                    {/* Shipment Details */}
                    <div style={{ flex: "60%", position: "relative" }}>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <Typography sx={{ color: "#7d8695" }}>
                                        <b>Shipment ID</b>
                                    </Typography>
                                    <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                                        {shipmentId}
                                    </Typography>
                                </div>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <Typography sx={{ color: "#7d8695" }}>
                                        <b>Status</b>
                                    </Typography>
                                    <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                                        {status}
                                    </Typography>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: "20px",
                                }}
                            >
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <Typography sx={{ color: "#7d8695" }}>
                                        <b>Shipper</b>
                                    </Typography>
                                    <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                                        {shipper}
                                    </Typography>
                                </div>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <Typography sx={{ color: "#7d8695" }}>
                                        <b>Consignee</b>
                                    </Typography>
                                    <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                                        {consignee}
                                    </Typography>
                                </div>
                            </div>

                            <div style={{ textAlign: "center", marginTop: "20px" }}>
                                <Typography sx={{ color: "#7d8695" }}>
                                    <b>Service</b>
                                </Typography>
                                <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                                    {service}
                                </Typography>
                            </div>
                        </div>
                        {/* Vertical Divider */}
                        <div
                            style={{
                                position: "absolute",
                                right: "-10px",
                                top: "0",
                                bottom: "0",
                                width: "2px",
                                backgroundColor: "#ddd",
                            }}
                        ></div>
                    </div>

                    {/* Tracking Section */}
                    <div style={{ flex: "40%", textAlign: "center", position: "relative" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                padding: "20px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start", // Align to the left
                                    gap: "20px",
                                    justifyContent: "center",
                                }}
                            >
                                {steps.map((step, index) => (
                                    <div key={index} style={{ display: "flex", alignItems: "center" }}>
                                        <div
                                            style={{
                                                width: "10px",
                                                height: "10px",
                                                borderRadius: "50%",
                                                backgroundColor: getStepColor(index), // Apply dynamic color based on the current step
                                                transition: "background-color 0.3s",
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                marginLeft: "10px",
                                                fontWeight: currentStep >= index + 1 ? "bold" : "normal",
                                                color: getStepColor(index),
                                            }}
                                        >
                                            {step}
                                        </Typography>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackShipmentPage;
