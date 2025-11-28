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
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Close, Loop } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    username: "",
    password: "",
    phoneNo: "",
    warehouseCode: "",
    role: "supervisor",
  });
  const [usernameError, setUsernameError] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    fetchData();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const fetchWarehouses = async () => {
    const res = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    const data = await res.json();
    setWarehouses(data.body);
  };

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/admin/get-all-employees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setEmployees(data.body);
    setIsLoading(false);
  };

  // Filters
  const applyFilter = () => {
    const filtered = employees.filter((emp) => {
      return (
        (nameFilter
          ? emp.name.toLowerCase().startsWith(nameFilter.toLowerCase())
          : true) &&
        (phoneFilter ? emp.phoneNo.startsWith(phoneFilter) : true) &&
        (warehouseFilter
          ? emp.warehouseCode.warehouseID === warehouseFilter
          : true)
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
    setCurrentEmployee({
      ...employee,
      warehouseCode: employee.warehouseCode.warehouseID,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (username) => {
    setEmployeeToDelete(username);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading2(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/employee`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: employeeToDelete,
      }),
    });

    const data = await res.json();
    setIsLoading2(false);
    setDeleteModalOpen(false);
    fetchData();
    setEmployeeToDelete(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleSave = async (isReset = false, resetPasswordVal = "") => {
    if (isReset && !resetPasswordVal) {
      alert("Please enter a new password");
      return;
    }

    setIsLoading1(true);
    const token = localStorage.getItem("token");
    const updates = {
      name: currentEmployee.name,
      phoneNo: currentEmployee.phoneNo,
      warehouseCode: currentEmployee.warehouseCode,
    };

    if (isReset) {
      updates.password = resetPasswordVal;
    }
    console.log(updates);

    const res = await fetch(`${BASE_URL}/api/admin/manage/employee`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: currentEmployee.username,
        updates,
        isReset,
      }),
    });

    const data = await res.json();
    setIsLoading1(false);
    console.log(data);

    if (!res.ok) {
      alert(data.message || "Failed to update employee");
      return;
    }

    fetchData();
    setIsModalOpen(false);
    setIsResetModalOpen(false);
    setResetPassword("");
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentEmployee(null);
  };

  const handleFieldChange = (field, value) => {
    if (field === "warehouseCode") {
    }
    setCurrentEmployee({ ...currentEmployee, [field]: value });
    if (field === "warehouseCode") {
    }
  };

  const openResetModal = (employee) => {
    setCurrentEmployee({
      ...employee,
      warehouseCode: employee.warehouseCode.warehouseID,
    });
    setResetPassword("");
    setIsResetModalOpen(true);
  };

  const closeResetModal = () => {
    setIsResetModalOpen(false);
    setResetPassword("");
  };

  const handleAddFieldChange = (field, value) => {
    if (field === "username") {
      const isDuplicate = employees.some((emp) => emp.username === value);
      if (isDuplicate) {
        setUsernameError("Username already exists");
      } else {
        setUsernameError("");
      }
    }
    setNewEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openAddModal = () => {
    setNewEmployee({
      name: "",
      username: "",
      password: "",
      phoneNo: "",
      warehouseCode: warehouses[0]?.warehouseID || "",
      role: "supervisor",
    });
    setUsernameError("");
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setUsernameError("");
  };

  const handleAddEmployee = async () => {
    if (
      !newEmployee.name ||
      !newEmployee.username ||
      !newEmployee.password ||
      !newEmployee.phoneNo ||
      !newEmployee.warehouseCode ||
      !newEmployee.role
    ) {
      alert("Please fill all fields");
      return;
    }

    if (usernameError) {
      alert("Please choose a unique username");
      return;
    }

    setIsAdding(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: newEmployee.username,
        password: newEmployee.password,
        name: newEmployee.name,
        phoneNo: newEmployee.phoneNo,
        warehouseID: newEmployee.warehouseCode,
        role: newEmployee.role,
      }),
    });

    const data = await res.json();
    setIsAdding(false);

    if (!res.ok) {
      alert(data.message || "Failed to add employee");
      return;
    }

    fetchData();
    closeAddModal();
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Employee List
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "center" }}>
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
          Apply
        </Button>
        <Button variant="outlined" color="secondary" onClick={clearFilter}>
          Clear
        </Button>
        <button className="button " onClick={openAddModal} style={{ margin: 0 }}>
          Add Employee
        </button>
      </Box>

      {/* Employee Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Sl No.</TableCell>
              <TableCell sx={headerStyle}>Name</TableCell>
              <TableCell sx={headerStyle}>Username</TableCell>
              <TableCell sx={headerStyle}>Phone No</TableCell>
              <TableCell sx={headerStyle}>Role</TableCell>
              <TableCell sx={headerStyle}>Station</TableCell>
              {/* <TableCell sx={headerStyle}>Station Code</TableCell> */}
              <TableCell sx={{...headerStyle, textAlign: "center"}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress
                    size={22}
                    className="spinner"
                    sx={{ color: "#1E3A5F", animation: "none !important" }}
                  />
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length > 1 ? (
              filteredEmployees.map(
                (employee, index) =>
                  employee.username !== "admin" && (
                    <TableRow key={index}>
                      <TableCell sx={rowStyle}>{index}.</TableCell>
                      <TableCell sx={rowStyle}>{employee.name}</TableCell>
                      <TableCell sx={rowStyle}>{employee.username}</TableCell>
                      <TableCell sx={rowStyle}>{employee.phoneNo}</TableCell>
                      <TableCell sx={rowStyle}>{employee.role[0].toUpperCase() + employee.role.slice(1)}</TableCell>
                      <TableCell sx={rowStyle}>
                        {employee.warehouseCode.name}
                      </TableCell>
                      {/* <TableCell sx={rowStyle}>
                        {employee.warehouseCode.warehouseID}
                      </TableCell> */}
                      <TableCell sx={{...rowStyle, textAlign: "center"}}>
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
                        <IconButton
                          onClick={() => openResetModal(employee)}
                        >
                          <Loop />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "#7D8695" }}>
                  No employees found for the selected filter.
                </TableCell>
              </TableRow>
            )}
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
                  {isLoading1 && (
                    <CircularProgress
                      size={22}
                      className="spinner"
                      sx={{ color: "#fff", animation: "none !important", ml: 1 }}
                    />
                  )}
                </button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={isResetModalOpen} onClose={closeResetModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 380,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            color="error"
            onClick={closeResetModal}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ marginBottom: "16px", textAlign: "center", ...headerStyle }}
          >
            Reset Password
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type="text"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            sx={{ marginBottom: "16px" }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "8px",
            }}
          >
            <button
              className="button button-large"
              onClick={() => handleSave(true, resetPassword)}
              disabled={isLoading1}
            >
              Update
              {isLoading1 && (
                <CircularProgress
                  size={22}
                  className="spinner"
                  sx={{ color: "#fff", animation: "none !important", ml: 1 }}
                />
              )}
            </button>
          </Box>
        </Box>
      </Modal>

      {/* Add Modal */}
      <Modal open={isAddModalOpen} onClose={closeAddModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 420,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            color="error"
            onClick={closeAddModal}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ marginBottom: "16px", textAlign: "center", ...headerStyle }}
          >
            Add Employee
          </Typography>
          <Box>
            <TextField
              fullWidth
              label="Username"
              value={newEmployee.username}
              onChange={(e) => handleAddFieldChange("username", e.target.value)}
              error={Boolean(usernameError)}
              helperText={usernameError}
              sx={{ marginBottom: "14px" }}
            />
            <TextField
              fullWidth
              label="Password"
              type="text"
              value={newEmployee.password}
              onChange={(e) => handleAddFieldChange("password", e.target.value)}
              sx={{ marginBottom: "14px" }}
            />
            <TextField
              fullWidth
              label="Name"
              value={newEmployee.name}
              onChange={(e) => handleAddFieldChange("name", e.target.value)}
              sx={{ marginBottom: "14px" }}
            />
            <TextField
              fullWidth
              label="Phone No"
              value={newEmployee.phoneNo}
              onChange={(e) => handleAddFieldChange("phoneNo", e.target.value)}
              sx={{ marginBottom: "14px" }}
            />
            <TextField
              select
              fullWidth
              label="Station"
              value={newEmployee.warehouseCode}
              onChange={(e) =>
                handleAddFieldChange("warehouseCode", e.target.value)
              }
              sx={{ marginBottom: "14px" }}
            >
              {warehouses.map((warehouse) => (
                <MenuItem
                  key={warehouse.warehouseID}
                  value={warehouse.warehouseID}
                >
                  {warehouse.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Role"
              value={newEmployee.role}
              onChange={(e) => handleAddFieldChange("role", e.target.value)}
              sx={{ marginBottom: "14px" }}
            >
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "12px",
              }}
            >
              <button
                className="button button-large"
                onClick={handleAddEmployee}
                disabled={isAdding || Boolean(usernameError)}
              >
                Add
                {isAdding && (
                  <CircularProgress
                    size={22}
                    className="spinner"
                    sx={{ color: "#fff", animation: "none !important", ml: 1 }}
                  />
                )}
              </button>
            </Box>
          </Box>
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
            Delete Employee
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
              Delete
              {isLoading2 && (
                <CircularProgress
                  size={22}
                  className="spinner"
                  sx={{ color: "#fff", animation: "none !important", ml:1 }}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AllEmployeePage;
