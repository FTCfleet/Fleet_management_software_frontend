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
import { useOutletContext } from "react-router-dom";
import { Edit, Delete, Close, VpnKey } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";

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
  const { isDarkMode, colors } = useOutletContext() || {};
  
  const headerStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: colors?.textSecondary || "#25344E" };

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
    console.log(data);
    setEmployees(data.body);
    setIsLoading(false);
  };

  // Filters
  const applyFilter = () => {
    if (!employees || employees.length === 0) {
      setFilteredEmployees([]);
      return;
    }
    const searchTerm = nameFilter.toLowerCase().trim();
    const filtered = employees.filter((emp) => {
      const matchesSearch = !searchTerm || 
        (emp.name && emp.name.toLowerCase().includes(searchTerm)) ||
        (emp.phoneNo && emp.phoneNo.includes(searchTerm));
      const matchesWarehouse = !warehouseFilter || 
        emp.warehouseCode?.warehouseID === warehouseFilter;
      return matchesSearch && matchesWarehouse;
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
    console.log(isReset);
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
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={nameFilter}
        onSearchChange={setNameFilter}
        searchPlaceholder="Search by Name or Phone"
        onApply={applyFilter}
        onClear={clearFilter}
        isLoading={isLoading}
        showDropdown={true}
        dropdownValue={warehouseFilter}
        onDropdownChange={setWarehouseFilter}
        dropdownOptions={warehouses.map(w => ({ value: w.warehouseID, label: w.name }))}
        dropdownPlaceholder="All Stations"
        extraButtons={
          <Button
            variant="contained"
            onClick={openAddModal}
            sx={{
              background: isDarkMode ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
              color: isDarkMode ? "#0a1628" : "#fff",
              fontWeight: 600,
              px: 2,
              height: "40px",
              borderRadius: "10px",
              textTransform: "none",
              whiteSpace: "nowrap",
            }}
          >
            Add Employee
          </Button>
        }
      />

      {/* Employee Table */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
        backgroundColor: colors?.bgCard || "#ffffff",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
      }}>
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
                <TableCell colSpan={7} align="center">
                  <ModernSpinner size={28} />
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map(
                (employee, index) =>
                  employee.username !== "admin" && (
                    <TableRow key={index}>
                      <TableCell sx={rowStyle}>{index}.</TableCell>
                      <TableCell sx={rowStyle}>{highlightMatch(employee.name, nameFilter, isDarkMode)}</TableCell>
                      <TableCell sx={rowStyle}>{employee.username}</TableCell>
                      <TableCell sx={rowStyle}>{highlightMatch(employee.phoneNo, nameFilter, isDarkMode)}</TableCell>
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
                          title="Edit Employee"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="warning"
                          onClick={() => openResetModal(employee)}
                          title="Reset Password"
                        >
                          <VpnKey />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(employee.username)}
                          title="Delete Employee"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: colors?.textMuted || "#7D8695" }}>
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
            width: { xs: "90%", sm: 450 },
            maxWidth: 450,
            bgcolor: isDarkMode ? "#1a2332" : "#ffffff",
            borderRadius: "16px",
            boxShadow: isDarkMode 
              ? "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)" 
              : "0 25px 50px rgba(0,0,0,0.15)",
            p: 3,
          }}
        >
          <Box sx={{ position: "relative", mb: 3 }}>
            <IconButton
              onClick={handleClose}
              sx={{ 
                position: "absolute", 
                top: -8, 
                right: -8,
                color: colors?.textSecondary,
                "&:hover": { backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }
              }}
            >
              <Close />
            </IconButton>
            <Typography variant="h5" sx={{ color: colors?.textPrimary, fontWeight: 700, textAlign: "center" }}>
              Edit Employee
            </Typography>
          </Box>
          {currentEmployee && (
            <Box>
              <TextField
                fullWidth
                label="Name"
                value={currentEmployee.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                sx={{ 
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                  "& .MuiInputLabel-root": { color: colors?.textSecondary },
                  "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
                }}
              />
              <TextField
                fullWidth
                label="Phone No"
                value={currentEmployee.phoneNo}
                onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                sx={{ 
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                  "& .MuiInputLabel-root": { color: colors?.textSecondary },
                  "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
                }}
              />
              <TextField
                select
                fullWidth
                label="Station"
                value={currentEmployee.warehouseCode}
                onChange={(e) => handleFieldChange("warehouseCode", e.target.value)}
                sx={{ 
                  mb: 3,
                  "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                  "& .MuiInputLabel-root": { color: colors?.textSecondary },
                  "& .MuiSelect-select": { color: colors?.textPrimary },
                }}
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.warehouseID} value={warehouse.warehouseID}>{warehouse.name}</MenuItem>
                ))}
              </TextField>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleSave()}
                disabled={isLoading1}
                sx={{
                  py: 1.5, borderRadius: "12px", fontSize: "1rem", fontWeight: 600, textTransform: "none",
                  background: isDarkMode ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
                  color: isDarkMode ? "#0a1628" : "#fff",
                  boxShadow: "none",
                  mb: 1.5,
                  "&:hover": { background: isDarkMode ? "linear-gradient(135deg, #FFA726 0%, #F57C00 100%)" : "linear-gradient(135deg, #25445f 0%, #0f2035 100%)", boxShadow: "none" },
                }}
              >
                Save Changes
                {isLoading1 && <CircularProgress size={20} sx={{ color: isDarkMode ? "#0a1628" : "#fff", ml: 1 }} />}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  handleClose();
                  openResetModal(currentEmployee);
                }}
                sx={{
                  py: 1.5, borderRadius: "12px", fontSize: "1rem", fontWeight: 600, textTransform: "none",
                  borderColor: isDarkMode ? colors?.accent : colors?.primary,
                  color: isDarkMode ? colors?.accent : colors?.primary,
                  "&:hover": { 
                    borderColor: isDarkMode ? colors?.accentHover : colors?.primaryHover,
                    backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.04)"
                  },
                }}
              >
                Reset Password
              </Button>
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
            width: { xs: "90%", sm: 400 },
            maxWidth: 400,
            bgcolor: isDarkMode ? "#1a2332" : "#ffffff",
            borderRadius: "16px",
            boxShadow: isDarkMode 
              ? "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)" 
              : "0 25px 50px rgba(0,0,0,0.15)",
            p: 3,
          }}
        >
          <Box sx={{ position: "relative", mb: 3 }}>
            <IconButton
              onClick={closeResetModal}
              sx={{ position: "absolute", top: -8, right: -8, color: colors?.textSecondary, "&:hover": { backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" } }}
            >
              <Close />
            </IconButton>
            <Typography variant="h5" sx={{ color: colors?.textPrimary, fontWeight: 700, textAlign: "center", mb: 1 }}>
              Reset Password
            </Typography>
            {currentEmployee && (
              <Typography sx={{ color: colors?.textSecondary, textAlign: "center", fontSize: "0.9rem" }}>
                for {currentEmployee.name} (@{currentEmployee.username})
              </Typography>
            )}
          </Box>
          <Box>
            <TextField
              fullWidth
              label="New Password"
              type="text"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              sx={{ 
                mb: 3,
                "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                "& .MuiInputLabel-root": { color: colors?.textSecondary },
                "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleSave(true, resetPassword)}
              disabled={isLoading1}
              sx={{
                py: 1.5, borderRadius: "12px", fontSize: "1rem", fontWeight: 600, textTransform: "none",
                background: isDarkMode ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
                color: isDarkMode ? "#0a1628" : "#fff",
                boxShadow: "none",
                "&:hover": { background: isDarkMode ? "linear-gradient(135deg, #FFA726 0%, #F57C00 100%)" : "linear-gradient(135deg, #25445f 0%, #0f2035 100%)", boxShadow: "none" },
              }}
            >
              Update Password
              {isLoading1 && <CircularProgress size={20} sx={{ color: isDarkMode ? "#0a1628" : "#fff", ml: 1 }} />}
            </Button>
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
            width: { xs: "90%", sm: 480 },
            maxWidth: 480,
            maxHeight: "90vh",
            bgcolor: isDarkMode ? "#1a2332" : "#ffffff",
            borderRadius: "16px",
            boxShadow: isDarkMode 
              ? "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)" 
              : "0 25px 50px rgba(0,0,0,0.15)",
            p: 3,
            overflowY: "auto",
          }}
        >
          <Box sx={{ position: "relative", mb: 3 }}>
            <IconButton
              onClick={closeAddModal}
              sx={{ position: "absolute", top: -8, right: -8, color: colors?.textSecondary, "&:hover": { backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" } }}
            >
              <Close />
            </IconButton>
            <Typography variant="h5" sx={{ color: colors?.textPrimary, fontWeight: 700, textAlign: "center" }}>
              Add New Employee
            </Typography>
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Username"
              value={newEmployee.username}
              onChange={(e) => handleAddFieldChange("username", e.target.value)}
              error={Boolean(usernameError)}
              helperText={usernameError}
              sx={{ 
                mb: 2,
                "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                "& .MuiInputLabel-root": { color: colors?.textSecondary },
                "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="text"
              value={newEmployee.password}
              onChange={(e) => handleAddFieldChange("password", e.target.value)}
              sx={{ 
                mb: 2,
                "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                "& .MuiInputLabel-root": { color: colors?.textSecondary },
                "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
              }}
            />
            <TextField
              fullWidth
              label="Name"
              value={newEmployee.name}
              onChange={(e) => handleAddFieldChange("name", e.target.value)}
              sx={{ 
                mb: 2,
                "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                "& .MuiInputLabel-root": { color: colors?.textSecondary },
                "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
              }}
            />
            <TextField
              fullWidth
              label="Phone No"
              value={newEmployee.phoneNo}
              onChange={(e) => handleAddFieldChange("phoneNo", e.target.value)}
              sx={{ 
                mb: 2,
                "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                "& .MuiInputLabel-root": { color: colors?.textSecondary },
                "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
              }}
            />
            <TextField
              select
              fullWidth
              label="Station"
              value={newEmployee.warehouseCode}
              onChange={(e) => handleAddFieldChange("warehouseCode", e.target.value)}
              sx={{ 
                mb: 2,
                "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                "& .MuiInputLabel-root": { color: colors?.textSecondary },
                "& .MuiSelect-select": { color: colors?.textPrimary },
              }}
            >
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.warehouseID} value={warehouse.warehouseID}>{warehouse.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Role"
              value={newEmployee.role}
              onChange={(e) => handleAddFieldChange("role", e.target.value)}
              sx={{ 
                mb: 3,
                "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc" },
                "& .MuiInputLabel-root": { color: colors?.textSecondary },
                "& .MuiSelect-select": { color: colors?.textPrimary },
              }}
            >
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddEmployee}
              disabled={isAdding || Boolean(usernameError)}
              sx={{
                py: 1.5, borderRadius: "12px", fontSize: "1rem", fontWeight: 600, textTransform: "none",
                background: isDarkMode ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
                color: isDarkMode ? "#0a1628" : "#fff",
                boxShadow: "none",
                "&:hover": { background: isDarkMode ? "linear-gradient(135deg, #FFA726 0%, #F57C00 100%)" : "linear-gradient(135deg, #25445f 0%, #0f2035 100%)", boxShadow: "none" },
              }}
            >
              Add Employee
              {isAdding && <CircularProgress size={20} sx={{ color: isDarkMode ? "#0a1628" : "#fff", ml: 1 }} />}
            </Button>
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
