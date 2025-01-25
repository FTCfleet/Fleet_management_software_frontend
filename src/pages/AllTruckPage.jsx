import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Modal,
    TextField,
} from "@mui/material";
import { Edit, Delete, Close, Warning } from "@mui/icons-material";

const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
const rowStyle = { color: "#25344E" };

export default function TruckDetailsPage() {
    const initialTrucks = [
        { id: 1, driverName: "John Doe", phone: "1234567890", truckNumber: "AB123CD" },
        { id: 2, driverName: "Jane Smith", phone: "0987654321", truckNumber: "EF456GH" },
        { id: 3, driverName: "Alice Brown", phone: "5555555555", truckNumber: "IJ789KL" },
        { id: 4, driverName: "Bob Johnson", phone: "7777777777", truckNumber: "MN012OP" },
        { id: 5, driverName: "Chris Wilson", phone: "9999999999", truckNumber: "QR345ST" },
    ];
    const [trucks, setTrucks] = useState(initialTrucks);
    const [filteredTrucks, setFilteredTrucks] = useState(initialTrucks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTruck, setCurrentTruck] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [nameFilter, setNameFilter] = useState("");
    const [truckNoFilter, setTruckNoFilter] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [truckToDelete, setTruckToDelete] = useState(null);


    // Filters
    const applyFilter = () => {
        const filtered = trucks.filter((truck) => {
            return (
                (nameFilter ? truck.driverName.toLowerCase().includes(nameFilter.toLowerCase()) : true) &&
                (truckNoFilter ? truck.truckNumber.toLowerCase().includes(truckNoFilter.toLowerCase()) : true)
            );
        });
        setFilteredTrucks(filtered);
    };

    const clearFilter = () => {
        setNameFilter("");
        setTruckNoFilter("");
        setFilteredTrucks(trucks);
    };

    const handleEdit = (truck) => {
        setCurrentTruck({ ...truck });
        setIsModalOpen(true);
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        setTruckToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        alert("Delete functionality to be implemented.");
        setDeleteModalOpen(false);
        setTruckToDelete(null);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setTruckToDelete(null);
    };


    const handleAdd = () => {
        setCurrentTruck({ driverName: "", phone: "", truckNumber: "" });
        setIsModalOpen(true);
        setIsAdding(true);
    };

    const handleSaveOrAdd = () => {
        if (isAdding) {
            alert("Add functionality to be implemented.");
        } else {
            alert("Save functionality to be implemented.");
        }
        setIsModalOpen(false);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setCurrentTruck(null);
    };

    const handleFieldChange = (field, value) => {
        setCurrentTruck({ ...currentTruck, [field]: value });
    };

    return (
        <Box sx={{ padding: "20px" }}>
            <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
                Truck Details
            </Typography>

            {/* Filters */}
            <Box sx={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                <TextField
                    label="Search by Driver Name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    variant="outlined"
                    size="small"
                />
                <TextField
                    label="Search by Truck Number"
                    value={truckNoFilter}
                    onChange={(e) => setTruckNoFilter(e.target.value)}
                    variant="outlined"
                    size="small"
                />
                <Button variant="contained" color="primary" onClick={applyFilter}>
                    Apply Filter
                </Button>
                <Button variant="outlined" color="secondary" onClick={clearFilter}>
                    Clear Filter
                </Button>
            </Box>

            {/* Truck Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={headerStyle}>Driver Name</TableCell>
                            <TableCell sx={headerStyle}>Phone Number</TableCell>
                            <TableCell sx={headerStyle}>Truck Number</TableCell>
                            <TableCell sx={headerStyle}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTrucks.map((truck) => (
                            <TableRow key={truck.id}>
                                <TableCell sx={rowStyle}>{truck.driverName}</TableCell>
                                <TableCell sx={rowStyle}>{truck.phone}</TableCell>
                                <TableCell sx={rowStyle}>{truck.truckNumber}</TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleEdit(truck)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(truck.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Truck Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button className="button button-large" onClick={handleAdd}>
                    Add Truck
                </button>
            </Box>

            {/* Modal for Add/Edit Truck */}
            <Modal open={isModalOpen} onClose={handleClose}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <IconButton
                        color="error"
                        onClick={handleClose}
                        sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                        <Close />
                    </IconButton>
                    <Typography variant="h6" sx={{ marginBottom: "16px", textAlign: "center", ...headerStyle }}>
                        {isAdding ? "Add Truck" : "Edit Truck Details"}
                    </Typography>
                    {currentTruck && (
                        <Box>
                            <TextField
                                fullWidth
                                label="Driver Name"
                                value={currentTruck.driverName}
                                onChange={(e) => handleFieldChange("driverName", e.target.value)}
                                sx={{ marginBottom: "16px" }}
                            />
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={currentTruck.phone}
                                onChange={(e) => handleFieldChange("phone", e.target.value)}
                                sx={{ marginBottom: "16px" }}
                            />
                            <TextField
                                fullWidth
                                label="Truck Number"
                                value={currentTruck.truckNumber}
                                onChange={(e) => handleFieldChange("truckNumber", e.target.value)}
                                sx={{ marginBottom: "16px" }}
                            />
                            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                                <button className="button button-large" onClick={handleSaveOrAdd}>
                                    {isAdding ? "Add" : "Save"}
                                </button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Modal>
            {/* Modal for Delete Confirmation */}
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
                    <Typography variant="h6" sx={{ marginBottom: "14px", textAlign: "center", color: "#d32f2f" }}>
                        <Warning sx={{ marginRight: 1, marginBottom: -0.5, fontSize: "24px" }} />
                        Confirm Deletion
                    </Typography>
                    <Typography sx={{ marginBottom: "16px", textAlign: "center" , color:"#1E3A5F"}}>
                        Are you sure you want to delete this truck?
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                        <Button variant="outlined" color="primary" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Delete />}
                            onClick={confirmDelete}
                        >
                            Confirm
                        </Button>
                    </Box>
                </Box>
            </Modal>

        </Box>
    );
}