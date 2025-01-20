import React, { useEffect, useState } from "react";
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
  IconButton,
} from "@mui/material";
import { Close, QrCode2 } from "@mui/icons-material";
import { useParams } from "react-router-dom";
// import qrcode from "../assets/qr.png";
import orders from "../assets/orders.png";
import "../css/table.css";
import {Link} from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ViewOrderPage() {
  const { id } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [senderDetails, setSenderDetails] = useState("NA");
  const [receiverDetails, setReceiverDetails] = useState("NA");
  const [sourceWarehouse, setSourceWarehouse] = useState("NA");
  const [destWarehouse, setDestWarehouse] = useState("NA");
  const [status, setStatus] = useState(0);
  const [items, setItems] = useState([]);
  const [qrCodes, setQrCodes] = useState([]);
  const [qrCode, setQrCode] = useState("");

  const cellStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowCellStyle = { color: "#25344E" };

  useEffect(() => {
    fetchData();
    fetchQRCodes().then((data) => setQrCodes(data));
  }, []);

  const fetchQRCodes = async () => {
    const response = await fetch(`${BASE_URL}/api/parcel/generate-qr/${id}`);
    const data = (await response.json());
    return data.body;
  };

  const fetchData = async () => {
    const response = await fetch(`${BASE_URL}/api/parcel/track/${id}`);
    if (!response.ok) {
      alert("Error occurred");
      return;
    }
    if (response.status === 201) {
      alert("No such Order");
      return;
    }
    const data = (await response.json()).body;

    setSenderDetails(data.sender);
    setReceiverDetails(data.receiver);
    setSourceWarehouse(data.source);
    setDestWarehouse(data.destination);
    setStatus(data.status);
    setItems(data.items);
  };

  const handleViewQR = (itemId) => {
    const item = items.find((i) => i.itemId === itemId);
    setCurrentItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentItem(null);
    setQrCode("");
  };

  const printLR = async () => {
    const response = await fetch(`${BASE_URL}/api/parcel/print/${id}`);
    console.log(response);
    console.log((await response.json()));
  };

  const printQR = async () => {
    const response = await fetch(`${BASE_URL}/api/parcel/qr/${id}`);
    console.log(response);
    console.log((await response.json()));
  };

  return (
    <Box
      sx={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Top Section: Order Details + Image */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start", // Ensure content stays aligned to the left
          alignItems: "flex-start", // Align items at the top
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <Box sx={{ flex: 1, textAlign: "left" }}>
          <Typography variant="h5" sx={{ marginBottom: "10px", ...cellStyle }}>
            Order Details
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Order ID:</strong> {id}
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Sender's Name:</strong> {senderDetails.name}
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Sender's Phone:</strong> {senderDetails.phoneNo}
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Sender's Address:</strong> {senderDetails.address}
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Receiver's Name:</strong> {receiverDetails.name}
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Receiver's Phone:</strong> {receiverDetails.phoneNo}
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Receiver's Address:</strong> {receiverDetails.address}
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Source Warehouse:</strong> {sourceWarehouse}
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Destination Warehouse:</strong> {destWarehouse}
          </Typography>
          <Typography sx={rowCellStyle}>
            <strong>Package:</strong> {items.length}
          </Typography>
        </Box>
        <Box sx={{ flex: "0 0 150px", marginLeft: "20px" }}>
          <img
            src={orders}
            alt="Orders"
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
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
              <TableCell sx={cellStyle}>Item ID</TableCell>
              <TableCell sx={cellStyle}>Item Name</TableCell>
              <TableCell sx={cellStyle}>Quantity</TableCell>
              <TableCell sx={cellStyle}>Status</TableCell>
              <TableCell sx={cellStyle}>View QR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.itemId}>
                <TableCell sx={rowCellStyle}>{item.itemId}</TableCell>
                <TableCell sx={rowCellStyle}>{item.name}</TableCell>
                <TableCell sx={rowCellStyle}>{item.quantity}</TableCell>
                <TableCell sx={rowCellStyle}>
                  <span
                    className={`table-status ${item.status
                      .replace(" ", "-")
                      .toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    startIcon={<QrCode2 />}
                    sx={{
                      textTransform: "none",
                      color: "#1E3A5F",
                      borderColor: "#1E3A5F",
                    }}
                    onClick={() => handleViewQR(item.itemId)}
                  >
                    View QR
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Print QR Button */}
      {/* <Box sx={{ marginTop: "20px", textAlign: "center" }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#1E3A5F",
            color: "#ffffff",
            textTransform: "none",
            "&:hover": { backgroundColor: "#16314D" },
          }}
          onClick={printQR}
        >
          Print QR Codes
        </Button>
      </Box> */}
          {/* Print LR Recipt */}
      <Box sx={{ marginTop: "20px", textAlign: "center" }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#1E3A5F",
            color: "#ffffff",
            textTransform: "none",
            "&:hover": { backgroundColor: "#16314D" },
          }}
          // onClick={Navigate(`{}`)}
        >
          <Link to={`${BASE_URL}/api/parcel/generate-lr-receipt/${id}`}> 
          Print LR Receipt
          </Link>
        </Button>
      </Box>


      {/* QR Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "300px",
            backgroundColor: "#ffffff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={handleCloseModal}>
              <Close sx={{ color: "#1E3A5F" }} />
            </IconButton>
          </Box>
          {currentItem && (
            <>
              <Typography
                variant="h6"
                sx={{ marginBottom: "10px", color: "#1E3A5F" }}
              >
                QR Code for {currentItem.name}
              </Typography>
              <img  
                src={qrCodes.find((item) => item.id === currentItem.itemId).qrCodeURL}
                alt="QR Code"
                style={{ width: "100%", height: "auto" }}
              />
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
