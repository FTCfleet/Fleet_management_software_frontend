import React, { useState } from "react";
import {
  Typography,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import backImg from "../assets/back2.jpg";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import "../css/main.css";

const TrackShipmentPage = () => {
  const [shipmentIdInput, setShipmentIdInput] = useState("");
  const [shipmentId, setShipmentId] = useState("NA");
  const [status, setStatus] = useState("NA");
  const [shipper, setShipper] = useState("NA");
  const [consignee, setConsignee] = useState("NA");
  const [service, setService] = useState("NA");
  const [currentStep, setCurrentStep] = useState(2);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const steps = ["Order Placed", "Shipment Dispatched", "Delivered"];
  const cellStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowCellStyle = { color: "#25344E" };
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down(800));

  const getStepColor = (index) => {
    if (currentStep >= index + 1) {
      return index + 1 === currentStep ? "#1E3A5F" : "#82acc2";
    }
    return "#9da8bb";
  };
  const handleTrack = async () => {
    setIsLoading(true);
    fetch(`${BASE_URL}/api/parcel/track/${shipmentIdInput}`)
      .then((response) => {
        if (!response.ok) {
          setIsLoading(false);
          toast.error("Error occurred", {
            className: "custom-toast",
            position: "bottom-right",
          });
        }
        if (response.status === 201) {
          setIsLoading(false);
          toast.warn("Invalid Tracking ID", {
            className: "custom-toast",
            position: "bottom-right",
          });
          setShipmentIdInput("");
        }
        return response.json();
      })
      .then((data) => {
        setIsLoading(false);
        if (Object.keys(data.body).length) {
          data = data.body;
          if (data.completed) {
            setStatus(steps[2]);
            setCurrentStep(2);
          } else {
            if (data.status === "arrived") {
              setStatus(steps[0]);
              setCurrentStep(1);
            } else if (data.status === "dispatched") {
              setStatus(steps[1]);
              setCurrentStep(2);
            } else {
              setStatus(steps[2]);
              setCurrentStep(3);
            }
          }
          setShipmentId(shipmentIdInput);
          setShipper(data.sender.name);
          setConsignee(data.receiver.name);
          setService(data.items.length);
          setItems(data.items);
        }
      });
  };

  return (
    <div className="app">
      <ToastContainer />
      <div
        style={{
          backgroundColor: "#eaf7ff",
          padding: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          flex: "55%",
        }}
      >
        <div
          style={{
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: "#1b3655", marginBottom: "20px" }}
          >
            Wondering where your package is?
          </Typography>
          <Typography sx={{ color: "#82a7c1", marginBottom: "30px" }}>
            Keep track of your shipment by inputting shipment ID or AWB number
          </Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "15px",
              alignItems: "center",
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Enter Shipment ID"
              value={shipmentIdInput}
              onChange={(e) => setShipmentIdInput(e.target.value.trim())}
              sx={{
                width: "100%",
                maxWidth: "350px",
                backgroundColor: "white",
              }}
            />
            <button
              className="button button-large"
              onClick={handleTrack}
              disabled={isLoading}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#1b3655",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Track
              {isLoading && (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              )}
            </button>
          </div>
        </div>
        {/* </div> */}
        {mobileView ? null : (
          <div style={{ flex: "40%" }}>
            <img
              src={backImg}
              alt="Tracking Illustration"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "10px",
                boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        )}
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
            flexDirection: "column",
            gap: "40px",
            alignItems: "center",
          }}
        >
          {mobileView ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                padding: "20px",
              }}
            >
              <div>
                <Typography sx={{ color: "#7d8695" }}>
                  <b>Shipment ID</b>
                </Typography>
                <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                  {shipmentId}
                </Typography>
              </div>
              <div>
                <Typography sx={{ color: "#7d8695" }}>
                  <b>Status</b>
                </Typography>
                <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                  {status}
                </Typography>
              </div>
              <div>
                <Typography sx={{ color: "#7d8695" }}>
                  <b>Shipper</b>
                </Typography>
                <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                  {shipper}
                </Typography>
              </div>
              <div>
                <Typography sx={{ color: "#7d8695" }}>
                  <b>Consignee</b>
                </Typography>
                <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                  {consignee}
                </Typography>
              </div>
              <div>
                <Typography sx={{ color: "#7d8695" }}>
                  <b>Packages</b>
                </Typography>
                <Typography sx={{ color: "#25344e", fontWeight: "bold" }}>
                  {service}
                </Typography>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "40px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                width: "90%",
              }}
            >
              {/* Shipment Details */}
              <div style={{ flex: "60%", position: "relative" }}>
                <div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
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
                      <b>Packages</b>
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
              <div
                style={{
                  flex: "40%",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "30px",
                      justifyContent: "center",
                    }}
                  >
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: getStepColor(index),
                            transition: "background-color 0.3s",
                          }}
                        />
                        <Typography
                          sx={{
                            marginLeft: "10px",
                            fontWeight:
                              currentStep >= index + 1 ? "bold" : "normal",
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
          )}

          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              width: "90%",
              marginTop: "20px",
            }}
          >
            <Typography variant="h6" sx={{ padding: "16px", ...cellStyle }}>
              Items in Package
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={cellStyle}>Item Name</TableCell>
                  <TableCell sx={cellStyle}>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell sx={rowCellStyle}>{item.name}</TableCell>
                    <TableCell sx={rowCellStyle}>{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
};

export default TrackShipmentPage;
