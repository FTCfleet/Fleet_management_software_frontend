import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Divider,
  Button,
} from "@mui/material";
import { useAuth } from "../routes/AuthContext";
import Loading from "../components/Loading";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const { checkAuthStatus, resetAuth } = useAuth();

  useEffect(() => {
    checkAuthStatus().then((data) => {
      setUser(data.user_data);
    });
  }, []);

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
            <strong>Warehouse:</strong> {user.warehouseName}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Phone:</strong> {user.phoneNo}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Role:</strong> {user.role.charAt(0).toUpperCase()+user.role.slice(1)}
          </Typography>
        </CardContent>
        <Button variant="contained" onClick={resetAuth}>
          Logout
        </Button>
      </Card>
    </Box>
  ) : (
    <Loading />
  );
};

export default DashboardPage;
