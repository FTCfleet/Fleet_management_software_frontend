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
  TextField,
} from "@mui/material";
import { Close, QrCode2 } from "@mui/icons-material";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPrint,
  FaExclamationTriangle,
} from "react-icons/fa";
import orders from "../assets/orders.png";
import { useAuth } from "../routes/AuthContext";
import "../css/table.css";
import "../css/main.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ViewOrderPage() {
  const { id } = useParams();
  const [senderDetails, setSenderDetails] = useState({});
  const [receiverDetails, setReceiverDetails] = useState({});
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destWarehouse, setDestWarehouse] = useState("");
  const [qrCount, setQrCount] = useState(0);
  const [items, setItems] = useState([]);
  const [qrCode, setQrCode] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const navigate = useNavigate();

  const { isAdmin } = useAuth();
  const cellStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowCellStyle = { color: "#25344E" };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/parcel/track/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      alert("Error occurred");
      return;
    }
    if (response.status === 201) {
      alert("No such Order");
      return;
    }
    const data = await response.json();
    console.log(data);
    setSenderDetails(data.body.sender);
    setReceiverDetails(data.body.receiver);
    setSourceWarehouse(data.body.sourceWarehouse.warehouseID);
    setDestWarehouse(data.body.destinationWarehouse.warehouseID);
    setItems(data.body.items);
    setQrCode(data.qrCode);
    // console.log(data)
  };

  // const printQR = async () => {
  //   const response = await fetch(`${BASE_URL}/api/parcel/qr/${id}`);
  //   console.log(response);
  //   console.log(await response.json());
  // };

  const handleOpenDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleQrCodeModal = () => {
    setQrCodeModalOpen(true);
    setQrCount(items.length);
  };

  const confirmDelete = async () => {
    console.log("Order deleted!"); // Replace with actual delete logic
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
    console.log(data);
    if (data.flag) {
      handleCloseDeleteModal();
      navigate("/user/order/all");
    } else {
      alert("Error occurred");
    }
  };

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
        <Box sx={{ flex: 1, textAlign: "left" }}>
          <Typography variant="h5" sx={{ marginBottom: "10px", ...cellStyle }}>
            Order Details
          </Typography>

          {/* Order ID */}
          <Typography sx={rowCellStyle}>
            <strong>Order ID:</strong> {id}
          </Typography>

          <Box sx={{ display: "flex", marginBottom: "10px" }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={rowCellStyle}>
                <strong>Sender's Name:</strong>{" "}
                {senderDetails.name ? senderDetails.name : "NA"}
              </Typography>
              <Typography sx={rowCellStyle}>
                <strong>Sender's Phone:</strong>{" "}
                {senderDetails.phoneNo ? senderDetails.phoneNo : "NA"}
              </Typography>
              <Typography sx={rowCellStyle}>
                <strong>Sender's Address:</strong>{" "}
                {senderDetails.address ? senderDetails.address : "NA"}
              </Typography>
              <Typography sx={rowCellStyle}>
                <strong>Source Warehouse:</strong> {sourceWarehouse}
              </Typography>
              <Typography sx={rowCellStyle}>
                <strong>Package:</strong> {items.length}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={rowCellStyle}>
                <strong>Receiver's Name:</strong>{" "}
                {receiverDetails.name ? receiverDetails.name : "NA"}
              </Typography>
              <Typography sx={rowCellStyle}>
                <strong>Receiver's Phone:</strong>{" "}
                {receiverDetails.phoneNo ? receiverDetails.phoneNo : "NA"}
              </Typography>
              <Typography sx={rowCellStyle}>
                <strong>Receiver's Address:</strong>{" "}
                {receiverDetails.address ? receiverDetails.address : "NA"}
              </Typography>
              <Typography sx={rowCellStyle}>
                <strong>Destination Warehouse:</strong> {destWarehouse}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: "0 0 150px", marginLeft: "20px" }}>
          <img
            src={qrCode ? qrCode : orders}
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
              <TableCell sx={cellStyle}>Sl. No.</TableCell>
              <TableCell sx={cellStyle}>Item Name</TableCell>
              <TableCell sx={cellStyle}>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell sx={rowCellStyle}>{idx + 1}</TableCell>
                <TableCell sx={rowCellStyle}>{item.name}</TableCell>
                <TableCell sx={rowCellStyle}>{item.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ marginTop: "20px", textAlign: "center" }}>
        <Link
          to={`${BASE_URL}/api/parcel/generate-lr-receipt/${id}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <button className="button">
            <FaPrint style={{ marginRight: "8px" }} /> Print LR Receipt
          </button>
        </Link>
        <Link
          to={`/user/edit/order/${id}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <button className="button">
            <FaEdit style={{ marginRight: "8px" }} /> Edit Order
          </button>
        </Link>
        <button className="button" onClick={handleOpenDeleteModal}>
          <FaTrash style={{ marginRight: "8px" }} /> Delete Order
        </button>
        <button className="button" onClick={handleQrCodeModal}>
          Print QR Code
        </button>

        {/* Delete Confirmation Modal */}
        <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                marginBottom: "16px",
                textAlign: "center",
                color: "#d32f2f",
              }}
            >
              <FaExclamationTriangle style={{ marginRight: "8px" }} /> Confirm
              Deletion
            </Typography>
            <Typography
              sx={{
                marginBottom: "16px",
                textAlign: "center",
                color: "#1E3A5F",
              }}
            >
              Are you sure you want to delete this order?
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: "16px" }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<FaTrash />}
                onClick={confirmDelete}
              >
                Confirm
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
              width: 300,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                marginBottom: "16px",
                textAlign: "center",
                color: "#d32f2f",
              }}
            >
              Enter Count
            </Typography>
            <Typography
              sx={{
                marginBottom: "16px",
                textAlign: "center",
                color: "#1E3A5F",
              }}
            >
              Enter number of QR codes (default to no of packages)
            </Typography>
            <TextField
              label="Count"
              value={qrCount}
              onChange={(e) => setQrCount(parseInt(e.target.value) || 0)}
            ></TextField>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: "16px" }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setQrCodeModalOpen(false)}
              >
                Cancel
              </Button>
              <Link
                to={`${BASE_URL}/api/parcel/generate-qr/${id}?count=${qrCount}`}
              >
                <Button variant="contained" color="error">
                  Print
                </Button>
              </Link>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}
