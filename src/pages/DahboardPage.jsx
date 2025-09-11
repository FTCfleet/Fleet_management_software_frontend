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
} from "@mui/material";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../routes/AuthContext";
import Loading from "../components/Loading";

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

  useEffect(() => {
    checkAuthStatus().then((data) => {
      setUser(data.user_data);
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

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const handleChangePassword = async () => {
    if (
      newPassword.length === 0 ||
      oldPassword.length === 0 ||
      confirmPassword !== newPassword
    ) {
      alert("Password is empty");
      return;
    }
    setIsLoading(true);
    // return;
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });
    if (!response.ok) {
      alert("Error occurred");
      setIsLoading(false);
      return;
    }
    const data = await response.json();
    if (!data.flag) {
      alert("Inavlid Credentials!!");
      setIsLoading(false);
      return;
    }
    localStorage.setItem("token", data.token);
    setIsLoading(false);
    alert("Password Changed Successfully");
    window.location.reload();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordVisible(false);
  };

  return user ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Card
        sx={{
          width: "80%",
          p: 3,
          backgroundColor: "white",
        }}
      >
        {/* DashboardPage Picture Section */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Avatar
            src={user.avatar}
            alt={user.name}
            sx={{ width: 120, height: 120 }}
          />
        </Box>

        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold">
            {user.name}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            @{user.username}
          </Typography>

          {/* Divider */}
          <Divider sx={{ my: 2 }} />

          {/* User Details */}
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Code:</strong> {user.warehouseCode}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Station:</strong> {user.warehouseName}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Phone:</strong> {user.phoneNo}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Role:</strong>{" "}
            {user.role?.charAt(0).toUpperCase() + user.role.slice(1)}
          </Typography>
        </CardContent>
        <Button
          variant="outlined"
          sx={{ mr: "8px" }}
          onClick={() => setStationModal(true)}
        >
          Change Station
        </Button>
        <Button
          variant="outlined"
          sx={{ mr: "8px" }}
          onClick={() => setOpenModal(true)}
        >
          Change Password
        </Button>
        <Button variant="contained" onClick={resetAuth}>
          Logout
        </Button>
      </Card>

      <Modal open={openModal} onClose={handleCloseModal}>
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
          <Typography
            id="change-password-modal"
            variant="h6"
            component="h2"
            color="black"
            mb="10px"
            sx={{ fontWeight: "bold" }}
          >
            Change Password
          </Typography>
          <TextField
            label="Current Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            type={passwordVisible ? "text" : "password"}
            sx={{ mb: 2 }}
          />
          <button type="button" onClick={togglePasswordVisibility}>
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>

          <TextField
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type={passwordVisible ? "text" : "password"}
            sx={{ mb: 2 }}
          ></TextField>
          <button type="button" onClick={togglePasswordVisibility}>
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
          <TextField
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={passwordVisible ? "text" : "password"}
            error={newPassword !== confirmPassword}
            helperText={
              newPassword !== confirmPassword ? "Passwords do not match" : ""
            }
          ></TextField>
          <button type="button" onClick={togglePasswordVisibility}>
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>

          <Button
            variant="outlined"
            onClick={handleCloseModal}
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            sx={{ mt: 2, ml: 2 }}
            disabled={isLoading}
          >
            Save{" "}
            {isLoading && (
              <CircularProgress
                size={20}
                style={{ color: "#fff", marginLeft: "10px" }}
              />
            )}
          </Button>
        </Box>
      </Modal>

      <Modal open={stationModal} onClose={() => setStationModal(false)}>
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
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            sx={{ color: "black", fontWeight: "bold" }}
            variant="h6"
            component="h2"
          >
            Change Station
          </Typography>
          <FormControl>
            <InputLabel>Select Station</InputLabel>
            <Select
              label="Select Station"
              value={newWarehouse}
              onChange={(e) => setNewWarehouse(e.target.value)}
            >
              {allWarehouse
                .filter((w) => w.isSource)
                .map((w) => (
                  <MenuItem key={w.warehouseID} value={w.warehouseID}>
                    {w.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Box>
            <Button
              variant="outlined"
              onClick={() => setStationModal(false)}
              sx={{ mt: 2 }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => alert("Change Station to " + newWarehouse)}
              sx={{ mt: 2, ml: 2 }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  ) : (
    <Loading />
  );
};

export default DashboardPage;
