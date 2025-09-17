import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Link, Navigate, useNavigate, useOutletContext, useParams, useLocation } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaPrint,
  FaExclamationTriangle,
  FaQrcode,
} from "react-icons/fa";
import orders_img from "../assets/orders.png";
import { useAuth } from "../routes/AuthContext";
import "../css/table.css";
import "../css/main.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ViewOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState({
    sender: {},
    receiver: {},
    sourceWarehouse: {},
    destinationWarehouse: {},
    items: [],
    hamali: 0,
    freight: 0,
    status: "",
    isDoorDelivery: false,
    isPaid: false,
    addedBy: {},
  });
  const [qrCode, setQrCode] = useState(0);
  const [qrCount, setQrCount] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const cellStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowCellStyle = { color: "#25344E" };
  const {setIsScreenLoading, setIsScreenLoadingText} = useOutletContext();
  const location = useLocation();
  useEffect(() => {
    fetchData();
  }, []);

  const hasTriggered = useRef(false);

  // useEffect(() => {
  //   if (!hasTriggered.current) {
  //     hasTriggered.current = true;
  //     return;
  //   }

  //   // console.log("Triggered on navigation:", location.pathname);
  //   handleLRPrint();
  // }, [location]);

  const fetchData = async () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/parcel/track/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      alert("Error occurred");
      setIsLoading1(false);
      return;
    }
    if (response.status === 201) {
      alert("No such LR");
      setIsLoading1(false);
      return;
    }
    const data = await response.json();
    setOrder(data.body);
    setQrCode(data.qrCode);
    setIsLoading1(false);
    if (location.state?.print && !hasTriggered.current) {
      navigate(location.pathname, { replace: true, state: null });
      hasTriggered.current = true;
      handleLRPrint();
    }
  };

  const handleOpenDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleQrCodeModal = () => {
    setQrCodeModalOpen(true);
    setQrCount(order.items.length);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/parcel`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "DELETE",
      body: JSON.stringify({
        trackingId: id,
      }),
    });

    const data = await res.json();
    if (data.flag) {
      setIsLoading(false);
      handleCloseDeleteModal();
      navigate("/user/order/all");
    } else {
      setIsLoading(false);
      alert("Error occurred");
    }
  };

  const handlePrint = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/parcel/generate-qr/${id}?count=${qrCount}`
      );
      const blob = await response.blob();
      const pdfURL = URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = pdfURL;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };
    } catch (error) {
      alert("Failed to load or print the PDF.");
    }
    setQrCodeModalOpen(false);
  };

  const handleLRPrint = async () => {
    try {
      setIsScreenLoadingText("Generating LR Receipt...");
      setIsScreenLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/parcel/generate-lr-receipt/${id}` 
      );
      const blob = await response.blob();
      const pdfURL = URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = pdfURL;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };
    } catch (error) {
      alert("Failed to load or print the PDF.");
    }
    setIsScreenLoadingText("");
    setIsScreenLoading(false);
  };

  const dateFormatter = (dateString) => {
    if (!dateString) return "N/A"; 
    const year = dateString.substring(0, 4);
    const month = dateString.substring(5, 7);
    const day = dateString.substring(8, 10);
    const hour24 = parseInt(dateString.substring(11, 13));
    const minute = dateString.substring(14, 16);

    let ampm = hour24 >= 12 ? 'PM' : 'AM';
    let hour12 = hour24 % 12;
    hour12 = hour12 === 0 ? 12 : hour12; 

    const formattedDate = `${day}/${month}/${year}, ${hour12}:${minute} ${ampm}`;
    return (formattedDate); 
  }

  return (
    <Box
      sx={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <Box sx={{ flex: 1, textAlign: "left", marginRight: "20px" }}>
          <Typography variant="h5" sx={{ marginBottom: "10px", ...cellStyle }}>
            Order Details
          </Typography>

          {/* Order ID */}
          {isLoading1 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", marginBottom: "10px" }}>
                <Box sx={{flex: "40%"}}>
                  <Typography sx={rowCellStyle}>
                    <strong>LR ID:</strong> {id}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Sender's Name:</strong> {order.sender?.name}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Sender's Phone:</strong> {order.sender?.phoneNo}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Sender's Address:</strong> {order.sender?.address}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Sender's GST:</strong> {order.sender?.gst}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Source Station:</strong>{" "}
                    {order.sourceWarehouse?.name}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Added by:</strong> {order.addedBy?.name}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Created on:</strong> {dateFormatter(order.placedAt)}
                  </Typography>
                </Box>
                <Box sx={{ flex: "40%", marginLeft: "40px" }}>
                  <Typography sx={rowCellStyle}>
                    <strong>Status:</strong>{" "}
                    {order.status?.charAt(0).toUpperCase() +
                      order.status?.slice(1)}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Receiver's Name:</strong> {order.receiver?.name}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Receiver's Phone:</strong> {order.receiver?.phoneNo}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Receiver's Address:</strong>{" "}
                    {order.receiver?.address}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Receiver's GST:</strong> {order.receiver?.gst}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Destination Station:</strong>{" "}
                    {order.destinationWarehouse?.name}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Last Modified by:</strong> {order.lastModifiedBy?.name}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Last Modified On:</strong> {dateFormatter(order.lastModifiedAt)}
                  </Typography>
                </Box>
                <Box sx={{ marginLeft: "40px" }}>
                  <Typography sx={rowCellStyle}>
                    <strong>Type:</strong> {order.payment}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Total:</strong>{" "}
                    {order.freight + order.hamali + order.hamali}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Freight:</strong> {order.freight}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Hamali:</strong> {order.hamali}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Packages:</strong> {order.items?.reduce((sum, x) => sum + x.quantity, 0)}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Door Delivery:</strong>
                    {order.isDoorDelivery ? order.doorDeliveryCharge : " No"}
                  </Typography>
                </Box>
                {/* <Box
                  sx={{
                    boxSizing: "border-box",
                    alignContent: "center",
                    justifyContent: "center",
                    height: "10vw",
                    marginLeft: "60px",
                  }}
                >
                  <img
                    src={qrCode ? qrCode : orders_img}
                    alt="Orders"
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    }}
                  />
                </Box> */}
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Items Table */}
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#ffffff", borderRadius: "8px" }}
      >
        <Typography variant="h6" sx={{ padding: "16px", ...cellStyle }}>
          Items in Package
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={cellStyle}>No.</TableCell>
              <TableCell sx={cellStyle}>Item Name</TableCell>
              <TableCell sx={cellStyle}>Item Type</TableCell>
              <TableCell sx={cellStyle}>Quantity</TableCell>
              <TableCell sx={cellStyle}>Freight</TableCell>
              <TableCell sx={cellStyle}>Hamali</TableCell>
              <TableCell sx={cellStyle}>Statistical Charges</TableCell>
              <TableCell sx={cellStyle}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading1 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress
                    size={22}
                    className="spinner"
                    sx={{ color: "#1E3A5F", animation: "none !important" }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              order.items.length !== 0 &&
              order.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={rowCellStyle}>{idx + 1}</TableCell>
                  <TableCell sx={rowCellStyle}>{item.name}</TableCell>
                  <TableCell sx={rowCellStyle}>{item.type}</TableCell>
                  <TableCell sx={rowCellStyle}>{item.quantity}</TableCell>
                  <TableCell sx={rowCellStyle}>{item.freight}</TableCell>
                  <TableCell sx={rowCellStyle}>{item.hamali}</TableCell>
                  <TableCell sx={rowCellStyle}>{item.hamali}</TableCell>
                  <TableCell sx={rowCellStyle}>
                    {(item.freight + 2 * item.hamali) * item.quantity}
                  </TableCell>
                </TableRow>
              ))
            )}
            <TableRow>
              <TableCell sx={rowCellStyle}/>
              <TableCell sx={rowCellStyle}/>
              <TableCell sx={rowCellStyle}><strong>Total</strong></TableCell>
              <TableCell sx={rowCellStyle}>{order.items?.reduce((prev, item) => prev + item.quantity, 0)}</TableCell>
              <TableCell sx={rowCellStyle}>{order.freight}</TableCell>
              <TableCell sx={rowCellStyle}>{order.hamali}</TableCell>
              <TableCell sx={rowCellStyle}>{order.hamali}</TableCell>
              <TableCell sx={rowCellStyle}>{order.freight + order.hamali + order.hamali}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ marginTop: "20px", textAlign: "center" }}>
        <button className="button" onClick={() => handleLRPrint(0)}>
          <FaPrint style={{ marginRight: "8px" }} /> Download LR Receipt
        </button>

        <Link
          to={`/user/edit/order/${id}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <button className="button">
            <FaEdit style={{ marginRight: "8px" }} /> Edit LR
          </button>
        </Link>
        <button className="button" onClick={handleOpenDeleteModal}>
          <FaTrash style={{ marginRight: "8px" }} /> Delete LR
        </button>
        {/* <button className="button" onClick={handleQrCodeModal}>
          <FaQrcode style={{ marginRight: "8px" }} /> Download QR Code
        </button> */}

        {/* Delete Confirmation Modal */}
        <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 350,
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <FaExclamationTriangle
              style={{
                color: "#d32f2f",
                fontSize: "36px",
                marginBottom: "12px",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                marginBottom: "12px",
                color: "#d32f2f",
              }}
            >
              Delete LR
            </Typography>
            <Typography
              sx={{
                marginBottom: "20px",
                color: "#374151",
                fontSize: "15px",
              }}
            >
              This action cannot be undone. Are you sure you want to proceed?
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <Button
                variant="outlined"
                sx={{ borderColor: "#1E3A5F", color: "#1E3A5F" }}
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#d32f2f" }}
                startIcon={<FaTrash />}
                onClick={confirmDelete}
              >
                Delete {"  "}
                {isLoading && (
                  <CircularProgress
                    size={15}
                    className="spinner"
                    sx={{ color: "#fff", animation: "none !important" }}
                  />
                )}
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* QR Code Modal */}
        <Modal open={qrCodeModalOpen} onClose={() => setQrCodeModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 320,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                color: "#1E3A5F",
                fontWeight: "bold",
              }}
            >
              QR Code Quantity
            </Typography>

            <Typography
              sx={{
                textAlign: "center",
                color: "#4A4A4A",
                fontSize: 14,
              }}
            >
              Specify the number of QR codes to generate. Default is set to
              package count.
            </Typography>

            <TextField
              label="Enter Quantity"
              type="text"
              value={qrCount}
              onChange={(e) => setQrCount(parseInt(e.target.value) || 0)}
              fullWidth
              variant="outlined"
              size="small"
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                gap: "20px",
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={() => setQrCodeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handlePrint}>
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}
