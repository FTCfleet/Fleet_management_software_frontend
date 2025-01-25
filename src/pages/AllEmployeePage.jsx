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
    IconButton,
    Modal,
    TextField,
    Select,
    MenuItem,
} from "@mui/material";
import { Edit, Delete, Close, Warning } from "@mui/icons-material";

const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
const rowStyle = { color: "#25344E" };

const AllEmployeePage = () => {
    const initialEmployees = [
        { id: 1, name: "John Doe", phone: "1234567890", role: "Manager", warehouse: "Warehouse 1" },
        { id: 2, name: "Jane Smith", phone: "0987654321", role: "Worker", warehouse: "Warehouse 2" },
        { id: 3, name: "Alice Brown", phone: "5555555555", role: "Supervisor", warehouse: "Warehouse 1" },
        { id: 4, name: "Bob Johnson", phone: "7777777777", role: "Clerk", warehouse: "Warehouse 3" },
        { id: 5, name: "Emily Davis", phone: "8888888888", role: "Worker", warehouse: "Warehouse 2" },
        { id: 6, name: "Chris Wilson", phone: "9999999999", role: "Manager", warehouse: "Warehouse 3" },
    ];
    const [employees, setEmployees] = useState(initialEmployees);
    const [filteredEmployees, setFilteredEmployees] = useState(initialEmployees);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [nameFilter, setNameFilter] = useState("");
    const [phoneFilter, setPhoneFilter] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    const [warehouses] = useState(["Warehouse 1", "Warehouse 2", "Warehouse 3"]);

    // Filters
    const applyFilter = () => {
        const filtered = employees.filter((emp) => {
            return (
                (nameFilter ? emp.name.toLowerCase().includes(nameFilter.toLowerCase()) : true) &&
                (phoneFilter ? emp.phone.includes(phoneFilter) : true) &&
                (warehouseFilter ? emp.warehouse === warehouseFilter : true)
            );
        });
        setFilteredEmployees(filtered);
    };

    const clearFilter = () => {
        setNameFilter("");
        setPhoneFilter("");
        setWarehouseFilter("");
        setFilteredEmployees(employees);
    };

    const handleEdit = (employee) => {
        setCurrentEmployee({ ...employee });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setEmployeeToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        alert("Delete functionality to be implemented.");
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };


    const handleSave = () => {
        alert("Save functionality to be implemented.");
        setIsModalOpen(false);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setCurrentEmployee(null);
    };

    const handleFieldChange = (field, value) => {
        setCurrentEmployee({ ...currentEmployee, [field]: value });
    };

    return (
        <Box sx={{ padding: "20px" }}>
            <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
                Employee List
            </Typography>

            {/* Filters */}
            <Box sx={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                <TextField
                    label="Search by Name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    variant="outlined"
                    size="small"
                />
                <TextField
                    label="Search by Phone"
                    value={phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value)}
                    variant="outlined"
                    size="small"
                />
                <Select
                    value={warehouseFilter}
                    onChange={(e) => setWarehouseFilter(e.target.value)}
                    displayEmpty
                    size="small"
                >
                    <MenuItem value="">All Warehouses</MenuItem>
                    {warehouses.map((warehouse) => (
                        <MenuItem key={warehouse} value={warehouse}>
                            {warehouse}
                        </MenuItem>
                    ))}
                </Select>
                <Button variant="contained" color="primary" onClick={applyFilter}>
                    Apply Filter
                </Button>
                <Button variant="outlined" color="secondary" onClick={clearFilter}>
                    Clear Filter
                </Button>
            </Box>

            {/* Employee Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={headerStyle}>Name</TableCell>
                            <TableCell sx={headerStyle}>Phone No</TableCell>
                            <TableCell sx={headerStyle}>Role</TableCell>
                            <TableCell sx={headerStyle}>Warehouse</TableCell>
                            <TableCell sx={headerStyle}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEmployees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell sx={rowStyle}>{employee.name}</TableCell>
                                <TableCell sx={rowStyle}>{employee.phone}</TableCell>
                                <TableCell sx={rowStyle}>{employee.role}</TableCell>
                                <TableCell sx={rowStyle}>{employee.warehouse}</TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleEdit(employee)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(employee.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Modal */}
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
                        Edit Employee Details
                    </Typography>
                    {currentEmployee && (
                        <Box>
                            <TextField
                                fullWidth
                                label="Name"
                                value={currentEmployee.name}
                                onChange={(e) => handleFieldChange("name", e.target.value)}
                                sx={{ marginBottom: "16px" }}
                            />
                            <TextField
                                fullWidth
                                label="Phone No"
                                value={currentEmployee.phone}
                                onChange={(e) => handleFieldChange("phone", e.target.value)}
                                sx={{ marginBottom: "16px" }}
                            />
                            <Select
                                fullWidth
                                value={currentEmployee.warehouse}
                                onChange={(e) => handleFieldChange("warehouse", e.target.value)}
                                sx={{ marginBottom: "16px" }}
                            >
                                {warehouses.map((warehouse) => (
                                    <MenuItem key={warehouse} value={warehouse}>
                                        {warehouse}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                                <button className="button button-large" onClick={handleSave}>
                                    Save
                                </button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Modal>
            {/* Delete Modal */}
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
                    <Typography variant="h6" sx={{ marginBottom: "16px", textAlign: "center", color: "#d32f2f" }}>
                        <Warning sx={{ marginRight: 1, marginBottom: -0.5, fontSize: "24px" }} />
                        Confirm Deletion
                    </Typography>
                    <Typography sx={{ marginBottom: "16px", textAlign: "center" , color: "#1E3A5F"}}>
                        Are you sure you want to delete this employee?
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
};

export default AllEmployeePage;
