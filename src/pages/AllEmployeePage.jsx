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
  IconButton,
  Modal,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Close, Warning } from "@mui/icons-material";

const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
const rowStyle = { color: "#25344E" };
const BASE_URL = import.meta.env.VITE_BASE_URL;

const AllEmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [warehouses, setWarehouses] = useState([""]);

  useEffect(() => {
    fetchData();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const fetchWarehouses = async () => {
    // const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    const data = await res.json();
    console.log(data);
    setWarehouses(data.body);
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/get-all-employees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    setEmployees(data.body);
  };

  // Filters
  const applyFilter = () => {
    const filtered = employees.filter((emp) => {
      return (
        (nameFilter
          ? emp.name.toLowerCase().includes(nameFilter.toLowerCase())
          : true) &&
        (phoneFilter ? emp.phoneNo.includes(phoneFilter) : true) &&
        (warehouseFilter ? emp.warehouseCode === warehouseFilter : true)
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

  const handleDelete = (username) => {
    setEmployeeToDelete(username);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/employee`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: employeeToDelete
      }),
    });
  
    const data = await res.json();
    console.log(data);
    fetchData();
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/employee`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: currentEmployee.username,
        updates: {
          name: currentEmployee.name,
          phoneNo: currentEmployee.phoneNo,
          warehouseID: currentEmployee.warehouseID,
        },
      }),
    });

    const data = await res.json();
    console.log(data);
    fetchData();
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
            <MenuItem key={warehouse.warehouseID} value={warehouse.warehouseID}>
              {warehouse.name}
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
              <TableRow key={employee.username}>
                <TableCell sx={rowStyle}>{employee.name}</TableCell>
                <TableCell sx={rowStyle}>{employee.phoneNo}</TableCell>
                <TableCell sx={rowStyle}>{employee.role}</TableCell>
                <TableCell sx={rowStyle}>{employee.warehouseCode}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(employee)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(employee.username)}
                  >
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
          <Typography
            variant="h6"
            sx={{ marginBottom: "16px", textAlign: "center", ...headerStyle }}
          >
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
                value={currentEmployee.phoneNo}
                onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                sx={{ marginBottom: "16px" }}
              />
              <Select
                fullWidth
                value={currentEmployee.warehouseCode}
                onChange={(e) =>
                  handleFieldChange("warehouseCode", e.target.value)
                }
                sx={{ marginBottom: "16px" }}
              >
                {warehouses.map((warehouse) => (
                  <MenuItem
                    key={warehouse.warehouseID}
                    value={warehouse.warehouseID}
                  >
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "16px",
                }}
              >
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
          <Typography
            variant="h6"
            sx={{ marginBottom: "16px", textAlign: "center", color: "#d32f2f" }}
          >
            <Warning
              sx={{ marginRight: 1, marginBottom: -0.5, fontSize: "24px" }}
            />
            Confirm Deletion
          </Typography>
          <Typography
            sx={{ marginBottom: "16px", textAlign: "center", color: "#1E3A5F" }}
          >
            Are you sure you want to delete this employee?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: "16px" }}>
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
