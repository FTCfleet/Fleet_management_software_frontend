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
  CircularProgress,
  TextField,
} from "@mui/material";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaPrint,
  FaExclamationTriangle,
  FaQrcode,
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
  const [status, setStatus] = useState("");
  const [qrCount, setQrCount] = useState(0);
  const [charges, setCharges] = useState(0);
  const [freight, setFreight] = useState(0);
  const [hamali, setHamali] = useState(0);
  const [items, setItems] = useState([]);
  const [qrCode, setQrCode] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const { isAdmin } = useAuth();
  const cellStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowCellStyle = { color: "#25344E" };

  useEffect(() => {
    fetchData();
  }, []);

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
      alert("No such Order");
      setIsLoading1(false);
      return;
    }
    const data = await response.json();
    console.log(data);
    setSenderDetails(data.body.sender);
    setReceiverDetails(data.body.receiver);
    setSourceWarehouse(data.body.sourceWarehouse.name);
    setDestWarehouse(data.body.destinationWarehouse.name);
    setItems(data.body.items);
    setCharges(data.body.charges);
    setQrCode(data.qrCode);
    setStatus(data.body.status);
    setIsLoading1(false);
  };

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
    console.log(data);
    if (data.flag) {
      setIsLoading(false);
      handleCloseDeleteModal();
      navigate("/user/order/all");
    } else {
      setIsLoading(false);
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
                <Box sx={{ flex: 1 }}>
                  <Typography sx={rowCellStyle}>
                    <strong>Order ID:</strong> {id}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Sender's Name:</strong>{" "}
                    {senderDetails.name}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Sender's Phone:</strong>{" "}
                    {senderDetails.phoneNo}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Sender's Address:</strong>{" "}
                    {senderDetails.address}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Source Warehouse:</strong> {sourceWarehouse}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Package:</strong> {items.length}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                <strong>Freight:</strong> {charges}
              </Typography>
            </Box>
                <Box sx={{ flex: 1, marginLeft: "20px" }}>
                  <Typography sx={rowCellStyle}>
                    <strong>Status:</strong> {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Receiver's Name:</strong>{" "}
                    {receiverDetails.name}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Receiver's Phone:</strong>{" "}
                    {receiverDetails.phoneNo}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Receiver's Address:</strong>{" "}
                    {receiverDetails.address}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Destination Warehouse:</strong> {destWarehouse}
                  </Typography>
                  <Typography sx={rowCellStyle}>
                    <strong>Hamali:</strong> {hamali}
              </Typography>
              <Typography sx={rowCellStyle}>
                <strong>Statistical Charges:</strong> {charges}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ flex: "0 0 150px" }}>
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
            {isLoading1 ? (<TableRow>
              <TableCell colSpan={7} align="center">
                <CircularProgress
                  size={22}
                  className="spinner"
                  sx={{ color: "#1E3A5F", animation: "none !important" }}
                />
              </TableCell>
            </TableRow>) :
              (orders.length !== 0 && items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={rowCellStyle}>{idx + 1}</TableCell>
                  <TableCell sx={rowCellStyle}>{item.name}</TableCell>
                  <TableCell sx={rowCellStyle}>{item.quantity}</TableCell>
                </TableRow>
              )))}
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
          <FaQrcode style={{ marginRight: "8px" }} /> Print QR Code
        </button>

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
              Delete Order
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
            <Box sx={{ display: "flex", justifyContent: "center", gap: "12px" }}>
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
                Delete  {isLoading && (
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
              Specify the number of QR codes to generate. Default is set to package count.
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

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: "20px" }}>
              <Button variant="outlined" color="error" onClick={() => setQrCodeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={() => {
                window.location.href = `${BASE_URL}/api/parcel/generate-qr/${id}?count=${qrCount}`;
              }}>
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}
