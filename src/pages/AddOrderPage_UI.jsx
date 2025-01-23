import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import { FaCopy, FaTrash, FaPlus } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import "../css/main.css";


export default function AddOrderPage() {
    const [items, setItems] = useState([]);
    const [counter, setCounter] = useState(1);
    const [senderDetails, setSenderDetails] = useState({ role: "sender" });
    const [receiverDetails, setReceiverDetails] = useState({ role: "receiver" });
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleAddRow = () => {
        setItems([...items, { id: counter, name: "", quantity: "" }]);
        setCounter(counter + 1);
    };

    const handleRemoveRow = (id) => {
        const updatedItems = items
            .filter((item) => item.id !== id)
            .map((item, index) => ({
                ...item,
                id: index + 1,
            }));
        setItems(updatedItems);
        setCounter(updatedItems.length + 1);
    };

    const handleCopyRow = (id) => {
        const itemToCopy = items.find((item) => item.id === id);
        if (itemToCopy) {
            setItems([...items, { ...itemToCopy, id: counter }]);
            setCounter(counter + 1);
        }
    };

    const handleInputChange = (id, field, value) => {
        if (field === "quantity") {
            value = parseInt(value);
        }
        const updatedItems = items.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setItems(updatedItems);
    };

    const handleDetailsChange = (e, type) => {
        const { name, value } = e.target;
        if (type === "sender") {
            setSenderDetails({ ...senderDetails, [name]: value });
        } else {
            setReceiverDetails({ ...receiverDetails, [name]: value });
        }
    };

    const validateOrder = () => {
        if (
            !senderDetails.name ||
            !senderDetails.phoneNo ||
            !receiverDetails.name ||
            !receiverDetails.phoneNo ||
            !receiverDetails.address
        ) {
            return false;
        }

        if (
            items.length === 0 ||
            items.some((item) => !item.name || !item.quantity)
        ) {
            return false;
        }

        return true;
    };

    const handleAddOrder = async () => {
        if (!validateOrder()) {
            setError(true);
            return;
        }
        // console.log(senderDetails);
        // console.log(receiverDetails);
        // console.log(items);
        await fetch(`${BASE_URL}/api/parcel/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                senderDetails: senderDetails,
                receiverDetails: receiverDetails,
                items: items,
                sourceWarehouse: 'HYO',
                destinationWarehouse: 'MNC'
            }),
        }).then(async (response) => {
            if (!response.ok) {
                alert("Error occurred");
            } else {
                alert("Order Added Successfully");
                const data = await response.json();
                navigate(`/user/view/order/${data.body.trackingId}`);
            }
        });
    };

    const renderTextField = ({ label, name, isOptional, isSender }) => (
        <TextField
            label={label}
            variant="outlined"
            fullWidth
            name={name}
            onChange={(e) => handleDetailsChange(e, isSender ? "sender" : "receiver")}
            error={
                error &&
                !isOptional &&
                !(isSender ? senderDetails[name] : receiverDetails[name])
            }
            helperText={
                error &&
                    !isOptional &&
                    !(isSender ? senderDetails[name] : receiverDetails[name])
                    ? "This field is required"
                    : ""
            }
            sx={{
                "& .MuiInputBase-root": { fontSize: "14px", color: "#1b3655" },
                "& .MuiInputLabel-root": { fontSize: "14px", color: "#7d8695" },
            }}
        />
    );

    return (
        <Box
            sx={{
                padding: "20px",
                margin: "auto",
                backgroundColor: "#ffffff",
                color: "#1b3655",
            }}
        >
            <Typography
                variant="h4"
                sx={{ marginBottom: "20px", textAlign: "center", color: "#1c3553" }}
            >
                Add Order
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gap: "12px",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
            >
                {renderTextField({
                    label: "Sender's Name",
                    name: "name",
                    isSender: true,
                })}
                {renderTextField({
                    label: "Receiver's Name",
                    name: "name",
                    isSender: false,
                })}
                {renderTextField({
                    label: "Sender's Phone No.",
                    name: "phoneNo",
                    isSender: true,
                })}
                {renderTextField({
                    label: "Receiver's Phone No.",
                    name: "phoneNo",
                    isSender: false,
                })}
                {renderTextField({
                    label: "Sender's Address (Optional)",
                    name: "address",
                    isSender: true,
                    isOptional: true,
                })}
                {renderTextField({
                    label: "Receiver's Address",
                    name: "address",
                    isSender: false,
                })}
            </Box>

            <Box sx={{ marginTop: "30px" }}>
                <Typography
                    variant="h6"
                    sx={{
                        marginBottom: "10px",
                        textAlign: "center",
                        color: "#25344e",
                        fontWeight: "bold",
                    }}
                >
                    Items
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                                Sl. No.
                            </TableCell>
                            <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                                Item Name
                            </TableCell>
                            <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                                Quantity
                            </TableCell>
                            <TableCell sx={{ color: "#1b3655", fontWeight: "bold" }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>
                                    <TextField
                                        value={item.name}
                                        onChange={(e) =>
                                            handleInputChange(item.id, "name", e.target.value)
                                        }
                                        placeholder="Enter Item Name"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        error={error && !item.name}
                                        helperText={error && !item.name ? "Required" : ""}
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                fontSize: "14px",
                                                color: "#1b3655",
                                            },
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleInputChange(item.id, "quantity", e.target.value)
                                        }
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        error={error && !item.quantity}
                                        helperText={error && !item.quantity ? "Required" : ""}
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                fontSize: "14px",
                                                color: "#1b3655",
                                            },
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleCopyRow(item.id)}
                                    >
                                        <FaCopy />
                                    </IconButton>
                                    <IconButton
                                        color="secondary"
                                        onClick={() => handleRemoveRow(item.id)}
                                    >
                                        <FaTrash />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Box sx={{ textAlign: "right", marginTop: "10px" }}>
                    <button
                        className="button"
                        onClick={handleAddRow}
                    >
                        <FaPlus style={{ marginRight: "8px" }} /> Add Item
                    </button>
                </Box>
            </Box>

            <Box sx={{ textAlign: "center", marginTop: "30px" }}>
                <button
                    className="button button-large"
                    onClick={handleAddOrder}
                >
                    Add Order
                </button>
            </Box>
        </Box>
    );
}
