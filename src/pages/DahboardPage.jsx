import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Divider,
  Button,
  Modal,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaBuilding, FaPhone, FaUserTag } from "react-icons/fa";
import { useAuth } from "../routes/AuthContext";
import Loading from "../components/Loading";
import ModernSpinner from "../components/ModernSpinner";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState("");
  const [stationModal, setStationModal] = useState(false);
  const [allWarehouse, setAllWarehouse] = useState([]);
  const { checkAuthStatus, resetAuth } = useAuth();
  const { dialogState, hideDialog, showAlert, showError, showSuccess, showConfirm } = useDialog();
  const { isDarkMode, colors } = useOutletContext() || {};

  useEffect(() => {
    checkAuthStatus().then((data) => {
      setUser(data.user_data);
      setNewWarehouse(data.user_data.warehouseCode);
    });
    fetchWarehouse();
  }, []);

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) {
      const data = await response.json();
      setAllWarehouse(data.body);
    }
  };

  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);

  const handleChangePassword = async () => {
    if (!newPassword || !oldPassword || confirmPassword !== newPassword) {
      showError("Please fill all fields correctly", "Validation Error");
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (!response.ok) {
      showError("Error occurred while changing password", "Error");
      setIsLoading(false);
      return;
    }
    const data = await response.json();
    if (!data.flag) {
      showError("Invalid current password!", "Authentication Error");
      setIsLoading(false);
      return;
    }
    localStorage.setItem("token", data.token);
    setIsLoading(false);
    showSuccess("Password changed successfully!", "Success");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleChangeWarehouse = async () => {
    if (!newWarehouse) {
      showError("Please select a warehouse", "Validation Error");
      return;
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/warehouse/edit/${newWarehouse}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      method: "PUT",
    });
    if (!response.ok) {
      showError("Error occurred while changing station", "Error");
      return;
    }
    const data = await response.json();
    if (!data.flag) {
      showError("Unable to change station. Please try again.", "Error");
      return;
    }
    checkAuthStatus().then((data) => setUser(data.user_data));
    setStationModal(false);
    showSuccess("Station changed successfully!", "Success");
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordVisible(false);
  };

  const handleLogout = () => {
    showConfirm(
      "Are you sure you want to logout?",
      () => {
        resetAuth();
      },
      "Confirm Logout"
    );
  };

  if (!user) return <Loading />;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: { xs: 1.5, sm: 2.5 } }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: "480px",
          borderRadius: 4,
          boxShadow: isDarkMode ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          overflow: "visible",
          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(226, 232, 240, 0.8)",
          backgroundColor: colors?.bgCard || "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {/* Avatar */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{
                width: { xs: 90, sm: 110 },
                height: { xs: 90, sm: 110 },
                border: "4px solid #f1f5f9",
                boxShadow: "0 8px 24px rgba(30, 58, 95, 0.15)",
                background: "linear-gradient(135deg, #1E3A5F 0%, #2d5a87 100%)",
                fontSize: "2.5rem",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          {/* Name & Username */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", mb: 0.5, letterSpacing: "-0.02em" }}>
              {user.name}
            </Typography>
            <Typography sx={{ color: colors?.textSecondary || "#94a3b8", fontSize: "0.9rem", fontWeight: 500 }}>@{user.username}</Typography>
          </Box>

          <Divider sx={{ mb: 2.5, borderColor: colors?.borderLight || "#f1f5f9" }} />

          {/* User Details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, px: 1 }}>
            <DetailRow icon={<FaBuilding />} label="Code" value={user.warehouseCode} colors={colors} isDarkMode={isDarkMode} />
            <DetailRow icon={<FaBuilding />} label="Station" value={user.warehouseName} colors={colors} isDarkMode={isDarkMode} />
            <DetailRow icon={<FaPhone />} label="Phone" value={user.phoneNo} colors={colors} isDarkMode={isDarkMode} />
            <DetailRow
              icon={<FaUserTag />}
              label="Role"
              value={user.role?.charAt(0).toUpperCase() + user.role.slice(1)}
              colors={colors}
              isDarkMode={isDarkMode}
            />
          </Box>

          <Divider sx={{ my: 2.5, borderColor: colors?.borderLight || "#f1f5f9" }} />

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              justifyContent: "center",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setStationModal(true)}
              sx={{ 
                flex: { sm: 1 }, 
                borderColor: colors?.border || "#e2e8f0", 
                color: isDarkMode ? colors?.accent : colors?.textPrimary || "#1E3A5F",
                fontWeight: 600,
                fontSize: "0.85rem",
                borderRadius: "10px",
                textTransform: "none",
                "&:hover": { 
                  borderColor: isDarkMode ? colors?.accent : "#1E3A5F", 
                  backgroundColor: isDarkMode ? "rgba(255, 183, 77, 0.1)" : "rgba(30, 58, 95, 0.04)" 
                }
              }}
            >
              Change Station
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenModal(true)}
              sx={{ 
                flex: { sm: 1 }, 
                borderColor: colors?.border || "#e2e8f0", 
                color: isDarkMode ? colors?.accent : colors?.textPrimary || "#1E3A5F",
                fontWeight: 600,
                fontSize: "0.85rem",
                borderRadius: "10px",
                textTransform: "none",
                "&:hover": { 
                  borderColor: isDarkMode ? colors?.accent : "#1E3A5F", 
                  backgroundColor: isDarkMode ? "rgba(255, 183, 77, 0.1)" : "rgba(30, 58, 95, 0.04)" 
                }
              }}
            >
              Change Password
            </Button>
            <Button
              variant="contained"
              onClick={handleLogout}
              sx={{ 
                flex: { sm: 1 }, 
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                fontWeight: 600,
                fontSize: "0.85rem",
                borderRadius: "10px",
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
                "&:hover": { background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)" }
              }}
            >
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", mb: 2, textAlign: "center" }}>
            Change Password
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PasswordField
              label="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              visible={passwordVisible}
              onToggle={togglePasswordVisibility}
            />
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              visible={passwordVisible}
              onToggle={togglePasswordVisibility}
            />
            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              visible={passwordVisible}
              onToggle={togglePasswordVisibility}
              error={newPassword !== confirmPassword}
              helperText={newPassword !== confirmPassword ? "Passwords do not match" : ""}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, mt: 3, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={handleCloseModal} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={isLoading}
              sx={{ 
                backgroundColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
                color: isDarkMode ? "#0a1628" : "#fff",
                "&:hover": { backgroundColor: isDarkMode ? "#FFA726" : "#2d5a87" }
              }}
            >
              Save {isLoading && <CircularProgress size={18} sx={{ color: isDarkMode ? "#0a1628" : "#fff", ml: 1 }} />}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Change Station Modal */}
      <Modal open={stationModal} onClose={() => setStationModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", mb: 2, textAlign: "center" }}>
            Change Station
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Station</InputLabel>
            <Select label="Select Station" value={newWarehouse} onChange={(e) => setNewWarehouse(e.target.value)}>
              {allWarehouse
                .filter((w) => w.isSource === user.isSource)
                .map((w) => (
                  <MenuItem key={w.warehouseID} value={w.warehouseID}>
                    {w.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", gap: 1, mt: 3, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={() => setStationModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleChangeWarehouse} 
              sx={{ 
                backgroundColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
                color: isDarkMode ? "#0a1628" : "#fff",
                "&:hover": { backgroundColor: isDarkMode ? "#FFA726" : "#2d5a87" }
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
      
      <CustomDialog
        open={dialogState.open}
        onClose={hideDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
      />
    </Box>
  );
};

// Helper Components
const DetailRow = ({ icon, label, value, colors, isDarkMode }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    <Box sx={{ 
      color: isDarkMode ? colors?.accent : colors?.textPrimary || "#1E3A5F", 
      opacity: isDarkMode ? 0.9 : 0.6, 
      display: "flex",
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDarkMode ? "rgba(255, 183, 77, 0.1)" : "rgba(30, 58, 95, 0.06)",
      borderRadius: "8px",
      fontSize: "0.85rem"
    }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: colors?.textSecondary || "#94a3b8", fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</Typography>
      <Typography sx={{ color: colors?.textPrimary || "#1E3A5F", fontWeight: 600, fontSize: "0.9rem" }}>{value}</Typography>
    </Box>
  </Box>
);

const PasswordField = ({ label, value, onChange, visible, onToggle, error, helperText }) => (
  <Box sx={{ position: "relative" }}>
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={visible ? "text" : "password"}
      fullWidth
      size="small"
      error={error}
      helperText={helperText}
    />
    <IconButton
      onClick={onToggle}
      sx={{ position: "absolute", right: 8, top: error ? "25%" : "50%", transform: "translateY(-50%)" }}
      size="small"
    >
      {visible ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
    </IconButton>
  </Box>
);

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 400,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
};

export default DashboardPage;
