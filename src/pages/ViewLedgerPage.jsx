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
    TextField,
    IconButton,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import ledger from "../assets/ledger.jpg";

export default function ViewLedgerPage() {
    const { id } = useParams();
    const [ledgerData, setLedgerData] = useState([
        { id: 1, name: "Item A", lrNo: "LR1234", packages: 5, consignee: "Delhi", freight: 1000, hamali: 50 },
        { id: 2, name: "Item B", lrNo: "LR5678", packages: 2, consignee: "Mumbai", freight: 800, hamali: 30 },
        { id: 3, name: "Item C", lrNo: "LR9101", packages: 10, consignee: "Chennai", freight: 0, hamali: 0 },
    ]);

    const ledgerDetails = {
        ledgerNo: id,
        truckNo: "KA-01-AB-1234",
        deliveryStation: "Bengaluru",
    };

    // Styling variables
    const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
    const rowStyle = { color: "#25344E" };

    // Handler for updating Freight or Hamali
    const handleUpdate = (id, field, value) => {
        setLedgerData((prevData) =>
            prevData.map((item) =>
                item.id === id ? { ...item, [field]: Number(value) } : item
            )
        );
        console.log(`Updated ${field} for ID ${id} to ${value}`); // Replace with your database function later
    };

    // Calculate totals
    const totals = ledgerData.reduce(
        (acc, item) => {
            acc.packages += item.packages;
            acc.freight += item.freight;
            acc.hamali += item.hamali;
            return acc;
        },
        { packages: 0, freight: 0, hamali: 0 }
    );

    return (
        <Box
            sx={{
                padding: "20px",
                backgroundColor: "#f5f5f5",
                minHeight: "100vh",
            }}
        >
            {/* Top Section: Ledger Details + Image */}
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
                    <Typography variant="h5" sx={{ marginBottom: "10px", ...headerStyle }}>
                        Ledger Details
                    </Typography>
                    <Typography sx={rowStyle}>
                        <strong>Ledger No:</strong> {ledgerDetails.ledgerNo}
                    </Typography>
                    <Typography sx={rowStyle}>
                        <strong>Truck No:</strong> {ledgerDetails.truckNo}
                    </Typography>
                    <Typography sx={rowStyle}>
                        <strong>Delivery Station:</strong> {ledgerDetails.deliveryStation}
                    </Typography>
                </Box>
                <Box sx={{ flex: "0 0 150px", marginLeft: "20px" }}>
                    <img
                        src={ledger}
                        alt="Ledger"
                        style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                    />
                </Box>
            </Box>

            {/* Ledger Table */}
            <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff", borderRadius: "8px" }}>
                <Typography variant="h6" sx={{ padding: "16px", ...headerStyle }}>
                    Ledger Items
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={headerStyle}>S.No</TableCell>
                            <TableCell sx={headerStyle}>Item Name</TableCell>
                            <TableCell sx={headerStyle}>LR No</TableCell>
                            <TableCell sx={headerStyle}>Packages</TableCell>
                            <TableCell sx={headerStyle}>Consignee</TableCell>
                            <TableCell sx={headerStyle}>Freight</TableCell>
                            <TableCell sx={headerStyle}>Hamali</TableCell>
                            <TableCell sx={headerStyle}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ledgerData.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell sx={rowStyle}>{index + 1}</TableCell>
                                <TableCell sx={rowStyle}>{item.name}</TableCell>
                                <TableCell sx={rowStyle}>{item.lrNo}</TableCell>
                                <TableCell sx={rowStyle}>{item.packages}</TableCell>
                                <TableCell sx={rowStyle}>{item.consignee}</TableCell>
                                <TableCell sx={rowStyle}>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={item.freight}
                                        onChange={(e) => handleUpdate(item.id, "freight", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell sx={rowStyle}>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={item.hamali}
                                        onChange={(e) => handleUpdate(item.id, "hamali", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton color="success">
                                        <CheckCircle />
                                    </IconButton>
                                    <IconButton color="error">
                                        <Cancel />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {/* Totals Row */}
                        <TableRow>
                            <TableCell colSpan={3} sx={{ ...headerStyle }}>
                                Total
                            </TableCell>
                            <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>{totals.packages}</TableCell>
                            <TableCell sx={rowStyle}>---</TableCell>
                            <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>{totals.freight}</TableCell>
                            <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>{totals.hamali}</TableCell>
                            <TableCell>---</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
