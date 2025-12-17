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
  Chip,
  Grid,
  Paper,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaBuilding, 
  FaPhone, 
  FaUserTag, 
  FaEdit,
  FaKey,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaShieldAlt
} from "react-icons/fa";
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
    <Box sx={{ 
      minHeight: "100vh",
      background: isDarkMode 
        ? "linear-gradient(135deg, #0a1628 0%, #132238 50%, #1e293b 100%)"
        : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              color: colors?.textPrimary,
              mb: 1,
              background: isDarkMode 
                ? "linear-gradient(135deg, #FFB74D 0%, #FFC107 100%)"
                : "linear-gradient(135deg, #1E3A5F 0%, #2d5a87 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em"
            }}
          >
            Profile Settings
          </Typography>
          <Typography sx={{ color: colors?.textSecondary, fontSize: "1.1rem" }}>
            Manage your account information and preferences
          </Typography>
        </Box>

        {/* Single Column Layout for Better Balance */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Profile Header Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: isDarkMode 
                ? "0 8px 32px rgba(0,0,0,0.4)" 
                : "0 8px 32px rgba(0,0,0,0.08)",
              border: isDarkMode ? "1px solid rgba(255, 183, 77, 0.1)" : "1px solid rgba(226, 232, 240, 0.8)",
              backgroundColor: colors?.bgCard,
              overflow: "visible",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #FFB74D 0%, #FFC107 100%)",
                borderRadius: "12px 12px 0 0"
              }
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: 4,
                textAlign: { xs: "center", sm: "left" }
              }}>
                {/* Avatar with Status */}
                <Box sx={{ position: "relative", flexShrink: 0 }}>
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      border: `4px solid ${isDarkMode ? "rgba(255, 183, 77, 0.2)" : "#f1f5f9"}`,
                      boxShadow: isDarkMode 
                        ? "0 12px 32px rgba(255, 183, 77, 0.2)" 
                        : "0 12px 32px rgba(30, 58, 95, 0.15)",
                      background: "linear-gradient(135deg, #FFB74D 0%, #FFC107 100%)",
                      fontSize: { xs: "2.5rem", sm: "3rem" },
                      fontWeight: 700,
                      color: "#1E3A5F",
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  {/* Online Status */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      border: `3px solid ${colors?.bgCard}`,
                      boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)"
                    }}
                  />
                </Box>

                {/* User Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: colors?.textPrimary, 
                      mb: 0.5,
                      letterSpacing: "-0.02em"
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: colors?.textSecondary, 
                      fontSize: "1.1rem", 
                      fontWeight: 500,
                      mb: 2
                    }}
                  >
                    @{user.username}
                  </Typography>

                  {/* Role Badge */}
                  <Chip
                    icon={<FaShieldAlt />}
                    label={user.role?.charAt(0).toUpperCase() + user.role.slice(1)}
                    sx={{
                      background: isDarkMode 
                        ? "linear-gradient(135deg, rgba(255, 183, 77, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%)"
                        : "linear-gradient(135deg, rgba(30, 58, 95, 0.1) 0%, rgba(45, 90, 135, 0.1) 100%)",
                      color: isDarkMode ? colors?.accent : colors?.primary,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      height: 36,
                      border: `1px solid ${isDarkMode ? "rgba(255, 183, 77, 0.3)" : "rgba(30, 58, 95, 0.2)"}`,
                      "& .MuiChip-icon": {
                        color: isDarkMode ? colors?.accent : colors?.primary
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Account Details & Actions Grid */}
          <Grid container spacing={3}>
            {/* Account Details */}
            <Grid item xs={12} lg={8}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: isDarkMode 
                    ? "0 8px 32px rgba(0,0,0,0.4)" 
                    : "0 8px 32px rgba(0,0,0,0.08)",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(226, 232, 240, 0.8)",
                  backgroundColor: colors?.bgCard,
                  height: "fit-content"
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: colors?.textPrimary, 
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <FaIdCard style={{ color: isDarkMode ? colors?.accent : colors?.primary }} />
                    Account Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <ModernDetailCard 
                        icon={<FaBuilding />} 
                        label="Station Code" 
                        value={user.warehouseCode} 
                        colors={colors} 
                        isDarkMode={isDarkMode} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ModernDetailCard 
                        icon={<FaMapMarkerAlt />} 
                        label="Station Name" 
                        value={user.warehouseName} 
                        colors={colors} 
                        isDarkMode={isDarkMode} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ModernDetailCard 
                        icon={<FaPhone />} 
                        label="Phone Number" 
                        value={user.phoneNo} 
                        colors={colors} 
                        isDarkMode={isDarkMode} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ModernDetailCard 
                        icon={<FaUser />} 
                        label="Username" 
                        value={user.username} 
                        colors={colors} 
                        isDarkMode={isDarkMode} 
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions Sidebar */}
            <Grid item xs={12} lg={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: isDarkMode 
                    ? "0 8px 32px rgba(0,0,0,0.4)" 
                    : "0 8px 32px rgba(0,0,0,0.08)",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(226, 232, 240, 0.8)",
                  backgroundColor: colors?.bgCard,
                  height: "fit-content"
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: colors?.textPrimary, 
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <FaEdit style={{ color: isDarkMode ? colors?.accent : colors?.primary }} />
                    Quick Actions
                  </Typography>
                  
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <CompactActionButton
                      icon={<FaMapMarkerAlt />}
                      title="Change Station"
                      onClick={() => setStationModal(true)}
                      colors={colors}
                      isDarkMode={isDarkMode}
                      variant="primary"
                    />
                    <CompactActionButton
                      icon={<FaKey />}
                      title="Change Password"
                      onClick={() => setOpenModal(true)}
                      colors={colors}
                      isDarkMode={isDarkMode}
                      variant="secondary"
                    />
                    <CompactActionButton
                      icon={<FaSignOutAlt />}
                      title="Logout"
                      onClick={handleLogout}
                      colors={colors}
                      isDarkMode={isDarkMode}
                      variant="danger"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Change Password Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={getModalStyle(colors, isDarkMode)}>
          {/* Modal Header */}
          <Box sx={{ 
            p: 4,
            borderBottom: `1px solid ${isDarkMode ? "rgba(255, 183, 77, 0.1)" : "rgba(226, 232, 240, 0.5)"}`
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: isDarkMode 
                  ? "rgba(255, 183, 77, 0.2)" 
                  : "rgba(30, 58, 95, 0.1)",
                color: isDarkMode ? colors?.accent : colors?.primary
              }}>
                <FaKey size={20} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors?.textPrimary, mb: 0.5 }}>
                  Change Password
                </Typography>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.9rem" }}>
                  Update your account password securely
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Modal Content */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <PasswordField
                label="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                visible={passwordVisible}
                onToggle={togglePasswordVisibility}
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                visible={passwordVisible}
                onToggle={togglePasswordVisibility}
                colors={colors}
                isDarkMode={isDarkMode}
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                visible={passwordVisible}
                onToggle={togglePasswordVisibility}
                error={newPassword !== confirmPassword}
                helperText={newPassword !== confirmPassword ? "Passwords do not match" : ""}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </Box>
            
            <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
              <Button 
                variant="outlined" 
                onClick={handleCloseModal} 
                disabled={isLoading}
                sx={{
                  borderColor: colors?.border,
                  color: colors?.textSecondary,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: colors?.textSecondary,
                    backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={isLoading}
                sx={{ 
                  background: isDarkMode 
                    ? "linear-gradient(135deg, #FFB74D 0%, #FFC107 100%)"
                    : "linear-gradient(135deg, #1E3A5F 0%, #2d5a87 100%)",
                  color: isDarkMode ? "#0a1628" : "#fff",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: isDarkMode 
                    ? "0 4px 12px rgba(255, 183, 77, 0.3)" 
                    : "0 4px 12px rgba(30, 58, 95, 0.3)",
                  "&:hover": { 
                    background: isDarkMode 
                      ? "linear-gradient(135deg, #FFA726 0%, #FF9800 100%)"
                      : "linear-gradient(135deg, #2d5a87 0%, #1E3A5F 100%)",
                    boxShadow: isDarkMode 
                      ? "0 6px 16px rgba(255, 183, 77, 0.4)" 
                      : "0 6px 16px rgba(30, 58, 95, 0.4)"
                  }
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={18} sx={{ color: isDarkMode ? "#0a1628" : "#fff" }} />
                    Updating...
                  </Box>
                ) : (
                  "Update Password"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Change Station Modal */}
      <Modal open={stationModal} onClose={() => setStationModal(false)}>
        <Box sx={getModalStyle(colors, isDarkMode)}>
          {/* Modal Header */}
          <Box sx={{ 
            p: 4,
            borderBottom: `1px solid ${isDarkMode ? "rgba(255, 183, 77, 0.1)" : "rgba(226, 232, 240, 0.5)"}`
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: isDarkMode 
                  ? "rgba(255, 183, 77, 0.2)" 
                  : "rgba(30, 58, 95, 0.1)",
                color: isDarkMode ? colors?.accent : colors?.primary
              }}>
                <FaMapMarkerAlt size={20} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors?.textPrimary, mb: 0.5 }}>
                  Change Station
                </Typography>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.9rem" }}>
                  Switch to a different station location
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Modal Content */}
          <Box sx={{ p: 4 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ 
                color: colors?.textSecondary,
                "&.Mui-focused": {
                  color: isDarkMode ? colors?.accent : colors?.primary
                }
              }}>
                Select Station
              </InputLabel>
              <Select 
                label="Select Station" 
                value={newWarehouse} 
                onChange={(e) => setNewWarehouse(e.target.value)}
                sx={{
                  backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors?.border
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? colors?.accent : colors?.primary
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? colors?.accent : colors?.primary,
                    borderWidth: "2px"
                  }
                }}
              >
                {allWarehouse
                  .filter((w) => w.isSource === user.isSource)
                  .map((w) => (
                    <MenuItem key={w.warehouseID} value={w.warehouseID}>
                      {w.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
              <Button 
                variant="outlined" 
                onClick={() => setStationModal(false)}
                sx={{
                  borderColor: colors?.border,
                  color: colors?.textSecondary,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: colors?.textSecondary,
                    backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleChangeWarehouse} 
                sx={{ 
                  background: isDarkMode 
                    ? "linear-gradient(135deg, #FFB74D 0%, #FFC107 100%)"
                    : "linear-gradient(135deg, #1E3A5F 0%, #2d5a87 100%)",
                  color: isDarkMode ? "#0a1628" : "#fff",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: isDarkMode 
                    ? "0 4px 12px rgba(255, 183, 77, 0.3)" 
                    : "0 4px 12px rgba(30, 58, 95, 0.3)",
                  "&:hover": { 
                    background: isDarkMode 
                      ? "linear-gradient(135deg, #FFA726 0%, #FF9800 100%)"
                      : "linear-gradient(135deg, #2d5a87 0%, #1E3A5F 100%)",
                    boxShadow: isDarkMode 
                      ? "0 6px 16px rgba(255, 183, 77, 0.4)" 
                      : "0 6px 16px rgba(30, 58, 95, 0.4)"
                  }
                }}
              >
                Update Station
              </Button>
            </Box>
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
const ModernDetailCard = ({ icon, label, value, colors, isDarkMode }) => (
  <Paper
    sx={{
      p: 2.5,
      borderRadius: 2,
      backgroundColor: isDarkMode 
        ? "rgba(255, 183, 77, 0.04)" 
        : "rgba(30, 58, 95, 0.02)",
      border: `1px solid ${isDarkMode ? "rgba(255, 183, 77, 0.08)" : "rgba(30, 58, 95, 0.06)"}`,
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: isDarkMode 
          ? "rgba(255, 183, 77, 0.06)" 
          : "rgba(30, 58, 95, 0.04)",
        transform: "translateY(-1px)",
        boxShadow: isDarkMode 
          ? "0 6px 20px rgba(255, 183, 77, 0.12)" 
          : "0 6px 20px rgba(30, 58, 95, 0.08)"
      }
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box sx={{ 
        color: isDarkMode ? colors?.accent : colors?.primary,
        display: "flex",
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode 
          ? "rgba(255, 183, 77, 0.12)" 
          : "rgba(30, 58, 95, 0.08)",
        borderRadius: "10px",
        fontSize: "1rem"
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography 
          sx={{ 
            color: colors?.textSecondary, 
            fontSize: "0.75rem", 
            fontWeight: 600, 
            textTransform: "uppercase", 
            letterSpacing: "0.5px",
            mb: 0.25
          }}
        >
          {label}
        </Typography>
        <Typography 
          sx={{ 
            color: colors?.textPrimary, 
            fontWeight: 600, 
            fontSize: "0.95rem",
            lineHeight: 1.3,
            wordBreak: "break-word"
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const CompactActionButton = ({ icon, title, onClick, colors, isDarkMode, variant = "primary" }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          background: isDarkMode 
            ? "rgba(239, 68, 68, 0.08)" 
            : "rgba(239, 68, 68, 0.04)",
          border: `1px solid ${isDarkMode ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.15)"}`,
          color: "#ef4444",
          "&:hover": {
            background: isDarkMode 
              ? "rgba(239, 68, 68, 0.12)" 
              : "rgba(239, 68, 68, 0.08)",
            borderColor: "#ef4444",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)"
          }
        };
      case "secondary":
        return {
          background: isDarkMode 
            ? "rgba(255, 183, 77, 0.06)" 
            : "rgba(30, 58, 95, 0.03)",
          border: `1px solid ${isDarkMode ? "rgba(255, 183, 77, 0.15)" : "rgba(30, 58, 95, 0.1)"}`,
          color: isDarkMode ? colors?.accent : colors?.primary,
          "&:hover": {
            background: isDarkMode 
              ? "rgba(255, 183, 77, 0.1)" 
              : "rgba(30, 58, 95, 0.06)",
            borderColor: isDarkMode ? colors?.accent : colors?.primary,
            transform: "translateY(-1px)",
            boxShadow: isDarkMode 
              ? "0 4px 12px rgba(255, 183, 77, 0.15)" 
              : "0 4px 12px rgba(30, 58, 95, 0.1)"
          }
        };
      default:
        return {
          background: isDarkMode 
            ? "rgba(255, 183, 77, 0.08)" 
            : "rgba(30, 58, 95, 0.04)",
          border: `1px solid ${isDarkMode ? "rgba(255, 183, 77, 0.2)" : "rgba(30, 58, 95, 0.15)"}`,
          color: isDarkMode ? colors?.accent : colors?.primary,
          "&:hover": {
            background: isDarkMode 
              ? "rgba(255, 183, 77, 0.12)" 
              : "rgba(30, 58, 95, 0.08)",
            borderColor: isDarkMode ? colors?.accent : colors?.primary,
            transform: "translateY(-1px)",
            boxShadow: isDarkMode 
              ? "0 4px 12px rgba(255, 183, 77, 0.2)" 
              : "0 4px 12px rgba(30, 58, 95, 0.15)"
          }
        };
    }
  };

  return (
    <Button
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.3s ease",
        textAlign: "left",
        justifyContent: "flex-start",
        textTransform: "none",
        width: "100%",
        ...getVariantStyles()
      }}
    >
      <Box sx={{ 
        display: "flex",
        alignItems: "center",
        gap: 2,
        width: "100%"
      }}>
        <Box sx={{ 
          fontSize: "1.1rem",
          opacity: 0.9,
          flexShrink: 0
        }}>
          {icon}
        </Box>
        <Typography 
          sx={{ 
            fontWeight: 600, 
            fontSize: "0.9rem",
            color: "inherit",
            textAlign: "left"
          }}
        >
          {title}
        </Typography>
      </Box>
    </Button>
  );
};

const ModernActionButton = ({ icon, title, description, onClick, colors, isDarkMode, variant = "primary" }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          background: isDarkMode 
            ? "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)"
            : "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#ef4444",
          "&:hover": {
            background: isDarkMode 
              ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)"
              : "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.08) 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(239, 68, 68, 0.2)"
          }
        };
      case "secondary":
        return {
          background: isDarkMode 
            ? "rgba(255, 183, 77, 0.08)" 
            : "rgba(30, 58, 95, 0.04)",
          border: `1px solid ${isDarkMode ? "rgba(255, 183, 77, 0.2)" : "rgba(30, 58, 95, 0.15)"}`,
          color: isDarkMode ? colors?.accent : colors?.primary,
          "&:hover": {
            background: isDarkMode 
              ? "rgba(255, 183, 77, 0.12)" 
              : "rgba(30, 58, 95, 0.08)",
            transform: "translateY(-2px)",
            boxShadow: isDarkMode 
              ? "0 8px 24px rgba(255, 183, 77, 0.2)" 
              : "0 8px 24px rgba(30, 58, 95, 0.15)"
          }
        };
      default:
        return {
          background: isDarkMode 
            ? "rgba(255, 183, 77, 0.1)" 
            : "rgba(30, 58, 95, 0.06)",
          border: `1px solid ${isDarkMode ? "rgba(255, 183, 77, 0.25)" : "rgba(30, 58, 95, 0.2)"}`,
          color: isDarkMode ? colors?.accent : colors?.primary,
          "&:hover": {
            background: isDarkMode 
              ? "rgba(255, 183, 77, 0.15)" 
              : "rgba(30, 58, 95, 0.1)",
            transform: "translateY(-2px)",
            boxShadow: isDarkMode 
              ? "0 8px 24px rgba(255, 183, 77, 0.25)" 
              : "0 8px 24px rgba(30, 58, 95, 0.2)"
          }
        };
    }
  };

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.3s ease",
        textAlign: "center",
        ...getVariantStyles()
      }}
    >
      <Box sx={{ 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5
      }}>
        <Box sx={{ 
          fontSize: "1.5rem",
          opacity: 0.9
        }}>
          {icon}
        </Box>
        <Box>
          <Typography 
            sx={{ 
              fontWeight: 700, 
              fontSize: "1rem",
              mb: 0.5,
              color: "inherit"
            }}
          >
            {title}
          </Typography>
          <Typography 
            sx={{ 
              fontSize: "0.85rem",
              opacity: 0.8,
              color: "inherit"
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const PasswordField = ({ label, value, onChange, visible, onToggle, error, helperText, colors, isDarkMode }) => (
  <Box sx={{ position: "relative" }}>
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={visible ? "text" : "password"}
      fullWidth
      error={error}
      helperText={helperText}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
          "& fieldset": {
            borderColor: colors?.border
          },
          "&:hover fieldset": {
            borderColor: isDarkMode ? colors?.accent : colors?.primary
          },
          "&.Mui-focused fieldset": {
            borderColor: isDarkMode ? colors?.accent : colors?.primary
          }
        },
        "& .MuiInputLabel-root": {
          color: colors?.textSecondary,
          "&.Mui-focused": {
            color: isDarkMode ? colors?.accent : colors?.primary
          }
        }
      }}
    />
    <IconButton
      onClick={onToggle}
      sx={{ 
        position: "absolute", 
        right: 8, 
        top: error ? "25%" : "50%", 
        transform: "translateY(-50%)",
        color: colors?.textSecondary,
        "&:hover": {
          color: isDarkMode ? colors?.accent : colors?.primary,
          backgroundColor: isDarkMode ? "rgba(255, 183, 77, 0.1)" : "rgba(30, 58, 95, 0.05)"
        }
      }}
      size="small"
    >
      {visible ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
    </IconButton>
  </Box>
);

const getModalStyle = (colors, isDarkMode) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 480,
  backgroundColor: colors?.bgCard,
  borderRadius: 3,
  boxShadow: isDarkMode 
    ? "0 25px 80px rgba(0,0,0,0.6)" 
    : "0 25px 80px rgba(0,0,0,0.15)",
  p: 0,
  border: isDarkMode 
    ? "1px solid rgba(255, 183, 77, 0.1)" 
    : "1px solid rgba(226, 232, 240, 0.8)",
  overflow: "hidden"
});

export default DashboardPage;
