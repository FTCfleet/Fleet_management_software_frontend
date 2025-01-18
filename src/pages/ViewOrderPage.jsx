import React, { useState } from "react";
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
import qrcode from "../assets/qr.png";
import orders from "../assets/orders.png";
import "../css/table.css";

export default function ViewOrderPage() {
    const { id } = useParams();
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const cellStyle = { color: "#1E3A5F", fontWeight: "bold" };
    const rowCellStyle = { color: "#25344E" };

    const orderDetails = {
        id,
        sender: "PIN:560001, Bengaluru",
        receiver: "PIN:110001, Delhi",
        package: 40,
    };

    const items = [
        { id: 1, name: "Item A", status: "Delivered", quantity: 2, cost: 500 },
        { id: 2, name: "Item B", status: "Pending", quantity: 1, cost: 300 },
        { id: 3, name: "Item C", status: "Dispatched", quantity: 5, cost: 1500 },
    ];

    const handleViewQR = (itemId) => {
        const item = items.find((i) => i.id === itemId);
        setCurrentItem(item);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentItem(null);
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
                <Box sx={{ flex: 1 , textAlign: "left" }}>
                    <Typography variant="h5" sx={{ marginBottom: "10px", ...cellStyle }}>
                        Order Details
                    </Typography>
                    <Typography sx={rowCellStyle}>
                        <strong>Order ID:</strong> {orderDetails.id}
                    </Typography>
                    <Typography sx={rowCellStyle}>
                        <strong>Sender's Address:</strong> {orderDetails.sender}
                    </Typography>
                    <Typography sx={rowCellStyle}>
                        <strong>Receiver's Address:</strong> {orderDetails.receiver}
                    </Typography>
                    <Typography sx={rowCellStyle}>
                        <strong>Package:</strong> {orderDetails.package}
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
            <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff", borderRadius: "8px" }}>
                <Typography variant="h6" sx={{ padding: "16px", ...cellStyle }}>
                    Items in Package
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={cellStyle}>Item ID</TableCell>
                            <TableCell sx={cellStyle}>Item Name</TableCell>
                            <TableCell sx={cellStyle}>Status</TableCell>
                            <TableCell sx={cellStyle}>Quantity</TableCell>
                            <TableCell sx={cellStyle}>Cost</TableCell>
                            <TableCell sx={cellStyle}>View QR</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell sx={rowCellStyle}>{item.id}</TableCell>
                                <TableCell sx={rowCellStyle}>{item.name}</TableCell>
                                <TableCell sx={rowCellStyle}>
                                    <span className={`table-status ${item.status.replace(" ", "-").toLowerCase()}`}>
                                        {item.status}
                                    </span>
                                </TableCell>
                                <TableCell sx={rowCellStyle}>{item.quantity}</TableCell>
                                <TableCell sx={rowCellStyle}>${item.cost}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        startIcon={<QrCode2 />}
                                        sx={{ textTransform: "none", color: "#1E3A5F", borderColor: "#1E3A5F" }}
                                        onClick={() => handleViewQR(item.id)}
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
            <Box sx={{ marginTop: "20px", textAlign: "center" }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#1E3A5F",
                        color: "#ffffff",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "#16314D" },
                    }}
                    onClick={() => console.log("Print all QR codes")}
                >
                    Print QR Codes
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
                            <Typography variant="h6" sx={{ marginBottom: "10px", color: "#1E3A5F" }}>
                                QR Code for {currentItem.name}
                            </Typography>
                            <img src={qrcode} alt="QR Code" style={{ width: "100%", height: "auto" }} />
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
}
